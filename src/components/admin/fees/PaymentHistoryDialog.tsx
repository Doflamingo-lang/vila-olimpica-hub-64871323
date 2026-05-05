import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Taxa, Unidade, MESES_LABELS, MESES_SHORT, formatCurrency } from "./types";
import StatusBadge from "./StatusBadge";
import { generateReceiptPdf, sendReceiptToResident, downloadBlob } from "@/lib/paymentReceipt";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  unidade: Unidade | null;
  taxas: Taxa[];
  adminUserId?: string | null;
  residentUserId?: string | null;
  system?: "FFH" | "FDP";
}

interface MonthRow {
  taxa: Taxa;
  saldoInicial: number;
  pago: number;
  saldoFinal: number;
}

const PaymentHistoryDialog = ({
  open,
  onOpenChange,
  unidade,
  taxas,
  adminUserId,
  residentUserId,
  system = "FFH",
}: Props) => {
  const { toast } = useToast();
  const [anoFiltro, setAnoFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const dadosMorador = useMemo(() => {
    if (!unidade) return { rows: [] as MonthRow[], anos: [] as number[] };
    const todas = taxas
      .filter((t) => t.unidade_id === unidade.id)
      .sort((a, b) =>
        a.ano_referencia !== b.ano_referencia
          ? a.ano_referencia - b.ano_referencia
          : a.mes_referencia - b.mes_referencia
      );

    let saldoCorrente = Math.max(0, (unidade.divida_anterior ?? unidade.divida_inicial ?? 0) - (unidade.pagamentos_historicos ?? 0));
    const rows: MonthRow[] = todas.map((t) => {
      const saldoInicial = saldoCorrente + t.valor;
      const pago = t.valor_pago;
      const saldoFinal = Math.max(0, saldoInicial - pago);
      saldoCorrente = saldoFinal;
      return { taxa: t, saldoInicial, pago, saldoFinal };
    });

    const anos = Array.from(new Set(todas.map((t) => t.ano_referencia))).sort((a, b) => b - a);
    return { rows, anos };
  }, [unidade, taxas]);

  const filteredRows = useMemo(() => {
    return dadosMorador.rows
      .filter((r) => anoFiltro === "todos" || r.taxa.ano_referencia === Number(anoFiltro))
      .filter((r) => {
        if (statusFiltro === "todos") return true;
        if (statusFiltro === "pago") return r.taxa.valor_pago >= r.taxa.valor;
        if (statusFiltro === "pendente") return r.taxa.valor_pago < r.taxa.valor;
        return true;
      })
      .reverse();
  }, [dadosMorador.rows, anoFiltro, statusFiltro]);

  const handleResendReceipt = async (row: MonthRow) => {
    if (!unidade) return;
    if (!adminUserId || !residentUserId) {
      toast({
        title: "Não foi possível enviar",
        description: "Morador ainda não associado a uma conta de utilizador.",
        variant: "destructive",
      });
      return;
    }
    setSendingId(row.taxa.id);
    try {
      const receiptNumber = `REC-${system}-${row.taxa.id.slice(0, 8).toUpperCase()}`;
      const fileName = `${receiptNumber}.pdf`;
      const pdf = await generateReceiptPdf({
        receiptNumber,
        system,
        residentName: unidade.nome,
        residentId: `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`,
        contacto: unidade.contacto,
        allocations: [
          { period: `${MESES_LABELS[row.taxa.mes_referencia]}/${row.taxa.ano_referencia}`, amount: row.pago },
        ],
        totalPago: row.pago,
        paymentMethod: row.taxa.payment_method || "—",
        paymentDate: row.taxa.data_pagamento ? new Date(row.taxa.data_pagamento) : new Date(),
        saldoRemanescente: row.saldoFinal,
      });
      downloadBlob(pdf, fileName);
      const result = await sendReceiptToResident({
        pdf,
        fileName,
        adminUserId,
        residentUserId,
        message: `Recibo de pagamento — ${MESES_LABELS[row.taxa.mes_referencia]}/${row.taxa.ano_referencia} (${formatCurrency(row.pago)}).`,
      });
      if (result.ok) {
        toast({ title: "Recibo enviado", description: "Mensagem enviada ao morador." });
      } else {
        toast({ title: "Erro", description: result.error || "Falha no envio.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao gerar recibo.", variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  if (!unidade) return null;
  const idMorador = `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos — {unidade.nome}</DialogTitle>
          <DialogDescription>
            ID Morador: <span className="font-mono">{idMorador}</span> · Contacto: {unidade.contacto || "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={anoFiltro} onValueChange={setAnoFiltro}>
            <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Ano" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              {dadosMorador.anos.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredRows.length} registo(s)
          </span>
        </div>

        <div className="overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Via</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acção</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Sem registos.</TableCell></TableRow>
              ) : filteredRows.map((r) => (
                <TableRow key={r.taxa.id}>
                  <TableCell className="text-xs font-medium">{MESES_SHORT[r.taxa.mes_referencia]}/{r.taxa.ano_referencia}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs">{formatCurrency(r.saldoInicial)}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-emerald-600 font-medium">{formatCurrency(r.pago)}</TableCell>
                  <TableCell className={`text-right tabular-nums text-xs font-medium ${r.saldoFinal > 0 ? "text-destructive" : "text-emerald-600"}`}>
                    {formatCurrency(r.saldoFinal)}
                  </TableCell>
                  <TableCell className="text-xs">{r.taxa.data_pagamento ? new Date(r.taxa.data_pagamento).toLocaleDateString("pt-PT") : "—"}</TableCell>
                  <TableCell className="text-xs">{r.taxa.payment_method || "—"}</TableCell>
                  <TableCell><StatusBadge status={r.taxa.status} /></TableCell>
                  <TableCell className="text-right">
                    {r.pago > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={sendingId === r.taxa.id}
                        onClick={() => handleResendReceipt(r)}
                        title="Gerar e enviar recibo para o morador"
                      >
                        {sendingId === r.taxa.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                        Enviar Recibo
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryDialog;
