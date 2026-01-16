import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Settings, Layers, FolderGit2 } from 'lucide-react';
import Dashboard from './pages/Dashboard'; // <--- O Import do arquivo real

// REMOVI O "const Dashboard" antigo daqui para não dar conflito

// Estes continuam aqui pois ainda não criamos os arquivos reais deles
const Kanban = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Kanban Board</h1>
    <p className="text-gray-600">Aqui entrará o arrasta-e-solta.</p>
  </div>
);

const ConfiguracoesAI = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Gerenciar Agentes de IA</h1>
    <p className="text-gray-600">Aqui você cria os prompts personalizados.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        
        {/* Sidebar Lateral */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <Layers className="w-6 h-6" /> 
              Refinaria
            </h2>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all font-medium">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            
            {/* Link temporário de exemplo */}
            <Link to="/projeto/1" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all font-medium">
              <FolderGit2 size={20} /> Projeto Demo
            </Link>

            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all font-medium">
              <Settings size={20} /> Configurar IA
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400">
            v1.0.0 Alpha
          </div>
        </aside>

        {/* Área Principal */}
        <main className="flex-1 overflow-auto relative">
          <Routes>
            <Route path="/" element={<Dashboard />} /> 
            <Route path="/projeto/:id" element={<Kanban />} />
            <Route path="/settings" element={<ConfiguracoesAI />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;