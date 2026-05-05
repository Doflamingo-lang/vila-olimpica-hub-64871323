import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wallet, History, CheckCircle2, Pencil, FileDown, LayoutDashboard, Plus, Receipt, Trash2, Printer, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import InstitutionsDashboard from "./InstitutionsDashboard";
import { generateReceiptPdf, downloadBlob } from "@/lib/paymentReceipt";

const DEFAULT_INSTITUTIONS = [
  { key: "FDP", label: "FDP", desc: "Fundo de Desenvolvimento para a Paz", taxaMensal: 80000 },
  { key: "UP", label: "UP", desc: "Universidade Pedagógica", taxaMensal: 8000 },
  { key: "Bolsa de Mercadorias", label: "Bolsa de Mercadorias", desc: "Bolsa de Mercadorias de Moçambique", taxaMensal: 5000 },
  { key: "CNBB", label: "CNBB", desc: "Centro Nacional de Biotecnologia e Biociências", taxaMensal: 4000 },
  { key: "IIA", label: "IIA", desc: "Instituto de Investigação em Águas", taxaMensal: 3000 },
  { key: "Fundo da Paz", label: "Fundo da Paz", desc: "Fundo da Paz", taxaMensal: 4000 },
];

const TAXA_MENSAL_BY_INSTITUTION: Record<string, number> = DEFAULT_INSTITUTIONS.reduce(
  (acc, i) => ({ ...acc, [i.key]: i.taxaMensal }),
  {} as Record<string, number>
);

const CUSTOM_KEY = "vo_custom_institutions";
const loadCustom = (): { key: string; label: string; desc: string }[] => {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; }
};
const saveCustom = (list: { key: string; label: string; desc: string }[]) =>
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type Fee = {
  id: string;
  institution: string;
  reference_year: number;
  reference_month: number;
  period_label: string;
  descricao: string;
  taxa: number;
  n_apartamentos: number;
  valor: number;
  valor_pago: number;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
};

type Payment = {
  id: string;
  fee_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

const fmtMZN = (v: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", minimumFractionDigits: 2 }).format(v || 0);

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-800 border-green-300",
    partial: "bg-amber-100 text-amber-800 border-amber-300",
    pending: "bg-red-100 text-red-800 border-red-300",
  };
  const label = s === "paid" ? "Pago" : s === "partial" ? "Parcial" : "Pendente";
  return <Badge variant="outline" className={cn("font-medium", map[s] || map.pending)}>{label}</Badge>;
};

