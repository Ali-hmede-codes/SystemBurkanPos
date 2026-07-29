import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const storeService = {
  getAll: () => api.get('/stores'),
  getById: (id) => api.get(`/stores/${id}`),
  create: (data) => api.post('/stores', data),
  update: (id, data) => api.put(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

export const categoryService = {
  getAll: (storeId) => api.get('/categories', { params: { store_id: storeId } }),
  getByStore: (storeId) => api.get(`/categories/store/${storeId}`),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const productService = {
  getAll: (storeId, categoryId) => api.get('/products', { params: { store_id: storeId, category_id: categoryId } }),
  getByStore: (storeId) => api.get(`/products/store/${storeId}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const billService = {
  getAll: (storeId, status) => api.get('/bills', { params: { store_id: storeId, status } }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  updateStatus: (id, status) => api.patch(`/bills/${id}/status`, { status }),
  delete: (id) => api.delete(`/bills/${id}`),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
