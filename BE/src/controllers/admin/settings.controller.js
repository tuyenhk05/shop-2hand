const Setting = require('../../models/settings.model');

exports.getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne({ key: 'consignment_commission_rate' });
        if (!setting) {
            setting = await Setting.create({ key: 'consignment_commission_rate', value: 0 });
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { value } = req.body;
        const rate = Number(value);
        if (isNaN(rate) || rate < 0) {
            return res.status(400).json({ success: false, message: 'Giá trị chiết khấu không hợp lệ' });
        }

        const setting = await Setting.findOneAndUpdate(
            { key: 'consignment_commission_rate' },
            { value: rate },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, message: 'Cập nhật chiết khấu thành công', data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
