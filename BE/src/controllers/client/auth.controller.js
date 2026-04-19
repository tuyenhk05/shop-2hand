const User = require('../../models/users.model.js');
const { generateToken } = require('../../utils/jwt.utils');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // Dùng để mã hóa mật khẩu
const Role = require('../../models/roles.model.js');


// ✅ ĐĂNG KÝ
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, phone } = req.body;

        // Validate input
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check user already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email này đã được đăng ký'
            });
        }

        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Số điện thoại này đã được sử dụng'
                });
            }
        }

        // Get default role
        let defaultRole = await Role.findOne({ title: 'Khách hàng' });

        // Create new user
        const user = new User({
            fullName,
            email,
            password,
            phone,
            role: defaultRole ? defaultRole._id : undefined
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// ✅ ĐĂNG NHẬP
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check user exists and get password field
        const user = await User.findOne({ email }).select('+password').populate('role');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// ✅ SOCIAL LOGIN (Google, Facebook)
exports.socialLogin = async (req, res) => {
    try {
        // SỬA ĐỔI: Chỉ nhận Token và Provider từ Frontend
        const { token, provider } = req.body;

        if (!token || !provider) {
            return res.status(400).json({
                success: false,
                message: 'Please provide authentication token and provider'
            });
        }

        let verifiedEmail = "";
        let verifiedFullName = "";
        let verifiedAvatar = "";

        // ==========================================
        // 1. XÁC MINH TOKEN VỚI GOOGLE / FACEBOOK
        // ==========================================
        if (provider === 'google') {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            verifiedEmail = payload.email;
            verifiedFullName = payload.name;
            verifiedAvatar = payload.picture;

        } else if (provider === 'facebook') {
            const fbResponse = await axios.get(`https://graph.facebook.com/me`, {
                params: {
                    fields: 'id,name,email,picture',
                    access_token: token
                }
            });

            verifiedEmail = fbResponse.data.email;
            verifiedFullName = fbResponse.data.name;
            verifiedAvatar = fbResponse.data.picture?.data?.url;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid provider' });
        }

        if (!verifiedEmail) {
            return res.status(400).json({ success: false, message: 'Could not retrieve email from provider' });
        }

        // ==========================================
        // 2. XỬ LÝ DATABASE (Dùng dữ liệu đã verified)
        // ==========================================
        let user = await User.findOne({ email: verifiedEmail }).populate('role');
        let isNewUser = false; // Tạo biến cờ để báo cho frontend

        if (!user) {
            isNewUser = true;
            const randomPassword = Math.random().toString(36).slice(-15);
            let defaultRole = await Role.findOne({ title: 'Khách hàng' });

            user = new User({
                fullName: verifiedFullName,
                email: verifiedEmail,
                password: randomPassword,
               // phone: '',
                avatar: verifiedAvatar || null,
                provider: provider,
                isActive: true,
                role: defaultRole ? defaultRole._id : undefined
            });

            await user.save();
        } else {
            let isModified = false;

            if (!user.avatar && verifiedAvatar) {
                user.avatar = verifiedAvatar;
                isModified = true;
            }
            if (!user.provider) {
                user.provider = provider;
                isModified = true;
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is deactivated'
                });
            }

            if (isModified) await user.save();
        }

        // ==========================================
        // 3. TẠO TOKEN NỘI BỘ VÀ TRẢ VỀ
        // ==========================================
        const appToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: `Login with ${provider} successful`,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
               // phone: user.phone || '',
                role: user.role,
                token: appToken,
                isNewUser: isNewUser
            }
        });
    } catch (error) {
        console.error('Social login error:', error);
        res.status(401).json({
            success: false,
            message: 'Social login failed. Token might be invalid or expired.',
            error: error.message
        });
    }
};
exports.completeProfile = async (req, res) => {
    try {
       
        // req.user.id có được là nhờ middleware verifyToken giải mã Token ra
        const userId = req.user.id;
        const { phone, dateOfBirth } = req.body;

        if (!phone || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ số điện thoại và ngày sinh'
            });
        }

        // Kiểm tra xem số điện thoại có bị trùng với user khác không
        const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác'
            });
        }

        // Tìm user và cập nhật thông tin
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { phone: phone, dateOfBirth: dateOfBirth },
            { returnDocument: 'after', runValidators: true } // Mới
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                //phone: updatedUser.phone,
                dateOfBirth: updatedUser.dateOfBirth
            }
        });

    } catch (error) {
        console.error('Lỗi complete profile:', error);
        res.status(500).json({
            success: false,
            message: 'Cập nhật thông tin thất bại',
            error: error.message
        });
    }
};
// ✅ GET CURRENT USER
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('role');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user info',
            error: error.message
        });
    }
};

// ✅ LOGOUT
exports.logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};
exports.forgotPassword = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }

        });
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Email chưa được đăng ký trong hệ thống' });
        }

        // Tạo mã OTP ngẫu nhiên 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu OTP vào DB, hạn sử dụng 5 phút
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        // Gửi email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Atelier - Mã xác nhận đặt lại mật khẩu',
            html: `
                <h3>Chào ${user.fullName},</h3>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác nhận (OTP) của bạn là:</p>
                <h1 style="color: #ff6b6b; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Mã xác nhận đã được gửi đến email của bạn' });

    } catch (error) {
        console.error('Lỗi forgot password:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi gửi email' });
    }
};

// ✅ API 2: Xác nhận OTP và lưu mật khẩu mới
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() } // Kiểm tra xem OTP còn hạn không
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
        }

        // Mã hóa mật khẩu mới (Nếu bạn đang dùng pre-save hook trong Mongoose thì không cần dùng bcrypt ở đây, chỉ cần gán user.password = newPassword)
        // user.password = await bcrypt.hash(newPassword, 10); // Bật dòng này nếu bạn tự mã hoá thủ công
        user.password = newPassword;

        // Xóa OTP đi sau khi dùng xong
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công!' });

    } catch (error) {
        console.error('Lỗi reset password:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi đổi mật khẩu' });
    }
};