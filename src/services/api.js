import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
});

// Add a request interceptor to attach JWT token
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('neon_user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const productAPI = {
    getAll: () => API.get('/products'),
    getById: (id) => API.get(`/products/${id}`),
    create: (data) => API.post('/products', data),
    delete: (id) => API.delete(`/products/${id}`),
    update: (id, data) => API.put(`/products/${id}`, data),
    addReview: (id, review) => API.post(`/products/${id}/reviews`, review),
};

export const authAPI = {
    login: (data) => API.post('/users/login', data),
    register: (data) => API.post('/users/register', data),
    updateProfile: (data) => API.put('/users/profile', data),
    getAllUsers: () => API.get('/users'),
    deleteUser: (id) => API.delete(`/users/${id}`),
    updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
};

export const orderAPI = {
    create: (data) => API.post('/orders', data),
    getAll: () => API.get('/orders'),
    updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
    delete: (id) => API.delete(`/orders/${id}`),
    clearCancelled: () => API.delete('/orders/status/cancelled'),
};

export const categoryAPI = {
    getAll: () => API.get('/categories'),
    create: (name) => API.post('/categories', { name }),
    delete: (id) => API.delete(`/categories/${id}`),
};

export const couponAPI = {
    getAll: () => API.get('/coupons'),
    create: (data) => API.post('/coupons', data),
    delete: (id) => API.delete(`/coupons/${id}`),
};

export const settingsAPI = {
    getAll: () => API.get('/settings'),
    update: (key, value) => API.post('/settings', { key, value }),
};

export const cartAPI = {
    get: (userId) => API.get(`/cart/${userId}`),
    update: (data) => API.post('/cart', data),
};

export const wishlistAPI = {
    get: (userId) => API.get(`/wishlist/${userId}`),
    update: (data) => API.post('/wishlist', data),
};

export default API;
