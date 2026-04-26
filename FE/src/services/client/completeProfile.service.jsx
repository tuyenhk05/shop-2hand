import { put } from "../../untils/request";

export const updateCompleteProfile = async (body) => {
    try {
        return await put(`/auth/complete-profile`, body);
    } catch (error) {
        console.error('Complete profile service error:', error);
        return { success: false, message: error.message };
    }
};
