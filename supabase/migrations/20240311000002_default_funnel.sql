-- Função para criar funil e etapas padrão ao cadastrar uma nova empresa
CREATE OR REPLACE FUNCTION public.handle_new_company_default_funnel()
RETURNS TRIGGER AS $$
DECLARE
  new_funil_id UUID;
BEGIN
  -- 1. Cria o funil padrão "Início"
  INSERT INTO public.funis (empresa_id, nome_funil)
  VALUES (NEW.id, 'Início')
  RETURNING id INTO new_funil_id;

  -- 2. Cria as etapas padrão para este funil
  INSERT INTO public.etapas (funil_id, nome_etapa, ordem)
  VALUES 
    (new_funil_id, 'Novos Leads', 1),
    (new_funil_id, 'Em Atendimento', 2),
    (new_funil_id, 'Proposta Enviada', 3),
    (new_funil_id, 'Vencido/Ganho', 4);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado após a inserção de uma nova empresa
DROP TRIGGER IF EXISTS on_company_created_default_funnel ON public.empresas;
CREATE TRIGGER on_company_created_default_funnel
  AFTER INSERT ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company_default_funnel();

-- Garantir que empresas existentes tenham pelo menos um funil (opcional, mas recomendado)
DO $$
DECLARE
    emp_record RECORD;
    curr_funil_id UUID;
BEGIN
    FOR emp_record IN SELECT id FROM public.empresas WHERE id NOT IN (SELECT empresa_id FROM public.funis) LOOP
        INSERT INTO public.funis (empresa_id, nome_funil)
        VALUES (emp_record.id, 'Início')
        RETURNING id INTO curr_funil_id;

        INSERT INTO public.etapas (funil_id, nome_etapa, ordem)
        VALUES 
            (curr_funil_id, 'Novos Leads', 1),
            (curr_funil_id, 'Em Atendimento', 2),
            (curr_funil_id, 'Proposta Enviada', 3),
            (curr_funil_id, 'Vencido/Ganho', 4);
    END LOOP;
END $$;
