const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const Role = require('../models/roles.model');

// Middleware xác thực JWT token và phân quyền
exports.requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate('role').lean();

        if (!user) {
            return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
        }

        if (!user.role) {
            return res.status(403).json({ success: false, message: 'Lỗi phân quyền. Truy cập bị từ chối.' });
        }

        // Kiểm tra vai trò: Nếu là vai trò 'Khách hàng' và không có bất kỳ quyền quản trị nào, từ chối ngay lập tức
        const permissions = user.role.permissions || [];
        const isCustomer = user.role.title === 'Khách hàng';
        const hasAdminAccess = permissions.includes('all') || permissions.some(p => p !== 'client_access') || user.role.title === 'Quản trị viên';

        if (isCustomer && !hasAdminAccess) {
            return res.status(403).json({ 
                success: false, 
                message: 'Truy cập bị từ chối. Bạn không có quyền quản trị.' 
            });
        }

        // Lưu thông tin user và quyền vào req để các controller/middleware tiếp theo sử dụng
        req.user = user;
        req.user.isAdmin = hasAdminAccess;
        req.permissions = permissions;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn' });
        }
        res.status(500).json({ success: false, message: 'Lỗi xác thực' });
    }
};

// Middleware kiểm tra quyền cụ thể
exports.requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.permissions || (!req.permissions.includes(permission) && !req.permissions.includes('all'))) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền thực hiện hành động này' 
            });
        }
        next();
    };
};
