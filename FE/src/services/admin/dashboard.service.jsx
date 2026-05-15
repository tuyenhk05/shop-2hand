import { adminGet } from "../../untils/adminRequest";

export const getDashboardStats = async (revenueRange = 30) => {
    return await adminGet("/dashboard/stats", { revenueRange });
};
