import { adminGet, adminPut, adminDelete } from '../../untils/adminRequest.jsx';

export const getAllUsers = async () => adminGet('/users');

export const updateUser = async (id, body) => adminPut(`/users/${id}`, body);

export const deleteUser = async (id) => adminDelete(`/users/${id}`);
