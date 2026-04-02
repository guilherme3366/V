import React, { useState } from 'react';
import { useApp, Usuario, PerfilUsuario } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, MoreHorizontal, Shield, X, Check, User, Mail, ShieldAlert, Trash2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCPF, formatPhone } from '../lib/utils';
import ConfirmModal from '../components/ConfirmModal';

const UsersPage = () => {
  const { equipe, addUsuario, deleteUsuario, updateUsuarioMembro } = useApp();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: '',
    name: ''
  });
  
  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    perfil: 'vendedor' as PerfilUsuario,
    status: 'ativo' as 'ativo' | 'inativo' | 'convidado'
  });

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditUser(user);
      setFormData({
        nome: user.nome,
        email: user.email,
        cpf: user.cpf || '',
        telefone: user.telefone || '',
        perfil: user.perfil,
        status: user.status
      });
    } else {
      setEditUser(null);
      setFormData({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        perfil: 'vendedor',
        status: 'ativo'
      });
    }
    setIsModalOpen(true);
    setIsMenuOpen(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editUser) {
        const result = await updateUsuarioMembro(editUser.id, formData);
        if (result.success) {
          showToast('Usuário atualizado com sucesso!', 'success');
          setIsModalOpen(false);
        } else {
          showToast(result.error || 'Erro ao atualizar usuário', 'error');
        }
      } else {
        const result = await addUsuario(formData);
        if (result.success) {
          showToast('Convite enviado com sucesso!', 'success');
          setIsModalOpen(false);
        } else {
          showToast(result.error || 'Erro ao convidar usuário', 'error');
        }
      }
    } catch (error) {
      showToast('Ocorreu um erro inesperado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, nome: string) => {
    setConfirmModal({
      isOpen: true,
      id,
      name: nome
    });
    setIsMenuOpen(null);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteUsuario(confirmModal.id);
    if (result.success) {
      showToast('Usuário removido da equipe.', 'info');
    } else {
      showToast('Erro ao remover usuário.', 'error');
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const toggleStatus = async (user: Usuario) => {
    const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
    const result = await updateUsuarioMembro(user.id, { status: newStatus });
    if (result.success) {
      showToast(`Usuário ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } else {
      showToast('Erro ao alterar status.', 'error');
    }
    setIsMenuOpen(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipe</h2>
          <p className="text-white/40 text-sm">Gerencie o acesso do seu escritório</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary w-full sm:w-auto shadow-lg shadow-primary/10"
        >
          <UserPlus size={18} />
          Convidar Usuário
        </button>
      </div>

      <div className="glass rounded-[32px] overflow-hidden border-white/5">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Nome / E-mail</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Cargo</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipe.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold border",
                        u.perfil === 'admin_master' ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-white/40 border-white/10"
                      )}>
                        {u.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{u.nome}</p>
                        <p className="text-xs text-white/30 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "flex items-center gap-2",
                      u.perfil === 'admin_master' ? "text-primary" : "text-white/40"
                    )}>
                      {u.perfil === 'admin_master' ? <Shield size={14} /> : <User size={14} />}
                      <span className="text-[10px] font-mono uppercase tracking-wider capitalize">
                        {u.perfil.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      u.status === 'ativo' ? "bg-green-500/10 text-green-400 border-green-500/10" : 
                      u.status === 'convidado' ? "bg-blue-500/10 text-blue-400 border-blue-500/10" :
                      "bg-white/5 text-white/20 border-white/5"
                    )}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right relative">
                    {!u.usuario_principal && (
                      <>
                        <button 
                          onClick={() => setIsMenuOpen(isMenuOpen === u.id ? null : u.id)}
                          className="text-white/20 hover:text-white transition-colors p-2"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        <AnimatePresence>
                          {isMenuOpen === u.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-6 top-12 w-48 glass rounded-xl border border-white/10 shadow-2xl z-50 p-1.5"
                              >
                                <button 
                                  onClick={() => handleOpenModal(u)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                                >
                                  <User size={12} />
                                  Editar Informações
                                </button>
                                <button 
                                  onClick={() => toggleStatus(u)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                                >
                                  {u.status === 'ativo' ? <X size={12} /> : <Check size={12} />}
                                  {u.status === 'ativo' ? 'Desativar Usuário' : 'Ativar Usuário'}
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button 
                                  onClick={() => handleDeleteClick(u.id, u.nome)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                >
                                  <Trash2 size={12} />
                                  Remover Membro
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Convite/Edição */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass rounded-[32px] border border-white/10 shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {editUser ? <User size={24} /> : <UserPlus size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{editUser ? 'Editar Membro' : 'Convidar Membro'}</h3>
                    <p className="text-white/40 text-xs">
                      {editUser ? `Editando perfil de ${editUser.nome}` : 'Adicione um novo integrante à equipe'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      autoFocus={!editUser}
                      required
                      type="text" 
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: João Souza" 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-sans"
                    />
                  </div>
                </div>

                {!editUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-1">E-mail Profissional</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="joao@escritorio.com" 
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-sans"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-1">CPF</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        type="text" 
                        value={formData.cpf}
                        onChange={(e) => {
                          setFormData({...formData, cpf: formatCPF(e.target.value)});
                        }}
                        placeholder="000.000.000-00" 
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-1">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        type="text" 
                        value={formData.telefone}
                        onChange={(e) => {
                          setFormData({...formData, telefone: formatPhone(e.target.value)});
                        }}
                        placeholder="(00) 00000-0000" 
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-1">Perfil de Acesso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, perfil: 'vendedor'})}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all",
                        formData.perfil === 'vendedor' ? "bg-primary/5 border-primary/30 text-primary" : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                      )}
                    >
                      <User size={18} className="mb-2" />
                      <p className="text-sm font-bold">Vendedor</p>
                      <p className="text-[10px] opacity-60">Acesso aos leads</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, perfil: 'gerente'})}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all",
                        formData.perfil === 'gerente' ? "bg-primary/5 border-primary/30 text-primary" : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                      )}
                    >
                      <ShieldAlert size={18} className="mb-2" />
                      <p className="text-sm font-bold">Gerente</p>
                      <p className="text-[10px] opacity-60">Gestão do funil</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-6 rounded-2xl text-sm font-bold text-white/40 hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-primary shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        {editUser ? 'Salvar Alterações' : 'Enviar Convite'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="Remover Membro"
        message={`Deseja realmente remover ${confirmModal.name} da equipe? O acesso será revogado imediatamente.`}
        confirmText="Confirmar Remoção"
        variant="danger"
      />
    </div>
  );
};

export default UsersPage;
