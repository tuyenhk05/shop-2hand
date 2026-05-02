import { post } from "../../utils/request";

// YÃªu cáº§u láº¥y URL VNPAY
export const createPaymentUrlApi = async (paymentData) => {
    return await post(`/payment/create_payment_url`, paymentData);
};
