import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Receipt, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentStatus, MESES_SHORT, formatCurrency, calcStatus } from "./types";
import { cn } from "@/lib/utils";

export interface PaymentTaxa {
  id: string;
  unidade_id: string;
  mes_referencia: number;
  ano_referencia: number;
  valor: number;
  valor_pago: number;
  status: PaymentStatus;
}

const STATUS_MAP: Record<PaymentStatus, string> = {
  em_dia: "paid",
  pendente: "pending",
  em_atraso: "overdue",
  arquivado: "pending",
};

export const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "emola", label: "e-Mola" },
  { value: "bim", label: "Transferência BIM" },
  { value: "bci", label: "Transferência BCI" },
  { value: "standard_bank", label: "Transferência Standard Bank" },
  { value: "absa", label: "Transferência ABSA" },
  { value: "millennium", label: "Transferência Millennium" },
  { value: "fnb", label: "Transferência FNB" },
  { value: "moza", label: "Transferência Moza" },
  { value: "letshego", label: "Transferência Letshego" },
  { value: "deposito", label: "Depósito Bancário" },
  { value: "numerario", label: "Numerário (Dinheiro)" },
  { value: "outro", label: "Outro" },
];

interface FeesPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxa: PaymentTaxa | null;
  /** Nome do inquilino para exibição */
  inquilinoNome?: string;
  /** Identificador adicional (ex: "Bloco X / Apt Y") */
  inquilinoSubtitulo?: string;
  /** Todas as taxas do inquilino — usadas para mostrar o histórico */
  taxasInquilino: PaymentTaxa[];
  /** Tabela do Supabase a actualizar: "condominium_fees" ou "fpd_fees" */
  table: "condominium_fees" | "fpd_fees";
  /** Callback após sucesso, recebe patch para optimistic update */
  onSuccess: (taxaId: string, patch: Partial<PaymentTaxa> & { data_pagamento?: string | null; payment_method?: string }) => void;
}

const STATUS_ICON: Record<PaymentStatus, JSX.Element> = {
  em_dia: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  pendente: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  em_atraso: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
  arquivado: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  em_dia: "Em Dia",
  pendente: "Pendente",
  em_atraso: "Em Atraso",
  arquivado: "Arquivado",
};

