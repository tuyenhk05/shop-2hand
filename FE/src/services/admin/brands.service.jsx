import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/adminRequest';

export const getAllBrandsAdminApi = async (params = {}) => {
    return await adminGet('/brands', params);
};

export const getBrandDetailAdminApi = async (id) => {
    return await adminGet(`/brands/${id}`);
};

export const createBrandAdminApi = async (data) => {
    return await adminPost('/brands', data);
};

export const updateBrandAdminApi = async (id, data) => {
    return await adminPut(`/brands/${id}`, data);
};

export const deleteBrandAdminApi = async (id) => {
    return await adminDelete(`/brands/${id}`);
};
