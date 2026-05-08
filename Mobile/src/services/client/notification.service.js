import { get, patch } from "../../utils/request";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/api";

const NOTIFICATION_SOCKET_URL = SOCKET_URL + "/notifications";

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
    return io(NOTIFICATION_SOCKET_URL, {
        transports: ['websocket'], // Quan trọng cho React Native
    });
};
