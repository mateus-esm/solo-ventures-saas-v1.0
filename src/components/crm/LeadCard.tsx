import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/hooks/useLeads";
import { Phone, Mail, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

export const LeadCard = ({ lead, onClick }: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`p-3 cursor-pointer hover:shadow-md transition-shadow bg-card border-border ${
        isDragging ? "opacity-50 shadow-lg ring-2 ring-primary" : ""
      }`}
    >
      <div className="space-y-2">
        {/* Nome */}
        <div className="font-medium text-foreground truncate">{lead.nome}</div>

        {/* Contact Info */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {lead.telefone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              <span className="truncate">{lead.telefone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-1">
          {lead.reuniao_agendada && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              Agendada
            </Badge>
          )}
          {lead.reuniao_realizada && (
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Realizada
            </Badge>
          )}
          {lead.no_show && (
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
              No Show
            </Badge>
          )}
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{lead.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Next Contact */}
        {lead.proximo_contato && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t border-border">
            <Clock className="h-3 w-3" />
            <span>
              Próximo: {format(new Date(lead.proximo_contato), "dd/MM", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Origin Badge */}
        {lead.atendido_por_agente && (
          <div className="pt-1">
            <Badge variant="outline" className="text-xs bg-accent/10">
              🤖 Via Agente
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
