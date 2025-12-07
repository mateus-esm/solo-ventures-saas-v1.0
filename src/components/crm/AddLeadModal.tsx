import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, DollarSign, User } from "lucide-react";
import { PipelineStage } from "./KanbanBoard";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    nome: string;
    email?: string;
    telefone?: string;
    stage_id?: string;
    observacoes?: string;
    origem?: string;
  }) => void;
}

// Default stages for the demo
const defaultStages: PipelineStage[] = [
  { id: "stage_1", equipe_id: "demo", name: "Novo Lead", position: 1, color: "#6366f1", is_default: true, created_at: "" },
  { id: "stage_2", equipe_id: "demo", name: "Qualificação", position: 2, color: "#f59e0b", is_default: false, created_at: "" },
  { id: "stage_3", equipe_id: "demo", name: "Proposta Enviada", position: 3, color: "#8b5cf6", is_default: false, created_at: "" },
  { id: "stage_4", equipe_id: "demo", name: "Negociação", position: 4, color: "#06b6d4", is_default: false, created_at: "" },
  { id: "stage_5", equipe_id: "demo", name: "Fechado Ganho", position: 5, color: "#22c55e", is_default: false, created_at: "" },
  { id: "stage_6", equipe_id: "demo", name: "Fechado Perdido", position: 6, color: "#ef4444", is_default: false, created_at: "" },
];

export const AddLeadModal = ({ open, onClose, onAdd }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    stage_id: defaultStages[0]?.id || "",
    valor: "",
    observacoes: "",
    origem: "manual",
  });

  const handleSubmit = () => {
    if (!formData.nome.trim()) return;

    onAdd({
      nome: formData.nome,
      email: formData.email || undefined,
      telefone: formData.telefone || undefined,
      stage_id: formData.stage_id || undefined,
      observacoes: formData.observacoes || undefined,
      origem: formData.origem,
    });

    // Reset form
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      stage_id: defaultStages[0]?.id || "",
      valor: "",
      observacoes: "",
      origem: "manual",
    });
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const number = parseInt(numericValue, 10) / 100;
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="add-nome">Nome *</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="add-nome"
                className="pl-9"
                value={formData.nome}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nome: e.target.value }))
                }
                placeholder="Nome do lead"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="add-telefone">Telefone</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="add-telefone"
                  className="pl-9"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="add-email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="add-email"
                  type="email"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="add-stage">Etapa</Label>
              <Select
                value={formData.stage_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, stage_id: value }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultStages.map((stage) => (
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
              <Label htmlFor="add-valor">Valor</Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="add-valor"
                  className="pl-9"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      valor: formatCurrency(e.target.value),
                    }))
                  }
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="add-origem">Fonte</Label>
            <Select
              value={formData.origem}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, origem: value }))
              }
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
                <SelectItem value="agente_sdr">Agente SDR</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="add-observacoes">Observações</Label>
            <Textarea
              id="add-observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
              }
              rows={3}
              className="mt-1.5 resize-none"
              placeholder="Notas sobre este lead..."
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.nome.trim()}
          >
            Adicionar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
