import axios from 'axios';

const api = axios.create({
  // AQUI ESTÁ A MÁGICA: O IP DO SEU PC
  baseURL: 'http://192.168.0.13:8000/api/',
});

export default api;