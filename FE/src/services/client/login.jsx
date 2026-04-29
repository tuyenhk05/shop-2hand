import { post } from "../../untils/request";

export const postLogin = async (body) => {
    try {
        const result = await post(`/auth/login`, body);
        return result;
    } catch (error) {
        console.error('Register service error:', error);
        return {
            success: false,
            message: 'L?i k?t n?i. Vui lòng th? l?i.'
        };
    }
};
