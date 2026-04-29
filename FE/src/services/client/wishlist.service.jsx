import { get, post } from "../../untils/request";

export const getWishlistApi = async (userId) => {
    return await get(`/wishlists/${userId}`);
};

export const addToWishlistApi = async (userId, productId) => {
    return await post(`/wishlists/${userId}/add`, { productId });
};

export const removeFromWishlistApi = async (userId, productId) => {
    return await post(`/wishlists/${userId}/remove`, { productId });
};
