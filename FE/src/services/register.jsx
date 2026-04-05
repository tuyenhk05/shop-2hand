import { post } from "../untils/request"; 

export const postRegister = async (body) => {
    try {
        const result = await post(`/auth/register`, body);
        return result;
    } catch (error) {
        console.error('Register service error:', error);
        return {
            success: false,
            message: 'Lỗi kết nối. Vui lòng thử lại.'
        };
    }
};