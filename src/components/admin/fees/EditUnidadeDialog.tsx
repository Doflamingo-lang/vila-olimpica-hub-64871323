import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Unidade, CategoriaUnidade, CATEGORIAS_LABELS, CATEGORIAS_LIST } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  unidade: Unidade | null;
  onSaved: () => void;
}

const EditUnidadeDialog = ({ open, onOpenChange, unidade, onSaved }: Props) => {
  const [form, setForm] = useState({ nome: "", bloco: "1", edificio: "1", apartamento: "1", contacto: "", via: "", categoria: "quitadas" as CategoriaUnidade });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (unidade) {
      setForm({
        nome: unidade.nome,
        bloco: String(unidade.bloco),
        edificio: String(unidade.edificio),
        apartamento: String(unidade.apartamento),
        contacto: unidade.contacto || "",
        via: unidade.via || "",
        categoria: unidade.categoria,
      });
    }
  }, [unidade]);

  const handleSave = async () => {
    if (!unidade) return;
    setSaving(true);
    const { error } = await supabase.from("unidades").update({
      nome: form.nome,
      bloco: parseInt(form.bloco) || 1,
      edificio: parseInt(form.edificio) || 1,
      apartamento: parseInt(form.apartamento) || 1,
      contacto: form.contacto,
      via: form.via,
      categoria: form.categoria,
    }).eq("id", unidade.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar a unidade.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Unidade actualizada." });
      onSaved();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
          <DialogDescription>Actualize os dados da unidade.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Morador</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaUnidade })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS_LIST.map(cat => (
                  <SelectItem key={cat} value={cat}>{CATEGORIAS_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Bloco</Label>
              <Input type="number" min="1" value={form.bloco} onChange={(e) => setForm({ ...form, bloco: e.target.value })} />
            </div>
            <div>
              <Label>Edifício</Label>
              <Input type="number" min="1" value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} />
            </div>
            <div>
              <Label>Apartamento</Label>
              <Input type="number" min="1" value={form.apartamento} onChange={(e) => setForm({ ...form, apartamento: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Contacto</Label>
            <Input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="+258..." />
          </div>
          <div>
            <Label>Via</Label>
            <Input value={form.via} onChange={(e) => setForm({ ...form, via: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.nome.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUnidadeDialog;
