-- Create equipes table (teams/companies)
CREATE TABLE public.equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  niche TEXT,
  gpt_maker_agent_id TEXT,
  asaas_customer_id TEXT,
  limite_creditos INTEGER DEFAULT 100,
  creditos_avulsos INTEGER DEFAULT 0,
  webhook_secret TEXT DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (user profiles linked to teams)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES public.equipes(id) ON DELETE SET NULL,
  nome_completo TEXT,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  cargo TEXT DEFAULT 'member',
  chat_link_base TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pipeline_stages table (etapas do funil por equipe)
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#6b7280',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'manual',
  opportunity_value DECIMAL(12,2) DEFAULT 0,
  meeting_scheduled BOOLEAN DEFAULT false,
  meeting_done BOOLEAN DEFAULT false,
  no_show BOOLEAN DEFAULT false,
  next_contact DATE,
  observations TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  origem TEXT DEFAULT 'manual',
  atendido_por_agente BOOLEAN DEFAULT false,
  interaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_activities table (histórico de atividades)
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_automations table (automações agendadas)
CREATE TABLE public.scheduled_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_automations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipes
CREATE POLICY "Users can view their own team"
ON public.equipes
FOR SELECT
USING (
  id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- RLS Policies for pipeline_stages
CREATE POLICY "Users can view their team stages"
ON public.pipeline_stages
FOR SELECT
USING (
  equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Users can manage their team stages"
ON public.pipeline_stages
FOR ALL
USING (
  equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- RLS Policies for leads
CREATE POLICY "Users can view their team leads"
ON public.leads
FOR SELECT
USING (
  equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Users can manage their team leads"
ON public.leads
FOR ALL
USING (
  equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- RLS Policies for lead_activities
CREATE POLICY "Users can view their team lead activities"
ON public.lead_activities
FOR SELECT
USING (
  lead_id IN (
    SELECT l.id FROM public.leads l
    WHERE l.equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

CREATE POLICY "Users can manage their team lead activities"
ON public.lead_activities
FOR ALL
USING (
  lead_id IN (
    SELECT l.id FROM public.leads l
    WHERE l.equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- RLS Policies for scheduled_automations
CREATE POLICY "Users can view their team automations"
ON public.scheduled_automations
FOR SELECT
USING (
  equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Users can manage their team automations"
ON public.scheduled_automations
FOR ALL
USING (
  equipe_id IN (SELECT p.equipe_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- Create function and trigger for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updating updated_at on leads
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipes_updated_at
BEFORE UPDATE ON public.equipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Create indexes for better performance
CREATE INDEX idx_leads_equipe_id ON public.leads(equipe_id);
CREATE INDEX idx_leads_stage_id ON public.leads(stage_id);
CREATE INDEX idx_pipeline_stages_equipe_id ON public.pipeline_stages(equipe_id);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_scheduled_automations_scheduled_for ON public.scheduled_automations(scheduled_for) WHERE executed = false;
CREATE INDEX idx_profiles_equipe_id ON public.profiles(equipe_id);