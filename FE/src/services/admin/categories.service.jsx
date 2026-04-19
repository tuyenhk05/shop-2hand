import { adminGet, adminPost, adminPut, adminDelete } from '../../untils/adminRequest.jsx';

export const getAllCategories = async () => adminGet('/categories');

export const createCategory = async (body) => adminPost('/categories', body);

export const updateCategory = async (id, body) => adminPut(`/categories/${id}`, body);

export const deleteCategory = async (id) => adminDelete(`/categories/${id}`);
