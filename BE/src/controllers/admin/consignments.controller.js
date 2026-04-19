const Consignment = require('../../models/consignments.model');

// Lấy danh sách toàn bộ yêu cầu ký gửi
exports.getAllConsignments = async (req, res) => {
    try {
        const consignments = await Consignment.find({})
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: consignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật trạng thái ký gửi
exports.updateConsignmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        let updateData = { status };
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        const updatedConsignment = await Consignment.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'fullName email phone');
            
        res.status(200).json({ success: true, data: updatedConsignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa yêu cầu ký gửi
exports.deleteConsignment = async (req, res) => {
    try {
        const { id } = req.params;
        await Consignment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Đã xóa yêu cầu ký gửi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
