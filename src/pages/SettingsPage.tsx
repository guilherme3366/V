import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Save, User, Building, Lock, Mail, Phone, MapPin, Shield, Camera, LayoutGrid, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

import { cn, formatCNPJ } from '../lib/utils';

const NavItem = ({ id, label, icon: Icon, activeSection, setActiveSection }: { id: string, label: string, icon: any, activeSection: string, setActiveSection: (id: string) => void }) => (
  <button 
    onClick={() => setActiveSection(id)}
    className={cn(
      "flex items-center gap-3 px-6 py-4 rounded-2xl transition-all text-sm w-full group relative overflow-hidden",
      activeSection === id 
        ? "bg-primary text-black font-bold shadow-lg shadow-primary/20" 
        : "text-white/40 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={18} className={cn("transition-transform duration-300", activeSection === id ? "scale-110" : "group-hover:scale-110")} />
    {label}
    {activeSection === id && (
      <motion.div 
        layoutId="activeTab"
        className="absolute inset-0 bg-primary -z-10"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </button>
);

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-8">
    <h3 className="text-xl font-bold tracking-tight">{title}</h3>
    <p className="text-white/40 text-xs">{subtitle}</p>
  </div>
);

const PipelineSettings = ({ funis, etapas, addEtapa, updateEtapa, deleteEtapa, addFunil, updateFunil, deleteFunil, showToast }: any) => {
  const [newStageName, setNewStageName] = useState('');
  const [newFunilName, setNewFunilName] = useState('');
  const [activeFunil, setActiveFunil] = useState(funis[0] || null);
  const [editingEtapa, setEditingEtapa] = useState<string | null>(null);
  const [editEtapaName, setEditEtapaName] = useState('');
  const [editingFunil, setEditingFunil] = useState<string | null>(null);
  const [editFunilName, setEditFunilName] = useState('');

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

  // Sincronizar activeFunil caso funis mude
  useEffect(() => {
    if (!activeFunil && funis.length > 0) {
      setActiveFunil(funis[0]);
    }
  }, [funis, activeFunil]);

  const handleAddStage = async () => {
    if (newStageName.trim() && activeFunil) {
      await addEtapa(newStageName, activeFunil.id);
      setNewStageName('');
      showToast('Etapa adicionada!', 'success');
    }
  };

  const handleAddFunil = async () => {
    if (newFunilName.trim()) {
      await addFunil(newFunilName);
      setNewFunilName('');
      showToast('Novo funil criado!', 'success');
    }
  };

  const handleUpdateFunil = async (id: string) => {
    if (editFunilName.trim()) {
      await updateFunil(id, editFunilName);
      setEditingFunil(null);
      showToast('Funil renomeado!', 'info');
    }
  };

  const handleDeleteFunil = async (id: string, name: string) => {
    if (funis.length <= 1) {
      showToast('Você deve manter ao menos um funil.', 'info');
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'funil',
      id,
      name
    });
  };

  const handleDeleteStage = async (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'etapa',
      id,
      name
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.type === 'funil') {
      await deleteFunil(confirmModal.id);
      if (activeFunil?.id === confirmModal.id) {
        const otherFunil = funis.find((f: any) => f.id !== confirmModal.id);
        if (otherFunil) setActiveFunil(otherFunil);
      }
      showToast('Funil removido.', 'info');
    } else if (confirmModal.type === 'etapa') {
      await deleteEtapa(confirmModal.id);
      showToast('Etapa removida.', 'info');
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleUpdateStage = async (id: string) => {
    if (editEtapaName.trim()) {
      await updateEtapa(id, editEtapaName);
      setEditingEtapa(null);
      showToast('Etapa atualizada!', 'info');
    }
  };

  return (
    <div className="space-y-10">
      <SectionHeader title="Funis e Etapas" subtitle="Gerencie seus fluxos de trabalho e colunas do Kanban" />
      
      <div className="space-y-6">
        <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Meus Funis</label>
        <div className="flex flex-wrap gap-4 items-center">
          {funis.map((f: any) => (
            <div key={f.id} className="relative group">
              {editingFunil === f.id ? (
                <input 
                  autoFocus
                  className="bg-white/10 border border-primary/40 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none w-32"
                  value={editFunilName}
                  onChange={(e) => setEditFunilName(e.target.value)}
                  onBlur={() => handleUpdateFunil(f.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateFunil(f.id)}
                />
              ) : (
                <button 
                  onClick={() => setActiveFunil(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                    activeFunil?.id === f.id ? "bg-primary text-black" : "bg-white/5 text-white/40 hover:text-white"
                  )}
                >
                  {f.nome_funil}
                  {activeFunil?.id === f.id && (
                    <div className="flex items-center gap-1 ml-1 border-l border-black/10 pl-2">
                       <Edit2 size={10} className="hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); setEditingFunil(f.id); setEditFunilName(f.nome_funil); }} />
                       <Trash2 size={10} className="hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); handleDeleteFunil(f.id, f.nome_funil); }} />
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-2 bg-white/[0.02] border border-dashed border-white/10 rounded-xl px-3 py-1.5 focus-within:border-primary/40 transition-all">
            <Plus size={14} className="text-white/20" />
            <input 
              type="text"
              placeholder="Novo funil..."
              className="bg-transparent text-[10px] focus:outline-none w-24 placeholder:text-white/10"
              value={newFunilName}
              onChange={(e) => setNewFunilName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFunil()}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">
            Colunas de: <span className="text-primary font-bold">{activeFunil?.nome_funil}</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {etapas.filter((e: any) => e.funil_id === activeFunil?.id).sort((a: any, b: any) => a.ordem - b.ordem).map((etapa: any) => (
            <div key={etapa.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-mono text-white/20">{etapa.ordem}</div>
              
              {editingEtapa === etapa.id ? (
                <input 
                  autoFocus
                  className="flex-1 bg-white/5 border border-primary/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                  value={editEtapaName}
                  onChange={(e) => setEditEtapaName(e.target.value)}
                  onBlur={() => handleUpdateStage(etapa.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateStage(etapa.id)}
                />
              ) : (
                <span className="flex-1 text-sm font-medium">{etapa.nome_etapa}</span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingEtapa(etapa.id); setEditEtapaName(etapa.nome_etapa); }}
                  className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-primary transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteStage(etapa.id, etapa.nome_etapa)}
                  className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl bg-primary/5 border border-dashed border-primary/20">
            <Plus size={16} className="text-primary" />
            <input 
              type="text"
              placeholder="Adicionar coluna..."
              className="flex-1 bg-transparent py-2 text-sm focus:outline-none placeholder:text-primary/30"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            />
            <button 
              onClick={handleAddStage}
              disabled={!newStageName.trim()}
              className="px-4 py-2 bg-primary text-black text-[10px] font-black uppercase rounded-xl disabled:opacity-50"
            >
            </button>
          </div>
        </div>
      </div>

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


const InputField = ({ label, icon: Icon, value, onChange, placeholder, disabled, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={16} />}
      <input 
        type={type}
        disabled={disabled}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10",
          Icon && "pl-12",
          disabled && "opacity-50 cursor-not-allowed bg-transparent border-dashed"
        )}
      />
    </div>
  </div>
);
const SettingsPage = () => {
  const { usuario, empresa, funis, etapas, leads, updateEmpresa, updateUsuario, updatePassword, addEtapa, updateEtapa, deleteEtapa, addFunil, updateFunil, deleteFunil, setIsNewLeadModalOpen } = useApp();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('perfil');
  const [localUsuario, setLocalUsuario] = useState({...usuario});
  const [localEmpresa, setLocalEmpresa] = useState({...empresa});
  
  // Security State
  const [passwords, setPasswords] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });

  useEffect(() => {
    if (usuario) setLocalUsuario({...usuario});
  }, [usuario]);

  useEffect(() => {
    if (empresa) setLocalEmpresa({...empresa});
  }, [empresa]);

  const handleSavePerfil = async () => {
    const { success, error } = await updateUsuario(localUsuario);
    if (success) {
      showToast('Perfil atualizado com sucesso!', 'success');
    } else {
      showToast(error || 'Erro ao atualizar perfil', 'error');
    }
  };

  const handleSaveEmpresa = async () => {
    const { success, error } = await updateEmpresa(localEmpresa);
    if (success) {
      showToast('Dados da empresa atualizados!', 'success');
    } else {
      showToast(error || 'Erro ao atualizar dados da empresa', 'error');
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.nova || passwords.nova !== passwords.confirmar) {
      showToast('As senhas não coincidem ou estão vazias', 'error');
      return;
    }

    if (passwords.nova.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    const { success, error } = await updatePassword(passwords.nova);
    if (success) {
      showToast('Senha atualizada com sucesso!', 'success');
      setPasswords({ atual: '', nova: '', confirmar: '' });
    } else {
      showToast(error || 'Erro ao atualizar senha', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tighter mb-2">Configurações</h2>
        <p className="text-white/40 text-sm">Gerencie sua conta e as preferências da empresa</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1 space-y-2">
          <NavItem id="perfil" label="Meu Perfil" icon={User} activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="empresa" label="Empresa" icon={Building} activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="pipelines" label="Funis e Etapas" icon={LayoutGrid} activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="seguranca" label="Segurança" icon={Lock} activeSection={activeSection} setActiveSection={setActiveSection} />
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSection === 'perfil' && (
              <motion.div 
                key="perfil"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-8 lg:p-10 rounded-[40px] border-white/5 space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
                
                <SectionHeader 
                  title="Informações Pessoais" 
                  subtitle="Atualize seus dados de contato e foto de perfil" 
                />

                <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-primary to-green-400 p-[2px]">
                      <div className="w-full h-full rounded-[30px] bg-surface flex items-center justify-center text-primary text-3xl font-black italic">
                        {localUsuario?.nome?.substring(0, 2).toUpperCase() || 'AV'}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/80">
                      <Camera size={24} />
                    </div>
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <button className="btn-primary py-2 px-6 text-xs rounded-xl shadow-lg shadow-primary/10">Trocar Avatar</button>
                    <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Formatos: JPG, PNG • Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <InputField 
                    label="Nome Completo" 
                    icon={User} 
                    value={localUsuario?.nome} 
                    onChange={(e: any) => setLocalUsuario({...localUsuario, nome: e.target.value})}
                  />
                  <InputField 
                    label="Endereço de E-mail" 
                    icon={Mail} 
                    value={localUsuario?.email} 
                    disabled 
                  />
                  <InputField 
                    label="Telefone / WhatsApp" 
                    icon={Phone} 
                    value={localUsuario?.telefone} 
                    onChange={(e: any) => setLocalUsuario({...localUsuario, telefone: e.target.value})}
                  />
                  <InputField 
                    label="CPF de Acesso" 
                    icon={Shield} 
                    value={localUsuario?.cpf} 
                    disabled 
                  />
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={handleSavePerfil}
                    className="btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20"
                  >
                    <Save size={18} />
                    Salvar Perfil
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'empresa' && (
              <motion.div 
                key="empresa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-8 lg:p-10 rounded-[40px] border-white/5 space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />

                <SectionHeader 
                  title="Dados da Empresa" 
                  subtitle="Configurações globais do seu escritório de advocacia" 
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <InputField 
                    label="Razão Social" 
                    icon={Building} 
                    value={localEmpresa?.razao_social} 
                    onChange={(e: any) => setLocalEmpresa({...localEmpresa, razao_social: e.target.value})}
                  />
                  <InputField 
                    label="CNPJ" 
                    icon={Shield} 
                    value={localEmpresa?.cnpj} 
                    onChange={(e: any) => setLocalEmpresa({...localEmpresa, cnpj: formatCNPJ(e.target.value)})}
                  />
                  <InputField 
                    label="E-mail de Suporte" 
                    icon={Mail} 
                    value={localEmpresa?.email_suporte} 
                    onChange={(e: any) => setLocalEmpresa({...localEmpresa, email_suporte: e.target.value})}
                  />
                  <InputField 
                    label="Telefone Comercial" 
                    icon={Phone} 
                    value={localEmpresa?.telefone_comercial} 
                    onChange={(e: any) => setLocalEmpresa({...localEmpresa, telefone_comercial: e.target.value})}
                  />
                </div>

                <div className="space-y-6 pt-6">
                  <div className="flex items-center gap-3 text-white/30 mb-4 px-2">
                    <MapPin size={16} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black">Localização</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <InputField 
                        label="CEP" 
                        value={localEmpresa?.cep} 
                        onChange={(e: any) => setLocalEmpresa({...localEmpresa, cep: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                       <InputField 
                        label="Logradouro" 
                        value={localEmpresa?.logradouro} 
                        onChange={(e: any) => setLocalEmpresa({...localEmpresa, logradouro: e.target.value})}
                      />
                    </div>
                    <InputField 
                      label="Número" 
                      value={localEmpresa?.numero} 
                      onChange={(e: any) => setLocalEmpresa({...localEmpresa, numero: e.target.value})}
                    />
                    <InputField 
                      label="Bairro" 
                      value={localEmpresa?.bairro} 
                      onChange={(e: any) => setLocalEmpresa({...localEmpresa, bairro: e.target.value})}
                    />
                    <InputField 
                      label="Cidade" 
                      value={localEmpresa?.cidade} 
                      onChange={(e: any) => setLocalEmpresa({...localEmpresa, cidade: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={handleSaveEmpresa}
                    className="btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20"
                  >
                    <Save size={18} />
                    Salvar Dados
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'pipelines' && (
              <motion.div 
                key="pipelines"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-8 lg:p-10 rounded-[40px] border-white/5 relative overflow-hidden"
              >
                <PipelineSettings 
                  funis={funis} 
                  etapas={etapas} 
                  addEtapa={addEtapa} 
                  updateEtapa={updateEtapa} 
                  deleteEtapa={deleteEtapa} 
                  addFunil={addFunil}
                  updateFunil={updateFunil}
                  deleteFunil={deleteFunil}
                  showToast={showToast} 
                />
              </motion.div>
            )}


            {activeSection === 'seguranca' && (
              <motion.div 
                key="seguranca"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-8 lg:p-10 rounded-[40px] border-white/5 space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />

                <SectionHeader 
                  title="Segurança" 
                  subtitle="Proteja sua conta e defina suas credenciais" 
                />

                <div className="space-y-8 max-w-sm">
                  <InputField 
                    label="Nova Senha" 
                    type="password" 
                    icon={Lock} 
                    placeholder="••••••••••••" 
                    value={passwords.nova}
                    onChange={(e: any) => setPasswords({...passwords, nova: e.target.value})}
                  />
                  <InputField 
                    label="Confirmar Nova Senha" 
                    type="password" 
                    icon={Lock} 
                    placeholder="••••••••••••" 
                    value={passwords.confirmar}
                    onChange={(e: any) => setPasswords({...passwords, confirmar: e.target.value})}
                  />
                </div>

                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <Shield size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Atenção</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Sugerimos o uso de senhas fortes com números, letras e símbolos. 
                    Tokens 2FA estarão disponíveis em versões futuras.
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={handleUpdatePassword}
                    className="btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20"
                  >
                    <Save size={18} />
                    Atualizar Senha
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
