import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Taxa, Unidade, MESES_SHORT, formatCurrency } from "./types";
import StatusBadge from "./StatusBadge";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  unidade: Unidade | null;
  taxas: Taxa[];
}

const PaymentHistoryDialog = ({ open, onOpenChange, unidade, taxas }: Props) => {
  if (!unidade) return null;
  const histo = taxas
    .filter(t => t.unidade_id === unidade.id)
    .sort((a, b) => b.ano_referencia - a.ano_referencia || b.mes_referencia - a.mes_referencia);

  const idMorador = `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos — {unidade.nome}</DialogTitle>
          <DialogDescription>ID Morador: <span className="font-mono">{idMorador}</span></DialogDescription>
        </DialogHeader>
        <div className="overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead className="text-right">Dívida</TableHead>
                <TableHead>Data Pag.</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {histo.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Sem registos.</TableCell></TableRow>
              ) : histo.map(t => {
                const divida = Math.max(0, t.valor - t.valor_pago);
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{MESES_SHORT[t.mes_referencia]}/{t.ano_referencia}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{formatCurrency(t.valor)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-emerald-600">{formatCurrency(t.valor_pago)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-destructive">{divida > 0 ? formatCurrency(divida) : "—"}</TableCell>
                    <TableCell className="text-xs">{t.data_pagamento ? new Date(t.data_pagamento).toLocaleDateString("pt-PT") : "—"}</TableCell>
                    <TableCell className="text-xs">{t.payment_method || "—"}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryDialog;
