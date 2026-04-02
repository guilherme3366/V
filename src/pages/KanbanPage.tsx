import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import KanbanColumn from '../components/KanbanColumn';
import LeadList from '../components/LeadList';
import { 
  Filter, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  Settings2,
  TrendingUp,
  Clock,
  Briefcase,
  Plus,
  Users,
  X
} from 'lucide-react';
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  closestCorners,
  DragOverlay
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import LeadCard from '../components/LeadCard';
import ConfirmModal from '../components/ConfirmModal';
import { cn } from '../utils/cn';

const KanbanPage = () => {
  const { funis, etapas, leads, moveLead, addEtapa, addFunil, deleteEtapa, deleteFunil } = useApp();
  const { showToast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewFunnelModalOpen, setIsNewFunnelModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isFunnelMenuOpen, setIsFunnelMenuOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newFunilName, setNewFunilName] = useState('');
  const [activeFunil, setActiveFunil] = useState(funis[0]);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'etapa' | 'funil' | null;
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    name: ''
  });

  React.useEffect(() => {
    if (funis.length > 0 && !activeFunil) {
      setActiveFunil(funis[0]);
    }
  }, [funis, activeFunil]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const leadId = active.id as string;
      const newEtapaId = over.id as string;
      moveLead(leadId, newEtapaId);
    }
  };

  const handleCreateStage = () => {
    if (newStageName.trim() && activeFunil) {
      addEtapa(newStageName, activeFunil.id);
      setNewStageName('');
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.type === 'funil') {
      await deleteFunil(confirmModal.id);
      if (activeFunil?.id === confirmModal.id) {
        const otherFunil = funis.find((f: any) => f.id !== confirmModal.id);
        if (otherFunil) setActiveFunil(otherFunil);
      }
      showToast('Funil excluído.', 'info');
    } else if (confirmModal.type === 'etapa') {
      await deleteEtapa(confirmModal.id);
      showToast('Etapa excluída.', 'info');
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleCreateFunil = async () => {
    if (newFunilName.trim()) {
      await addFunil(newFunilName);
      setNewFunilName('');
      setIsNewFunnelModalOpen(false);
    }
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  // Estatísticas Dinâmicas do Funil Atual
  const funilLeads = leads.filter(l => etapas.some(e => e.id === l.etapa_id && e.funil_id === activeFunil?.id));
  const totalLeads = funilLeads.length;
  const emAndamento = funilLeads.filter(l => l.status_negociacao === 'andamento').length;
  const leadsVendidos = funilLeads.filter(l => l.status_negociacao === 'vendido').length;
  const conversao = totalLeads > 0 ? Math.round((leadsVendidos / totalLeads) * 100) : 0;
  
  const totalValor = funilLeads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);
  const formatValor = (valor: number) => {
    if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1).replace('.0', '')}M`;
    if (valor >= 1000) return `R$ ${(valor / 1000).toFixed(1).replace('.0', '')}k`;
    return `R$ ${valor}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header do Kanban */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={16} className="text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Negociações</h2>
          </div>
          <p className="text-white/40 text-sm">Gerencie seus leads comercialmente</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-primary text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('lista')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'lista' ? 'bg-primary text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-medium transition-all",
                statusFilter !== 'todos' ? "bg-primary text-black" : "bg-white/5 hover:bg-white/10"
              )}
            >
              <Filter size={14} />
              {statusFilter === 'todos' ? 'Filtros' : `Status: ${statusFilter}`}
            </button>

            <AnimatePresence>
              {isFilterMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsFilterMenuOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-2xl border border-white/10 shadow-2xl z-50 p-2"
                  >
                    {['todos', 'andamento', 'vendido', 'perdido', 'pausado'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsFilterMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all capitalize",
                          statusFilter === status ? "bg-primary/20 text-primary font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {status}
                        {statusFilter === status && <div className="w-1 h-1 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFunnelMenuOpen(!isFunnelMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-all"
            >
              {activeFunil?.nome_funil}
              <ChevronDown size={14} className={cn("transition-transform", isFunnelMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isFunnelMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsFunnelMenuOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-2xl border border-white/10 shadow-2xl z-50 p-2"
                  >
                    {funis.map((funil) => (
                      <button
                        key={funil.id}
                        onClick={() => {
                          setActiveFunil(funil);
                          setIsFunnelMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all group",
                          activeFunil.id === funil.id ? "bg-primary/20 text-primary font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {funil.nome_funil}
                        {activeFunil.id === funil.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                    
                    <div className="my-1 border-t border-white/5" />
                    
                    <button
                      onClick={() => {
                        setIsNewFunnelModalOpen(true);
                        setIsFunnelMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary/10 transition-all active:scale-95"
                    >
                      <Plus size={12} />
                      Novo Funil
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>



          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Plus size={14} />
            Nova Etapa
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-blue-400' },
          { label: 'Em Andamento', value: emAndamento, icon: Clock, color: 'text-yellow-400' },
          { label: 'Taxa de Conversão', value: `${conversao}%`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Valor Estimado', value: formatValor(totalValor), icon: Settings2, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conteúdo Dinâmico: Kanban ou Lista */}
      {viewMode === 'kanban' ? (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-6 overflow-x-auto pb-6 no-scrollbar min-h-[500px]">
            {etapas
              .filter(e => e.funil_id === activeFunil?.id)
              .sort((a, b) => a.ordem - b.ordem)
              .map(etapa => (
                <KanbanColumn 
                  key={etapa.id} 
                  etapa={etapa} 
                  leads={leads.filter(l => 
                    l.etapa_id === etapa.id && 
                    (statusFilter === 'todos' || l.status_negociacao === statusFilter)
                  )} 
                  onDelete={(e) => setConfirmModal({
                    isOpen: true,
                    type: 'etapa',
                    id: e.id,
                    name: e.nome_etapa
                  })}
                />
              ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <LeadCard lead={activeLead} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <LeadList 
          leads={leads.filter(l => (statusFilter === 'todos' || l.status_negociacao === statusFilter))} 
          etapas={etapas} 
        />
      )}

      {/* Modal de Nova Etapa */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-[32px] border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Nova Etapa</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Nome da Etapa</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateStage()}
                    placeholder="Ex: Proposta Enviada" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateStage}
                    disabled={!newStageName.trim()}
                    className="flex-1 py-4 rounded-2xl bg-primary text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Etapa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Novo Funil */}
      <AnimatePresence>
        {isNewFunnelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewFunnelModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass p-10 rounded-[40px] border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">Novo Funil</h3>
                  <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest mt-1">Crie um novo fluxo de vendas</p>
                </div>
                <button 
                  onClick={() => setIsNewFunnelModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Nome do Funil</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newFunilName}
                    onChange={(e) => setNewFunilName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFunil()}
                    placeholder="Ex: Pós-Venda ou Recuperação" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-5 px-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsNewFunnelModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateFunil}
                    disabled={!newFunilName.trim()}
                    className="flex-1 py-4 rounded-2xl bg-primary text-black text-sm font-black uppercase hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                  >
                    Criar Funil
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={confirmModal.type === 'funil' ? 'Excluir Funil' : 'Excluir Etapa'}
        message={confirmModal.type === 'funil' 
          ? `Deseja realmente excluir o funil "${confirmModal.name}"? Todos os leads e etapas vinculados serão removidos permanentemente.` 
          : `Deseja realmente excluir a etapa "${confirmModal.name}"? Todos os leads desta etapa também serão removidos.`
        }
        confirmText="Excluir Permanentemente"
        variant="danger"
      />
    </div>
  );
};

export default KanbanPage;
