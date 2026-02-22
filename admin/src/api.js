const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Core fetch wrapper
const request = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers: customHeaders = {} } = options;

    const headers = { ...customHeaders };

    const config = {
        method,
        headers,
        credentials: 'include' // Important for sending/receiving cookies
    };

    if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        config.body = body;
    }

    const res = await fetch(`${API_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error || 'Request failed');
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
};

const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

    // File upload
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return request('/upload', { method: 'POST', body: formData });
    },

    // Auth helpers
    auth: {
        signup: (data) => api.post('/auth/signup', data),
        login: (data) => api.post('/auth/login', data),
        logout: () => api.post('/auth/logout'),
        verifyOtp: (data) => api.post('/auth/verify-otp', data),
        resendOtp: (data) => api.post('/auth/resend-otp', data),
        getUser: async () => {
            try {
                return await api.get('/auth/me');
            } catch {
                return null;
            }
        },
    },
};

export default api;
