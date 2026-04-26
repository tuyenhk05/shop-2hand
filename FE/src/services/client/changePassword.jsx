import { post } from "../../untils/request";

export const forgotPassword = async (body) => {
    try {
        return await post(`/auth/forgot-password`, body);
    } catch (error) {
        console.error('Forgot password service error:', error);
        return { success: false, message: error.message };
    }
};

export const resetPassword = async (body) => {
    try {
        return await post(`/auth/reset-password`, body);
    } catch (error) {
        console.error('Reset password service error:', error);
        return { success: false, message: error.message };
    }
};
