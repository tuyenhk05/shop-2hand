import { adminGet } from '../../untils/adminRequest.jsx';

export const getDashboardStats = async () => {
    return await adminGet('/dashboard/stats');
};
