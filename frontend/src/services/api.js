import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusflow_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  demo: () => api.get('/auth/demo'),
}

export const taskApi = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
}

export const calendarApi = { list: () => api.get('/calendar') }
export const emailApi = { sync: (emails) => api.post('/emails/sync', { emails }) }
export const gmailApi = {
  authorize: () => api.get('/integrations/gmail/authorize'),
  status: () => api.get('/integrations/gmail/status'),
  sync: () => api.post('/integrations/gmail/sync'),
  disconnect: () => api.post('/integrations/gmail/disconnect'),
}

export const tierApi = {
  getStatus: () => api.get('/tier/status'),
  switchTier: (tier, userId) => api.post('/tier/switch', { tier, user_id: userId }),
  adminSwitchTier: (data) => api.post('/admin/tier/switch', data),
  adminResetQuota: (userId) => api.post('/admin/quota/reset', { user_id: userId }),
  adminListUsers: () => api.get('/admin/users'),
}

export const paymentApi = {
  createOrder: (tier = 'pro') => api.post('/payments/create-order', { tier }),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
}

export default api
