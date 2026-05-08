import { get, patch } from "../../untils/request";
import { io } from "socket.io-client";

// Lấy link từ .env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL + "/notifications";

export const getNotificationsApi = async () => {
    return await get("/notifications");
};

export const markAsReadApi = async (id) => {
    return await patch(`/notifications/${id}/read`);
};

export const markAllAsReadApi = async () => {
    return await patch("/notifications/read-all");
};

export const connectNotificationSocket = () => {
    return io(SOCKET_URL, {
        withCredentials: true,
    });
};
