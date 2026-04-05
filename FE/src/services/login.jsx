import { post } from "../untils/request";

export const postLogin = async (body) => {
    try {
        const result = await post(`/auth/login`, body);
        return result;
    } catch (error) {
        console.error('Register service error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại.'
        };
    }
};