import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Removi useContext daqui
import { LayoutDashboard, Settings as SettingsIcon, Layers, LogOut, Menu, X } from 'lucide-react'; 
import { Toaster } from 'react-hot-toast';

// 1. IMPORTAÇÃO CORRIGIDA (Troquei AuthContext por useAuth)
import { AuthProvider, useAuth } from './context/AuthContext'; 

import ThemeToggle from './components/ThemeToggle';

// Páginas
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Kanban from './pages/Kanban';
import SettingsPage from './pages/Settings'; 

// Layout com Sidebar Responsiva
const PrivateLayout = () => {
  // 2. USO CORRIGIDO (Usando o Hook em vez do Contexto direto)
  const { authenticated, loading, logout } = useAuth(); 
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600 dark:text-indigo-400">Carregando...</div>;

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
        flex flex-col shadow-xl lg:shadow-none transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Layers className="w-6 h-6" /> TheAlchemist
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === '/settings' ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800'}`}>
            <SettingsIcon size={20} /> Configurar IA
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
           <ThemeToggle />
           <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full rounded-lg transition-colors text-sm font-medium">
             <LogOut size={18} /> Sair
           </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300 p-1">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-700 dark:text-white flex items-center gap-2">
              <Layers size={20} className="text-indigo-600 dark:text-indigo-400"/> TheAlchemist
          </span>
          <div className="w-6"></div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg',
            duration: 4000,
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projeto/:id" element={<Kanban />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;