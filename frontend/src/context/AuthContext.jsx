import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 

// 1. Cria o Contexto (NÃO EXPORTAMOS MAIS ISSO DIRETAMENTE)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoverUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Configura o token nas requisições ao recarregar a página
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

// 2. Hook Personalizado (A MANEIRA CERTA DE USAR)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};