import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const chatWithAI = async (message, history, sessionId) => {
    try {
        const response = await axios.post(`${API_URL}/chat`, {
            message,
            history,
            sessionId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: 'Lỗi kết nối AI' };
    }
};

export const getChatHistory = async (sessionId) => {
    try {
        const response = await axios.get(`${API_URL}/chat/history/${sessionId}`);
        return response.data;
    } catch (error) {
        return { success: false, message: 'Lỗi tải lịch sử' };
    }
};
