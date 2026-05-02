import { get, post } from '../../utils/request';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.14:3001';

// --- Client REST API -----------------------------------------

export const createConversationApi = async (data) => {
    return await post('/support', data);
};

export const getMyConversationsApi = async () => {
    return await get('/support/my');
};

export const getConversationByIdApi = async (id) => {
    return await get(`/support/${id}`);
};

export const markReadByCustomerApi = async (id) => {
    return await post(`/support/${id}/read`, {});
};

// --- Admin REST API -----------------------------------------

export const getAllConversationsAdminApi = async () => {
    return await get('/support/admin/conversations');
};

export const getConversationDetailAdminApi = async (id) => {
    return await get(`/support/admin/conversations/${id}`);
};

export const closeConversationApi = async (id) => {
    return await post(`/support/admin/conversations/${id}/close`, {});
};

export const markReadByAdminApi = async (id) => {
    return await post(`/support/admin/conversations/${id}/read`, {});
};

export const getUnreadCountApi = async () => {
    return await get('/support/admin/unread-count');
};

// --- Socket.IO -----------------------------------------------

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
