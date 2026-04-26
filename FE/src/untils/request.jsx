const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = (isFormData = false) => {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
    }
    return headers;
};

export const get = async (path) => {
    try {
        const response = await fetch(`${API + path}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in GET request:', error);
        return { success: false, message: error.message };
    }
}

export const post = async (path, body) => {
    try {
        const response = await fetch(`${API + path}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in POST request:', error);
        return { success: false, message: error.message };
    }
}

export const postFormData = async (path, formData) => {
    try {
        const response = await fetch(`${API + path}`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in POST Form Data:', error);
        return { success: false, message: error.message };
    }
}

export const del = async (path) => {
    try {
        const response = await fetch(`${API + path}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in DELETE request:', error);
        return { success: false, message: error.message };
    }
}

export const put = async (path, body) => {
    try {
        const result = await fetch(`${API + path}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error('Error in PUT request:', error);
        return { success: false, message: error.message };
    }
}

export const patch = async (path, body) => {
    try {
        const result = await fetch(`${API + path}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error('Error in PATCH request:', error);
        return { success: false, message: error.message };
    }
}