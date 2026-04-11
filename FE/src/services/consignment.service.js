import { get, post } from "../untils/request";

export const getConsignmentsApi = async (userId) => {
    return await get(`/consignments/${userId}`);
};

export const createConsignmentApi = async (consignmentData) => {
    return await post(`/consignments/create`, consignmentData);
};
