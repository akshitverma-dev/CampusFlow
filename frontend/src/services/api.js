import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
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
}
export default api
