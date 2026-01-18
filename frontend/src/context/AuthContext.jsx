import { createContext, useState, useEffect } from 'react';
import api from '../services/api'; 
// Removi o 'axios' daqui porque vamos usar só o 'api' que já está configurado

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoverUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Configura o token nas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Mantemos o usuário na sessão
        setUser({ token });
      }
      
      setLoading(false);
    };

    recoverUser();
  }, []);

  const login = async (username, password) => {
    try {
        // CORREÇÃO AQUI: Usamos 'api.post' sem a URL completa.
        // Ele vai pegar o IP (192.168.137.1) que configuramos no services/api.js
        const response = await api.post('token/', {
          username,
          password
        });

        if (response.data.access) {
          const token = response.data.access;
          localStorage.setItem('token', token);
          
          // Configura o token para as próximas chamadas
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          setUser({ username, token });
          return true;
        }
        return false;
    } catch (error) {
        console.error("Erro de Login:", error);
        return false;
    }
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