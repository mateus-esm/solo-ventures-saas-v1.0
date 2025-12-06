import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PipelineStage } from "@/hooks/usePipelineStages";
import { Lead } from "@/hooks/useLeads";
import { LeadCard } from "./LeadCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export const KanbanColumn = ({ stage, leads, onLeadClick }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg">
      {/* Column Header */}
      <div 
        className="p-3 border-b border-border rounded-t-lg"
        style={{ borderTopColor: stage.color, borderTopWidth: 3 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{stage.name}</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset rounded-b-lg"
        )}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
};
