import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useLeads, Lead } from "@/hooks/useLeads";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { AddLeadModal } from "./AddLeadModal";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const KanbanBoard = () => {
  const { leads, isLoading: leadsLoading, moveLeadToStage, updateLead, deleteLead, createLead, refetch } = useLeads();
  const { stages, isLoading: stagesLoading } = usePipelineStages();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
    
    // Initialize with empty arrays for each stage
    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });
    
    // Add "no stage" bucket
    grouped["no_stage"] = [];
    
    // Distribute leads
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

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback handled by KanbanColumn isOver state
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
      moveLeadToStage.mutate({ leadId, stageId: targetStage.id });
      return;
    }

    // Check if dropped over another lead (find its stage)
    const targetLead = leads.find((l) => l.id === overId);
    if (targetLead && targetLead.stage_id) {
      moveLeadToStage.mutate({ leadId, stageId: targetLead.stage_id });
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const isLoading = leadsLoading || stagesLoading;

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[280px] space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-header-bg">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Pipeline <span className="text-primary">Comercial</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {leads.length} leads • {stages.length} etapas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
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
      <div className="flex-1 overflow-x-auto p-4">
        {stages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">Nenhuma etapa configurada</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Configure as etapas do pipeline no banco de dados
                </p>
              </div>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full">
              <SortableContext
                items={stages.map((s) => s.id)}
                strategy={horizontalListSortingStrategy}
              >
                {stages.map((stage) => (
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
                    equipe_id: "",
                    name: "Sem Etapa",
                    position: 999,
                    color: "#6b7280",
                    is_default: false,
                    created_at: "",
                  }}
                  leads={leadsByStage["no_stage"]}
                  onLeadClick={handleLeadClick}
                />
              )}
            </div>

            <DragOverlay>
              {activeLead && (
                <div className="opacity-80">
                  <LeadCard lead={activeLead} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <LeadDetailsModal
        lead={selectedLead}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLead(null);
        }}
        onSave={(data) => updateLead.mutate(data)}
        onDelete={(id) => deleteLead.mutate(id)}
      />

      <AddLeadModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => createLead.mutate(data)}
      />
    </div>
  );
};
