import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Receipt, Download, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MESES_LABELS, MESES_SHORT, formatCurrency, calcStatus, PaymentStatus } from "./types";
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
  system: "FFH" | "FDP";
  table: "condominium_fees" | "fpd_fees";
  unidadesTable: "unidades" | "fpd_unidades";
  unidade: {
    id: string;
    nome: string;
    contacto?: string;
    idLegivel: string;
    user_id?: string | null;
    divida_anterior: number;
    pagamentos_historicos: number;
  };
  taxasInquilino: CascadeTaxa[];
  adminUserId?: string | null;
  onSuccess: () => void;
}

const STATUS_MAP: Record<PaymentStatus, string> = {
  em_dia: "paid",
  pendente: "pending",
  em_atraso: "overdue",
  arquivado: "pending",
};

const TAXA_MENSAL = 1000;

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
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [mesesSelecionados, setMesesSelecionados] = useState<number[]>([]);

  const dividaAcumulada = useMemo(
    () => Math.max(0, (unidade.divida_anterior ?? 0) - (unidade.pagamentos_historicos ?? 0)),
    [unidade]
  );

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>();
    const y = new Date().getFullYear();
    for (let i = y - 5; i <= y + 1; i++) set.add(i);
    taxasInquilino.forEach((t) => set.add(t.ano_referencia));
    return Array.from(set).sort((a, b) => b - a);
  }, [taxasInquilino]);

  // Para cada mês 1..12 do ano, calcular dívida (taxa - pago)
  const mesesDoAno = useMemo(() => {
    const anoNum = Number(ano);
    return Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const taxa = taxasInquilino.find((t) => t.ano_referencia === anoNum && t.mes_referencia === mes);
      const valor = taxa?.valor ?? TAXA_MENSAL;
      const pago = taxa?.valor_pago ?? 0;
      const divida = Math.max(0, valor - pago);
      return { mes, taxa, valor, pago, divida };
    });
  }, [ano, taxasInquilino]);

  const totalSelecionado = useMemo(
    () => mesesDoAno.filter((m) => mesesSelecionados.includes(m.mes)).reduce((s, m) => s + m.divida, 0),
    [mesesDoAno, mesesSelecionados]
  );

  const totalAPagar = dividaAcumulada + totalSelecionado;

  useEffect(() => {
    if (open) {
      setVia("");
      // pré-selecciona meses em dívida do ano corrente
      const anoNum = Number(ano);
      const atrasados = taxasInquilino
        .filter((t) => t.ano_referencia === anoNum && t.valor - t.valor_pago > 0)
        .map((t) => t.mes_referencia);
      setMesesSelecionados(atrasados);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setValor(String(totalAPagar.toFixed(2)));
  }, [totalAPagar]);

  const toggleMes = (mes: number) => {
    setMesesSelecionados((prev) => (prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes].sort((a, b) => a - b)));
  };

  const selecionarTodosEmDivida = () => {
    setMesesSelecionados(mesesDoAno.filter((m) => m.divida > 0).map((m) => m.mes));
  };

  const limparSelecao = () => setMesesSelecionados([]);

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
    if (mesesSelecionados.length === 0 && dividaAcumulada <= 0) {
      toast({ title: "Selecione meses", description: "Seleccione pelo menos um mês para pagar.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let restante = valorNumber;
      const allocations: Array<{ period: string; amount: number }> = [];
      const anoNum = Number(ano);

      // 1. Abater dívida histórica primeiro
      let novosPagHist = unidade.pagamentos_historicos ?? 0;
      if (dividaAcumulada > 0 && restante > 0) {
        const aplicar = Math.min(restante, dividaAcumulada);
        novosPagHist += aplicar;
        restante -= aplicar;
        allocations.push({ period: "Dívida acumulada", amount: aplicar });
      }

      // 2. Distribuir entre meses seleccionados (mais antigo → mais recente)
      const mesesOrdenados = [...mesesSelecionados].sort((a, b) => a - b);
      const updates: Array<{ id?: string; mes: number; ano: number; valor_pago: number; valor: number; status: string; paid_at: string | null; existingTaxa?: CascadeTaxa }> = [];

      for (const mes of mesesOrdenados) {
        if (restante <= 0) break;
        const dadosMes = mesesDoAno.find((m) => m.mes === mes);
        if (!dadosMes || dadosMes.divida <= 0) continue;
        const aplicar = Math.min(restante, dadosMes.divida);
        const novoValorPago = dadosMes.pago + aplicar;
        const novoStatus = calcStatus(dadosMes.valor, novoValorPago);
        updates.push({
          id: dadosMes.taxa?.id,
          mes,
          ano: anoNum,
          valor_pago: novoValorPago,
          valor: dadosMes.valor,
          status: STATUS_MAP[novoStatus],
          paid_at: novoStatus === "em_dia" ? new Date().toISOString() : null,
          existingTaxa: dadosMes.taxa,
        });
        allocations.push({ period: `${MESES_LABELS[mes]}/${anoNum}`, amount: aplicar });
        restante -= aplicar;
      }

      // 3. Aplicar updates / inserts
      const monthNames = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      for (const u of updates) {
        if (u.existingTaxa) {
          const { error } = await supabase
            .from(table)
            .update({
              valor_pago: u.valor_pago,
              status: u.status,
              paid_at: u.paid_at,
              payment_method: via,
            })
            .eq("id", u.existingTaxa.id);
          if (error) throw error;
        } else {
          // criar novo registo de taxa
          const dueDate = new Date(u.ano, u.mes, 5).toISOString().slice(0, 10);
          const insertData: any = {
            unidade_id: unidade.id,
            reference_month: monthNames[u.mes],
            reference_year: u.ano,
            amount: u.valor,
            valor_pago: u.valor_pago,
            status: u.status,
            paid_at: u.paid_at,
            payment_method: via,
            due_date: dueDate,
          };
          if (table === "condominium_fees" && unidade.user_id) {
            insertData.user_id = unidade.user_id;
          }
          const { error } = await (supabase.from(table) as any).insert(insertData);
          if (error) throw error;
        }
      }

      // 4. Atualizar pagamentos_historicos
      if (novosPagHist !== (unidade.pagamentos_historicos ?? 0)) {
        const { error } = await (supabase.from(unidadesTable) as any)
          .update({ pagamentos_historicos: novosPagHist })
          .eq("id", unidade.id);
        if (error) throw error;
      }

      const saldoRemanescente = restante;
      if (saldoRemanescente > 0) {
        allocations.push({ period: "Crédito (próximo mês)", amount: saldoRemanescente });
      }

      // 5. Gerar PDF
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

      downloadBlob(pdf, fileName);

      if (adminUserId && unidade.user_id) {
        const send = await sendReceiptToResident({
          pdf,
          fileName,
          adminUserId,
          residentUserId: unidade.user_id,
          message: `Recibo de pagamento ${system} no valor de ${formatCurrency(valorNumber)} (${PAYMENT_METHODS.find((m) => m.value === via)?.label || via}).`,
        });
        if (!send.ok) {
          toast({ title: "Pagamento registado", description: `Recibo gerado, mas mensagem falhou: ${send.error}`, variant: "destructive" });
        } else {
          toast({ title: "Pagamento registado", description: "Recibo PDF descarregado e enviado ao morador." });
        }
      } else {
        toast({
          title: "Pagamento registado",
          description: unidade.user_id ? "Recibo gerado." : "Recibo gerado. Morador sem conta — mensagem não enviada.",
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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
          {dividaAcumulada > 0 && (
            <div className="rounded-lg border bg-destructive/5 border-destructive/30 p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Dívida acumulada da unidade:</span>
              <span className="font-semibold tabular-nums text-destructive">{formatCurrency(dividaAcumulada)}</span>
            </div>
          )}

          <div>
            <Label>Ano de referência</Label>
            <Select value={ano} onValueChange={(v) => { setAno(v); setMesesSelecionados([]); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map((a) => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Selecionar meses</Label>
              <div className="flex gap-2">
                <button type="button" className="text-xs text-primary hover:underline" onClick={selecionarTodosEmDivida}>
                  Em dívida
                </button>
                <span className="text-muted-foreground text-xs">·</span>
                <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={limparSelecao}>
                  Limpar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border rounded-lg p-2">
              {mesesDoAno.map((m) => {
                const checked = mesesSelecionados.includes(m.mes);
                const pago = m.divida === 0;
                return (
                  <label
                    key={m.mes}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer border transition-colors ${
                      checked ? "bg-primary/10 border-primary" : "border-transparent hover:bg-muted"
                    } ${pago ? "opacity-50" : ""}`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleMes(m.mes)}
                      disabled={pago}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{MESES_SHORT[m.mes]}</div>
                      <div className={`text-[10px] tabular-nums ${pago ? "text-emerald-600" : "text-destructive"}`}>
                        {pago ? "Pago" : formatCurrency(m.divida)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-between text-xs mt-2 px-1">
              <span className="text-muted-foreground">{mesesSelecionados.length} mês(es) selecionado(s)</span>
              <span className="font-medium tabular-nums">Total meses: {formatCurrency(totalSelecionado)}</span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 flex justify-between">
            <span className="font-semibold">Total a pagar:</span>
            <span className="font-bold tabular-nums text-destructive">{formatCurrency(totalAPagar)}</span>
          </div>

          <div>
            <Label>Via de pagamento *</Label>
            <Select value={via} onValueChange={setVia}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent className="max-h-72">
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valor pago (MT)</Label>
            <Input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} className="mt-1" />
            <p className="text-[11px] text-muted-foreground mt-1">
              Aplica-se primeiro à dívida acumulada, depois aos meses seleccionados (mais antigo → mais recente).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded p-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>O recibo PDF será descarregado e enviado ao morador via mensagens.</span>
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
