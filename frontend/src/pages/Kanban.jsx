import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectService } from '../services/projectService';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function Kanban() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de Criação
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [addingCardToColumnId, setAddingCardToColumnId] = useState(null);
  const [newCardContent, setNewCardContent] = useState('');

  // Estados de Exclusão
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  async function loadProject() {
    try {
      const data = await projectService.getById(id);
      // Ordenação inicial para garantir que o front mostre o que o banco tem
      data.colunas.sort((a, b) => a.ordem - b.ordem);
      data.colunas.forEach(col => col.cards.sort((a, b) => a.ordem - b.ordem));
      setProject(data);
    } catch (error) {
      toast.error("Erro ao carregar projeto.");
    } finally {
      setLoading(false);
    }
  }

  // --- LÓGICA DO DRAG AND DROP (Atualizada) ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // 1. Se soltou fora ou no mesmo lugar
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 2. Clone Profundo (Deep Clone) para Atualização Otimista
    // Usamos JSON.parse/stringify ou spread manual cuidadoso para não mutar o estado diretamente
    const newProject = { ...project, colunas: [...project.colunas] };
    
    // Encontra índices das colunas
    const sourceColIndex = newProject.colunas.findIndex(c => c.id.toString() === source.droppableId);
    const destColIndex = newProject.colunas.findIndex(c => c.id.toString() === destination.droppableId);

    const sourceCol = { ...newProject.colunas[sourceColIndex], cards: [...newProject.colunas[sourceColIndex].cards] };
    const destCol = sourceColIndex === destColIndex 
      ? sourceCol // Se for a mesma coluna, usa a referência já clonada
      : { ...newProject.colunas[destColIndex], cards: [...newProject.colunas[destColIndex].cards] };

    // Remove da origem
    const [movedCard] = sourceCol.cards.splice(source.index, 1);
    
    // Atualiza o ID da coluna no objeto card (para consistência interna)
    movedCard.coluna = parseInt(destination.droppableId);
    
    // Adiciona no destino
    destCol.cards.splice(destination.index, 0, movedCard);

    // Atualiza o array de colunas no projeto clonado
    newProject.colunas[sourceColIndex] = sourceCol;
    newProject.colunas[destColIndex] = destCol;

    // Atualiza visualmente AGORA (sem esperar o backend)
    setProject(newProject);
    
    // 3. Salva no Backend (Silenciosamente)
    try {
      await projectService.moveCard(
        draggableId,              // ID do Card
        destination.droppableId,  // ID da Nova Coluna
        destination.index         // Nova Posição (0, 1, 2...)
      );
    } catch (error) {
      console.error("Erro ao salvar movimentação:", error);
      toast.error("Erro ao sincronizar. Recarregando...");
      loadProject(); // Reverte para o estado do servidor se der erro
    }
  };

  // --- Funções CRUD ---
  async function handleAddColumn(e) {
    e.preventDefault();
    if (!newColumnTitle) return;
    const promise = projectService.createColumn(id, newColumnTitle);
    toast.promise(promise, { loading: 'Criando...', success: 'Criado!', error: 'Erro.' });
    try { await promise; setNewColumnTitle(''); setIsAddingColumn(false); loadProject(); } catch (e) {}
  }

  async function handleAddCard(e, columnId) {
    e.preventDefault();
    if (!newCardContent) return;
    try {
      await projectService.createCard(columnId, newCardContent);
      setNewCardContent('');
      setAddingCardToColumnId(null);
      loadProject();
    } catch (error) { toast.error("Erro ao adicionar card."); }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'column') {
        await projectService.deleteColumn(itemToDelete.id);
        toast.success("Lista removida.");
      } else if (itemToDelete.type === 'card') {
        await projectService.deleteCard(itemToDelete.id);
        toast.success("Card removido.");
      }
      loadProject();
    } catch (error) { toast.error("Erro ao excluir."); } 
    finally { setItemToDelete(null); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando Board...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Projeto não encontrado.</div>;

  return (
    <div className="flex flex-col h-full bg-indigo-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* HEADER RESPONSIVO */}
      <header className="px-4 py-3 md:px-6 md:py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <Link to="/" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 truncate">
              <span className="truncate">{project.titulo}</span>
              <span className="hidden sm:inline-block text-xs font-normal px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full shrink-0">
                {project.total_membros} membros
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* DRAG DROP CONTEXT */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* SNAP SCROLL CONTAINER (Mobile Magic) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 snap-x snap-mandatory">
          <div className="flex h-full gap-4 md:gap-6">
            
            {project.colunas.map(coluna => (
              // COLUNA RESPONSIVA (85vw no mobile, 80 (320px) no desktop)
              <div key={coluna.id} className="w-[85vw] md:w-80 flex-shrink-0 flex flex-col max-h-full snap-center snap-always">
                
                {/* Header Coluna */}
                <div className="flex justify-between items-center mb-3 px-1 group/col">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide truncate">
                    {coluna.titulo} <span className="text-gray-400 ml-2 font-normal">{coluna.cards.length}</span>
                  </h3>
                  {project.is_dono && (
                    <button onClick={() => setItemToDelete({ type: 'column', id: coluna.id })} className="text-gray-300 hover:text-red-500 lg:opacity-0 lg:group-hover/col:opacity-100 transition-all p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* DROPPABLE AREA */}
                <Droppable droppableId={coluna.id.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        bg-gray-100 dark:bg-gray-800/50 rounded-xl p-2 flex-1 overflow-y-auto custom-scrollbar border 
                        ${snapshot.isDraggingOver ? 'border-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700/50'}
                        transition-colors duration-200
                      `}
                    >
                      <div className="space-y-3 min-h-[10px]">
                        
                        {coluna.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={`
                                  bg-white dark:bg-gray-700 p-3 md:p-4 rounded-lg shadow-sm border 
                                  ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-2' : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'}
                                  group relative transition-all active:scale-95 touch-manipulation
                                `}
                              >
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed pr-6 break-words">
                                  {card.conteudo_original}
                                </p>

                                {project.is_dono && (
                                  <button
                                    onClick={() => setItemToDelete({ type: 'card', id: card.id })}
                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-2"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}

                                {card.prompt_refinado && (
                                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                                     <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded">
                                       Refinado IA
                                     </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {/* Input Novo Card */}
                      {addingCardToColumnId === coluna.id ? (
                        <form onSubmit={(e) => handleAddCard(e, coluna.id)} className="mt-3 animate-in fade-in zoom-in duration-200 pb-2">
                          <textarea
                            autoFocus
                            placeholder="Nova tarefa..."
                            className="w-full p-3 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none shadow-sm"
                            rows="3"
                            value={newCardContent}
                            onChange={e => setNewCardContent(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e, coluna.id); }}}
                          />
                          <div className="flex gap-2 mt-2">
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex-1">Adicionar</button>
                            <button type="button" onClick={() => setAddingCardToColumnId(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-xs px-2">Cancelar</button>
                          </div>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setAddingCardToColumnId(coluna.id)}
                          className="mt-3 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:bg-gray-300"
                        >
                          <Plus size={16} /> Adicionar Card
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Nova Coluna Mobile */}
            <div className="w-[85vw] md:w-80 flex-shrink-0 snap-center">
              {isAddingColumn ? (
                 <form onSubmit={handleAddColumn} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-in slide-in-from-right-4 duration-200">
                  <input autoFocus type="text" placeholder="Nome da lista..." className="w-full mb-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white" value={newColumnTitle} onChange={e => setNewColumnTitle(e.target.value)} />
                  <div className="flex justify-between items-center gap-3">
                    <button type="button" onClick={() => setIsAddingColumn(false)} className="text-gray-500 dark:text-gray-400 text-sm p-2">Cancelar</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 flex-1">Salvar</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setIsAddingColumn(true)} className="w-full h-12 flex items-center justify-center gap-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all active:scale-95">
                  <Plus size={20} /> Nova Lista
                </button>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'column' ? "Excluir Lista" : "Excluir Card"}
        message={itemToDelete?.type === 'column' ? "Tem certeza? Todos os cards desta lista também serão apagados para sempre." : "Tem certeza que deseja apagar este card?"}
        confirmText="Sim, excluir"
        isDanger={true}
      />
    </div>
  );
}