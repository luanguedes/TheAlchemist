import { useState } from 'react'; // Removi useContext, não precisa mais
import { useAuth } from '../context/AuthContext'; // <--- IMPORTANTE: Importa o Hook
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, User, Layers } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // USANDO O HOOK AQUI
  const { login } = useAuth(); 
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/'); // Manda para a Dashboard
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">
      
      {/* LADO ESQUERDO - Visual e Branding (Escondido em celular) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 dark:bg-indigo-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Círculos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          
          {/* LOGO NO TOPO */}
          <div className="flex items-center gap-3 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
               <Layers size={28} className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">TheAlchemist</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Transmute ideias em <span className="text-indigo-200">realidade.</span>
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed mb-8">
            Gerencie projetos, refine requisitos com IA e organize seu fluxo de trabalho em um único lugar. O TheAlchemist é a sua forja de ideias.
          </p>
          
          <div className="flex gap-4 text-sm font-medium text-indigo-200 border-t border-indigo-500/30 pt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Sistema Online
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div> v1.0.0 Alpha
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          
          {/* Cabeçalho Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
             <div className="bg-indigo-600 p-2 rounded-lg">
               <Layers size={24} className="text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white">TheAlchemist</h2>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Entre com suas credenciais para acessar
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all outline-none"
                    placeholder="Seu nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Acesso negado</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      Usuário ou senha incorretos. Tente novamente.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Não tem uma conta? <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">Fale com o Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}