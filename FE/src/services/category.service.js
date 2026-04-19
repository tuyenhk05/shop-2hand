import { get } from "../untils/request";

export const getAllCategories = async () => {
    try {
        return await get(`/categories`);
    } catch (error) {
        console.error('Get categories service error:', error);
        return { success: false, message: error.message };
    }
};
