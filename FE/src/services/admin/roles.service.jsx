import { adminGet, adminPost, adminPut, adminDelete } from '../../untils/adminRequest.jsx';

export const getAllRoles = async () => adminGet('/roles');

export const createRole = async (body) => adminPost('/roles', body);

export const updateRole = async (id, body) => adminPut(`/roles/${id}`, body);

export const deleteRole = async (id) => adminDelete(`/roles/${id}`);
