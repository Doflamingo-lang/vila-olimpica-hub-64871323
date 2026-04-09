import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AddRecordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { nome: string; bloco: number; edificio: number; apartamento: number; contacto: string; via: string }) => Promise<void>;
}

const AddRecordSheet = ({ open, onOpenChange, onAdd }: AddRecordSheetProps) => {
  const [form, setForm] = useState({
    nome: "", bloco: "1", edificio: "1", apartamento: "1", contacto: "", via: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setIsSubmitting(true);
    await onAdd({
      nome: form.nome,
      bloco: parseInt(form.bloco) || 1,
      edificio: parseInt(form.edificio) || 1,
      apartamento: parseInt(form.apartamento) || 1,
      contacto: form.contacto,
      via: form.via,
    });
    setForm({ nome: "", bloco: "1", edificio: "1", apartamento: "1", contacto: "", via: "" });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova Unidade</SheetTitle>
          <SheetDescription>Adicione uma unidade ao sistema de taxas</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="col-span-2">
            <Label>Nome do Morador *</Label>
            <Input autoFocus required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bloco</Label>
              <Input type="number" min="1" value={form.bloco} onChange={(e) => setForm({ ...form, bloco: e.target.value })} />
            </div>
            <div>
              <Label>Edifício</Label>
              <Input type="number" min="1" value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Apartamento</Label>
            <Input type="number" min="1" value={form.apartamento} onChange={(e) => setForm({ ...form, apartamento: e.target.value })} />
          </div>
          <div>
            <Label>Contacto</Label>
            <Input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="+258..." />
          </div>
          <div>
            <Label>Via</Label>
            <Input value={form.via} onChange={(e) => setForm({ ...form, via: e.target.value })} placeholder="CMVO, FFH, etc." />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !form.nome.trim()}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Adicionar Unidade
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddRecordSheet;
