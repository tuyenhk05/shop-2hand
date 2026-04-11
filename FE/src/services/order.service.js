import { get, post } from "../untils/request";

export const getOrdersApi = async (buyerId) => {
    return await get(`/orders/${buyerId}`);
};

export const createOrderApi = async (orderData) => {
    return await post(`/orders/create`, orderData);
};
