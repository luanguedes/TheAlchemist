import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Adicione este interceptador:
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o erro for 401 (Não autorizado/Token inválido)
    if (error.response && error.response.status === 401) {
      // Remove o token podre
      localStorage.removeItem('token');
      
      // Se não estivermos já na tela de login, redireciona
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;