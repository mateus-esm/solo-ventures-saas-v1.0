import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, X, Plus, Phone, Mail, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lead, PipelineStage } from "./KanbanBoard";

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { id: string } & Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

export const LeadDetailsModal = ({
  lead,
  open,
  onClose,
  onSave,
  onDelete,
}: LeadDetailsModalProps) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [newTag, setNewTag] = useState("");

  // Get stages from parent (we'll pass them through context or props in a real app)
  const stages: PipelineStage[] = [
    { id: "stage_1", equipe_id: "demo", name: "Novo Lead", position: 1, color: "#6366f1", is_default: true, created_at: "" },
    { id: "stage_2", equipe_id: "demo", name: "Qualificação", position: 2, color: "#f59e0b", is_default: false, created_at: "" },
    { id: "stage_3", equipe_id: "demo", name: "Proposta Enviada", position: 3, color: "#8b5cf6", is_default: false, created_at: "" },
    { id: "stage_4", equipe_id: "demo", name: "Negociação", position: 4, color: "#06b6d4", is_default: false, created_at: "" },
    { id: "stage_5", equipe_id: "demo", name: "Fechado Ganho", position: 5, color: "#22c55e", is_default: false, created_at: "" },
    { id: "stage_6", equipe_id: "demo", name: "Fechado Perdido", position: 6, color: "#ef4444", is_default: false, created_at: "" },
  ];

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead]);

  if (!lead) return null;

  const handleSave = () => {
    onSave({ ...formData, id: lead.id } as { id: string } & Partial<Lead>);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const number = parseInt(numericValue, 10) / 100;
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/\D/g, "");
    return parseInt(numericValue, 10) / 100;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes do Lead
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="stage">Etapa</Label>
                <Select
                  value={formData.stage_id || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, stage_id: value }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor">Valor da Oportunidade</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="valor"
                    className="pl-9"
                    value={
                      formData.valor
                        ? formatCurrency(String(formData.valor * 100))
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valor: parseCurrency(e.target.value),
                      }))
                    }
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    className="pl-9"
                    value={formData.telefone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, telefone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.tags || []).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Nova tag..."
                    className="h-7 w-24 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddTag}
                    className="h-7 px-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Checkboxes */}
            <div>
              <Label>Status</Label>
              <div className="flex flex-wrap gap-6 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reuniao_agendada"
                    checked={formData.reuniao_agendada || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        reuniao_agendada: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="reuniao_agendada" className="font-normal cursor-pointer">
                    Reunião Agendada
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reuniao_realizada"
                    checked={formData.reuniao_realizada || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        reuniao_realizada: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="reuniao_realizada" className="font-normal cursor-pointer">
                    Reunião Realizada
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no_show"
                    checked={formData.no_show || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        no_show: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="no_show" className="font-normal cursor-pointer">
                    No Show
                  </Label>
                </div>
              </div>
            </div>

            {/* Next Contact */}
            <div>
              <Label>Próximo Contato</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1.5 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.proximo_contato
                      ? format(new Date(formData.proximo_contato), "PPP", {
                          locale: ptBR,
                        })
                      : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.proximo_contato
                        ? new Date(formData.proximo_contato)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        proximo_contato: date?.toISOString() || null,
                      }))
                    }
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Observations */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                rows={4}
                className="mt-1.5 resize-none"
                placeholder="Adicione anotações sobre este lead..."
              />
            </div>

            {/* Meta Info */}
            <div className="text-xs text-muted-foreground pt-4 border-t border-border">
              <p>
                Criado em:{" "}
                {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
              <p>
                Última atualização:{" "}
                {format(new Date(lead.updated_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
              <p>Origem: {lead.origem}</p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(lead.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
