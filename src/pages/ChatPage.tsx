import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Send, 
  Check, 
  CheckCheck,
  Phone,
  Video,
  User,
  Image as ImageIcon,
  ChevronLeft,
  MessageSquare,
  X,
  FileText,
  Plus,
  Clock,
  Shield,
  Calendar,
  MapPin,
  DollarSign,
  ArrowLeft,
  Layers,
  Send as SendIcon
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

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar?: string;
  online: boolean;
  status: 'pendente' | 'finalizada' | 'nao_atribuida';
  messages: Message[];
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { leads, etapas, updateLead } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dados' | 'historico' | 'tarefas' | 'arquivos'>('dados');
  const [currentFilter, setCurrentFilter] = useState<'todos' | 'nao_lidas' | 'nao_atribuidas' | 'pendentes' | 'finalizadas'>('todos');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial chats based on leads
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'lead-1',
      name: 'João Silva',
      lastMessage: 'Olá, gostaria de saber mais sobre os serviços.',
      time: '10:30',
      unreadCount: 2,
      online: true,
      status: 'pendente',
      messages: [
        { id: '1', text: 'Bom dia! Tudo bem?', sender: 'me', time: '10:25', status: 'read' },
        { id: '2', text: 'Olá, gostaria de saber mais sobre os serviços.', sender: 'them', time: '10:30', status: 'read' },
      ]
    },
    {
      id: 'lead-2',
      name: 'Maria Souza',
      lastMessage: 'A proposta foi enviada por e-mail?',
      time: 'Ontem',
      unreadCount: 0,
      online: false,
      status: 'finalizada',
      messages: [
        { id: '3', text: 'Boa tarde Maria!', sender: 'me', time: '15:00', status: 'read' },
        { id: '4', text: 'A proposta foi enviada por e-mail?', sender: 'them', time: '15:05', status: 'read' },
      ]
    },
    {
      id: 'lead-3',
      name: 'Roberto Rocha',
      lastMessage: 'Podemos marcar uma reunião para amanhã?',
      time: '11:45',
      unreadCount: 1,
      online: true,
      status: 'nao_atribuida',
      messages: [
        { id: '5', text: 'Podemos marcar uma reunião para amanhã?', sender: 'them', time: '11:45', status: 'read' },
      ]
    }
  ]);

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const leadFullData = leads.find(l => l.id === selectedChatId?.replace('lead-', ''));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedChatId) {
      scrollToBottom();
      // Mark as read
      setChats(prev => prev.map(c => 
        c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [selectedChatId, chats.find(c => c.id === selectedChatId)?.messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChats(prev => prev.map(c => 
      c.id === selectedChatId 
        ? { ...c, messages: [...c.messages, message], lastMessage: newMessage, time: 'Agora' } 
        : c
    ));

    setNewMessage('');
    
    // Mock auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pelo seu contato! Em breve um de nossos consultores irá falar com você.',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };
      setChats(prev => prev.map(c => 
        c.id === selectedChatId 
          ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, time: 'Agora' } 
          : c
      ));
    }, 2000);
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (currentFilter === 'nao_lidas') matchesFilter = chat.unreadCount > 0;
    else if (currentFilter === 'nao_atribuidas') matchesFilter = chat.status === 'nao_atribuida';
    else if (currentFilter === 'pendentes') matchesFilter = chat.status === 'pendente';
    else if (currentFilter === 'finalizadas') matchesFilter = chat.status === 'finalizada';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden relative">
      <div className="flex h-full w-full">
      {/* Search and Sidebar */}
      <div className={cn(
        "w-full lg:w-[380px] border-r border-white/5 flex flex-col transition-all bg-white/[0.02]",
        selectedChatId ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/kanban')}
                className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold tracking-tighter">Mensagens</h2>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-all">
              <MoreVertical size={18} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Buscar ou começar nova conversa" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'nao_lidas', label: 'Não lidas' },
              { id: 'nao_atribuidas', label: 'Não atribuídas' },
              { id: 'pendentes', label: 'Pendentes' },
              { id: 'finalizadas', label: 'Finalizadas' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCurrentFilter(f.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm",
                  currentFilter === f.id 
                    ? "bg-primary text-black border-primary" 
                    : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white/60"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={cn(
                "w-full p-4 rounded-2xl flex items-center gap-4 transition-all group relative",
                selectedChatId === chat.id 
                  ? "bg-primary text-black" 
                  : "hover:bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                  selectedChatId === chat.id ? "bg-black/10" : "bg-white/5"
                )}>
                  {chat.name.charAt(0)}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={cn(
                    "font-bold truncate",
                    selectedChatId === chat.id ? "text-black" : "text-white"
                  )}>{chat.name}</h3>
                  <span className={cn(
                    "text-[10px] uppercase font-mono tracking-tighter",
                    selectedChatId === chat.id ? "text-black/60" : "text-white/20"
                  )}>{chat.time}</span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  selectedChatId === chat.id ? "text-black/70" : "text-white/40"
                )}>{chat.lastMessage}</p>
              </div>

              {chat.unreadCount > 0 && selectedChatId !== chat.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-black">
                  {chat.unreadCount}
                </div>
              )}
            </button>
          ))}
          
          {filteredChats.length === 0 && (
            <div className="py-10 text-center text-white/20 text-xs italic">
              Nenhuma conversa encontrada
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-white/[0.01]",
        !selectedChatId ? "hidden lg:flex" : "flex"
      )}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="lg:hidden p-2 hover:bg-white/5 rounded-full text-white/40"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-primary">
                    {selectedChat.name.charAt(0)}
                  </div>
                  {selectedChat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm lg:text-base">{selectedChat.name}</h3>
                  <p className="text-[10px] lg:text-xs text-green-500 font-medium">
                    {selectedChat.online ? 'Online agora' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 lg:gap-3">
                <button className="p-2 lg:p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                  <Phone size={18} />
                </button>
                <button className="p-2 lg:p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                  <Video size={18} />
                </button>
                <div className="w-px h-6 bg-white/5 mx-1" />
                <button 
                  onClick={() => setIsInfoDrawerOpen(true)}
                  className="p-2 lg:p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all shadow-lg"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 custom-scrollbar bg-[url('https://w0.peakpx.com/wallpaper/580/678/HD-wallpaper-whatsapp-dark-mode-pattern-whatsapp-dark-mode-whatsapp-pattern-whatsapp-thumbnail.jpg')] bg-repeat bg-opacity-5">
              {selectedChat.messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] lg:max-w-[70%]",
                    msg.sender === 'me' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm shadow-xl",
                    msg.sender === 'me' 
                      ? "bg-primary text-black rounded-tr-none font-medium" 
                      : "bg-white/[0.05] border border-white/10 text-white rounded-tl-none backdrop-blur-md"
                  )}>
                    {msg.text}
                    <div className={cn(
                      "flex items-center justify-end gap-1 mt-1 text-[10px]",
                      msg.sender === 'me' ? "text-black/40" : "text-white/20"
                    )}>
                      {msg.time}
                      {msg.sender === 'me' && (
                        msg.status === 'read' ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 lg:p-6 bg-white/[0.02] border-t border-white/5">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 lg:gap-4 glass px-4 lg:px-6 py-2 rounded-2xl border border-white/10"
              >
                <div className="flex items-center gap-1 lg:gap-2">
                  <button type="button" className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all">
                    <Smile size={20} />
                  </button>
                  <button type="button" className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all">
                    <Paperclip size={20} />
                  </button>
                </div>
                
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..." 
                  className="flex-1 bg-transparent py-4 text-sm focus:outline-none placeholder:text-white/10"
                />
                
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "p-3 rounded-xl transition-all flex-shrink-0",
                    newMessage.trim() 
                      ? "bg-primary text-black shadow-lg shadow-primary/20 scale-100 hover:scale-110 active:scale-95" 
                      : "text-white/10 scale-90"
                  )}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[url('https://w0.peakpx.com/wallpaper/580/678/HD-wallpaper-whatsapp-dark-mode-pattern-whatsapp-dark-mode-whatsapp-pattern-whatsapp-thumbnail.jpg')] bg-repeat opacity-20 filter grayscale">
             <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <MessageSquare className="text-white/10" size={48} />
             </div>
             <h2 className="text-2xl font-bold tracking-tighter mb-2 text-white/40 italic">Suas Mensagens</h2>
             <p className="text-sm text-white/20 max-w-xs uppercase tracking-widest font-mono font-black leading-relaxed">
               Selecione um contato para começar a conversar agora mesmo.
             </p>
          </div>
        )}
      </div>

      {/* Drawer de Informações (Global) */}
      <AnimatePresence>
        {isInfoDrawerOpen && selectedChat && (
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
                  <h3 className="font-black text-lg">Detalhes do Contato</h3>
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest mt-1">Informações do CRM</p>
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
                      {(leadFullData?.cliente?.nome || selectedChat.name).substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg">{leadFullData?.cliente?.nome || selectedChat.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/10">Lead Ativo</span>
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
                    {activeTab === 'dados' && <motion.div layoutId="drawerTabGlobal" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab('historico')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'historico' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Histórico
                    {activeTab === 'historico' && <motion.div layoutId="drawerTabGlobal" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab('tarefas')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'tarefas' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Tarefas
                    {activeTab === 'tarefas' && <motion.div layoutId="drawerTabGlobal" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab('arquivos')}
                    className={cn(
                      "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'arquivos' ? "text-primary" : "text-white/20 hover:text-white/40"
                    )}
                   >
                    Arquivos
                    {activeTab === 'arquivos' && <motion.div layoutId="drawerTabGlobal" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
                               { icon: Phone, label: "WhatsApp", value: leadFullData?.cliente?.telefone },
                               { icon: MessageSquare, label: "E-mail", value: leadFullData?.cliente?.email },
                               { icon: Shield, label: "CPF", value: leadFullData?.cliente?.cpf },
                               { icon: Calendar, label: "Nascimento", value: leadFullData?.cliente?.data_nascimento },
                               { icon: MapPin, label: "Endereço", value: leadFullData?.cliente?.endereco },
                               { icon: MapPin, label: "Cidade / UF", value: leadFullData?.cliente?.cidade && `${leadFullData.cliente.cidade} - ${leadFullData.cliente.uf}` },
                               { icon: DollarSign, label: "Valor Estimado", value: leadFullData?.valor_estimado ? `R$ ${parseFloat(leadFullData.valor_estimado as any).toLocaleString()}` : 'Não definido' },
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
                                  value={leadFullData?.etapa_id || ''}
                                  options={etapas.map(etapa => ({ value: etapa.id, label: etapa.nome_etapa }))}
                                  onChange={(val) => leadFullData && updateLead(leadFullData.id, { etapa_id: val })}
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
                                  value={leadFullData?.status_negociacao || ''}
                                  options={[
                                    { value: 'andamento', label: 'EM ANDAMENTO', className: 'text-yellow-500' },
                                    { value: 'vendido', label: 'VENDIDO', className: 'text-green-400' },
                                    { value: 'perdido', label: 'PERDIDO', className: 'text-red-400' },
                                    { value: 'pausado', label: 'PAUSADO', className: 'text-white/40' }
                                  ]}
                                  onChange={(val) => leadFullData && updateLead(leadFullData.id, { status_negociacao: val as any })}
                                  buttonClassName={cn(
                                    "w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm font-bold hover:bg-white/10",
                                    leadFullData?.status_negociacao === 'andamento' && "text-yellow-500",
                                    leadFullData?.status_negociacao === 'vendido' && "text-green-400",
                                    leadFullData?.status_negociacao === 'perdido' && "text-red-400",
                                    leadFullData?.status_negociacao === 'pausado' && "text-white/40"
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
                          { title: 'Primeiro Contato', text: 'Lead originado via WhatsApp', time: 'Ontem', icon: Plus },
                          { title: 'Qualificação', text: 'Movido para etapa de Prospecção', time: 'Hoje', icon: SendIcon },
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
                           </div>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                {selectedChatId?.startsWith('lead-') && (
                  <button 
                    onClick={() => navigate(`/negociacao/${selectedChatId.replace('lead-', '')}`)}
                    className="w-full py-4 rounded-2xl bg-white/5 text-white/60 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5 shadow-xl"
                  >
                    Abrir Ficha Completa
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatPage;
