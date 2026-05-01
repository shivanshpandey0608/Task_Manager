import api from '@/lib/api';

export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data),
  getDashboard: () => api.get('/tasks/dashboard'),
};
