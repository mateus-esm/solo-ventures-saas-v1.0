import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead, UpdateLeadData } from "@/hooks/useLeads";
import { useLeadActivities, CreateActivityData } from "@/hooks/useLeadActivities";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Plus, Phone, Mail, Calendar, MessageSquare, Clock } from "lucide-react";

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateLeadData) => void;
  onDelete?: (id: string) => void;
}

export const LeadDetailsModal = ({
  lead,
  open,
  onClose,
  onSave,
  onDelete,
}: LeadDetailsModalProps) => {
  const { stages } = usePipelineStages();
  const { activities, createActivity } = useLeadActivities(lead?.id);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    stage_id: "",
    tags: [] as string[],
    observacoes: "",
    proximo_contato: "",
    reuniao_agendada: false,
    reuniao_realizada: false,
    no_show: false,
  });
  const [newTag, setNewTag] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (lead) {
      setFormData({
        nome: lead.nome || "",
        email: lead.email || "",
        telefone: lead.telefone || "",
        stage_id: lead.stage_id || "",
        tags: lead.tags || [],
        observacoes: lead.observacoes || "",
        proximo_contato: lead.proximo_contato ? lead.proximo_contato.split("T")[0] : "",
        reuniao_agendada: lead.reuniao_agendada || false,
        reuniao_realizada: lead.reuniao_realizada || false,
        no_show: lead.no_show || false,
      });
    }
  }, [lead]);

  const handleSave = () => {
    if (!lead) return;
    onSave({
      id: lead.id,
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      stage_id: formData.stage_id || null,
      tags: formData.tags,
      observacoes: formData.observacoes || null,
      proximo_contato: formData.proximo_contato || null,
      reuniao_agendada: formData.reuniao_agendada,
      reuniao_realizada: formData.reuniao_realizada,
      no_show: formData.no_show,
    });
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleAddNote = () => {
    if (newNote.trim() && lead) {
      createActivity.mutate({
        lead_id: lead.id,
        tipo: "nota",
        descricao: newNote.trim(),
      });
      setNewNote("");
    }
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case "ligacao": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "reuniao": return <Calendar className="h-4 w-4" />;
      case "nota": return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Detalhes do Lead</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Etapa</Label>
                <Select
                  value={formData.stage_id}
                  onValueChange={(v) => setFormData((p) => ({ ...p, stage_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Status Checkboxes */}
            <div className="space-y-3">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reuniao_agendada"
                    checked={formData.reuniao_agendada}
                    onCheckedChange={(c) =>
                      setFormData((p) => ({ ...p, reuniao_agendada: !!c }))
                    }
                  />
                  <Label htmlFor="reuniao_agendada" className="font-normal cursor-pointer">
                    Reunião Agendada
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reuniao_realizada"
                    checked={formData.reuniao_realizada}
                    onCheckedChange={(c) =>
                      setFormData((p) => ({ ...p, reuniao_realizada: !!c }))
                    }
                  />
                  <Label htmlFor="reuniao_realizada" className="font-normal cursor-pointer">
                    Reunião Realizada
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="no_show"
                    checked={formData.no_show}
                    onCheckedChange={(c) =>
                      setFormData((p) => ({ ...p, no_show: !!c }))
                    }
                  />
                  <Label htmlFor="no_show" className="font-normal cursor-pointer">
                    No Show
                  </Label>
                </div>
              </div>
            </div>

            {/* Next Contact */}
            <div className="space-y-2">
              <Label htmlFor="proximo_contato">Próximo Contato</Label>
              <Input
                id="proximo_contato"
                type="date"
                value={formData.proximo_contato}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, proximo_contato: e.target.value }))
                }
              />
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, observacoes: e.target.value }))
                }
                rows={3}
              />
            </div>

            <Separator />

            {/* Activity Timeline */}
            <div className="space-y-3">
              <Label>Histórico de Atividades</Label>
              
              {/* Add Note */}
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNote())}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNote}
                  disabled={createActivity.isPending}
                >
                  Adicionar
                </Button>
              </div>

              {/* Activities List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg text-sm"
                  >
                    <div className="text-muted-foreground mt-0.5">
                      {getActivityIcon(activity.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground">{activity.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade registrada
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex justify-between">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(lead.id);
                onClose();
              }}
            >
              Excluir Lead
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
