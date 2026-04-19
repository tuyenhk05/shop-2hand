import { adminGet, adminPut, adminDelete } from '../../untils/adminRequest.jsx';

export const getAllOrders = async () => adminGet('/orders');

export const updateOrderStatus = async (id, status) => adminPut(`/orders/${id}`, { status });

export const cancelOrder = async (id) => adminDelete(`/orders/${id}`);
