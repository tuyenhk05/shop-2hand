import { adminGet, adminPost } from '../../untils/adminRequest.jsx';

export const getAdminSettings = async () => adminGet('/settings');

export const updateAdminSettings = async (body) => adminPost('/settings', body);
