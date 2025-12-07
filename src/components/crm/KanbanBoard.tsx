import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { AddLeadModal } from "./AddLeadModal";
import { StageManagerModal } from "./StageManagerModal";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Settings } from "lucide-react";
import { toast } from "sonner";

// Local types for mock data (compatible with hook types)
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

export interface PipelineStage {
  id: string;
  equipe_id: string;
  name: string;
  position: number;
  color: string;
  is_default: boolean;
  created_at: string;
}

// Sample data
const INITIAL_STAGES: PipelineStage[] = [
  { id: "stage_1", equipe_id: "demo", name: "Novo Lead", position: 1, color: "#6366f1", is_default: true, created_at: new Date().toISOString() },
  { id: "stage_2", equipe_id: "demo", name: "Qualificação", position: 2, color: "#f59e0b", is_default: false, created_at: new Date().toISOString() },
  { id: "stage_3", equipe_id: "demo", name: "Proposta Enviada", position: 3, color: "#8b5cf6", is_default: false, created_at: new Date().toISOString() },
  { id: "stage_4", equipe_id: "demo", name: "Negociação", position: 4, color: "#06b6d4", is_default: false, created_at: new Date().toISOString() },
  { id: "stage_5", equipe_id: "demo", name: "Fechado Ganho", position: 5, color: "#22c55e", is_default: false, created_at: new Date().toISOString() },
  { id: "stage_6", equipe_id: "demo", name: "Fechado Perdido", position: 6, color: "#ef4444", is_default: false, created_at: new Date().toISOString() },
];

