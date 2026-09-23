import axios from 'axios';

const API_ADMIN = import.meta.env.VITE_API_URL_ADMIN || import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001/admin';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') ||
        document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
    return { Authorization: `Bearer ${token}` };
};

// Lấy tất cả conversations (admin)
export const getAllConversationsAdminApi = async (params = {}) => {
    const res = await axios.get(`${API_ADMIN}/support/conversations`, {
        headers: getAuthHeaders(),
        params
    });
    return res.data;
};

// Lấy chi tiết conversation (admin)
export const getConversationDetailAdminApi = async (id) => {
    const res = await axios.get(`${API_ADMIN}/support/conversations/${id}`, {
        headers: getAuthHeaders()
    });
    return res.data;
};

// Đóng hội thoại (admin)
export const closeConversationApi = async (id) => {
    const res = await axios.post(`${API_ADMIN}/support/conversations/${id}/close`, {}, {
        headers: getAuthHeaders()
    });
    return res.data;
};

// Đánh dấu đã đọc (admin)
export const markReadByAdminApi = async (id) => {
    const res = await axios.post(`${API_ADMIN}/support/conversations/${id}/read`, {}, {
        headers: getAuthHeaders()
    });
    return res.data;
};

// Lấy số tin chưa đọc (badge admin)
export const getUnreadCountApi = async () => {
    const res = await axios.get(`${API_ADMIN}/support/unread-count`, {
        headers: getAuthHeaders()
    });
    return res.data;
};
