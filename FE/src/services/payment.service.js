import { post } from "../untils/request";

// Yêu cầu lấy URL VNPAY
export const createPaymentUrlApi = async (paymentData) => {
    return await post(`/payment/create_payment_url`, paymentData);
};
