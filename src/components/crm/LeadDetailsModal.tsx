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
import { Lead, PipelineStage } from "@/types/crm";

interface LeadDetailsModalProps {
  lead: Lead | null;
  stages: PipelineStage[];
  open: boolean;
  onClose: () => void;
  onSave: (data: { id: string } & Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

export const LeadDetailsModal = ({
  lead,
  stages,
  open,
  onClose,
  onSave,
  onDelete,
}: LeadDetailsModalProps) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [newTag, setNewTag] = useState("");

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
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
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
                <Label htmlFor="opportunity_value">Valor da Oportunidade</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="opportunity_value"
                    className="pl-9"
                    value={
                      formData.opportunity_value
                        ? formatCurrency(String(formData.opportunity_value * 100))
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        opportunity_value: parseCurrency(e.target.value),
                      }))
                    }
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
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
                    id="meeting_scheduled"
                    checked={formData.meeting_scheduled || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        meeting_scheduled: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="meeting_scheduled" className="font-normal cursor-pointer">
                    Reunião Agendada
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="meeting_done"
                    checked={formData.meeting_done || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        meeting_done: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="meeting_done" className="font-normal cursor-pointer">
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
                    {formData.next_contact
                      ? format(new Date(formData.next_contact), "PPP", {
                          locale: ptBR,
                        })
                      : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.next_contact
                        ? new Date(formData.next_contact)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        next_contact: date?.toISOString() || null,
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
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, observations: e.target.value }))
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
              <p>Origem: {lead.origem || "manual"}</p>
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
