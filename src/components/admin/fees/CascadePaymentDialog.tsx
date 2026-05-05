import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Receipt, Download, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MESES_LABELS, formatCurrency, calcStatus, PaymentStatus } from "./types";
import { PAYMENT_METHODS } from "./PaymentDialog";
import { generateReceiptPdf, sendReceiptToResident, downloadBlob } from "@/lib/paymentReceipt";

export interface CascadeTaxa {
  id: string;
  unidade_id: string;
  mes_referencia: number;
  ano_referencia: number;
  valor: number;
  valor_pago: number;
  status: PaymentStatus;
}

interface CascadePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sistema (FFH ou FDP) */
  system: "FFH" | "FDP";
  /** Tabela alvo */
  table: "condominium_fees" | "fpd_fees";
  /** Tabela de unidades */
  unidadesTable: "unidades" | "fpd_unidades";
  /** Unidade do morador */
  unidade: {
    id: string;
    nome: string;
    contacto?: string;
    /** ID legível (ex.: "1-2-3" ou "Apt 12") */
    idLegivel: string;
    /** user_id do morador (para enviar mensagem). Pode ser null se não estiver associado. */
    user_id?: string | null;
    divida_anterior: number;
    pagamentos_historicos: number;
  };
  /** Todas as taxas do morador */
  taxasInquilino: CascadeTaxa[];
  /** ID do admin actual (para mensagens) */
  adminUserId?: string | null;
  /** Callback após sucesso */
  onSuccess: () => void;
}

const STATUS_MAP: Record<PaymentStatus, string> = {
  em_dia: "paid",
  pendente: "pending",
  em_atraso: "overdue",
  arquivado: "pending",
};

