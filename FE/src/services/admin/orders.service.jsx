import { adminGet, adminPut, adminDelete } from '../../untils/adminRequest.jsx';

export const getAllOrders = async (params = {}) => adminGet('/orders', params);

export const getOrderById = async (id) => adminGet(`/orders/${id}`);

export const updateOrderStatus = async (id, status) => adminPut(`/orders/${id}`, { status });

export const cancelOrder = async (id) => adminDelete(`/orders/${id}`);
