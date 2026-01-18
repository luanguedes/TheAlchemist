import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, MoreHorizontal, Clock, AlertCircle, Sparkles, Trash2, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectService } from '../services/projectService';
import CardModal from '../components/CardModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { isPast, isToday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PASTEL_COLORS = ['#F1F5F9', '#E0F2FE', '#DCFCE7', '#FAE8FF', '#FEF9C3', '#FEE2E2'];

export default function Kanban() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DO MODAL (Unificado) ---
  const [modalData, setModalData] = useState(null); // null = fechado, {columnId} = criar, {id, ...} = editar
  
  // --- ESTADOS DA COLUNA (Nova Lista) ---
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumnId, setEditingColumnId] = useState(null);

  // --- ESTADO DE EXCLUSÃO ---
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { loadProject(); }, [id]);

  async function loadProject() {
    try {
      const data = await projectService.getById(id);
      data.colunas.sort((a, b) => a.ordem - b.ordem);
      data.colunas.forEach(col => col.cards.sort((a, b) => a.ordem - b.ordem));
      setProject(data);
    } catch (e) { toast.error("Erro ao carregar."); } finally { setLoading(false); }
  }

  // --- ABRIR MODAL (Card) ---
  function handleOpenCreate(columnId) {
    setModalData({ columnId: columnId }); // Modo Criação
  }

  function handleOpenEdit(card) {
    setModalData(card); // Modo Edição
  }

  // --- NOVA COLUNA ---
  async function handleAddColumn(e) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      await projectService.createColumn(id, newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
      loadProject();
      toast.success("Lista criada!");
    } catch (e) { toast.error("Erro ao criar lista."); }
  }

  // --- EXCLUSÃO ---
  function requestDelete(e, type, id, title) {
    e.stopPropagation();
    setItemToDelete({ type, id, title });
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
        if (itemToDelete.type === 'card') {
            await projectService.deleteCard(itemToDelete.id);
            if (modalData?.id === itemToDelete.id) setModalData(null);
            toast.success("Tarefa removida.");
        } else {
            await projectService.deleteColumn(itemToDelete.id);
            toast.success("Lista removida.");
        }
        loadProject();
    } catch (e) { toast.error("Erro ao excluir."); } 
    finally { setItemToDelete(null); }
  }

  // --- COR DA COLUNA ---
  async function handleChangeColor(columnId, newColor) {
    const updatedCols = project.colunas.map(c => c.id === columnId ? {...c, cor: newColor} : c);
    setProject({...project, colunas: updatedCols});
    setEditingColumnId(null);
    try { await projectService.updateColumn(columnId, { cor: newColor }); } catch (e) { loadProject(); }
  }

  // --- FORMATAR PRAZO ---
  function getDeadlineStyle(prazo) {
    if (!prazo) return null;
    const date = new Date(prazo);
    const formattedDate = format(date, "dd/MM HH:mm", { locale: ptBR });
    if (isPast(date) && !isToday(date)) return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle size={14} />, label: formattedDate };
    if (isToday(date)) return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <Clock size={14} />, label: 'Hoje ' + format(date, "HH:mm") };
    return { color: 'text-gray-500', bg: 'bg-gray-200/50', icon: <Clock size={14} />, label: formattedDate };
  }

  // --- DRAG AND DROP ---
  const onDragEnd = async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newProject = { ...project, colunas: [...project.colunas] };
      const sourceColIndex = newProject.colunas.findIndex(c => c.id.toString() === source.droppableId);
      const destColIndex = newProject.colunas.findIndex(c => c.id.toString() === destination.droppableId);
      const sourceCol = { ...newProject.colunas[sourceColIndex], cards: [...newProject.colunas[sourceColIndex].cards] };
      const destCol = sourceColIndex === destColIndex ? sourceCol : { ...newProject.colunas[destColIndex], cards: [...newProject.colunas[destColIndex].cards] };

      const [movedCard] = sourceCol.cards.splice(source.index, 1);
      movedCard.coluna = parseInt(destination.droppableId);
      destCol.cards.splice(destination.index, 0, movedCard);

      newProject.colunas[sourceColIndex] = sourceCol;
      newProject.colunas[destColIndex] = destCol;
      setProject(newProject);

      try { await projectService.moveCard(draggableId, destination.droppableId, destination.index); } 
      catch (error) { loadProject(); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><ArrowLeft size={20} className="text-gray-500"/></Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            {project?.titulo} 
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-normal text-gray-500">{project?.total_membros} membros</span>
        </h1>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50 dark:bg-gray-950">
          <div className="flex h-full gap-6">
            
            {/* --- LISTAGEM DE COLUNAS --- */}
            {project?.colunas.map(coluna => (
              <div key={coluna.id} className="w-80 flex-shrink-0 flex flex-col rounded-2xl max-h-full transition-colors duration-500 border border-transparent dark:border-gray-800" style={{ backgroundColor: coluna.cor || '#F1F5F9' }}>
                
                {/* Header da Coluna */}
                <div className="p-4 flex justify-between items-center relative group/header">
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    {coluna.titulo} <span className="bg-black/5 px-2 py-0.5 rounded-full text-[10px]">{coluna.cards.length}</span>
                  </h3>
                  <div className="flex items-center gap-1">
                     <button onClick={(e) => requestDelete(e, 'column', coluna.id, coluna.titulo)} className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-full text-gray-400 opacity-0 group-hover/header:opacity-100 transition-all"><Trash2 size={16} /></button>
                     <div className="relative">
                        <button onClick={() => setEditingColumnId(editingColumnId === coluna.id ? null : coluna.id)} className="p-1.5 hover:bg-black/5 rounded-full text-gray-500 opacity-0 group-hover/header:opacity-100 transition-all"><MoreHorizontal size={18} /></button>
                        {editingColumnId === coluna.id && (
                           <div className="absolute top-8 right-0 bg-white shadow-xl rounded-xl p-2 flex gap-2 z-20 border animate-in zoom-in-95 duration-100">
                              {PASTEL_COLORS.map(color => <button key={color} onClick={() => handleChangeColor(coluna.id, color)} className="w-6 h-6 rounded-full border hover:scale-110" style={{ backgroundColor: color }} />)}
                           </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Área dos Cards (Droppable) */}
                <Droppable droppableId={coluna.id.toString()}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar min-h-[100px]">
                      {coluna.cards.map((card, index) => {
                        const deadline = getDeadlineStyle(card.prazo);
                        return (
                          <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                            {(provided) => (
                              <div 
                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                onClick={() => handleOpenEdit(card)} // ABRE MODAL EDIÇÃO
                                style={{ ...provided.draggableProps.style }} 
                                className="mb-3 p-4 rounded-xl cursor-pointer bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group relative"
                              >
                                <button onClick={(e) => requestDelete(e, 'card', card.id, card.titulo)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={14} /></button>
                                <div className="flex justify-between items-start mb-2 pr-6">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug">{card.titulo || "Sem título"}</h4>
                                    {card.prompt_refinado && <Sparkles size={14} className="text-indigo-500 shrink-0" />}
                                </div>
                                {card.conteudo_original && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{card.conteudo_original}</p>}
                                {deadline && <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${deadline.color} ${deadline.bg}`}>{deadline.icon} <span>{deadline.label}</span></div>}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {/* Botão ADICIONAR CARD */}
                      <button onClick={() => handleOpenCreate(coluna.id)} className="w-full py-3 mt-2 text-gray-500 hover:text-gray-800 hover:bg-black/5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"><Plus size={16} /> Adicionar Tarefa</button>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* --- CRIAR NOVA LISTA --- */}
            <div className="w-80 shrink-0">
               {isAddingColumn ? (
                 <form onSubmit={handleAddColumn} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-right-4">
                    <input 
                      autoFocus 
                      className="w-full p-2 mb-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Nome da lista..."
                      value={newColumnTitle}
                      onChange={e => setNewColumnTitle(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddingColumn(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Salvar</button>
                    </div>
                 </form>
               ) : (
                 <button onClick={() => setIsAddingColumn(true)} className="w-full h-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-500 transition-all">
                    <Plus size={20} /> Nova Lista
                 </button>
               )}
            </div>

          </div>
        </div>
      </DragDropContext>

      {/* MODAL DE CARD (Unificado) */}
      <CardModal 
        isOpen={!!modalData}
        cardData={modalData}
        columns={project?.colunas}
        onClose={() => setModalData(null)}
        onSave={() => { loadProject(); setModalData(null); }}
        onDelete={(id) => requestDelete({stopPropagation:()=>{}}, 'card', id)}
      />

      {/* MODAL DE CONFIRMAÇÃO */}
      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'column' ? "Excluir Lista" : "Excluir Tarefa"}
        message={itemToDelete?.type === 'column' ? "Todos os cards desta lista serão perdidos." : "Tem certeza que deseja apagar esta tarefa permanentemente?"}
        confirmText="Sim, excluir"
        isDanger={true}
      />
    </div>
  );
}