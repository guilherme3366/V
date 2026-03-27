import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Tipos baseados no PRD
export type PerfilUsuario = 'admin_master' | 'vendedor' | 'gerente';
export type StatusNegociacao = 'andamento' | 'vendido' | 'perdido' | 'pausado';
export type TipoTarefa = 'tarefa' | 'almoço' | 'visita' | 'ligação' | 'email' | 'reunião' | 'whatsapp';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  perfil: PerfilUsuario;
  empresa_id: string;
  usuario_principal: boolean;
  status: 'ativo' | 'convidado' | 'inativo';
}

export interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string;
  email_suporte: string;
  telefone_comercial: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Funil {
  id: string;
  nome_funil: string;
  empresa_id: string;
}

export interface Etapa {
  id: string;
  funil_id: string;
  nome_etapa: string;
  ordem: number;
}

export interface Cliente {
  id: string;
  empresa_id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  criado_em: string;
}

export interface Lead {
  id: string;
  cliente_id: string;
  cliente: Cliente;
  empresa_id: string;
  funil_id: string;
  etapa_id: string;
  responsavel_id: string;
  titulo: string;
  valor_estimado?: number;
  status_negociacao: StatusNegociacao;
  observacoes?: string;
  criado_em: string;
}

interface AppContextType {
  usuario: Usuario | null;
  equipe: Usuario[];
  empresa: Empresa | null;
  leads: Lead[];
  funis: Funil[];
  etapas: Etapa[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewLeadModalOpen: boolean;
  setIsNewLeadModalOpen: (open: boolean) => void;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (dados: any) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  logout: () => void;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  moveLead: (leadId: string, newEtapaId: string) => Promise<void>;
  addEtapa: (nome: string, funilId: string) => Promise<void>;
  updateEtapa: (etapaId: string, nome: string) => Promise<void>;
  deleteEtapa: (etapaId: string) => Promise<void>;
  addUsuario: (dados: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
  updateEmpresa: (dados: Partial<Empresa>) => Promise<{ success: boolean; error?: string }>;
  updateLead: (id: string, dados: Partial<Lead>) => Promise<void>;
  addLead: (dados: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateUsuario: (dados: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  addFunil: (nome: string) => Promise<void>;
  updateFunil: (id: string, nome: string) => Promise<void>;
  deleteFunil: (id: string) => Promise<void>;
  bypassLogin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [equipe, setEquipe] = useState<Usuario[]>([]);
  const [funis, setFunis] = useState<Funil[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [etapasLocal, setEtapasLocal] = useState<Etapa[]>([]);

  // Fetch initial data
  const fetchData = async (user: SupabaseUser) => {
    try {
      // Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('usuarios_perfil')
        .select('*, empresas(*)')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUsuario({
        id: profile.id,
        nome: profile.nome,
        email: user.email!,
        cpf: profile.cpf,
        telefone: profile.telefone,
        perfil: profile.perfil,
        empresa_id: profile.empresa_id,
        usuario_principal: profile.usuario_principal,
        status: profile.status,
      });

      if (profile.empresas) {
        setEmpresa(profile.empresas);
      }

      // Fetch Funnels
      const { data: funnelsData } = await supabase
        .from('funis')
        .select('*')
        .eq('empresa_id', profile.empresa_id);
      
      setFunis(funnelsData || []);

      // Fetch Stages
      if (funnelsData && funnelsData.length > 0) {
        const funisIds = funnelsData.map(f => f.id);
        const { data: stagesData } = await supabase
          .from('etapas')
          .select('*')
          .in('funil_id', funisIds)
          .order('ordem', { ascending: true });
        
        setEtapasLocal(stagesData || []);
      }

      // Fetch Negotiations (Leads) with joined Client data
      const { data: leadsData } = await supabase
        .from('negociacoes')
        .select('*, cliente:clientes(*)')
        .eq('empresa_id', profile.empresa_id)
        .order('criado_em', { ascending: false });
      
      setLeads(leadsData || []);

      // Fetch Team
      const { data: teamData } = await supabase
        .from('usuarios_perfil')
        .select('*')
        .eq('empresa_id', profile.empresa_id);
      
      setEquipe(teamData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchData(session.user);
      } else {
        setUsuario(null);
        setEmpresa(null);
        setEquipe([]);
        setLeads([]);
        setFunis([]);
        setEtapasLocal([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      let message = 'Erro ao entrar. Tente novamente.';
      if (error.message.includes('Invalid login credentials')) message = 'E-mail ou senha incorretos.';
      if (error.message.includes('Email not confirmed')) message = 'Por favor, confirme seu e-mail antes de acessar.';
      return { success: false, error: message };
    }
    return { success: true };
  };

  const register = async (dados: any) => {
    try {
      // 1. Sign Up User first (to be authenticated if needed for RLS)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email_admin,
        password: dados.senha,
        options: {
          data: {
            nome: dados.nome_admin,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) throw new Error('Este e-mail já está cadastrado.');
        throw authError;
      }

      // If email confirmation is required, authData.session will be null
      const confirmationRequired = !authData.session;
      // 2. Create Company
      const { data: company, error: companyError } = await supabase
        .from('empresas')
        .insert([{
          razao_social: dados.nome_empresa,
          cnpj: dados.cnpj,
          cep: dados.cep,
          logradouro: dados.logradouro,
          numero: dados.numero,
          bairro: dados.bairro,
          cidade: dados.cidade,
          uf: dados.uf
        }])
        .select()
        .single();
      if (companyError) {
        if (companyError.message.includes('violates row-level security policy')) {
           throw new Error('Erro de permissão ao criar empresa.');
        }
        if (companyError.message.includes('unique constraint')) {
            throw new Error('Este CNPJ já está cadastrado em outra conta.');
        }
        throw companyError;
      }

      // 3. Update profile with company_id
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('usuarios_perfil')
          .update({ 
            empresa_id: company.id,
            usuario_principal: true,
            perfil: 'admin_master'
          })
          .eq('id', authData.user.id);
        
        if (updateError) throw updateError;
      }

      return { 
        success: true, 
        confirmationRequired 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const moveLead = async (leadId: string, newEtapaId: string) => {
    const { error } = await supabase
      .from('negociacoes')
      .update({ etapa_id: newEtapaId })
      .eq('id', leadId);
    
    if (!error) {
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, etapa_id: newEtapaId } : lead
      ));
    }
  };

  const addEtapa = async (nome: string, funilId: string) => {
    const { data, error } = await supabase
      .from('etapas')
      .insert([{
        nome_etapa: nome,
        funil_id: funilId,
        ordem: etapasLocal.filter(e => e.funil_id === funilId).length + 1
      }])
      .select()
      .single();

    if (data && !error) {
      setEtapasLocal(prev => [...prev, data]);
    }
  };

  const updateEtapa = async (etapaId: string, nome: string) => {
    const { error } = await supabase
      .from('etapas')
      .update({ nome_etapa: nome })
      .eq('id', etapaId);

    if (!error) {
      setEtapasLocal(prev => prev.map(e => 
        e.id === etapaId ? { ...e, nome_etapa: nome } : e
      ));
    }
  };

  const deleteEtapa = async (etapaId: string) => {
    const { error } = await supabase
      .from('etapas')
      .delete()
      .eq('id', etapaId);

    if (!error) {
      setEtapasLocal(prev => prev.filter(e => e.id !== etapaId));
      setLeads(prev => prev.filter(l => l.etapa_id !== etapaId));
    }
  };

  const addUsuario = async (dados: Partial<Usuario>) => {
    // In a real app, logic would involve sending an invite email
    // For now, we manually create a record if the user exists or just add to the list
    const { data, error } = await supabase
      .from('usuarios_perfil')
      .insert([{
        ...dados,
        empresa_id: empresa?.id
      }])
      .select()
      .single();

    if (data && !error) {
      setEquipe(prev => [...prev, data]);
    }
  };

  const deleteUsuario = async (id: string) => {
    const { error } = await supabase
      .from('usuarios_perfil')
      .delete()
      .eq('id', id);

    if (!error) {
      setEquipe(prev => prev.filter(u => u.id !== id));
    }
  };

  const updateEmpresa = async (dados: Partial<Empresa>) => {
    if (!empresa) return { success: false, error: 'Empresa não encontrada' };
    
    // Filter allowed fields
    const { id, criado_em, atualizado_em, ...allowedData } = dados as any;

    const { error } = await supabase
      .from('empresas')
      .update(allowedData)
      .eq('id', empresa.id);

    if (error) {
      console.error('Error updating company:', error);
      return { success: false, error: error.message };
    }

    setEmpresa(prev => prev ? ({ ...prev, ...allowedData }) : null);
    return { success: true };
  };

  const updateLead = async (id: string, dados: Partial<Lead>) => {
    // Separate client data if any
    const { cliente, ...negociacaoDados } = dados as any;
    
    // Update negotiation
    if (Object.keys(negociacaoDados).length > 0) {
      await supabase
        .from('negociacoes')
        .update(negociacaoDados)
        .eq('id', id);
    }

    // Update client if data provided
    if (cliente && Object.keys(cliente).length > 0) {
      const lead = leads.find(l => l.id === id);
      if (lead) {
        await supabase
          .from('clientes')
          .update(cliente)
          .eq('id', lead.cliente_id);
      }
    }

    // Refresh context data (could be optimized, but fetching again is safer for joins)
    if (usuario) fetchData({ id: usuario.id, email: usuario.email } as any);
  };

  const addLead = async (dados: Partial<Lead>) => {
    if (!usuario || !empresa) return;

    // 1. Check if client exists or create new one
    let clienteId = (dados as any).cliente_id;
    
    if (!clienteId) {
      const { data: newCliente, error: clienteError } = await supabase
        .from('clientes')
        .insert([{
          empresa_id: empresa.id,
          nome: (dados as any).nome || 'Novo Cliente',
          email: (dados as any).email,
          telefone: (dados as any).telefone,
          cpf: (dados as any).cpf
        }])
        .select()
        .single();
      
      if (clienteError) {
        console.error('Error creating client:', clienteError);
        return;
      }
      clienteId = newCliente.id;
    }

    // 2. Create negotiation
    const { data: newNegociacao, error: negError } = await supabase
      .from('negociacoes')
      .insert([{
        cliente_id: clienteId,
        empresa_id: empresa.id,
        responsavel_id: usuario.id,
        funil_id: dados.funil_id,
        etapa_id: dados.etapa_id,
        titulo: dados.titulo || 'Novo Serviço',
        valor_estimado: dados.valor_estimado,
        status_negociacao: 'andamento',
        observacoes: dados.observacoes
      }])
      .select('*, cliente:clientes(*)')
      .single();

    if (newNegociacao && !negError) {
      setLeads(prev => [newNegociacao, ...prev]);
    }
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase
      .from('negociacoes')
      .delete()
      .eq('id', id);

    if (!error) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  const updateUsuario = async (dados: Partial<Usuario>) => {
    if (!usuario) return { success: false, error: 'Usuário não logado' };
    
    // Filter allowed fields
    const { id, email, empresa_id, criado_em, atualizado_em, ...allowedData } = dados as any;

    const { error } = await supabase
      .from('usuarios_perfil')
      .update(allowedData)
      .eq('id', usuario.id);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    setUsuario(prev => prev ? ({ ...prev, ...allowedData }) : null);
    return { success: true };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const bypassLogin = () => {
    const mockUserId = 'mock-user-123';
    const mockEmpresaId = 'mock-empresa-123';
    
    setUsuario({
      id: mockUserId,
      nome: 'Usuário de Teste',
      email: 'teste@vonprevi.com',
      cpf: '000.000.000-00',
      telefone: '(11) 99999-9999',
      perfil: 'admin_master',
      empresa_id: mockEmpresaId,
      usuario_principal: true,
      status: 'ativo'
    });

    setEmpresa({
      id: mockEmpresaId,
      razao_social: 'Von Previ Business',
      cnpj: '00.000.000/0001-00',
      email_suporte: 'suporte@vonprevi.com',
      telefone_comercial: '(11) 4004-0000',
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      numero: '1',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP'
    });

    const mockFunis = [{ id: 'funil-1', nome_funil: 'Vendas Diretas', empresa_id: mockEmpresaId }];
    setFunis(mockFunis);

    const mockEtapas = [
      { id: 'etapa-1', funil_id: 'funil-1', nome_etapa: 'Leads', ordem: 1 },
      { id: 'etapa-2', funil_id: 'funil-1', nome_etapa: 'Em Calibragem', ordem: 2 },
      { id: 'etapa-3', funil_id: 'funil-1', nome_etapa: 'Negociação', ordem: 3 },
      { id: 'etapa-4', funil_id: 'funil-1', nome_etapa: 'Vendido', ordem: 4 }
    ];
    setEtapasLocal(mockEtapas);

    setLeads([
      { 
        id: 'lead-1', 
        cliente_id: 'client-1',
        cliente: {
          id: 'client-1',
          empresa_id: mockEmpresaId,
          nome: 'João Silva',
          telefone: '(11) 98888-8888',
          email: 'joao@email.com',
          criado_em: new Date().toISOString()
        },
        responsavel_id: mockUserId, 
        empresa_id: mockEmpresaId,
        funil_id: 'funil-1', 
        etapa_id: 'etapa-1', 
        titulo: 'Aposentadoria Rural',
        status_negociacao: 'andamento', 
        criado_em: new Date().toISOString() 
      },
      { 
        id: 'lead-2', 
        cliente_id: 'client-2',
        cliente: {
          id: 'client-2',
          empresa_id: mockEmpresaId,
          nome: 'Maria Souza',
          telefone: '(11) 97777-7777',
          email: 'maria@email.com',
          criado_em: new Date().toISOString()
        },
        valor_estimado: 5000, 
        responsavel_id: mockUserId, 
        empresa_id: mockEmpresaId,
        funil_id: 'funil-1', 
        etapa_id: 'etapa-2', 
        titulo: 'Revisão de Benefício',
        status_negociacao: 'andamento', 
        criado_em: new Date().toISOString() 
      }
    ]);

    setIsLoading(false);
  };

  return (
    <AppContext.Provider value={{ 
      usuario, 
      equipe,
      empresa,
      leads, 
      funis, 
      etapas: etapasLocal, 
      isAuthenticated: !!usuario,
      isLoading,
      isNewLeadModalOpen,
      setIsNewLeadModalOpen,
      login,
      register,
      logout,
      setLeads, 
      moveLead, 
      addEtapa, 
      updateEtapa, 
      deleteEtapa,
      addFunil: async (nome: string) => {
        if (!empresa) return;
        const { data, error } = await supabase
          .from('funis')
          .insert([{ nome_funil: nome, empresa_id: empresa.id }])
          .select()
          .single();
        if (data && !error) setFunis(prev => [...prev, data]);
      },
      updateFunil: async (id: string, nome: string) => {
        const { error } = await supabase
          .from('funis')
          .update({ nome_funil: nome })
          .eq('id', id);
        if (!error) setFunis(prev => prev.map(f => f.id === id ? { ...f, nome_funil: nome } : f));
      },
      deleteFunil: async (id: string) => {
        const { error } = await supabase
          .from('funis')
          .delete()
          .eq('id', id);
        if (!error) {
          setFunis(prev => prev.filter(f => f.id !== id));
          setEtapasLocal(prev => prev.filter(e => e.funil_id !== id));
        }
      },
      addUsuario,
      deleteUsuario,
      updateEmpresa,
      updateLead,
      addLead,
      deleteLead,
      updateUsuario,
      updatePassword,
      bypassLogin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
