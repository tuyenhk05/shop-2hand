const API = `http://localhost:3001/api`;

export const get = async (path) => {
    try {
        const response = await fetch(`${API + path}`);
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
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
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
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
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
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error('Error in PATCH request:', error);
        return { success: false, message: error.message };
    }
}