import { adminGet, adminPut, adminPost } from '../../untils/adminRequest.jsx';

export const getAllConsignments = async () => adminGet('/consignments');

export const updateConsignmentStatus = async (id, body) => adminPut(`/consignments/${id}`, body);

export const convertToProductApi = async (id) => adminPost(`/consignments/${id}/convert`);