const FeesPaymentDialog = ({
  open,
  onOpenChange,
  taxa,
  inquilinoNome,
  inquilinoSubtitulo,
  taxasInquilino,
  table,
  onSuccess,
}: FeesPaymentDialogProps) => {
  const [paymentValue, setPaymentValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens with a new taxa
  useMemo(() => {
    if (taxa && open) {
      const divida = Math.max(0, taxa.valor - taxa.valor_pago);
      setPaymentValue(String(divida));
      setPaymentMethod("");
    }
  }, [taxa?.id, open]);

  const historico = useMemo(() => {
    return [...taxasInquilino].sort((a, b) => {
      if (a.ano_referencia !== b.ano_referencia) return a.ano_referencia - b.ano_referencia;
      return a.mes_referencia - b.mes_referencia;
    });
  }, [taxasInquilino]);

  const totais = useMemo(() => {
    const totalDevido = taxasInquilino.reduce((s, t) => s + t.valor, 0);
    const totalPago = taxasInquilino.reduce((s, t) => s + t.valor_pago, 0);
    const totalDivida = taxasInquilino.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0);
    return { totalDevido, totalPago, totalDivida };
  }, [taxasInquilino]);

  const handlePayment = async () => {
    if (!taxa || !paymentValue) return;
    if (!paymentMethod) {
      toast({
        title: "Via de pagamento obrigatória",
        description: "Selecione a via que o inquilino usou para pagar.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    const novoValorPago = taxa.valor_pago + parseFloat(paymentValue);
    const novoStatus = calcStatus(taxa.valor, novoValorPago);
    const paidAt = novoStatus === "em_dia" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from(table)
      .update({
        valor_pago: novoValorPago,
        status: STATUS_MAP[novoStatus],
        paid_at: paidAt,
        payment_method: paymentMethod,
      })
      .eq("id", taxa.id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível registar o pagamento.", variant: "destructive" });
    } else {
      onSuccess(taxa.id, {
        valor_pago: novoValorPago,
        status: novoStatus,
        data_pagamento: paidAt,
        payment_method: paymentMethod,
      });
      toast({ title: "Pagamento registado", description: "O pagamento foi registado com sucesso." });
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  if (!taxa) return null;
  const dividaActual = Math.max(0, taxa.valor - taxa.valor_pago);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Registar Pagamento
          </DialogTitle>
          <DialogDescription>
            {inquilinoNome && <span className="font-medium text-foreground">{inquilinoNome}</span>}
            {inquilinoSubtitulo && <span className="text-muted-foreground"> · {inquilinoSubtitulo}</span>}
            <span className="block text-xs mt-0.5">
              Referência: {MESES_SHORT[taxa.mes_referencia]}/{taxa.ano_referencia}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Formulário de pagamento */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor da taxa:</span>
                <span className="font-medium tabular-nums">{formatCurrency(taxa.valor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Já pago:</span>
                <span className="font-medium tabular-nums text-emerald-600">{formatCurrency(taxa.valor_pago)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Dívida actual:</span>
                <span className="font-bold tabular-nums text-red-600">{formatCurrency(dividaActual)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="payment-method">
                Via de pagamento <span className="text-red-600">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method" className="mt-1">
                  <SelectValue placeholder="Selecione a via..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-value">Valor do pagamento (MT)</Label>
              <Input
                id="payment-value"
                type="number"
                step="0.01"
                value={paymentValue}
                onChange={(e) => setPaymentValue(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              className="w-full"
              onClick={handlePayment}
              disabled={isSubmitting || !paymentValue || !paymentMethod}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Pagamento
            </Button>
          </div>

          {/* Coluna 2: Histórico do inquilino */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-2">Resumo do Inquilino</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Devido</p>
                  <p className="text-xs font-bold tabular-nums mt-1">{formatCurrency(totais.totalDevido)}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
                  <p className="text-[10px] uppercase text-emerald-700">Pago</p>
                  <p className="text-xs font-bold tabular-nums mt-1 text-emerald-700">{formatCurrency(totais.totalPago)}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-2">
                  <p className="text-[10px] uppercase text-red-700">Dívida</p>
                  <p className="text-xs font-bold tabular-nums mt-1 text-red-700">{formatCurrency(totais.totalDivida)}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Histórico Completo</h4>
              <div className="border rounded-lg max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                    <tr>
                      <th className="text-left px-2 py-1.5 font-medium">Período</th>
                      <th className="text-right px-2 py-1.5 font-medium">Pago</th>
                      <th className="text-right px-2 py-1.5 font-medium">Dívida</th>
                      <th className="text-center px-2 py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted-foreground">
                          Sem histórico
                        </td>
                      </tr>
                    )}
                    {historico.map((t) => {
                      const d = Math.max(0, t.valor - t.valor_pago);
                      const isCurrent = t.id === taxa.id;
                      return (
                        <tr
                          key={t.id}
                          className={cn(
                            "border-t hover:bg-accent/40",
                            isCurrent && "bg-primary/5 font-medium"
                          )}
                        >
                          <td className="px-2 py-1.5">
                            {MESES_SHORT[t.mes_referencia]}/{String(t.ano_referencia).slice(-2)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-emerald-600">
                            {formatCurrency(t.valor_pago)}
                          </td>
                          <td
                            className={cn(
                              "px-2 py-1.5 text-right tabular-nums",
                              d > 0 ? "text-red-600 font-medium" : "text-muted-foreground"
                            )}
                          >
                            {d > 0 ? formatCurrency(d) : "—"}
                          </td>
                          <td className="px-2 py-1.5">
                            <span className="inline-flex items-center gap-1 justify-center" title={STATUS_LABEL[t.status]}>
                              {STATUS_ICON[t.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeesPaymentDialog;
