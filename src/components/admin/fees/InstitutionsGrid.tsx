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
import { Loader2, Wallet, History, CheckCircle2, Pencil, FileDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import InstitutionsDashboard from "./InstitutionsDashboard";
import { generateReceiptPdf, downloadBlob } from "@/lib/paymentReceipt";

const INSTITUTIONS = [
  { key: "FDP", label: "FDP", desc: "Fundo de Desenvolvimento para a Paz" },
  { key: "UP", label: "UP", desc: "Universidade Pedagógica" },
  { key: "Bolsa de Mercadorias", label: "Bolsa de Mercadorias", desc: "Bolsa de Mercadorias de Moçambique" },
  { key: "CNBB", label: "CNBB", desc: "Centro Nacional de Biotecnologia e Biociências" },
  { key: "IIA", label: "IIA", desc: "Instituto de Investigação em Águas" },
] as const;

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

const FeeRow = memo(({ fee, onPay, onHistory, onEdit }: {
  fee: Fee;
  onPay: (f: Fee) => void;
  onHistory: (f: Fee) => void;
  onEdit: (f: Fee) => void;
}) => {
  const saldo = Math.max(0, Number(fee.valor) - Number(fee.valor_pago));
  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">{fee.period_label}</TableCell>
      <TableCell className="text-muted-foreground">{fee.descricao}</TableCell>
      <TableCell className="text-right">{fmtMZN(Number(fee.taxa))}</TableCell>
      <TableCell className="text-center">{fee.n_apartamentos}</TableCell>
      <TableCell className="text-right font-semibold">{fmtMZN(Number(fee.valor))}</TableCell>
      <TableCell className="text-right">{fmtMZN(Number(fee.valor_pago))}</TableCell>
      <TableCell className={cn("text-right font-bold", saldo > 0 ? "text-red-700" : "text-green-700")}>
        {fmtMZN(saldo)}
      </TableCell>
      <TableCell><StatusBadge s={fee.status} /></TableCell>
      <TableCell>
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="outline" onClick={() => onEdit(fee)} className="h-8" title="Editar taxa/apartamentos">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onHistory(fee)} className="h-8">
            <History className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => onPay(fee)}
            disabled={saldo <= 0}
            className="h-8 bg-primary text-primary-foreground"
          >
            <Wallet className="w-3.5 h-3.5 mr-1" /> Pagar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
FeeRow.displayName = "FeeRow";

const InstitutionPanel = ({ institution }: { institution: string }) => {
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Fee | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("M-Pesa");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paying, setPaying] = useState(false);

  const [histOpen, setHistOpen] = useState(false);
  const [histTarget, setHistTarget] = useState<Fee | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Fee | null>(null);
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
    if (error) {
      toast({ title: "Erro a carregar", description: error.message, variant: "destructive" });
    } else {
      setFees((data || []) as Fee[]);
    }
    setLoading(false);
  }, [institution, toast]);

  useEffect(() => { load(); }, [load]);

  const years = useMemo(() => {
    const s = new Set(fees.map((f) => f.reference_year));
    return Array.from(s).sort((a, b) => a - b);
  }, [fees]);

  const filtered = useMemo(() => {
    return fees.filter((f) => {
      if (yearFilter !== "all" && String(f.reference_year) !== yearFilter) return false;
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      return true;
    });
  }, [fees, yearFilter, statusFilter]);

  const totals = useMemo(() => {
    const valor = filtered.reduce((a, f) => a + Number(f.valor), 0);
    const pago = filtered.reduce((a, f) => a + Number(f.valor_pago), 0);
    return { valor, pago, saldo: Math.max(0, valor - pago) };
  }, [filtered]);

  const openPay = (f: Fee) => {
    const remaining = Math.max(0, Number(f.valor) - Number(f.valor_pago));
    setPayTarget(f);
    setPayAmount(String(remaining));
    setPayMethod("M-Pesa");
    setPayRef("");
    setPayNotes("");
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayOpen(true);
  };

  const submitPayment = async () => {
    if (!payTarget) return;
    const amount = Number(payAmount);
    const remaining = Math.max(0, Number(payTarget.valor) - Number(payTarget.valor_pago));
    if (!amount || amount <= 0) {
      toast({ title: "Montante inválido", variant: "destructive" });
      return;
    }
    if (amount > remaining + 0.01) {
      toast({ title: "Montante excede o saldo", description: `Saldo restante: ${fmtMZN(remaining)}`, variant: "destructive" });
      return;
    }
    setPaying(true);
    const newPaid = Number(payTarget.valor_pago) + amount;
    const newStatus = newPaid >= Number(payTarget.valor) - 0.01 ? "paid" : "partial";

    const { data: u } = await supabase.auth.getUser();
    const { error: payErr } = await supabase.from("institution_payments").insert({
      fee_id: payTarget.id,
      institution: payTarget.institution,
      amount,
      payment_method: payMethod,
      payment_date: payDate,
      reference: payRef || null,
      notes: payNotes || null,
      created_by: u.user?.id ?? null,
    });
    if (payErr) {
      setPaying(false);
      toast({ title: "Erro ao registar pagamento", description: payErr.message, variant: "destructive" });
      return;
    }
    const { error: updErr } = await supabase
      .from("institution_fees")
      .update({
        valor_pago: newPaid,
        status: newStatus,
        paid_at: newStatus === "paid" ? new Date().toISOString() : payTarget.paid_at,
        payment_method: payMethod,
      })
      .eq("id", payTarget.id);
    setPaying(false);
    if (updErr) {
      toast({ title: "Pagamento registado mas saldo não atualizado", description: updErr.message, variant: "destructive" });
      return;
    }
    setFees((prev) => prev.map((f) => f.id === payTarget.id
      ? { ...f, valor_pago: newPaid, status: newStatus, payment_method: payMethod }
      : f));
    setPayOpen(false);
    toast({
      title: newStatus === "paid" ? "Pagamento total registado" : "Pagamento parcial registado",
      description: `Mês ${payTarget.period_label} · Saldo restante: ${fmtMZN(Math.max(0, Number(payTarget.valor) - newPaid))}`,
    });
  };

  const openHistory = async (f: Fee) => {
    setHistTarget(f);
    setHistOpen(true);
    setHistLoading(true);
    const { data, error } = await supabase
      .from("institution_payments")
      .select("id,amount,payment_method,payment_date,reference,notes,created_at")
      .eq("fee_id", f.id)
      .order("payment_date", { ascending: false });
    setHistLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setHistory((data || []) as Payment[]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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

      <div className="flex flex-wrap gap-2">
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
        <span className="text-sm text-muted-foreground self-center ml-auto">
          {filtered.length} {filtered.length === 1 ? "registo" : "registos"}
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Taxa (Mt)</TableHead>
                <TableHead className="text-center">Nr. Apt</TableHead>
                <TableHead className="text-right">Valor (Mt)</TableHead>
                <TableHead className="text-right">Pago (Mt)</TableHead>
                <TableHead className="text-right">Saldo (Mt)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Sem registos</TableCell></TableRow>
              ) : filtered.map((f) => (
                <FeeRow key={f.id} fee={f} onPay={openPay} onHistory={openHistory} />
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> Registar Pagamento
            </DialogTitle>
            <DialogDescription>
              {payTarget && (
                <>
                  <strong>{payTarget.institution}</strong> · Mês a pagar: <strong>{payTarget.period_label}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {payTarget && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Valor total:</span><span className="font-semibold">{fmtMZN(Number(payTarget.valor))}</span></div>
                <div className="flex justify-between"><span>Já pago:</span><span className="font-semibold text-green-700">{fmtMZN(Number(payTarget.valor_pago))}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span>Saldo a pagar:</span>
                  <span className="font-bold text-red-700">{fmtMZN(Math.max(0, Number(payTarget.valor) - Number(payTarget.valor_pago)))}</span>
                </div>
              </div>

              <div>
                <Label>Mês de referência</Label>
                <Input value={payTarget.period_label} disabled />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Montante (MZN)</Label>
                  <Input type="number" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Método</Label>
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

              <div>
                <Label>Referência (opcional)</Label>
                <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Nº de transacção" />
              </div>

              <div>
                <Label>Notas (opcional)</Label>
                <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
              </div>

              {Number(payAmount) > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Saldo após pagamento:</span>
                    <span className="font-bold text-primary">
                      {fmtMZN(Math.max(0, Number(payTarget.valor) - Number(payTarget.valor_pago) - Number(payAmount)))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying}>Cancelar</Button>
            <Button onClick={submitPayment} disabled={paying}>
              {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Histórico de Pagamentos
            </DialogTitle>
            <DialogDescription>
              {histTarget && <>{histTarget.institution} · {histTarget.period_label}</>}
            </DialogDescription>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.payment_date).toLocaleDateString("pt-PT")}</TableCell>
                      <TableCell>{p.payment_method}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.reference || "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{fmtMZN(Number(p.amount))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InstitutionsGrid = () => {
  const [active, setActive] = useState<string>("__dashboard");
  const mountedRef = useRef<Set<string>>(new Set(["__dashboard"]));
  if (!mountedRef.current.has(active)) mountedRef.current.add(active);

  return (
    <div className="space-y-4">
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger
            value="__dashboard"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
          </TabsTrigger>
          {INSTITUTIONS.map((i) => (
            <TabsTrigger
              key={i.key}
              value={i.key}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              title={i.desc}
            >
              {i.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="__dashboard" className="mt-4" forceMount={mountedRef.current.has("__dashboard") ? true : undefined} hidden={active !== "__dashboard"}>
          {mountedRef.current.has("__dashboard") && <InstitutionsDashboard />}
        </TabsContent>

        {INSTITUTIONS.map((i) => (
          <TabsContent key={i.key} value={i.key} className="mt-4 space-y-2" forceMount={mountedRef.current.has(i.key) ? true : undefined} hidden={active !== i.key}>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <p className="text-sm"><strong>{i.label}</strong> — {i.desc}</p>
            </div>
            {mountedRef.current.has(i.key) && <InstitutionPanel institution={i.key} />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default InstitutionsGrid;
