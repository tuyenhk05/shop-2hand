const ADMIN_API = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001/admin';

// Lấy token từ localStorage
const getToken = () => localStorage.getItem('token');

const getHeaders = (isFormData = false) => {
    const headers = {
        Authorization: `Bearer ${getToken()}`,
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
    }
    return headers;
};

export const adminGet = async (path, params = {}) => {
    try {
        let url = `${ADMIN_API}${path}`;

        // Append query parameters if provided
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const res = await fetch(url, {
            headers: getHeaders(),
        });
        return await res.json();
    } catch (error) {
        console.error('Admin GET error:', error);
        return { success: false, message: error.message };
    }
};

export const adminPost = async (path, body) => {
    try {
        const isFormData = body instanceof FormData;
        const res = await fetch(`${ADMIN_API}${path}`, {
            method: 'POST',
            headers: getHeaders(isFormData),
            body: isFormData ? body : JSON.stringify(body),
        });
        return await res.json();
    } catch (error) {
        console.error('Admin POST error:', error);
        return { success: false, message: error.message };
    }
};

export const adminPut = async (path, body) => {
    try {
        const isFormData = body instanceof FormData;
        const res = await fetch(`${ADMIN_API}${path}`, {
            method: 'PUT',
            headers: getHeaders(isFormData),
            body: isFormData ? body : JSON.stringify(body),
        });
        return await res.json();
    } catch (error) {
        console.error('Admin PUT error:', error);
        return { success: false, message: error.message };
    }
};

export const adminPatch = async (path, body) => {
    try {
        const res = await fetch(`${ADMIN_API}${path}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return await res.json();
    } catch (error) {
        console.error('Admin PATCH error:', error);
        return { success: false, message: error.message };
    }
};

export const adminDelete = async (path) => {
    try {
        const res = await fetch(`${ADMIN_API}${path}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return await res.json();
    } catch (error) {
        console.error('Admin DELETE error:', error);
        return { success: false, message: error.message };
    }
};
