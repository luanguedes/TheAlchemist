import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderGit2, Trash2, ArrowRight } from 'lucide-react';
import { projectService } from '../services/projectService';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Carregar projetos ao abrir a tela
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao carregar:", error);
      alert("Erro ao conectar com o Django. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      await projectService.create({ 
        titulo: newProjectName, 
        descricao: "Criado via Dashboard" 
      });
      setShowModal(false);
      setNewProjectName('');
      loadProjects(); // Recarrega a lista
    } catch (error) {
      alert("Erro ao criar projeto");
    }
  }

  async function handleDelete(id, e) {
    e.preventDefault(); // Evita entrar no link ao clicar em deletar
    if (confirm("Tem certeza que quer apagar este projeto?")) {
      await projectService.delete(id);
      loadProjects();
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meus Projetos</h1>
          <p className="text-gray-500 mt-1">Gerencie suas ideias e tarefas</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={20} /> Novo Projeto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Carregando projetos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Cada Projeto */}
          {projects.map((project) => (
            <Link 
              to={`/projeto/${project.id}`} 
              key={project.id}
              className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FolderGit2 size={24} />
                </div>
                <button 
                  onClick={(e) => handleDelete(project.id, e)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{project.titulo}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {project.descricao || "Sem descrição"}
              </p>
              
              <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:underline">
                Abrir Board <ArrowRight size={16} className="ml-1" />
              </div>
            </Link>
          ))}

          {/* Estado Vazio */}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Nenhum projeto encontrado.</p>
              <button onClick={() => setShowModal(true)} className="text-indigo-600 font-semibold hover:underline">
                Crie seu primeiro projeto agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Simples de Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Novo Projeto</h2>
            <input 
              autoFocus
              type="text" 
              placeholder="Nome do Projeto (ex: App Delivery)" 
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}