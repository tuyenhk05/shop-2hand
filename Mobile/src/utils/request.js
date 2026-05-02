import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';

const getToken = async () => await AsyncStorage.getItem('token');

const getHeaders = async (isFormData = false) => {
    const headers = {};
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
    }
    return headers;
};

export const get = async (path) => {
    try {
        const response = await fetch(`${BASE_URL + path}`, {
            headers: await getHeaders()
        });
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            return { success: false, message: data?.message || `Lỗi: ${response.status} ${response.statusText}` };
        }
        return data;
    } catch (error) {
        console.error('Error in GET request:', error);
        return { success: false, message: error.message };
    }
};

export const post = async (path, body) => {
    try {
        const response = await fetch(`${BASE_URL + path}`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            return { success: false, message: data?.message || `Lỗi: ${response.status} ${response.statusText}` };
        }
        return data;
    } catch (error) {
        console.error('Error in POST request:', error);
        return { success: false, message: error.message };
    }
};

export const postFormData = async (path, formData) => {
    try {
        const response = await fetch(`${BASE_URL + path}`, {
            method: 'POST',
            headers: await getHeaders(true),
            body: formData,
        });
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            return { success: false, message: data?.message || `Lỗi: ${response.status} ${response.statusText}` };
        }
        return data;
    } catch (error) {
        console.error('Error in POST Form Data:', error);
        return { success: false, message: error.message };
    }
};

export const del = async (path) => {
    try {
        const response = await fetch(`${BASE_URL + path}`, {
            method: 'DELETE',
            headers: await getHeaders()
        });
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            return { success: false, message: data?.message || `Lỗi: ${response.status} ${response.statusText}` };
        }
        return data;
    } catch (error) {
        console.error('Error in DELETE request:', error);
        return { success: false, message: error.message };
    }
};

export const put = async (path, body) => {
    try {
        const result = await fetch(`${BASE_URL + path}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        let data;
        try {
            data = await result.json();
        } catch (e) {
            data = null;
        }

        if (!result.ok) {
            return { success: false, message: data?.message || `Lỗi: ${result.status} ${result.statusText}` };
        }
        return data;
    } catch (error) {
        console.error('Error in PUT request:', error);
        return { success: false, message: error.message };
    }
};

export const patch = async (path, body) => {
    try {
        const result = await fetch(`${BASE_URL + path}`, {
            method: 'PATCH',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        let data;
        try {
            data = await result.json();
        } catch (e) {
            data = null;
        }

        if (!result.ok) {
            return { success: false, message: data?.message || `Lỗi: ${result.status} ${result.statusText}` };
        }
        return data;
    } catch (error) {
        console.error('Error in PATCH request:', error);
        return { success: false, message: error.message };
    }
};
