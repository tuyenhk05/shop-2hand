import { adminGet, adminPost, adminPut, adminPatch, adminDelete } from '../../untils/adminRequest.jsx';

export const getAllProducts = async () => adminGet('/products');

export const getProductById = async (id) => adminGet(`/products/${id}`);

export const createProduct = async (formData) => adminPost('/products', formData);

export const updateProduct = async (id, formData) => adminPut(`/products/${id}`, formData);

export const updateProductStatus = async (id, status) => adminPatch(`/products/${id}/status`, { status });

export const deleteProduct = async (id) => adminDelete(`/products/${id}`);

export const deleteProductImage = async (imageId) => adminDelete(`/products/images/${imageId}`);
