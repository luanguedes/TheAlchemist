import axios from 'axios';

const api = axios.create({
  // Se o seu Django estiver em outra porta, altere aqui
  baseURL: 'http://127.0.0.1:8000/api/', 
});

export default api;