const CascadePaymentDialog = ({
  open,
  onOpenChange,
  system,
  table,
  unidadesTable,
  unidade,
  taxasInquilino,
  adminUserId,
  onSuccess,
}: CascadePaymentDialogProps) => {
  const { toast } = useToast();
  const [valor, setValor] = useState("");
  const [via, setVia] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dívida acumulada histórica
  const dividaAcumulada = useMemo(
    () => Math.max(0, (unidade.divida_anterior ?? 0) - (unidade.pagamentos_historicos ?? 0)),
    [unidade]
  );

  // Taxas vencidas (até mês corrente) ordenadas mais antiga → mais recente
  const taxasVencidas = useMemo(() => {
    const hoje = new Date();
    const anoH = hoje.getFullYear();
    const mesH = hoje.getMonth() + 1;
    return [...taxasInquilino]
      .filter((t) => t.ano_referencia < anoH || (t.ano_referencia === anoH && t.mes_referencia <= mesH))
      .filter((t) => t.valor - t.valor_pago > 0)
      .sort((a, b) =>
        a.ano_referencia !== b.ano_referencia
          ? a.ano_referencia - b.ano_referencia
          : a.mes_referencia - b.mes_referencia
      );
  }, [taxasInquilino]);

  const dividaMes = useMemo(
    () => taxasVencidas.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
    [taxasVencidas]
  );
  const dividaTotal = dividaAcumulada + dividaMes;

  useEffect(() => {
    if (open) {
      setValor(String(dividaTotal.toFixed(2)));
      setVia("");
    }
  }, [open, dividaTotal]);

  const handleConfirm = async () => {
    const valorNumber = parseFloat(valor);
    if (!valorNumber || valorNumber <= 0) {
      toast({ title: "Valor inválido", description: "Insira um valor maior que zero.", variant: "destructive" });
      return;
    }
    if (!via) {
      toast({ title: "Via obrigatória", description: "Selecione a via de pagamento.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let restante = valorNumber;
      const allocations: Array<{ period: string; amount: number }> = [];

      // 1. Abater dívida histórica primeiro
      let novosPagHist = unidade.pagamentos_historicos ?? 0;
      if (dividaAcumulada > 0 && restante > 0) {
        const aplicar = Math.min(restante, dividaAcumulada);
        novosPagHist += aplicar;
        restante -= aplicar;
        allocations.push({ period: "Dívida histórica acumulada", amount: aplicar });
      }

      // 2. Distribuir entre taxas vencidas (mais antiga primeiro)
      const updates: Array<{ id: string; valor_pago: number; status: string; paid_at: string | null }> = [];
      for (const t of taxasVencidas) {
        if (restante <= 0) break;
        const dividaT = t.valor - t.valor_pago;
        if (dividaT <= 0) continue;
        const aplicar = Math.min(restante, dividaT);
        const novoValorPago = t.valor_pago + aplicar;
        const novoStatus = calcStatus(t.valor, novoValorPago);
        updates.push({
          id: t.id,
          valor_pago: novoValorPago,
          status: STATUS_MAP[novoStatus],
          paid_at: novoStatus === "em_dia" ? new Date().toISOString() : null,
        });
        allocations.push({
          period: `${MESES_LABELS[t.mes_referencia]}/${t.ano_referencia}`,
          amount: aplicar,
        });
        restante -= aplicar;
      }

      // 3. Aplicar updates
      if (updates.length > 0) {
        for (const u of updates) {
          const { error } = await supabase
            .from(table)
            .update({
              valor_pago: u.valor_pago,
              status: u.status,
              paid_at: u.paid_at,
              payment_method: via,
            })
            .eq("id", u.id);
          if (error) throw error;
        }
      }

      // 4. Atualizar pagamentos_historicos da unidade (se houve abate)
      if (novosPagHist !== (unidade.pagamentos_historicos ?? 0)) {
        const { error } = await (supabase.from(unidadesTable) as any)
          .update({ pagamentos_historicos: novosPagHist })
          .eq("id", unidade.id);
        if (error) throw error;
      }

      // 5. Saldo remanescente (crédito)
      const saldoRemanescente = restante;
      if (saldoRemanescente > 0) {
        allocations.push({ period: "Crédito (próximo mês)", amount: saldoRemanescente });
      }

      // 6. Gerar PDF
      const receiptNumber = `REC-${system}-${Date.now().toString().slice(-8)}`;
      const fileName = `${receiptNumber}.pdf`;
      const pdf = await generateReceiptPdf({
        receiptNumber,
        system,
        residentName: unidade.nome,
        residentId: unidade.idLegivel,
        contacto: unidade.contacto,
        allocations,
        totalPago: valorNumber,
        paymentMethod: PAYMENT_METHODS.find((m) => m.value === via)?.label || via,
        paymentDate: new Date(),
        saldoRemanescente,
      });

      // 7. Download para o admin
      downloadBlob(pdf, fileName);

      // 8. Enviar para o morador via mensagens (se possível)
      if (adminUserId && unidade.user_id) {
        const send = await sendReceiptToResident({
          pdf,
          fileName,
          adminUserId,
          residentUserId: unidade.user_id,
          message: `Recibo de pagamento ${system} no valor de ${formatCurrency(valorNumber)} (${PAYMENT_METHODS.find((m) => m.value === via)?.label || via}).`,
        });
        if (!send.ok) {
          toast({
            title: "Pagamento registado",
            description: `Recibo gerado, mas não foi possível enviar a mensagem: ${send.error}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Pagamento registado",
            description: "Recibo PDF descarregado e enviado ao morador.",
          });
        }
      } else {
        toast({
          title: "Pagamento registado",
          description: unidade.user_id
            ? "Recibo gerado. (Admin não autenticado para envio.)"
            : "Recibo gerado. Morador ainda não associado a uma conta — mensagem não enviada.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro", description: e.message || "Falha ao registar pagamento.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Registar Pagamento — {system}
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{unidade.nome}</span>
            <span className="text-muted-foreground"> · {unidade.idLegivel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dívida acumulada (histórica):</span>
              <span className="font-medium tabular-nums">{formatCurrency(dividaAcumulada)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dívida do mês (sistema):</span>
              <span className="font-medium tabular-nums">{formatCurrency(dividaMes)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t">
              <span className="font-semibold">Total em dívida:</span>
              <span className="font-bold tabular-nums text-destructive">{formatCurrency(dividaTotal)}</span>
            </div>
          </div>

          <div>
            <Label>Via de pagamento *</Label>
            <Select value={via} onValueChange={setVia}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valor a pagar (MT)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-1"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              O valor será aplicado primeiro à dívida histórica, depois aos meses mais antigos. Saldo restante fica como crédito.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded p-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Após confirmar, o recibo PDF será descarregado e enviado ao morador via mensagens.</span>
          </div>

          <Button className="w-full" onClick={handleConfirm} disabled={submitting || !via || !valor}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Download className="w-4 h-4 mr-2" />
            Confirmar Pagamento e Gerar Recibo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CascadePaymentDialog;
