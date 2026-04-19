import { get, post } from "../untils/request";

export const getOrdersApi = async (buyerId) => {
    return await get(`/orders/${buyerId}`);
};

export const createOrderApi = async (orderData) => {
    return await post(`/orders/create`, orderData);
};

export const getOrderByIdApi = async (orderId) => {
    return await get(`/orders/detail/${orderId}`);
};
