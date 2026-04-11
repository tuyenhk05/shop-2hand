import { get } from "../untils/request";

export const getAllProducts = async () => {
    try {
        const result = await get(`/products`);
        return result;
    }
    catch (error) {
        console.error('Get products service error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại.'
        }

    }
};
export const getProductById = async (id) => {
    try {
        const result = await get(`/products/${id}`);
        return result;
    }
    catch (error) {
        console.error('Get product by id service error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại.'
        }
    }
};
