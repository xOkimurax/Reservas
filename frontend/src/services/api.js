import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const serviciosApi = {
  obtenerServicios: () => api.get('/servicios'),
  obtenerServicioPorId: (id) => api.get(`/servicios/${id}`),
  crearServicio: (servicio) => api.post('/servicios', servicio),
  actualizarServicio: (id, servicio) => api.put(`/servicios/${id}`, servicio),
  eliminarServicio: (id) => api.delete(`/servicios/${id}`),
};

export const reservasApi = {
  crearReserva: (reserva) => api.post('/reservas', reserva),
  obtenerReservas: (params = {}) => api.get('/reservas', { params }),
  obtenerReservaPorId: (id) => api.get(`/reservas/${id}`),
  confirmarReserva: (id, emailGestor = null) => {
    const params = emailGestor ? { emailGestor } : {};
    return api.put(`/reservas/${id}/confirmar`, null, { params });
  },
  rechazarReserva: (id, emailGestor = null) => {
    const params = emailGestor ? { emailGestor } : {};
    return api.put(`/reservas/${id}/rechazar`, null, { params });
  },
};

export const usuariosApi = {
  obtenerUsuarios: (params = {}) => api.get('/usuarios', { params }),
  obtenerUsuarioPorId: (id) => api.get(`/usuarios/${id}`),
  crearUsuario: (usuario) => api.post('/usuarios', usuario),
  actualizarUsuario: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  eliminarUsuario: (id) => api.delete(`/usuarios/${id}`),
  obtenerRoles: () => api.get('/usuarios/roles'),
  obtenerUsuariosConReservas: () => api.get('/usuarios/con-reservas'),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  validateToken: (token) => api.post('/auth/validate', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export default api;