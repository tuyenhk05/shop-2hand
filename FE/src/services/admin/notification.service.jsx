import { adminGet, adminPatch } from "../../untils/adminRequest";

export const getAdminNotificationsApi = async () => {
    return await adminGet("/notifications");
};

export const markAdminAsReadApi = async (id) => {
    return await adminPatch(`/notifications/${id}/read`);
};

export const markAdminAllAsReadApi = async () => {
    return await adminPatch("/notifications/read-all");
};
