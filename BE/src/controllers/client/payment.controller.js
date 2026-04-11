const Order = require('../../models/orders.model');

exports.createPaymentUrl = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        // MOCK: Generate a URL redirect pointing back to FE checkout/success page
        // Cần truyền biến giả lập sandbox VNPAY vào đoạn này
        const mockUrl = `http://localhost:5173/checkout/vnpay_return?vnp_ResponseCode=00&vnp_TxnRef=${orderId}&vnp_Amount=${amount * 24000}`;
        
        res.status(200).json({ success: true, url: mockUrl });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { vnp_ResponseCode, vnp_TxnRef } = req.body;
        
        if (vnp_ResponseCode === '00') {
             await Order.findByIdAndUpdate(vnp_TxnRef, { paymentStatus: 'paid', status: 'paid' });
             res.status(200).json({ success: true, message: 'Thanh toán thành công' });
        } else {
             await Order.findByIdAndUpdate(vnp_TxnRef, { paymentStatus: 'failed', status: 'cancelled' });
             res.status(400).json({ success: false, message: 'Thanh toán thất bại' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