const createLead = (overrides: Partial<Lead>): Lead => ({
  id: `lead_${Date.now()}_${Math.random()}`,
  equipe_id: "demo",
  stage_id: null,
  nome: "",
  email: null,
  telefone: null,
  origem: "manual",
  atendido_por_agente: false,
  interaction_id: null,
  tags: [],
  observacoes: null,
  proximo_contato: null,
  reuniao_agendada: false,
  reuniao_realizada: false,
  no_show: false,
  valor: null,
  custom_fields: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const INITIAL_LEADS: Lead[] = [
  createLead({
    id: "lead_1",
    nome: "Maria Silva",
    email: "maria@empresa.com",
    telefone: "(11) 99999-1234",
    origem: "agente_sdr",
    atendido_por_agente: true,
    stage_id: "stage_1",
    valor: 15000,
    proximo_contato: new Date(Date.now() + 86400000).toISOString(),
    observacoes: "Interessada em consultoria jurídica para startups",
    tags: ["startup", "urgente"],
  }),
  createLead({
    id: "lead_2",
    nome: "João Pereira",
    email: "joao@tech.com.br",
    telefone: "(21) 98888-5678",
    origem: "indicacao",
    stage_id: "stage_2",
    valor: 25000,
    reuniao_agendada: true,
    proximo_contato: new Date(Date.now() + 172800000).toISOString(),
    observacoes: "Precisa de assessoria para fusão de empresas",
    tags: ["M&A", "grande porte"],
  }),
  createLead({
    id: "lead_3",
    nome: "Ana Costa",
    email: "ana.costa@gmail.com",
    telefone: "(31) 97777-9012",
    origem: "manual",
    stage_id: "stage_3",
    valor: 8000,
    reuniao_agendada: true,
    reuniao_realizada: true,
    observacoes: "Aguardando retorno sobre proposta de honorários",
    tags: ["trabalhista"],
  }),
  createLead({
    id: "lead_4",
    nome: "Carlos Mendes",
    email: "carlos@industria.com",
    telefone: "(41) 96666-3456",
    origem: "agente_sdr",
    atendido_por_agente: true,
    stage_id: "stage_1",
    valor: 50000,
    proximo_contato: new Date(Date.now() + 259200000).toISOString(),
    observacoes: "Empresa com problemas tributários complexos",
    tags: ["tributário", "grande porte", "urgente"],
  }),
  createLead({
    id: "lead_5",
    nome: "Fernanda Lima",
    email: "fernanda@startup.io",
    telefone: "(51) 95555-7890",
    origem: "indicacao",
    stage_id: "stage_4",
    valor: 12000,
    reuniao_agendada: true,
    reuniao_realizada: true,
    proximo_contato: new Date(Date.now() + 86400000).toISOString(),
    observacoes: "Negociando desconto para contrato anual",
    tags: ["contrato", "desconto"],
  }),
];

export const KanbanBoard = () => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    
    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });
    grouped["no_stage"] = [];
    
    leads.forEach((lead) => {
      if (lead.stage_id && grouped[lead.stage_id]) {
        grouped[lead.stage_id].push(lead);
      } else {
        grouped["no_stage"].push(lead);
      }
    });
    
    return grouped;
  }, [leads, stages]);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId),
    [leads, activeId]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a stage (column)
    const targetStage = stages.find((s) => s.id === overId);
    if (targetStage) {
      moveLeadToStage(leadId, targetStage.id);
      return;
    }

    // Check if dropped over another lead (find its stage)
    const targetLead = leads.find((l) => l.id === overId);
    if (targetLead && targetLead.stage_id) {
      moveLeadToStage(leadId, targetLead.stage_id);
    }
  };

  const moveLeadToStage = useCallback((leadId: string, stageId: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, stage_id: stageId, updated_at: new Date().toISOString() }
          : lead
      )
    );
    toast.success("Lead movido!");
  }, []);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const handleUpdateLead = useCallback((data: { id: string } & Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === data.id
          ? { ...lead, ...data, updated_at: new Date().toISOString() }
          : lead
      )
    );
    toast.success("Lead atualizado!");
    setShowDetailsModal(false);
    setSelectedLead(null);
  }, []);

  const handleDeleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    toast.success("Lead removido!");
    setShowDetailsModal(false);
    setSelectedLead(null);
  }, []);

  const handleAddLead = useCallback((data: { nome: string; email?: string; telefone?: string; stage_id?: string; observacoes?: string; origem?: string }) => {
    const newLead = createLead({
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      stage_id: data.stage_id || stages[0]?.id || null,
      observacoes: data.observacoes || null,
      origem: data.origem || "manual",
    });
    setLeads((prev) => [newLead, ...prev]);
    toast.success("Lead criado!");
    setShowAddModal(false);
  }, [stages]);

  // Stage management
  const handleUpdateStage = useCallback((id: string, updates: Partial<PipelineStage>) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, ...updates } : stage))
    );
  }, []);

  const handleAddStage = useCallback((name: string, color: string) => {
    const maxPosition = Math.max(...stages.map((s) => s.position), 0);
    const newStage: PipelineStage = {
      id: `stage_${Date.now()}`,
      equipe_id: "demo",
      name,
      position: maxPosition + 1,
      color,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    setStages((prev) => [...prev, newStage]);
    toast.success("Etapa criada!");
  }, [stages]);

  const handleDeleteStage = useCallback((id: string) => {
    // Move leads from deleted stage to no_stage
    setLeads((prev) =>
      prev.map((lead) => (lead.stage_id === id ? { ...lead, stage_id: null } : lead))
    );
    setStages((prev) => prev.filter((stage) => stage.id !== id));
    toast.success("Etapa removida!");
  }, []);

  const handleReorderStages = useCallback((orderedIds: string[]) => {
    setStages((prev) => {
      const stageMap = new Map(prev.map((s) => [s.id, s]));
      return orderedIds
        .map((id, index) => {
          const stage = stageMap.get(id);
          return stage ? { ...stage, position: index + 1 } : null;
        })
        .filter(Boolean) as PipelineStage[];
    });
  }, []);

  // Webhook URL for integration
  const webhookUrl = `${window.location.origin}/api/webhook/leads`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Pipeline <span className="text-primary">Comercial</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {leads.length} leads • {stages.length} etapas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStageManager(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Etapas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Dados atualizados!")}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 bg-muted/30">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-h-[500px]">
            <SortableContext
              items={stages.map((s) => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              {stages
                .sort((a, b) => a.position - b.position)
                .map((stage) => (
                  <KanbanColumn
                    key={stage.id}
                    stage={stage}
                    leads={leadsByStage[stage.id] || []}
                    onLeadClick={handleLeadClick}
                  />
                ))}
            </SortableContext>

            {/* No Stage Column */}
            {leadsByStage["no_stage"]?.length > 0 && (
              <KanbanColumn
                stage={{
                  id: "no_stage",
                  equipe_id: "demo",
                  name: "Sem Etapa",
                  position: 999,
                  color: "#6b7280",
                  is_default: false,
                  created_at: new Date().toISOString(),
                }}
                leads={leadsByStage["no_stage"]}
                onLeadClick={handleLeadClick}
              />
            )}
          </div>

          <DragOverlay>
            {activeLead && (
              <div className="opacity-90 rotate-2 scale-105">
                <LeadCard lead={activeLead} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <LeadDetailsModal
        lead={selectedLead}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLead(null);
        }}
        onSave={handleUpdateLead}
        onDelete={handleDeleteLead}
      />

      <AddLeadModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddLead}
      />

      <StageManagerModal
        open={showStageManager}
        stages={stages}
        webhookUrl={webhookUrl}
        onClose={() => setShowStageManager(false)}
        onUpdateStage={handleUpdateStage}
        onAddStage={handleAddStage}
        onDeleteStage={handleDeleteStage}
        onReorderStages={handleReorderStages}
      />
    </div>
  );
};
