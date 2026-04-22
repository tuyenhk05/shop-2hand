const Consignment = require('../../models/consignments.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { uploadToCloudinary } = require('../../configs/cloudinary');

// GET consignments by user
exports.getConsignments = async (req, res) => {
    try {
        const { userId } = req.params;
        const items = await Consignment.find({ userId })
            .populate('categoryId', 'name')
            .populate('brandId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, consignments: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST create consignment
exports.createConsignment = async (req, res) => {
    try {
        const { 
            userId, title, description, expectedPrice, condition,
            categoryId, brandId, gender, size, color, material 
        } = req.body;

        if (!userId || !title || !description) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'shop-2hand/consignments'));
            const uploadResults = await Promise.all(uploadPromises);
            photoUrls = uploadResults.map(result => result.secure_url);
        }

        const newCon = new Consignment({
            userId,
            title,
            description,
            expectedPrice: Number(expectedPrice) || 0,
            photos: photoUrls,
            condition: condition || 'excellent',
            categoryId: categoryId || null,
            brandId: brandId || null,
            gender: gender || 'unisex',
            size: size || '',
            color: color || '',
            material: material || '',
            status: 'pending'
        });
        await newCon.save();

        res.status(201).json({ success: true, consignment: newCon, message: 'Yêu cầu ký gửi đã được gửi thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH update consignment status (for User response: approved/rejected)
exports.updateConsignmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
        }

        const consignment = await Consignment.findByIdAndUpdate(
            id,
            { status, processedAt: Date.now() },
            { new: true }
        );

        if (!consignment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu ký gửi.' });
        }

        res.status(200).json({ success: true, consignment, message: 'Đã cập nhật trạng thái thành công.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST analyze image with Gemini AI
exports.analyzeImage = async (req, res) => {
    try {
        const { imageBase64, mimeType = 'image/jpeg' } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'Không có ảnh để phân tích.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback nếu chưa cấu hình API key
            return res.status(200).json({
                success: true,
                data: {
                    productName: '',
                    category: '',
                    brand: '',
                    color: '',
                    suggestedPrice: '',
                    confidence: 0,
                    description: '',
                    note: 'AI chưa được cấu hình. Vui lòng điền thông tin thủ công.'
                }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là chuyên gia định giá thời trang hàng hiệu secondhand tại Việt Nam.
Hãy phân tích ảnh sản phẩm thời trang này và trả lời theo định dạng JSON chính xác (không có markdown, không có backtick):
{
  "productName": "Tên sản phẩm cụ thể (thương hiệu + loại + model nếu nhận ra)",
  "category": "Loại sản phẩm (Túi xách / Giày / Quần áo / Phụ kiện / Đồng hồ / Khác)",
  "brand": "Thương hiệu (để trống nếu không xác định được)",
  "color": "Màu sắc chính",
  "condition": "Đánh giá tình trạng (Như mới / Tốt / Khá tốt / Trung bình)",
  "suggestedPriceMin": số tiền tối thiểu bằng VNĐ (chỉ số, không đơn vị),
  "suggestedPriceMax": số tiền tối đa bằng VNĐ (chỉ số, không đơn vị),
  "confidence": phần trăm độ tin cậy nhận diện từ 0-100,
  "description": "Mô tả ngắn về sản phẩm cho việc đăng bán (2-3 câu)",
  "highlights": ["điểm nổi bật 1", "điểm nổi bật 2"]
}
Lưu ý: suggestedPrice là giá bán lại thị trường VN hợp lý. Chỉ trả về JSON thuần túy.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: imageBase64
                }
            }
        ]);

        const text = result.response.text().trim();

        // Parse JSON từ response
        let analysisData;
        try {
            // Loại bỏ markdown code blocks nếu có
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysisData = JSON.parse(cleaned);
        } catch {
            analysisData = { raw: text, note: 'Không thể parse JSON, xem raw text' };
        }

        res.status(200).json({ success: true, data: analysisData });
    } catch (error) {
        console.error('Gemini AI Error:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi phân tích ảnh AI: ' + error.message });
    }
};
