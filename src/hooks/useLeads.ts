import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Lead {
  id: string;
  equipe_id: string;
  stage_id: string | null;
  nome: string;
  email: string | null;
  telefone: string | null;
  origem: string;
  atendido_por_agente: boolean;
  interaction_id: string | null;
  tags: string[];
  observacoes: string | null;
  proximo_contato: string | null;
  reuniao_agendada: boolean;
  reuniao_realizada: boolean;
  no_show: boolean;
  valor: number | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  nome: string;
  email?: string;
  telefone?: string;
  stage_id?: string;
  tags?: string[];
  observacoes?: string;
  origem?: string;
}

export interface UpdateLeadData {
  id: string;
  nome?: string;
  email?: string | null;
  telefone?: string | null;
  stage_id?: string | null;
  tags?: string[];
  observacoes?: string | null;
  proximo_contato?: string | null;
  reuniao_agendada?: boolean;
  reuniao_realizada?: boolean;
  no_show?: boolean;
  valor?: number | null;
  custom_fields?: Record<string, unknown>;
}

export const useLeads = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const equipeId = profile?.equipe_id;

  const leadsQuery = useQuery({
    queryKey: ["leads", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      
      const { data, error } = await supabase
        .from("leads" as any)
        .select("*")
        .eq("equipe_id", equipeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Lead[];
    },
    enabled: !!equipeId,
  });

  const createLead = useMutation({
    mutationFn: async (leadData: CreateLeadData) => {
      if (!equipeId) throw new Error("No equipe_id");
      
      const { data, error } = await supabase
        .from("leads" as any)
        .insert({
          ...leadData,
          equipe_id: equipeId,
          origem: leadData.origem || "manual",
          atendido_por_agente: false,
          tags: leadData.tags || [],
          custom_fields: {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", equipeId] });
      toast.success("Lead criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar lead: " + error.message);
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateLeadData) => {
      const { data, error } = await supabase
        .from("leads" as any)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", equipeId] });
      toast.success("Lead atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar lead: " + error.message);
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", equipeId] });
      toast.success("Lead removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover lead: " + error.message);
    },
  });

  const moveLeadToStage = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
      const { data, error } = await supabase
        .from("leads" as any)
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", equipeId] });
    },
    onError: (error) => {
      toast.error("Erro ao mover lead: " + error.message);
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    createLead,
    updateLead,
    deleteLead,
    moveLeadToStage,
    refetch: leadsQuery.refetch,
  };
};
