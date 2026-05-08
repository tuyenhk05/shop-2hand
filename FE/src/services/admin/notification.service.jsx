import { get, patch } from "../../untils/request";

export const getAdminNotificationsApi = async () => {
    return await get("/admin/notifications");
};

export const markAdminAsReadApi = async (id) => {
    return await patch(`/admin/notifications/${id}/read`);
};

export const markAdminAllAsReadApi = async () => {
    return await patch("/admin/notifications/read-all");
};
