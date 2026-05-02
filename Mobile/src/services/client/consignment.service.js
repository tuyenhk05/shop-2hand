import { get, post, postFormData, patch } from "../../utils/request";

export const getConsignmentsApi = async (userId) => {
    return await get(`/consignments/${userId}`);
};

export const createConsignmentApi = async (formData) => {
    return await postFormData(`/consignments/create`, formData);
};

export const updateUserConsignmentStatusApi = async (id, statusData) => {
    return await patch(`/consignments/${id}/status`, statusData);
};
