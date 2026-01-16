import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/'); // Manda para a Dashboard
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Esquerdo (Visual) - Em mobile fica em cima */}
        <div className="w-full bg-indigo-600 p-8 flex flex-col justify-center items-center text-white text-center">
          <div className="bg-white/20 p-3 rounded-full mb-4 backdrop-blur-sm">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">TheAlchemist</h1>
          <p className="text-indigo-100 text-sm">Transmute suas ideias em realidade.</p>
        </div>

        {/* Lado Direito (Formulário) */}
        <div className="w-full p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Bem-vindo de volta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
                Usuário ou senha incorretos.
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            Ainda não tem conta? Peça ao administrador.
          </div>
        </div>

      </div>
    </div>
  );
}