import { post } from "../../utils/request"; 

export const postRegister = async (body) => {
    try {
        const result = await post(`/auth/register`, body);
        return result;
    } catch (error) {
        console.error('Register service error:', error);
        return {
            success: false,
            message: 'L?i k?t n?i. Vui lòng th? l?i.'
        };
    }
};
