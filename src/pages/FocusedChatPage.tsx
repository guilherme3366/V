import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Smile, 
  Paperclip, 
  Send, 
  Check, 
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  MessageSquare,
  Shield,
  Info,
  X,
  FileText,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Layers,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import CustomSelect from '../components/CustomSelect';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

const FocusedChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, etapas, updateLead } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dados' | 'historico' | 'tarefas' | 'arquivos'>('dados');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lead = leads.find(l => l.id === id) || leads[0];
  const currentEtapa = etapas.find(e => e.id === lead.etapa_id);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Olá ${lead.cliente?.nome || 'Cliente'}, bom dia! Aqui é o Lucas da Von.`, sender: 'me', time: '10:25', status: 'read' },
    { id: '2', text: 'Bom dia Lucas! Tudo bem? Gostaria de tirar uma dúvida sobre o processo.', sender: 'them', time: '10:30', status: 'read' },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Mock auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pelo seu retorno! Estou analisando aqui e já te respondo.',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-surface z-[100] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => navigate(`/negociacao/${id}`)}
            className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-[20px] bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-inner border border-primary/10">
                {lead.cliente?.nome.charAt(0) || 'C'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-surface shadow-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm lg:text-lg tracking-tight">{lead.cliente?.nome}</h3>
                <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/10">Lead</span>
              </div>
              <p className="text-[10px] lg:text-xs text-green-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 leading-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online agora
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 lg:gap-3">
          <button className="hidden sm:flex p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10">
            <Phone size={20} />
          </button>
          <button className="hidden sm:flex p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10">
            <Video size={20} />
          </button>
          <div className="hidden sm:block w-px h-8 bg-white/5 mx-2" />
          <button className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10">
            <Info size={20} />
          </button>
          <button 
            onClick={() => setIsInfoDrawerOpen(true)}
            className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 custom-scrollbar bg-[url('https://w0.peakpx.com/wallpaper/580/678/HD-wallpaper-whatsapp-dark-mode-pattern-whatsapp-dark-mode-whatsapp-pattern-whatsapp-thumbnail.jpg')] bg-repeat bg-center bg-fixed">
        <div className="absolute inset-0 bg-surface/40 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex justify-center">
            <span className="px-4 py-1.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/5 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] shadow-xl">
              Hoje
            </span>
          </div>

          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              key={msg.id}
              className={cn(
                "flex flex-col group",
                msg.sender === 'me' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "px-5 py-4 rounded-[24px] text-sm shadow-2xl relative max-w-[85%] lg:max-w-xl",
                msg.sender === 'me' 
                  ? "bg-primary text-black rounded-tr-none font-bold" 
                  : "bg-surface/95 border border-white/10 text-white rounded-tl-none backdrop-blur-md shadow-2xl"
              )}>
                {msg.text}
                <div className={cn(
                  "flex items-center justify-end gap-1.5 mt-2 text-[9px] font-mono",
                  msg.sender === 'me' ? "text-black/40" : "text-white/20"
                )}>
                  {msg.time}
                  {msg.sender === 'me' && (
                    msg.status === 'read' ? <CheckCheck size={14} className="text-blue-600" /> : <Check size={14} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-6 lg:p-10 bg-surface/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 lg:gap-6 bg-white/[0.02] p-2 pr-2 pl-4 rounded-[32px] border border-white/10 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-2xl"
          >
            <div className="flex items-center gap-1">
              <button type="button" className="p-3 hover:bg-white/5 rounded-2xl text-white/30 hover:text-white transition-all scale-100 hover:scale-110 active:scale-95">
                <Smile size={24} />
              </button>
              <button type="button" className="p-3 hover:bg-white/5 rounded-2xl text-white/30 hover:text-white transition-all scale-100 hover:scale-110 active:scale-95">
                <Paperclip size={24} />
              </button>
            </div>
            
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem para o cliente..." 
              className="flex-1 bg-transparent py-4 text-sm lg:text-base focus:outline-none placeholder:text-white/10 font-medium"
            />
            
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className={cn(
                "w-14 h-14 rounded-full transition-all flex items-center justify-center flex-shrink-0 shadow-2xl",
                newMessage.trim() 
                  ? "bg-primary text-black shadow-primary/20 scale-100 hover:scale-110 active:scale-90" 
                  : "bg-white/5 text-white/10 scale-90"
              )}
            >
              <Send size={24} className={cn("transition-transform", newMessage.trim() && "translate-x-0.5 -translate-y-0.5")} />
            </button>
          </form>
          <p className="text-center mt-4 text-[9px] text-white/10 font-black uppercase tracking-[0.3em] font-mono">
            Conexão segura via Von Protocol • Lucas Almeida
          </p>
        </div>
      </div>

      {/* Drawer de Informações */}
      <AnimatePresence>
        {isInfoDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInfoDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface border-l border-white/10 z-[210] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h3 className="font-black text-lg">Detalhes do Lead</h3>
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest mt-1">Informações Completas</p>
                </div>
                <button 
                  onClick={() => setIsInfoDrawerOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Perfil Rápido */}
                <div className="p-8 flex flex-col items-center text-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                  <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-primary to-green-400 p-[2px] mb-4 shadow-2xl shadow-primary/20">
                    <div className="w-full h-full rounded-[26px] bg-surface flex items-center justify-center text-primary text-2xl font-black italic">
                      {lead.cliente?.nome.substring(0, 2).toUpperCase() || 'C'}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg">{lead.cliente?.nome}</h4>
                  <p className="text-[10px] text-primary/60 font-mono uppercase tracking-[0.2em] mt-1">{currentEtapa?.nome_etapa}</p>
                </div>

                {/* Info Rápida */}
                <div className="p-6 grid grid-cols-2 gap-4 border-b border-white/5">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] text-white/20 uppercase tracking-widest font-mono mb-1">Telefone</p>
                    <p className="text-xs font-bold truncate">{lead.cliente?.telefone || '---'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] text-white/20 uppercase tracking-widest font-mono mb-1">E-mail</p>
                    <p className="text-xs font-bold truncate">{lead.cliente?.email || '---'}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-white/[0.01] sticky top-0 z-20 backdrop-blur-md">
                   <button 
                    onClick={() => setActiveTab('dados')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'dados' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Dados
                    {activeTab === 'dados' && <motion.div layoutId="drawerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab('historico')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'historico' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Histórico
                    {activeTab === 'historico' && <motion.div layoutId="drawerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab('tarefas')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'tarefas' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Tarefas
                    {activeTab === 'tarefas' && <motion.div layoutId="drawerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab('arquivos')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'arquivos' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Arquivos
                    {activeTab === 'arquivos' && <motion.div layoutId="drawerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'dados' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                         <div className="space-y-6">
                            {[
                               { icon: Phone, label: "WhatsApp", value: lead.cliente?.telefone },
                               { icon: MessageSquare, label: "E-mail", value: lead.cliente?.email },
                               { icon: Shield, label: "CPF", value: lead.cliente?.cpf },
                               { icon: Calendar, label: "Nascimento", value: lead.cliente?.data_nascimento },
                               { icon: MapPin, label: "Endereço", value: lead.cliente?.endereco },
                               { icon: MapPin, label: "Cidade / UF", value: lead.cliente?.cidade && `${lead.cliente.cidade} - ${lead.cliente.uf}` },
                               { icon: DollarSign, label: "Valor Estimado", value: lead.valor_estimado ? `R$ ${parseFloat(lead.valor_estimado as any).toLocaleString()}` : 'Não definido' },
                             ].map((item, i) => (
                               <div key={i} className="flex items-start gap-4 group">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-all flex-shrink-0">
                                   <item.icon size={18} />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                   <p className="text-[9px] uppercase font-mono text-white/20 tracking-widest mb-1">{item.label}</p>
                                   <p className="text-sm font-bold truncate text-white/80">{item.value || '---'}</p>
                                 </div>
                               </div>
                             ))}
                          </div>

                          <div className="pt-8 border-t border-white/5 space-y-6">
                            <div className="flex items-start gap-4 group">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-all flex-shrink-0">
                                <Layers size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] uppercase font-mono text-white/20 tracking-widest mb-1">Etapa Atual</p>
                                <CustomSelect
                                  value={lead.etapa_id}
                                  options={etapas.map(etapa => ({ value: etapa.id, label: etapa.nome_etapa }))}
                                  onChange={(val) => updateLead(lead.id, { etapa_id: val })}
                                  buttonClassName="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white font-bold hover:bg-white/10"
                                  dropdownClassName="w-full left-0 bottom-full mb-2 origin-bottom"
                                />
                              </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-all flex-shrink-0">
                                <Shield size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] uppercase font-mono text-white/20 tracking-widest mb-1">Situação da Negociação</p>
                                <CustomSelect
                                  value={lead.status_negociacao}
                                  options={[
                                    { value: 'andamento', label: 'EM ANDAMENTO', className: 'text-yellow-500' },
                                    { value: 'vendido', label: 'VENDIDO', className: 'text-green-400' },
                                    { value: 'perdido', label: 'PERDIDO', className: 'text-red-400' },
                                    { value: 'pausado', label: 'PAUSADO', className: 'text-white/40' }
                                  ]}
                                  onChange={(val) => updateLead(lead.id, { status_negociacao: val as any })}
                                  buttonClassName={cn(
                                    "w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm font-bold hover:bg-white/10",
                                    lead.status_negociacao === 'andamento' && "text-yellow-500",
                                    lead.status_negociacao === 'vendido' && "text-green-400",
                                    lead.status_negociacao === 'perdido' && "text-red-400",
                                    lead.status_negociacao === 'pausado' && "text-white/40"
                                  )}
                                  dropdownClassName="w-full left-0 bottom-full mb-2 origin-bottom"
                                />
                              </div>
                            </div>
                          </div>
                       </motion.div>
                    )}
                    {activeTab === 'historico' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 relative"
                      >
                         <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/5" />
                         {[
                          { title: 'Lead Criado', text: 'Origem: Tráfego Pago', time: 'Ontem', icon: Plus },
                          { title: 'Prospecção', text: 'Movido para Prospecção', time: 'Hoje', icon: Send },
                         ].map((item, i) => (
                          <div key={i} className="flex gap-4 relative">
                            <div className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center z-10 text-white/20">
                              <item.icon size={16} className={cn(i === 1 && "text-primary")} />
                            </div>
                            <div className="flex-1 pt-1">
                              <h5 className="text-xs font-bold">{item.title}</h5>
                              <p className="text-[10px] text-white/40">{item.text}</p>
                            </div>
                          </div>
                         ))}
                      </motion.div>
                    )}

                    {activeTab === 'tarefas' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-md border border-white/10 mt-0.5" />
                              <div>
                                <h5 className="text-xs font-bold">Solicitar Cópia do Processo</h5>
                                <p className="text-[10px] text-white/20 mt-1 font-mono uppercase">15:30 - Hoje</p>
                              </div>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'arquivos' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                      >
                         {[
                           { name: 'Documento_Identidade.pdf', size: '1.2 MB' },
                           { name: 'Contrato_Assinado.pdf', size: '2.5 MB' },
                         ].map((file, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                                  <FileText size={14} />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold truncate max-w-[150px]">{file.name}</p>
                                  <p className="text-[9px] text-white/20 font-mono">{file.size}</p>
                                </div>
                              </div>
                              <button className="p-2 text-white/10 hover:text-white transition-all"><ArrowLeft size={14} className="rotate-180" /></button>
                           </div>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                <button 
                   onClick={() => navigate(`/negociacao/${id}`)}
                  className="w-full py-4 rounded-2xl bg-white/5 text-white/60 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5 shadow-xl"
                >
                  Abrir Ficha Completa
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default FocusedChatPage;
