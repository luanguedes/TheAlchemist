import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { LayoutDashboard, Settings, Layers, FolderGit2, LogOut } from 'lucide-react';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Placeholders
const Kanban = () => <div className="p-8"><h1>Kanban (Em breve)</h1></div>;
const ConfiguracoesAI = () => <div className="p-8"><h1>Configurações</h1></div>;

// Layout com Sidebar (Só aparece para usuário logado)
const PrivateLayout = () => {
  const { authenticated, loading, logout } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600">Carregando TheAlchemist...</div>;

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Layers className="w-6 h-6" /> Refinaria
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all font-medium">
            <Settings size={20} /> Configurar IA
          </Link>
        </nav>

        {/* Botão de Logout */}
        <div className="p-4 border-t border-gray-100">
           <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 w-full rounded-lg transition-colors text-sm font-medium">
             <LogOut size={18} /> Sair
           </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Todas as rotas aqui dentro terão Sidebar e proteção */}
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projeto/:id" element={<Kanban />} />
            <Route path="/settings" element={<ConfiguracoesAI />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;