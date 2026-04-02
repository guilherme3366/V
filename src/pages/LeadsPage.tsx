import React, { useState, useMemo } from 'react';
import { useApp, Cliente, Lead } from '../context/AppContext';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Filter,
  DollarSign,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import NewClientModal from '../components/NewClientModal';
import EditClientModal from '../components/EditClientModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const LeadsPage = () => {
  const { clientes, leads, deleteCliente, setIsNewLeadModalOpen, setPreSelectedClientId } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'com_negociacao' | 'sem_negociacao'>('todos');

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone.includes(searchTerm);
      
      const clientLeads = leads.filter(l => l.cliente_id === cliente.id);
      const matchesFilter = 
        filterStatus === 'todos' ||
        (filterStatus === 'com_negociacao' && clientLeads.length > 0) ||
        (filterStatus === 'sem_negociacao' && clientLeads.length === 0);
      
      return matchesSearch && matchesFilter;
    });
  }, [clientes, searchTerm, filterStatus, leads]);

  const handleDeleteConfirm = async () => {
    if (!deletingCliente) return;
    const { success, error } = await deleteCliente(deletingCliente.id);
    if (success) {
      showToast('Lead removido com sucesso!', 'success');
    } else {
      showToast(`Erro ao remover lead: ${error}`, 'error');
    }
    setDeletingCliente(null);
  };

  const getClientStats = (clienteId: string) => {
    const clientLeads = leads.filter(l => l.cliente_id === clienteId);
    const totalValue = clientLeads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);
    const activeDeals = clientLeads.filter(l => l.status_negociacao === 'andamento').length;
    return { count: clientLeads.length, totalValue, activeDeals };
  };

  // Stats for the whole page
  const totalLeads = clientes.length;
  const totalNegotiations = leads.length;
  const totalValue = leads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users size={24} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter">Gerenciar Leads</h2>
          </div>
          <p className="text-white/40 text-sm max-w-md">Controle sua base de leads, acompanhe negociações e converta mais clientes.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNewClientModalOpen(true)}
            className="btn-primary px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <UserPlus size={18} />
            Novo Lead
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Negociações Ativas', value: totalNegotiations, icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Valor em Pipeline', value: `R$ ${totalValue.toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[32px] border-white/5 flex items-center gap-5 group hover:border-white/10 transition-all"
          >
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono mb-1">{stat.label}</p>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou telefone..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-4 pl-16 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 p-1.5 rounded-[20px] self-stretch">
          {(['todos', 'com_negociacao', 'sem_negociacao'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                filterStatus === status ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
              )}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List/Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-6">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black">Lista de Leads</label>
          <span className="text-[10px] text-white/20 font-mono">{filteredClientes.length} resultados</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredClientes.map((cliente, idx) => {
              const stats = getClientStats(cliente.id);
              return (
                <motion.div 
                  key={cliente.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass p-6 md:px-8 rounded-[32px] border-white/5 hover:border-white/10 hover:bg-white/[0.01] transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                    {/* Client Main Info */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-green-400/20 flex-shrink-0 flex items-center justify-center text-primary font-black text-xl italic shadow-inner border border-white/5">
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-bold tracking-tight truncate group-hover:text-primary transition-colors">{cliente.nome}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Mail size={12} className="text-white/20" />
                            {cliente.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Phone size={12} className="text-white/20" />
                            {cliente.telefone}
                          </div>
                          {cliente.cidade && (
                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                              <MapPin size={12} className="text-white/20" />
                              {cliente.cidade}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="flex items-center gap-8 px-6 lg:border-x border-white/5">
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-widest text-white/20 font-black mb-1">Negociações</p>
                        <p className="text-sm font-bold flex items-center justify-center gap-1.5">
                          <Briefcase size={14} className="text-yellow-400/60" />
                          {stats.count}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-widest text-white/20 font-black mb-1">Valor Total</p>
                        <p className="text-sm font-bold flex items-center justify-center gap-1.5 text-primary">
                          <DollarSign size={14} className="opacity-60" />
                          {stats.totalValue.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-widest text-white/20 font-black mb-1">Ativas</p>
                        <p className="text-sm font-bold flex items-center justify-center gap-1.5 text-blue-400">
                          <TrendingUp size={14} className="opacity-60" />
                          {stats.activeDeals}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:ml-auto">
                      <button 
                        onClick={() => {
                          setPreSelectedClientId(cliente.id);
                          setIsNewLeadModalOpen(true);
                        }}
                        className="p-3 bg-white/5 hover:bg-primary hover:text-black rounded-2xl transition-all text-white/40 flex items-center gap-2 px-5 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Plus size={16} />
                        Nova Negoc.
                      </button>
                      <button 
                         onClick={() => setEditingCliente(cliente)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
                        title="Editar Lead"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeletingCliente(cliente)}
                        className="p-3 bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all text-white/40 hover:text-red-400"
                        title="Excluir Lead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Bottom Glow Effect on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}

            {filteredClientes.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                  <Users size={40} />
                </div>
                <div>
                  <h5 className="text-lg font-bold">Nenhum lead encontrado</h5>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
                </div>
                <button 
                  onClick={() => { setSearchTerm(''); setFilterStatus('todos'); }}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Limpar Filtros
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <NewClientModal 
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onCreated={(nome, id) => {
          showToast(`Lead ${nome} cadastrado!`, 'success');
        }}
      />

      <EditClientModal 
        isOpen={!!editingCliente}
        onClose={() => setEditingCliente(null)}
        cliente={editingCliente}
      />

      <ConfirmModal 
        isOpen={!!deletingCliente}
        onClose={() => setDeletingCliente(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Lead"
        message={`Deseja realmente excluir o lead "${deletingCliente?.nome}"? Todas as negociações vinculadas também serão removidas permanentemente.`}
        confirmText="Excluir Permanentemente"
        variant="danger"
      />
    </div>
  );
};

export default LeadsPage;
