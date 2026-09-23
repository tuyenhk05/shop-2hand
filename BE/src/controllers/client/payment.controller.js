const Order = require('../../models/orders.model');
const crypto = require('crypto');
const qs = require('qs');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

exports.createPaymentUrl = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng' });
        }

        // Chống gian lận tiền: Luôn lấy giá trị thực tế từ đơn hàng trong database
        const order = await Order.findById(orderId).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.paymentStatus === 'paid' || order.status === 'paid') {
            return res.status(400).json({ success: false, message: 'Đơn hàng này đã được thanh toán' });
        }

        const payableAmount = (order.totalAmount && order.totalAmount > 0) ? order.totalAmount : (Number(amount) || 0);
        if (payableAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Số tiền thanh toán không hợp lệ' });
        }

        let ipAddr = req.headers['x-forwarded-for'] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || '127.0.0.1';
        ipAddr = '127.0.0.1';

        const tmnCode = (process.env.VNP_TMN_CODE || '').trim();
        const secretKey = (process.env.VNP_HASH_SECRET || '').trim();
        let vnpUrl = (process.env.VNP_URL || '').trim();
        const returnUrl = (process.env.VNP_RETURN_URL || '').trim();

        const date = new Date();
        const createDate = String(date.getFullYear()) +
                           String(date.getMonth() + 1).padStart(2, '0') +
                           String(date.getDate()).padStart(2, '0') +
                           String(date.getHours()).padStart(2, '0') +
                           String(date.getMinutes()).padStart(2, '0') +
                           String(date.getSeconds()).padStart(2, '0');

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'ThanhToanChoMaGD_' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.round(payableAmount * 100);
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_BankCode'] = 'NCB';

        const expireDate = new Date(date.getTime() + 15 * 60 * 1000);
        vnp_Params['vnp_ExpireDate'] = String(expireDate.getFullYear()) +
                           String(expireDate.getMonth() + 1).padStart(2, '0') +
                           String(expireDate.getDate()).padStart(2, '0') +
                           String(expireDate.getHours()).padStart(2, '0') +
                           String(expireDate.getMinutes()).padStart(2, '0') +
                           String(expireDate.getSeconds()).padStart(2, '0');

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ success: true, url: vnpUrl });
    } catch (error) {
        console.error('createPaymentUrl error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo liên kết thanh toán' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        let vnp_Params = { ...req.body };
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = (process.env.VNP_HASH_SECRET || '').trim();
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const txId = vnp_Params['vnp_TxnRef'];

        // Kiểm tra chữ ký an toàn với constant-time comparison chống Timing Attack
        const isValidSignature = secureHash && signed && 
            secureHash.length === signed.length &&
            crypto.timingSafeEqual(Buffer.from(secureHash, 'utf-8'), Buffer.from(signed, 'utf-8'));

        if (!isValidSignature) {
            return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
        }

        const order = await Order.findById(txId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Chống gian lận tiền: Đối chiếu số tiền thực nhận từ VNPay với tổng tiền đơn hàng
        const paidAmount = Number(vnp_Params['vnp_Amount']) / 100;
        if (order.totalAmount && Math.round(paidAmount) !== Math.round(order.totalAmount)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Số tiền thanh toán không khớp với tổng tiền đơn hàng' 
            });
        }

        // Chống replay attack
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ success: true, message: 'Đơn hàng đã được ghi nhận thanh toán thành công' });
        }

        if (vnp_Params['vnp_ResponseCode'] === '00') {
            order.paymentStatus = 'paid';
            order.status = 'paid';
            if (vnp_Params['vnp_TransactionNo']) {
                order.vnpayTransactionId = vnp_Params['vnp_TransactionNo'];
            }
            await order.save();
            return res.status(200).json({ success: true, message: 'Thanh toán thành công' });
        } else {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            await order.save();
            return res.status(400).json({ success: false, message: 'Thanh toán thất bại hoặc bị hủy' });
        }
    } catch (error) {
        console.error('verifyPayment error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác thực thanh toán' });
    }
};

// Webhook IPN chuẩn quy cách VNPay
exports.vnpayIpn = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = (process.env.VNP_HASH_SECRET || '').trim();
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const txId = vnp_Params['vnp_TxnRef'];

        const isValidSignature = secureHash && signed && 
            secureHash.length === signed.length &&
            crypto.timingSafeEqual(Buffer.from(secureHash, 'utf-8'), Buffer.from(signed, 'utf-8'));

        if (!isValidSignature) {
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }

        const order = await Order.findById(txId);
        if (!order) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        const paidAmount = Number(vnp_Params['vnp_Amount']) / 100;
        if (order.totalAmount && Math.round(paidAmount) !== Math.round(order.totalAmount)) {
            return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (vnp_Params['vnp_ResponseCode'] === '00') {
            order.paymentStatus = 'paid';
            order.status = 'paid';
            if (vnp_Params['vnp_TransactionNo']) {
                order.vnpayTransactionId = vnp_Params['vnp_TransactionNo'];
            }
            await order.save();
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            await order.save();
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        }
    } catch (error) {
        console.error('vnpayIpn error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};
