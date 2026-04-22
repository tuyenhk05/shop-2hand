const Role = require('../../models/roles.model');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ 
            isDeleted: false,
            title: { $ne: 'Khách hàng' } 
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { title, description, permissions } = req.body;
        const newRole = await Role.create({ title, description, permissions });
        res.status(201).json({ success: true, data: newRole });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRole = await Role.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedRole });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        await Role.findByIdAndUpdate(id, { isDeleted: true });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
