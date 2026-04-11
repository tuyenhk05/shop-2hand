import { get, post } from "../untils/request";

export const getCartApi = async (userId) => {
    return await get(`/cart/${userId}`);
};

export const addToCartApi = async (userId, productId, quantity = 1) => {
    return await post(`/cart/${userId}/add`, { productId, quantity });
};

export const removeFromCartApi = async (userId, productId) => {
    return await post(`/cart/${userId}/remove`, { productId });
};

export const clearCartApi = async (userId) => {
    return await post(`/cart/${userId}/clear`);
};
