import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderGit2, Trash2, ArrowRight, Users, UserCheck } from 'lucide-react';
import { projectService } from '../services/projectService';
import AgentsModal from '../components/AgentsModal';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

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
      loadProjects(); 
    } catch (error) {
      alert("Erro ao criar projeto");
    }
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    if (confirm("Tem certeza que quer apagar este projeto?")) {
      await projectService.delete(id);
      loadProjects();
    }
  }

  // Filtragem dos Projetos
  const myProjects = projects.filter(p => p.is_dono);
  const sharedProjects = projects.filter(p => !p.is_dono);

  // Componente Interno do Card para evitar repetição de código
  const ProjectCard = ({ project, isShared }) => (
    <Link 
      to={`/projeto/${project.id}`} 
      className={`
        group p-6 rounded-xl border shadow-sm transition-all relative flex flex-col justify-between h-48
        /* Dark Mode Classes Adicionadas Aqui */
        ${isShared 
          ? 'bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 hover:border-purple-300' 
          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md'}
      `}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 rounded-lg transition-colors 
            ${isShared 
              ? 'bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
              : 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'}
          `}>
            {isShared ? <Users size={20} /> : <FolderGit2 size={20} />}
          </div>
          
          {/* Badge de Membros */}
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
            <Users size={12} /> {project.total_membros || 1}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight mb-1">{project.titulo}</h3>
        
        {/* Descrição ou Nome do Dono */}
        {isShared ? (
           <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">Dono: {project.nome_dono}</p>
        ) : (
           <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.descricao || "Sem descrição"}</p>
        )}
      </div>
      
      <div className="flex justify-between items-end mt-auto">
        <div className={`flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isShared ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
           Abrir <ArrowRight size={16} className="ml-1" />
        </div>

        {/* Só mostra lixeira se for MEU projeto */}
        {!isShared && (
           <button 
             onClick={(e) => handleDelete(project.id, e)}
             className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors p-1"
             title="Apagar Projeto"
           >
             <Trash2 size={18} />
           </button>
        )}
      </div>
    </Link>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Projetos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas ideias e tarefas</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={20} /> Novo Projeto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando projetos...</div>
      ) : (
        <div className="space-y-12">
          
          {/* SEÇÃO 1: Meus Projetos */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isShared={false} />
              ))}
              
              {/* Estado Vazio */}
              {myProjects.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não tem projetos.</p>
                  <button onClick={() => setShowModal(true)} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Comece criando um agora
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 2: Projetos Compartilhados */}
          {sharedProjects.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <UserCheck size={24} className="text-purple-600 dark:text-purple-400"/> 
                Compartilhados Comigo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} isShared={true} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* Modal de Criação (Com Dark Mode) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200 border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Novo Projeto</h2>
            <input 
              autoFocus
              type="text" 
              placeholder="Nome do Projeto (ex: App Delivery)" 
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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