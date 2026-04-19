import { adminGet, adminPut } from '../../untils/adminRequest.jsx';

export const getAllConsignments = async () => adminGet('/consignments');

export const updateConsignmentStatus = async (id, body) => adminPut(`/consignments/${id}`, body);
