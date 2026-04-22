import { get } from "../untils/request";

export const getAllBrands = async () => {
    try {
        return await get(`/brands`);
    } catch (error) {
        console.error('Get brands service error:', error);
        return { success: false, message: error.message };
    }
};
