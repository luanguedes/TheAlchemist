import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios'; // Importe axios direto para a chamada de login inicial

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar, verifica se tem token salvo
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Aqui poderíamos chamar uma rota /me para pegar dados do user, 
      // mas por enquanto vamos assumir que está logado.
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Chama a rota que criamos no Django
    const response = await axios.post('http://127.0.0.1:8000/api/token/', {
      username,
      password
    });

    if (response.data.access) {
      const token = response.data.access;
      localStorage.setItem('token', token);
      
      // Configura o axios para enviar esse token em todas as próximas requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ username, token });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};