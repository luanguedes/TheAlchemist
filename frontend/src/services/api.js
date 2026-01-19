import axios from 'axios';

const api = axios.create({
  // AQUI ESTÁ A CORREÇÃO:
  // Ele tenta pegar a URL do Railway (VITE_API_URL). 
  // Se não achar (quando você roda no seu PC), ele usa o localhost.
  baseURL: import.meta.env.VITE_API_URL,
});

// O resto continua igual...
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;