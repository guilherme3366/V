import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, Tarefa, Arquivo, TipoTarefa } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  Plus,
  FileText,
  Paperclip,
  Clock,
  Send,
  Edit2,
  Save,
  X,
  MapPin,
  Shield,
  DollarSign,
  MessageSquare,
  Loader2,
  Download,
  Users,
  Coffee,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCPF, formatCNPJ, formatPhone } from '../lib/utils';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';
import NewTaskModal from '../components/NewTaskModal';

const TAREFA_ICON_MAP: Record<string, any> = {
  'tarefa': List,
  'ligação': Phone,
  'reunião': Users,
  'visita': MapPin,
  'email': Mail,
  'whatsapp': MessageSquare,
  'almoço': Coffee
};

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }: { id: any, label: string, icon: any, activeTab: string, setActiveTab: (id: any) => void }) => (
  <button 
    onClick={() => setActiveTab(id)}
    className={cn(
      "flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 px-6 py-4 border-b-2 transition-all relative overflow-hidden",
      activeTab === id 
        ? "border-primary text-primary bg-primary/5 font-bold" 
        : "border-transparent text-white/40 hover:text-white"
    )}
  >
    <Icon size={18} />
    <span className="text-xs lg:text-sm">{label}</span>
    {activeTab === id && (
      <motion.div layoutId="detailTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
    )}
  </button>
);

const InfoItem = ({ icon: Icon, label, value, field, parent = 'negociacao', type = "text", mask, isEditing, leadData, setLeadData }: any) => (
  <div className="flex items-start gap-4 group">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
      isEditing ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40 group-hover:text-primary"
    )}>
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] lg:text-[10px] uppercase font-mono text-white/20 tracking-widest mb-1">{label}</p>
      {isEditing ? (
        <input 
          type={type}
          value={parent === 'cliente' ? (leadData.cliente?.[field] || '') : (leadData[field] || '')}
          onChange={(e) => {
            let val = e.target.value;
            if (mask === 'cpf') val = formatCPF(val);
            if (mask === 'cnpj') val = formatCNPJ(val);
            if (mask === 'phone') val = formatPhone(val);
            
            if (parent === 'cliente') {
              setLeadData({ 
                ...leadData, 
                cliente: { ...leadData.cliente, [field]: val } 
              });
            } else {
              setLeadData({ ...leadData, [field]: val });
            }
          }}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      ) : (
        <p className="text-sm font-semibold truncate text-white/80">{value || '---'}</p>
      )}
    </div>
  </div>
);

const NegotiationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    leads, 
    etapas, 
    updateLead, 
    deleteLead,
    fetchTarefas,
    updateTarefa,
    deleteTarefa,
    fetchArquivos,
    uploadArquivo,
    deleteArquivo
  } = useApp();
  const { showToast } = useToast();
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'historico' | 'tarefas' | 'arquivos'>('historico');
  const [leadData, setLeadData] = useState<any>(null);
  
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTarefas = async () => {
    if (!id) return;
    setIsLoadingContent(true);
    const data = await fetchTarefas(id);
    setTarefas(data);
    setIsLoadingContent(false);
  };

  const loadArquivos = async () => {
    if (!id) return;
    const data = await fetchArquivos(id);
    setArquivos(data);
  };

  useEffect(() => {
    const foundLead = leads.find(l => l.id === id);
    if (foundLead) {
      setLeadData({ ...foundLead });
    }
  }, [id, leads]);

  useEffect(() => {
    if (id) {
      if (activeTab === 'tarefas') loadTarefas();
      if (activeTab === 'arquivos') loadArquivos();
    }
  }, [id, activeTab]);

  if (!leadData) return <div className="p-20 text-center text-white/20 font-mono flex flex-col items-center gap-4">
    <Loader2 className="animate-spin text-primary" size={40} />
    Carregando dados...
  </div>;

  const handleConfirmDelete = async () => {
    await deleteLead(id!);
    setIsConfirmModalOpen(false);
    showToast('Lead excluído permanentemente.', 'info');
    navigate('/kanban');
  };

  const handleSave = () => {
    updateLead(leadData.id, leadData);
    setIsEditing(false);
    showToast('Alterações salvas com sucesso!', 'success');
  };

  const handleToggleTarefa = async (tarefa: Tarefa) => {
    const newStatus = !tarefa.concluida;
    const result = await updateTarefa(tarefa.id, { concluida: newStatus });
    if (result.success) {
      setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, concluida: newStatus } : t));
      showToast(newStatus ? 'Tarefa concluída!' : 'Tarefa reaberta.', 'success');
    }
  };

  const handleDeleteTarefa = async (tarefaId: string) => {
    const result = await deleteTarefa(tarefaId);
    if (result.success) {
      setTarefas(prev => prev.filter(t => t.id !== tarefaId));
      showToast('Tarefa removida.', 'info');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsUploading(true);
    const result = await uploadArquivo(file, id);
    setIsUploading(false);

    if (result.success) {
      showToast('Arquivo enviado com sucesso!', 'success');
      loadArquivos();
    } else {
      showToast(result.error || 'Erro ao enviar arquivo.', 'error');
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteArquivo = async (arquivo: Arquivo) => {
    const result = await deleteArquivo(arquivo.id, arquivo.url);
    if (result.success) {
      setArquivos(prev => prev.filter(a => a.id !== arquivo.id));
      showToast('Arquivo removido.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header / Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between glass p-4 rounded-[32px] border-white/5 gap-4 shadow-xl relative z-[100]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/kanban')}
            className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all flex-shrink-0 border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input 
                  value={leadData.cliente?.nome}
                  onChange={(e) => setLeadData({ ...leadData, cliente: { ...leadData.cliente, nome: e.target.value } })}
                  placeholder="Nome do Cliente"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary/40 block w-full"
                />
                <input 
                  value={leadData.titulo}
                  onChange={(e) => setLeadData({ ...leadData, titulo: e.target.value })}
                  placeholder="Título da Negociação"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-0.5 text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-primary/40 block w-full"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight truncate">{leadData.cliente?.nome}</h2>
                <p className="text-xs text-white/40 font-medium italic -mt-1">{leadData.titulo}</p>
              </>
            )}
            <div className="flex items-center gap-2 mt-1">
              <CustomSelect
                value={leadData.etapa_id}
                options={etapas.map(etapa => ({ value: etapa.id, label: etapa.nome_etapa }))}
                onChange={(val) => updateLead(leadData.id, { etapa_id: val })}
                buttonClassName={cn(
                  "px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-primary font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all",
                )}
                dropdownClassName="w-64 left-0"
              />
              <span className="text-white/10">•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" alt="Atendente" className="w-full h-full object-cover" />
                </div>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Atendente: <span className="text-white/60">Lucas Almeida</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 lg:gap-4 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => updateLead(leadData.id, { status_negociacao: 'vendido' })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-wider hover:bg-green-500/20 transition-all border border-green-500/20 shadow-lg shadow-green-500/5"
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">Venda</span>
            </button>
            <button 
              onClick={() => updateLead(leadData.id, { status_negociacao: 'perdido' })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-wider hover:bg-red-500/20 transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
            >
              <XCircle size={16} />
              <span className="hidden sm:inline">Perda</span>
            </button>
            <button 
              onClick={() => navigate(`/chat-focado/${id}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-primary/20 border border-primary/20"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Conversar</span>
            </button>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="p-3 bg-primary text-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <Save size={20} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setLeadData({ ...leads.find(l => l.id === id) || leads[0] });
                  }}
                  className="p-3 bg-white/5 text-white/40 rounded-2xl hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-3 bg-white/5 text-white/40 rounded-2xl hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
              >
                <Edit2 size={20} />
              </button>
            )}
            <button 
              onClick={() => setIsConfirmModalOpen(true)}
              title="Excluir" 
              className="p-3 bg-white/5 text-white/40 rounded-2xl hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Info Cliente */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          <div className="glass p-8 lg:p-10 rounded-[40px] border-white/5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -z-10" />
            
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-primary to-green-400 p-[2px] mb-6 shadow-2xl shadow-primary/20">
                <div className="w-full h-full rounded-[30px] bg-surface flex items-center justify-center text-primary text-3xl font-black italic">
                  {leadData.cliente?.nome.substring(0, 2).toUpperCase()}
                </div>
              </div>
              {!isEditing && (
                <>
                  <h3 className="text-xl font-bold tracking-tight">{leadData.cliente?.nome}</h3>
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    ID: {leadData.id}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <InfoItem icon={Phone} label="Telefone / WhatsApp" value={leadData.cliente?.telefone} field="telefone" parent="cliente" mask="phone" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
                <InfoItem icon={Mail} label="E-mail Pessoal" value={leadData.cliente?.email} field="email" parent="cliente" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
                <InfoItem icon={Shield} label="CPF / Documento" value={leadData.cliente?.cpf} field="cpf" parent="cliente" mask="cpf" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
                <InfoItem icon={Calendar} label="Nascimento" value={leadData.cliente?.data_nascimento} field="data_nascimento" parent="cliente" type="date" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
                <InfoItem icon={MapPin} label="Endereço" value={leadData.cliente?.endereco} field="endereco" parent="cliente" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
                <InfoItem icon={MapPin} label="Cidade / UF" value={leadData.cliente?.cidade && `${leadData.cliente?.cidade} - ${leadData.cliente?.uf}`} field="cidade" parent="cliente" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
                <InfoItem icon={DollarSign} label="Valor de Venda (Estimado)" value={leadData.valor_estimado ? `R$ ${parseFloat(leadData.valor_estimado).toLocaleString()}` : 'Não definido'} field="valor_estimado" type="number" isEditing={isEditing} leadData={leadData} setLeadData={setLeadData} />
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] uppercase font-mono text-white/20 tracking-[0.2em] mb-4 text-center">Situação Final</p>
                <CustomSelect
                  value={leadData.status_negociacao}
                  options={[
                    { value: 'andamento', label: 'EM ANDAMENTO', className: 'text-yellow-500' },
                    { value: 'vendido', label: 'VENDIDO', className: 'text-green-400' },
                    { value: 'perdido', label: 'PERDIDO', className: 'text-red-400' },
                    { value: 'pausado', label: 'PAUSADO', className: 'text-white/40' }
                  ]}
                  onChange={(val) => updateLead(leadData.id, { status_negociacao: val as any })}
                  buttonClassName={cn(
                    "w-full px-6 py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-center text-[11px] font-black uppercase tracking-[0.3em] shadow-inner hover:bg-white/[0.08]",
                    leadData.status_negociacao === 'andamento' && "text-yellow-500",
                    leadData.status_negociacao === 'vendido' && "text-green-400",
                    leadData.status_negociacao === 'perdido' && "text-red-400",
                    leadData.status_negociacao === 'pausado' && "text-white/40"
                  )}
                  dropdownClassName="w-full left-0 bottom-full mb-2 origin-bottom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Abas de Conteúdo */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass rounded-[40px] overflow-hidden border-white/5 flex flex-col min-h-[600px] shadow-2xl">
            <div className="flex border-b border-white/5 bg-white/[0.01] overflow-x-auto no-scrollbar">
              <TabButton id="historico" label="Histórico" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton id="tarefas" label="Tarefas" icon={CheckCircle2} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton id="arquivos" label="Arquivos" icon={Paperclip} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'historico' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="historico"
                    className="space-y-10 relative"
                  >
                    <div className="absolute left-[23px] top-2 bottom-2 w-px bg-white/5" />
                    
                    {[
                      { type: 'lead_created', title: 'Lead Criado', text: 'Lead originado através de campanha de Tráfego Pago.', time: 'Ontem às 14:20', icon: Plus },
                      { type: 'stage_move', title: 'Movido de Etapa', text: 'Lead avançou para a etapa de Prospecção.', time: 'Hoje às 09:15', icon: Send },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        <div className="w-12 h-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center z-10 text-white/20 group-hover:border-primary/20 transition-all flex-shrink-0 shadow-lg">
                          <item.icon size={20} className={cn("transition-colors", i === 1 && "text-primary")} />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm lg:text-base font-bold">{item.title}</h4>
                            <span className="text-[10px] text-white/20 font-mono italic">{item.time}</span>
                          </div>
                          <p className="text-xs lg:text-sm text-white/40 leading-relaxed font-medium">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'tarefas' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="tarefas"
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-6 px-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/20 font-mono">Planos de Ação</p>
                      <button 
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="flex items-center gap-2 text-primary hover:opacity-80 transition-all font-black text-[10px] uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl border border-primary/10"
                      >
                        <Plus size={14} />
                        Nova Tarefa
                      </button>
                    </div>

                    <div className="space-y-4">
                      {isLoadingContent ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                          <Loader2 className="animate-spin text-primary/40" size={32} />
                          <p className="text-[10px] uppercase tracking-widest text-white/20 font-mono">Carregando tarefas...</p>
                        </div>
                      ) : tarefas.length > 0 ? (
                        tarefas.map((tarefa) => {
                          const Icon = TAREFA_ICON_MAP[tarefa.tipo] || List;
                          return (
                            <div key={tarefa.id} className="glass-card p-6 rounded-3xl border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                              <div className="flex items-start justify-between gap-5">
                                <div className="flex items-start gap-5 flex-1 min-w-0" onClick={() => handleToggleTarefa(tarefa)}>
                                  <div className={cn(
                                    "w-6 h-6 rounded-lg border-2 mt-1 flex-shrink-0 flex items-center justify-center transition-all",
                                    tarefa.concluida ? "bg-primary border-primary text-black" : "border-white/10 group-hover:border-primary"
                                  )}>
                                    {tarefa.concluida && <CheckCircle2 size={16} strokeWidth={3} />}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className={cn("text-base font-bold mb-3 transition-all", tarefa.concluida && "text-white/20 line-through")}>
                                      {tarefa.titulo}
                                    </h4>
                                    <div className="flex items-center gap-4">
                                      <span className={cn(
                                        "text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider",
                                        tarefa.tipo === 'ligação' ? "bg-blue-500/10 text-blue-400" :
                                        tarefa.tipo === 'reunião' ? "bg-purple-500/10 text-purple-400" :
                                        tarefa.tipo === 'visita' ? "bg-orange-500/10 text-orange-400" :
                                        "bg-white/5 text-white/40"
                                      )}>
                                        {tarefa.tipo}
                                      </span>
                                      {tarefa.data_vencimento && (
                                        <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono">
                                          <Clock size={12} />
                                          {new Date(tarefa.data_vencimento).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTarefa(tarefa.id); }}
                                  className="p-2 text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-20 text-center space-y-4">
                          <CheckCircle2 size={48} className="mx-auto text-white/5" />
                          <p className="text-white/20 font-mono uppercase text-[10px] tracking-widest">Nenhuma tarefa pendente</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'arquivos' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="arquivos"
                    className="space-y-8"
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    
                    <div 
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed border-white/5 rounded-[32px] p-10 lg:p-14 flex flex-col items-center justify-center gap-6 hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer group relative",
                        isUploading && "opacity-50 cursor-wait"
                      )}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 size={32} className="animate-spin text-primary" />
                          <p className="text-sm font-bold animate-pulse text-primary">Enviando arquivo...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] flex items-center justify-center text-white/20 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                            <Paperclip size={24} />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm font-bold">Solte seus arquivos aqui</p>
                            <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">Ou clique para selecionar</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-3 px-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/20 font-mono mb-4 px-2">Documentos Anexados</p>
                      
                      {arquivos.length > 0 ? (
                        arquivos.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.01] border border-white/5 group hover:border-primary/10 hover:bg-white/[0.03] transition-all">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-white transition-colors">{file.nome}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] text-white/20 font-mono">{(file.tamanho / 1024 / 1024).toFixed(2)} MB</span>
                                  <span className="text-white/10">•</span>
                                  <span className="text-[9px] text-primary/40 font-mono font-bold uppercase">{file.tipo_arquivo}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <a 
                                 href={file.url} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="p-2 text-white/20 hover:text-primary transition-colors"
                               >
                                 <Download size={14} />
                               </a>
                               <button 
                                 onClick={() => handleDeleteArquivo(file)}
                                 className="p-2 text-white/20 hover:text-red-400 transition-colors"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center space-y-4">
                          <Paperclip size={32} className="mx-auto text-white/5" />
                          <p className="text-white/20 font-mono uppercase text-[9px] tracking-widest">Nenhum documento anexado</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Negociação"
        message={`Deseja realmente excluir a negociação "${leadData.titulo}" de "${leadData.cliente?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Agora"
        variant="danger"
      />
      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        negociacaoId={id!}
        onCreated={loadTarefas}
      />
    </div>
  );
};

export default NegotiationDetailPage;
