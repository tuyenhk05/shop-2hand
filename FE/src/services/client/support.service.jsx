import axios from 'axios';
import { io } from 'socket.io-client';

const API_CLIENT = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_ADMIN  = import.meta.env.VITE_API_URL_ADMIN || 'http://localhost:3001/admin';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') ||
        document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
    return { Authorization: `Bearer ${token}` };
};

// ─── Client REST API ───────────────────────────────────────

// Tạo hội thoại mới
export const createConversationApi = async (data) => {
    const res = await axios.post(`${API_CLIENT}/support`, data, { headers: getAuthHeaders() });
    return res.data;
};

// Lấy danh sách hội thoại của khách hàng
export const getMyConversationsApi = async () => {
    const res = await axios.get(`${API_CLIENT}/support/my`, { headers: getAuthHeaders() });
    return res.data;
};

// Lấy chi tiết hội thoại (client)
export const getConversationByIdApi = async (id) => {
    const res = await axios.get(`${API_CLIENT}/support/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// Đánh dấu đã đọc (client)
export const markReadByCustomerApi = async (id) => {
    const res = await axios.post(`${API_CLIENT}/support/${id}/read`, {}, { headers: getAuthHeaders() });
    return res.data;
};

// ─── Admin REST API ────────────────────────────────────────

// Lấy tất cả conversations (admin)
export const getAllConversationsAdminApi = async (params = {}) => {
    const res = await axios.get(`${API_ADMIN}/support/conversations`, {
        headers: getAuthHeaders(),
        params
    });
    return res.data;
};

// Lấy chi tiết (admin)
export const getConversationDetailAdminApi = async (id) => {
    const res = await axios.get(`${API_ADMIN}/support/conversations/${id}`, {
        headers: getAuthHeaders()
    });
    return res.data;
};

// Đóng hội thoại
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

// Lấy số tin chưa đọc (badge)
export const getUnreadCountApi = async () => {
    const res = await axios.get(`${API_ADMIN}/support/unread-count`, {
        headers: getAuthHeaders()
    });
    return res.data;
};

// ─── Socket.IO ─────────────────────────────────────────────

let socketInstance = null;

export const getSupportSocket = () => {
    if (!socketInstance) {
        socketInstance = io(`${SOCKET_URL}/support`, {
            autoConnect: false,
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
    }
    return socketInstance;
};

export const connectSupportSocket = () => {
    const socket = getSupportSocket();
    if (!socket.connected) socket.connect();
    return socket;
};

export const disconnectSupportSocket = () => {
    if (socketInstance?.connected) {
        socketInstance.disconnect();
    }
};
