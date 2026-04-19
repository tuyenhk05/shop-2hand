const User = require('../../models/users.model');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .populate('role')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, isActive } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { role, isActive }, 
            { new: true }
        ).populate('role');
        
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Thực tế có thể chỉ cho khóa thay vì xóa cứng
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Người dùng đã bị xóa' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
