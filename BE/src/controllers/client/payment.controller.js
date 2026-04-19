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
        let ipAddr = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       (req.connection.socket ? req.connection.socket.remoteAddress : null) || '127.0.0.1';
        // Force basic IPv4 format to avoid VNPAY IP regex rejection
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
        vnp_Params['vnp_Amount'] = Math.round(amount * 100);
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_BankCode'] = 'NCB'; // Force NCB to bypass buggy VNPay UI

        // Add 15 minutes for expire date
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
         res.status(500).json({ success: false, message: error.message });
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        let vnp_Params = req.body;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = process.env.VNP_HASH_SECRET;
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const txId = vnp_Params['vnp_TxnRef'];

        if(secureHash === signed){
            if (vnp_Params['vnp_ResponseCode'] === '00') {
                 await Order.findByIdAndUpdate(txId, { paymentStatus: 'paid', status: 'paid' });
                 res.status(200).json({ success: true, message: 'Thanh toán thành công' });
            } else {
                 await Order.findByIdAndUpdate(txId, { paymentStatus: 'failed', status: 'cancelled' });
                 res.status(400).json({ success: false, message: 'Thanh toán thất bại' });
            }
        } else{
            res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