const InstitutionPanel = ({ institution }: { institution: string }) => {
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Add record
  const [addOpen, setAddOpen] = useState(false);
  const [addYear, setAddYear] = useState(String(new Date().getFullYear()));
  const [addMonth, setAddMonth] = useState("1");
  const [addDesc, setAddDesc] = useState("Taxa de condomínio");
  const [addTaxa, setAddTaxa] = useState(String(TAXA_MENSAL_BY_INSTITUTION[institution] ?? 1000));
  const [addNApt, setAddNApt] = useState("1");
  const [adding, setAdding] = useState(false);

  // Multi-month payment
  const [payOpen, setPayOpen] = useState(false);
  const [payYear, setPayYear] = useState<string>("all");
  const [payMonth, setPayMonth] = useState<string>("all");
  const [paySelected, setPaySelected] = useState<Set<string>>(new Set());
  const [payMethod, setPayMethod] = useState("M-Pesa");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  // History (and view receipt)
  const [histOpen, setHistOpen] = useState(false);
  const [histTarget, setHistTarget] = useState<Fee | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Fee | null>(null);
  const [editYear, setEditYear] = useState("");
  const [editMonth, setEditMonth] = useState("1");
  const [editDesc, setEditDesc] = useState("");
  const [editTaxa, setEditTaxa] = useState("");
  const [editNApt, setEditNApt] = useState("");
  const [editValorPago, setEditValorPago] = useState("");
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("institution_fees")
      .select("id,institution,reference_year,reference_month,period_label,descricao,taxa,n_apartamentos,valor,valor_pago,status,paid_at,payment_method")
      .eq("institution", institution)
      .order("reference_year", { ascending: true })
      .order("reference_month", { ascending: true });
    if (error) toast({ title: "Erro a carregar", description: error.message, variant: "destructive" });
    else setFees((data || []) as Fee[]);
    setLoading(false);
  }, [institution, toast]);

  useEffect(() => { load(); }, [load]);

  const years = useMemo(() => {
    const s = new Set(fees.map((f) => f.reference_year));
    const cur = new Date().getFullYear();
    s.add(cur);
    return Array.from(s).sort((a, b) => a - b);
  }, [fees]);

  const filtered = useMemo(() => fees.filter((f) => {
    if (yearFilter !== "all" && String(f.reference_year) !== yearFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    return true;
  }), [fees, yearFilter, statusFilter]);

  const totals = useMemo(() => {
    const valor = filtered.reduce((a, f) => a + Number(f.valor), 0);
    const pago = filtered.reduce((a, f) => a + Number(f.valor_pago), 0);
    return { valor, pago, saldo: Math.max(0, valor - pago) };
  }, [filtered]);

  // ---- Add record ----
  const submitAdd = async () => {
    const y = Number(addYear), m = Number(addMonth), t = Number(addTaxa), n = Number(addNApt);
    if (!y || !m || t < 0 || n < 0) {
      toast({ title: "Valores inválidos", variant: "destructive" });
      return;
    }
    setAdding(true);
    const valor = t * n;
    const { data, error } = await supabase.from("institution_fees").insert({
      institution,
      reference_year: y,
      reference_month: m,
      period_label: `${MESES[m - 1]}/${y}`,
      descricao: addDesc || "Taxa de condomínio",
      taxa: t,
      n_apartamentos: n,
      valor,
      valor_pago: 0,
      status: "pending",
    }).select().single();
    setAdding(false);
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return;
    }
    setFees((prev) => [...prev, data as Fee].sort((a, b) =>
      a.reference_year - b.reference_year || a.reference_month - b.reference_month));
    setAddOpen(false);
    toast({ title: "Registo criado" });
  };

  // ---- Multi-month payment ----
  const openPay = () => {
    setPayYear(String(new Date().getFullYear()));
    setPaySelected(new Set());
    setPayMethod("M-Pesa");
    setPayRef("");
    setPayNotes("");
    setPayAmount("");
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayOpen(true);
  };

  const payYearFees = useMemo(() =>
    fees.filter((f) => String(f.reference_year) === payYear)
      .sort((a, b) => a.reference_month - b.reference_month),
  [fees, payYear]);

  const payTotal = useMemo(() => {
    return payYearFees
      .filter((f) => paySelected.has(f.id))
      .reduce((s, f) => s + Math.max(0, Number(f.valor) - Number(f.valor_pago)), 0);
  }, [payYearFees, paySelected]);

  useEffect(() => {
    setPayAmount(payTotal > 0 ? String(payTotal.toFixed(2)) : "");
  }, [payTotal]);

  const togglePaySel = (id: string) => {
    setPaySelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const submitPayment = async () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Montante inválido", variant: "destructive" });
      return;
    }
    if (paySelected.size === 0) {
      toast({ title: "Selecione pelo menos um mês", variant: "destructive" });
      return;
    }
    setPaying(true);
    const { data: u } = await supabase.auth.getUser();

    let restante = amount;
    const allocations: { period: string; amount: number }[] = [];
    const updates: { fee: Fee; aplicar: number; novoPago: number; novoStatus: string }[] = [];

    const ordered = payYearFees.filter((f) => paySelected.has(f.id));
    for (const f of ordered) {
      if (restante <= 0) break;
      const saldo = Math.max(0, Number(f.valor) - Number(f.valor_pago));
      if (saldo <= 0) continue;
      const aplicar = Math.min(restante, saldo);
      const novoPago = Number(f.valor_pago) + aplicar;
      const novoStatus = novoPago >= Number(f.valor) - 0.01 ? "paid" : "partial";
      updates.push({ fee: f, aplicar, novoPago, novoStatus });
      allocations.push({ period: f.period_label, amount: aplicar });
      restante -= aplicar;
    }

    try {
      for (const up of updates) {
        const { error: payErr } = await supabase.from("institution_payments").insert({
          fee_id: up.fee.id,
          institution: up.fee.institution,
          amount: up.aplicar,
          payment_method: payMethod,
          payment_date: payDate,
          reference: payRef || null,
          notes: payNotes || null,
          created_by: u.user?.id ?? null,
        });
        if (payErr) throw payErr;
        const { error: updErr } = await supabase.from("institution_fees").update({
          valor_pago: up.novoPago,
          status: up.novoStatus,
          paid_at: up.novoStatus === "paid" ? new Date().toISOString() : up.fee.paid_at,
          payment_method: payMethod,
        }).eq("id", up.fee.id);
        if (updErr) throw updErr;
      }

      // generate receipt
      const receiptNumber = `REC-INST-${Date.now().toString().slice(-8)}`;
      const pdf = await generateReceiptPdf({
        receiptNumber,
        system: "FFH",
        residentName: institution,
        residentId: institution,
        allocations,
        totalPago: amount,
        paymentMethod: payMethod,
        paymentDate: new Date(payDate),
        saldoRemanescente: Math.max(0, restante),
      });
      downloadBlob(pdf, `${receiptNumber}.pdf`);

      setFees((prev) => prev.map((f) => {
        const u = updates.find((x) => x.fee.id === f.id);
        return u ? { ...f, valor_pago: u.novoPago, status: u.novoStatus, payment_method: payMethod } : f;
      }));
      setPayOpen(false);
      toast({ title: "Pagamento registado", description: `Recibo PDF gerado · ${updates.length} mês(es).` });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  // ---- History / View receipt ----
  const openHistory = async (f: Fee) => {
    setHistTarget(f);
    setHistOpen(true);
    setHistLoading(true);
    const { data, error } = await supabase
      .from("institution_payments")
      .select("id,fee_id,amount,payment_method,payment_date,reference,notes,created_at")
      .eq("fee_id", f.id)
      .order("payment_date", { ascending: false });
    setHistLoading(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setHistory((data || []) as Payment[]);
  };

  const viewReceipt = async (p: Payment) => {
    if (!histTarget) return;
    const receiptNumber = `REC-INST-${p.id.slice(0, 8).toUpperCase()}`;
    const pdf = await generateReceiptPdf({
      receiptNumber,
      system: "FFH",
      residentName: histTarget.institution,
      residentId: histTarget.institution,
      allocations: [{ period: histTarget.period_label, amount: Number(p.amount) }],
      totalPago: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: new Date(p.payment_date),
      saldoRemanescente: 0,
    });
    const url = URL.createObjectURL(pdf);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // ---- Edit ----
  const openEdit = (f: Fee) => {
    setEditTarget(f);
    setEditYear(String(f.reference_year));
    setEditMonth(String(f.reference_month));
    setEditDesc(f.descricao);
    setEditTaxa(String(f.taxa));
    setEditNApt(String(f.n_apartamentos));
    setEditValorPago(String(f.valor_pago));
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    const y = Number(editYear), m = Number(editMonth);
    const taxa = Number(editTaxa), nApt = Number(editNApt), vPago = Number(editValorPago);
    if (!y || !m || taxa < 0 || nApt < 0 || vPago < 0) {
      toast({ title: "Valores inválidos", variant: "destructive" });
      return;
    }
    setEditing(true);
    const novoValor = taxa * nApt;
    const novoStatus = vPago >= novoValor - 0.01 && novoValor > 0 ? "paid" : vPago > 0 ? "partial" : "pending";
    const updateData = {
      reference_year: y,
      reference_month: m,
      period_label: `${MESES[m - 1]}/${y}`,
      descricao: editDesc,
      taxa, n_apartamentos: nApt, valor: novoValor, valor_pago: vPago, status: novoStatus,
    };
    const { error } = await supabase.from("institution_fees").update(updateData).eq("id", editTarget.id);
    setEditing(false);
    if (error) {
      toast({ title: "Erro ao editar", description: error.message, variant: "destructive" });
      return;
    }
    setFees((prev) => prev.map((f) => f.id === editTarget.id ? { ...f, ...updateData } as Fee : f)
      .sort((a, b) => a.reference_year - b.reference_year || a.reference_month - b.reference_month));
    setEditOpen(false);
    toast({ title: "Registo atualizado" });
  };

  const handleDelete = async (f: Fee) => {
    if (!confirm(`Eliminar o registo de ${f.period_label}? Os pagamentos associados também serão removidos.`)) return;
    const { error: pErr } = await supabase.from("institution_payments").delete().eq("fee_id", f.id);
    if (pErr) { toast({ title: "Erro", description: pErr.message, variant: "destructive" }); return; }
    const { error } = await supabase.from("institution_fees").delete().eq("id", f.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setFees((prev) => prev.filter((x) => x.id !== f.id));
    toast({ title: "Registo eliminado" });
  };

  const handlePrintLastReceipt = async (f: Fee) => {
    const { data, error } = await supabase
      .from("institution_payments")
      .select("id,amount,payment_method,payment_date")
      .eq("fee_id", f.id)
      .order("payment_date", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) {
      toast({ title: "Sem pagamentos", description: "Este registo ainda não tem pagamentos.", variant: "destructive" });
      return;
    }
    const p = data[0];
    const receiptNumber = `REC-INST-${p.id.slice(0, 8).toUpperCase()}`;
    const pdf = await generateReceiptPdf({
      receiptNumber, system: "FFH",
      residentName: f.institution, residentId: f.institution,
      allocations: [{ period: f.period_label, amount: Number(p.amount) }],
      totalPago: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: new Date(p.payment_date),
      saldoRemanescente: Math.max(0, Number(f.valor) - Number(f.valor_pago)),
    });
    downloadBlob(pdf, `${receiptNumber}.pdf`);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-l-4 border-l-primary">
          <p className="text-xs uppercase text-muted-foreground">Total a Cobrar</p>
          <p className="text-2xl font-bold mt-1">{fmtMZN(totals.valor)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-600">
          <p className="text-xs uppercase text-muted-foreground">Total Pago</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{fmtMZN(totals.pago)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-600">
          <p className="text-xs uppercase text-muted-foreground">Saldo Devedor</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{fmtMZN(totals.saldo)}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "registo" : "registos"}</span>
        <div className="ml-auto flex gap-2">
          <Button onClick={openPay} variant="outline" disabled={fees.length === 0}>
            <Wallet className="w-4 h-4 mr-1" /> Registar Pagamento
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar Registo
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Nº Apt</TableHead>
                <TableHead className="text-right">Taxa (Mt)</TableHead>
                <TableHead className="text-right">Valor (Mt)</TableHead>
                <TableHead className="text-right">Pago (Mt)</TableHead>
                <TableHead className="text-right">Saldo (Mt)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Sem registos. Clique em "Adicionar Registo".</TableCell></TableRow>
              ) : filtered.map((f) => {
                const saldo = Math.max(0, Number(f.valor) - Number(f.valor_pago));
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium whitespace-nowrap">{f.period_label}</TableCell>
                    <TableCell className="text-muted-foreground">{f.descricao}</TableCell>
                    <TableCell className="text-center">{f.n_apartamentos}</TableCell>
                    <TableCell className="text-right">{fmtMZN(Number(f.taxa))}</TableCell>
                    <TableCell className="text-right font-semibold">{fmtMZN(Number(f.valor))}</TableCell>
                    <TableCell className="text-right">{fmtMZN(Number(f.valor_pago))}</TableCell>
                    <TableCell className={cn("text-right font-bold", saldo > 0 ? "text-red-700" : "text-green-700")}>{fmtMZN(saldo)}</TableCell>
                    <TableCell><StatusBadge s={f.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => openEdit(f)} className="h-8" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openHistory(f)} className="h-8" title="Histórico / Recibos">
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePrintLastReceipt(f)} className="h-8" title="Imprimir último recibo">
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(f)} className="h-8 text-red-600 hover:text-red-700" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add record */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Novo Registo Mensal</DialogTitle>
            <DialogDescription>{institution}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Mês</Label>
                <Select value={addMonth} onValueChange={setAddMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Input type="number" value={addYear} onChange={(e) => setAddYear(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Nº Apartamentos</Label>
                <Input type="number" min="0" value={addNApt} onChange={(e) => setAddNApt(e.target.value)} />
              </div>
              <div>
                <Label>Taxa por Apt (MZN)</Label>
                <Input type="number" min="0" step="0.01" value={addTaxa} onChange={(e) => setAddTaxa(e.target.value)} />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm flex justify-between">
              <span>Valor total:</span>
              <span className="font-bold">{fmtMZN(Number(addTaxa) * Number(addNApt))}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>Cancelar</Button>
            <Button onClick={submitAdd} disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Multi-month payment */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Registar Pagamento</DialogTitle>
            <DialogDescription>{institution} · seleccione meses do ano</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Ano de referência</Label>
              <Select value={payYear} onValueChange={(v) => { setPayYear(v); setPaySelected(new Set()); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Meses</Label>
              <div className="border rounded-lg p-2 max-h-56 overflow-auto space-y-1 mt-1">
                {payYearFees.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum registo neste ano.</p>
                ) : payYearFees.map((f) => {
                  const saldo = Math.max(0, Number(f.valor) - Number(f.valor_pago));
                  const pago = saldo === 0;
                  return (
                    <label key={f.id} className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-muted",
                      paySelected.has(f.id) && "bg-primary/10", pago && "opacity-50")}>
                      <Checkbox checked={paySelected.has(f.id)} onCheckedChange={() => togglePaySel(f.id)} disabled={pago} />
                      <span className="flex-1">{f.period_label}</span>
                      <span className={cn("text-xs tabular-nums", pago ? "text-green-700" : "text-red-700")}>
                        {pago ? "Pago" : fmtMZN(saldo)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 flex justify-between text-sm">
              <span>Total seleccionado:</span>
              <span className="font-bold text-red-700">{fmtMZN(payTotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Valor pago (MZN)</Label>
                <Input type="number" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Via de pagamento</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="e-Mola">e-Mola</SelectItem>
                  <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                  <SelectItem value="Depósito">Depósito</SelectItem>
                  <SelectItem value="Numerário">Numerário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Referência</Label>
                <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="opcional" />
              </div>
              <div>
                <Label>Notas</Label>
                <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="opcional" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying}>Cancelar</Button>
            <Button onClick={submitPayment} disabled={paying || paySelected.size === 0}>
              {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
              Confirmar e Gerar Recibo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Histórico de Pagamentos</DialogTitle>
            <DialogDescription>{histTarget && <>{histTarget.institution} · {histTarget.period_label}</>}</DialogDescription>
          </DialogHeader>
          {histLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : history.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">Nenhum pagamento registado.</p>
          ) : (
            <div className="max-h-[50vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead className="text-right">Montante</TableHead>
                    <TableHead className="text-right">Recibo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.payment_date).toLocaleDateString("pt-PT")}</TableCell>
                      <TableCell>{p.payment_method}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.reference || "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{fmtMZN(Number(p.amount))}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => viewReceipt(p)}>
                          <Receipt className="w-3.5 h-3.5 mr-1" /> Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> Editar Registo</DialogTitle>
            <DialogDescription>{editTarget && <>{editTarget.institution}</>}</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Mês</Label>
                  <Select value={editMonth} onValueChange={setEditMonth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ano</Label>
                  <Input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Nº Apartamentos</Label>
                  <Input type="number" min="0" value={editNApt} onChange={(e) => setEditNApt(e.target.value)} />
                </div>
                <div>
                  <Label>Taxa por Apt (MZN)</Label>
                  <Input type="number" min="0" step="0.01" value={editTaxa} onChange={(e) => setEditTaxa(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Valor já pago (MZN)</Label>
                <Input type="number" min="0" step="0.01" value={editValorPago} onChange={(e) => setEditValorPago(e.target.value)} />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Novo valor total:</span><span className="font-semibold">{fmtMZN(Number(editTaxa) * Number(editNApt))}</span></div>
                <div className="flex justify-between"><span>Novo saldo:</span><span className="font-bold text-red-700">{fmtMZN(Math.max(0, Number(editTaxa) * Number(editNApt) - Number(editValorPago)))}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editing}>Cancelar</Button>
            <Button onClick={submitEdit} disabled={editing}>
              {editing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InstitutionsGrid = () => {
  const [active, setActive] = useState<string>("__dashboard");
  const [customList, setCustomList] = useState(loadCustom);
  const mountedRef = useRef<Set<string>>(new Set(["__dashboard"]));
  if (!mountedRef.current.has(active)) mountedRef.current.add(active);

  const allInstitutions = useMemo(() => [...DEFAULT_INSTITUTIONS, ...customList], [customList]);

  // New institution dialog
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { toast } = useToast();

  const submitNewInstitution = () => {
    const name = newName.trim();
    if (!name) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    if (allInstitutions.some((i) => i.key.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Instituição já existe", variant: "destructive" }); return;
    }
    const updated = [...customList, { key: name, label: name, desc: newDesc || name }];
    setCustomList(updated);
    saveCustom(updated);
    setNewOpen(false);
    setNewName(""); setNewDesc("");
    setActive(name);
    toast({ title: "Instituição adicionada" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setNewOpen(true)} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Nova Instituição
        </Button>
      </div>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="__dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
          </TabsTrigger>
          {allInstitutions.map((i) => (
            <TabsTrigger key={i.key} value={i.key}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" title={i.desc}>
              {i.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="__dashboard" className="mt-4"
          forceMount={mountedRef.current.has("__dashboard") ? true : undefined} hidden={active !== "__dashboard"}>
          {mountedRef.current.has("__dashboard") && <InstitutionsDashboard />}
        </TabsContent>

        {allInstitutions.map((i) => (
          <TabsContent key={i.key} value={i.key} className="mt-4 space-y-2"
            forceMount={mountedRef.current.has(i.key) ? true : undefined} hidden={active !== i.key}>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <p className="text-sm"><strong>{i.label}</strong> — {i.desc}</p>
            </div>
            {mountedRef.current.has(i.key) && <InstitutionPanel institution={i.key} />}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Nova Instituição</DialogTitle>
            <DialogDescription>As taxas mensais são definidas por registo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome / Sigla *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: SADC" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Nome completo (opcional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button onClick={submitNewInstitution}><CheckCircle2 className="w-4 h-4 mr-2" /> Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionsGrid;
