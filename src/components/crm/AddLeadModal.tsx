import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateLeadData } from "@/hooks/useLeads";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: CreateLeadData) => void;
}

export const AddLeadModal = ({ open, onClose, onAdd }: AddLeadModalProps) => {
  const { stages } = usePipelineStages();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    stage_id: "",
    observacoes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    onAdd({
      nome: formData.nome.trim(),
      email: formData.email.trim() || undefined,
      telefone: formData.telefone.trim() || undefined,
      stage_id: formData.stage_id || undefined,
      observacoes: formData.observacoes.trim() || undefined,
      origem: "manual",
    });

    // Reset form
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      stage_id: "",
      observacoes: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-nome">Nome *</Label>
            <Input
              id="add-nome"
              value={formData.nome}
              onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
              placeholder="Nome do lead"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-telefone">Telefone</Label>
            <Input
              id="add-telefone"
              value={formData.telefone}
              onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-stage">Etapa</Label>
            <Select
              value={formData.stage_id}
              onValueChange={(v) => setFormData((p) => ({ ...p, stage_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma etapa..." />
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
            <Label htmlFor="add-observacoes">Observações</Label>
            <Textarea
              id="add-observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData((p) => ({ ...p, observacoes: e.target.value }))}
              placeholder="Notas iniciais sobre o lead..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
