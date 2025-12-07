// CRM Types - shared across components

export interface Lead {
  id: string;
  equipe_id: string;
  stage_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  opportunity_value: number;
  meeting_scheduled: boolean;
  meeting_done: boolean;
  no_show: boolean;
  next_contact: string | null;
  observations: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  origem: string | null;
  atendido_por_agente: boolean;
  interaction_id: string | null;
  created_at: string;
  updated_at: string;
  // Alias fields for backward compatibility
  nome?: string;
  telefone?: string;
  observacoes?: string;
  proximo_contato?: string;
  reuniao_agendada?: boolean;
  reuniao_realizada?: boolean;
  valor?: number;
}

export interface PipelineStage {
  id: string;
  equipe_id: string;
  name: string;
  position: number;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string | null;
  tipo: string;
  descricao: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}