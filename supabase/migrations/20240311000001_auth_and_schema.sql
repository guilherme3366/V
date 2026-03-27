-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Empresas
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    email_suporte TEXT,
    telefone_comercial TEXT,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Perfis de Usuários (Extensão do auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios_perfil (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    perfil TEXT CHECK (perfil IN ('admin_master', 'vendedor', 'gerente')) DEFAULT 'vendedor',
    usuario_principal BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('ativo', 'convidado', 'inativo')) DEFAULT 'ativo',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Funis
CREATE TABLE IF NOT EXISTS public.funis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome_funil TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Etapas
CREATE TABLE IF NOT EXISTS public.etapas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funil_id UUID REFERENCES public.funis(id) ON DELETE CASCADE,
    nome_etapa TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    funil_id UUID REFERENCES public.funis(id),
    etapa_id UUID REFERENCES public.etapas(id),
    responsavel_id UUID REFERENCES public.usuarios_perfil(id),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    cpf TEXT,
    data_nascimento DATE,
    endereco TEXT,
    cidade TEXT,
    uf TEXT,
    cep TEXT,
    valor_estimado DECIMAL(12,2),
    status_negociacao TEXT CHECK (status_negociacao IN ('andamento', 'vendido', 'perdido', 'pausado')) DEFAULT 'andamento',
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios_perfil(id),
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT CHECK (tipo IN ('tarefa', 'almoço', 'visita', 'ligação', 'email', 'reunião', 'whatsapp')),
    data_vencimento TIMESTAMPTZ,
    concluida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS simples para visualização inicial
CREATE POLICY "Empresas: visualização própria" ON public.empresas FOR SELECT USING (true);
CREATE POLICY "Empresas: permitir inserção" ON public.empresas FOR INSERT WITH CHECK (true);
CREATE POLICY "Empresas: permitir atualização" ON public.empresas FOR UPDATE USING (true);
CREATE POLICY "Perfis: acesso empresa" ON public.usuarios_perfil FOR ALL USING (true);
CREATE POLICY "Funis: acesso empresa" ON public.funis FOR ALL USING (true);
CREATE POLICY "Etapas: acesso empresa" ON public.etapas FOR ALL USING (true);
CREATE POLICY "Leads: acesso empresa" ON public.leads FOR ALL USING (true);
CREATE POLICY "Tarefas: acesso empresa" ON public.tarefas FOR ALL USING (true);


-- Função e Trigger para criar perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios_perfil (id, nome, perfil, status)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nome', 'Novo Usuário'), 'vendedor', 'ativo');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger de updated_at em todas as tabelas
CREATE TRIGGER set_updated_at_empresas BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_perfil BEFORE UPDATE ON public.usuarios_perfil FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_funis BEFORE UPDATE ON public.funis FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_etapas BEFORE UPDATE ON public.etapas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_tarefas BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
