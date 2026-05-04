import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Loader2, Eye, Search, MoreVertical, Receipt } from "lucide-react";
import StatusBadge from "./StatusBadge";
import FeesPaymentDialog from "./PaymentDialog";
import { PaymentStatus, MESES_SHORT, MESES_LABELS, formatCurrency, calcStatus } from "./types";
import { cn } from "@/lib/utils";

interface FpdUnidade {
  id: string;
  ord: number;
  apartamento: number;
  nome: string;
  contacto: string;
  taxa: number;
}

interface FpdTaxa {
  id: string;
  unidade_id: string;
  mes_referencia: number;
  ano_referencia: number;
  valor: number;
  valor_pago: number;
  status: PaymentStatus;
  due_date: string;
  receipt_url?: string | null;
  payment_method?: string | null;
}

const FEE_PAGE_SIZE = 1000;
const PAGE_INCREMENT = 200;
const FEE_COLUMNS = "id,unidade_id,reference_month,reference_year,amount,valor_pago,paid_at,status,due_date,receipt_url,payment_method";

const STATUS_MAP: Record<PaymentStatus, string> = {
  em_dia: "paid", pendente: "pending", em_atraso: "overdue", arquivado: "pending",
};

const mapFeeStatus = (status: string, amount: number, valorPago: number): PaymentStatus => {
  if (status === "paid" || status === "em_dia") return "em_dia";
  if (status === "pending_verification" || status === "pendente") return "pendente";
  if (status === "overdue" || status === "em_atraso") return "em_atraso";
  if (status === "pending") return valorPago > 0 ? "pendente" : "em_atraso";
  return calcStatus(amount, valorPago);
};

const fetchFpdFeesByYear = async (year: number) => {
  const fees: any[] = [];
  for (let from = 0; ; from += FEE_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("fpd_fees")
      .select(FEE_COLUMNS)
      .eq("reference_year", year)
      .range(from, from + FEE_PAGE_SIZE - 1);
    if (error) throw error;
    if (!data?.length) break;
    fees.push(...data);
    if (data.length < FEE_PAGE_SIZE) break;
  }
  return fees;
};

const fetchFpdAvailableYears = async (): Promise<number[]> => {
  const { data, error } = await supabase
    .from("fpd_fees")
    .select("reference_year")
    .order("reference_year", { ascending: false })
    .limit(1000);
  if (error) return [];
  const set = new Set<number>(data?.map((r: any) => r.reference_year) || []);
  set.add(new Date().getFullYear());
  return [...set].sort((a, b) => b - a);
};

const FpdDataGrid = () => {
  const [unidades, setUnidades] = useState<FpdUnidade[]>([]);
  const [taxas, setTaxas] = useState<FpdTaxa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<PaymentStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<FpdTaxa | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptIsPdf, setReceiptIsPdf] = useState(false);
  const [gerarOpen, setGerarOpen] = useState(false);
  const [gerarAno, setGerarAno] = useState(String(new Date().getFullYear()));
  const [gerarValor, setGerarValor] = useState("1000");
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
  const [visibleCount, setVisibleCount] = useState(PAGE_INCREMENT);
  const { toast } = useToast();

  const fetchData = useCallback(async (opts: { force?: boolean } = {}) => {
    const cacheKey = `fdp:${anoFiltro}`;
    const cached = !opts.force ? feesCache.get<{ unidades: FpdUnidade[]; taxas: FpdTaxa[]; years: number[] }>(cacheKey) : null;
    if (cached) {
      setUnidades(cached.unidades);
      setTaxas(cached.taxas);
      setAvailableYears(cached.years);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [unidadesRes, feesData, years] = await Promise.all([
        supabase.from("fpd_unidades").select("*").order("ord"),
        fetchFpdFeesByYear(anoFiltro),
        fetchFpdAvailableYears(),
      ]);
      if (unidadesRes.error) throw unidadesRes.error;

      const mappedUnidades: FpdUnidade[] = (unidadesRes.data || []).map((u: any) => ({
        id: u.id, ord: u.ord, apartamento: u.apartamento,
        nome: u.nome, contacto: u.contacto, taxa: Number(u.taxa),
      }));

      const mappedTaxas: FpdTaxa[] = feesData.map((t: any) => {
        const valor = Number(t.amount);
        const valorPago = Number(t.valor_pago || 0);
        const month = parseInt(t.reference_month, 10);
        return {
          id: t.id, unidade_id: t.unidade_id,
          mes_referencia: isNaN(month) ? 1 : month,
          ano_referencia: t.reference_year,
          valor, valor_pago: valorPago,
          status: mapFeeStatus(t.status, valor, valorPago),
          due_date: t.due_date, receipt_url: t.receipt_url,
          payment_method: t.payment_method,
        };
      });

      setAvailableYears(years);
      setUnidades(mappedUnidades);
      setTaxas(mappedTaxas);
      feesCache.set(cacheKey, { unidades: mappedUnidades, taxas: mappedTaxas, years });
    } catch (error) {
      console.error("Erro ao carregar taxas FDP:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as taxas FDP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, anoFiltro]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = useCallback(() => {
    feesCache.invalidate("fdp:");
    fetchData({ force: true });
  }, [fetchData]);


  // Optimistic local update — avoids full refetch on row edits
  const updateTaxaLocal = useCallback((taxaId: string, patch: Partial<FpdTaxa>) => {
    setTaxas(prev => prev.map(t => t.id === taxaId ? { ...t, ...patch } : t));
  }, []);

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>(availableYears);
    set.add(new Date().getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [availableYears]);

  const unidadeMap = useMemo(() => {
    const map: Record<string, FpdUnidade> = {};
    unidades.forEach(u => { map[u.id] = u; });
    return map;
  }, [unidades]);

  const taxasAno = taxas; // already filtered by year on the server

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return taxasAno
      .filter(t => {
        if (mesFiltro !== null && t.mes_referencia !== mesFiltro) return false;
        if (statusFiltro !== "todos" && t.status !== statusFiltro) return false;
        if (search) {
          const u = unidadeMap[t.unidade_id];
          if (!u) return false;
          const text = `${u.nome} ${u.contacto} ${u.apartamento}`.toLowerCase();
          if (!text.includes(searchLower)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.mes_referencia !== b.mes_referencia) return a.mes_referencia - b.mes_referencia;
        const uA = unidadeMap[a.unidade_id];
        const uB = unidadeMap[b.unidade_id];
        return (uA?.ord || 0) - (uB?.ord || 0);
      });
  }, [taxasAno, mesFiltro, statusFiltro, search, unidadeMap]);

  const visibleSlice = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const stats = useMemo(() => {
    const arr = taxasAno;
    return {
      total: arr.length,
      arrecadado: arr.reduce((s, t) => s + t.valor_pago, 0),
      divida: arr.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
      emDia: arr.filter(t => t.status === "em_dia").length,
      emAtraso: arr.filter(t => t.status === "em_atraso").length,
    };
  }, [taxasAno]);

  const handleStatusChange = useCallback(async (taxaId: string, newStatus: PaymentStatus) => {
    updateTaxaLocal(taxaId, { status: newStatus });
    const { error } = await supabase
      .from("fpd_fees")
      .update({ status: STATUS_MAP[newStatus] })
      .eq("id", taxaId);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
      fetchData();
    }
  }, [updateTaxaLocal, fetchData, toast]);

  const handlePaymentSuccess = useCallback((taxaId: string, patch: any) => {
    updateTaxaLocal(taxaId, {
      valor_pago: patch.valor_pago,
      status: patch.status,
      payment_method: patch.payment_method,
    });
  }, [updateTaxaLocal]);

  const handleGerarTaxas = async () => {
    const ano = parseInt(gerarAno);
    const valor = parseFloat(gerarValor);
    if (!ano || !valor || unidades.length === 0) return;

    const existingKeys = new Set(
      taxas.filter(t => t.ano_referencia === ano).map(t => `${t.unidade_id}-${t.mes_referencia}`)
    );

    const toInsert: any[] = [];
    for (let m = 1; m <= 12; m++) {
      for (const u of unidades) {
        if (!existingKeys.has(`${u.id}-${m}`)) {
          toInsert.push({
            unidade_id: u.id,
            reference_month: String(m).padStart(2, "0"),
            reference_year: ano,
            amount: valor,
            valor_pago: 0,
            due_date: `${ano}-${String(m).padStart(2, "0")}-15`,
            status: "pending",
          });
        }
      }
    }

    if (toInsert.length === 0) {
      toast({ title: "Aviso", description: "Todas as taxas já existem para este ano." });
      return;
    }

    const { error } = await supabase.from("fpd_fees").insert(toInsert);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível gerar as taxas.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: `${toInsert.length} taxa(s) gerada(s).` });
      setGerarOpen(false);
      fetchData();
    }
  };

  const handleViewReceipt = async (url: string) => {
    setReceiptLoading(true);
    setReceiptDialogOpen(true);
    setReceiptUrl(null);
    setReceiptIsPdf(url.toLowerCase().endsWith(".pdf"));
    const { data } = await supabase.storage.from("payment-receipts").createSignedUrl(url, 300);
    if (data?.signedUrl) {
      setReceiptUrl(data.signedUrl);
    } else {
      toast({ title: "Erro", description: "Não foi possível carregar o comprovativo.", variant: "destructive" });
      setReceiptDialogOpen(false);
    }
    setReceiptLoading(false);
  };

  const handleDeleteUnidade = async (id: string) => {
    const { error } = await supabase.from("fpd_unidades").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível remover a unidade.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Unidade e taxas removidas." });
      fetchData();
    }
  };

  const statusChips: { value: PaymentStatus | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "em_dia", label: "Em Dia" },
    { value: "pendente", label: "Pendente" },
    { value: "em_atraso", label: "Em Atraso" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Taxa de Condomínio FDP</h2>
          <p className="text-muted-foreground text-sm">
            {unidades.length} unidades · {taxasAno.length} taxas em {anoFiltro}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setGerarOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Gerar Taxas (Novo Ano)
          </Button>
        </div>
      </div>

      {/* Year Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b">
        {anosDisponiveis.map(ano => (
          <button
            key={ano}
            onClick={() => { setAnoFiltro(ano); setVisibleCount(PAGE_INCREMENT); }}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2",
              anoFiltro === ano
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            FDP {ano === 2025 ? "Maio-Dez 2025" : `Jan-Dez ${ano}`}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Taxas</p>
            <p className="text-xl font-bold tabular-nums mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">Arrecadado</p>
            <p className="text-xl font-bold tabular-nums mt-1 text-emerald-700 dark:text-emerald-400">{formatCurrency(stats.arrecadado)}</p>
          </CardContent>
        </Card>
        <Card className="border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400 font-medium">Dívida</p>
            <p className="text-xl font-bold tabular-nums mt-1 text-red-700 dark:text-red-400">{formatCurrency(stats.divida)}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Em Dia</p>
            <p className="text-xl font-bold tabular-nums mt-1">{stats.emDia}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Em Atraso</p>
            <p className="text-xl font-bold tabular-nums mt-1">{stats.emAtraso}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={mesFiltro === null ? "todos" : String(mesFiltro)} onValueChange={(v) => { setMesFiltro(v === "todos" ? null : Number(v)); setVisibleCount(PAGE_INCREMENT); }}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os meses</SelectItem>
            {Object.entries(MESES_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b pb-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1.5 flex-wrap">
          {statusChips.map(chip => (
            <button
              key={chip.value}
              onClick={() => { setStatusFiltro(chip.value); setVisibleCount(PAGE_INCREMENT); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                statusFiltro === chip.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar nome, contacto ou apartamento..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_INCREMENT); }}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma taxa encontrada.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Apt</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">Dívida</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSlice.map((taxa) => {
                  const u = unidadeMap[taxa.unidade_id];
                  if (!u) return null;
                  const divida = Math.max(0, taxa.valor - taxa.valor_pago);
                  return (
                    <TableRow key={taxa.id} className="group hover:bg-accent/50">
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{u.ord}</TableCell>
                      <TableCell className="font-medium text-xs">{MESES_SHORT[taxa.mes_referencia]}</TableCell>
                      <TableCell className="tabular-nums text-xs">{u.apartamento}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm font-medium">{u.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.contacto || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{formatCurrency(taxa.valor)}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-emerald-600 font-medium">{formatCurrency(taxa.valor_pago)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums text-sm font-medium", divida > 0 ? "text-red-600" : "")}>
                        {divida > 0 ? formatCurrency(divida) : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={taxa.status} onStatusChange={(s) => handleStatusChange(taxa.id, s)} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setPaymentDialog(taxa); setPaymentDialogOpen(true); }}>
                              Registar Pagamento
                            </DropdownMenuItem>
                            {taxa.receipt_url && (
                              <DropdownMenuItem onClick={() => handleViewReceipt(taxa.receipt_url!)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Comprovativo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUnidade(u.id)}>
                              Remover Unidade
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>A mostrar {Math.min(visibleCount, filtered.length)} de {filtered.length}</span>
            {visibleCount < filtered.length && (
              <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + PAGE_INCREMENT)}>
                Carregar mais
              </Button>
            )}
          </div>
        </>
      )}

      {/* Payment Dialog (com via + histórico) */}
      <FeesPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={(o) => { setPaymentDialogOpen(o); if (!o) setPaymentDialog(null); }}
        taxa={paymentDialog}
        inquilinoNome={paymentDialog ? unidadeMap[paymentDialog.unidade_id]?.nome : undefined}
        inquilinoSubtitulo={
          paymentDialog && unidadeMap[paymentDialog.unidade_id]
            ? `Apt ${unidadeMap[paymentDialog.unidade_id].apartamento}`
            : undefined
        }
        taxasInquilino={
          paymentDialog
            ? taxas.filter((t) => t.unidade_id === paymentDialog.unidade_id)
            : []
        }
        table="fpd_fees"
        onSuccess={handlePaymentSuccess}
      />

      {/* Generate Fees Dialog */}
      <Dialog open={gerarOpen} onOpenChange={setGerarOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Taxas FDP</DialogTitle>
            <DialogDescription>Gerar taxas mensais para um novo ano</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ano</Label>
              <Input type="number" value={gerarAno} onChange={(e) => setGerarAno(e.target.value)} />
            </div>
            <div>
              <Label>Valor Mensal (MT)</Label>
              <Input type="number" step="0.01" value={gerarValor} onChange={(e) => setGerarValor(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleGerarTaxas}>
              Gerar Taxas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Comprovativo de Pagamento
            </DialogTitle>
            <DialogDescription>Pré-visualização do comprovativo</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4 flex items-center justify-center min-h-[300px]">
            {receiptLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : receiptUrl ? (
              receiptIsPdf ? (
                <iframe src={receiptUrl} className="w-full h-[60vh] rounded-lg border" title="Comprovativo PDF" />
              ) : (
                <img src={receiptUrl} alt="Comprovativo" className="max-w-full max-h-[60vh] rounded-lg border object-contain" />
              )
            ) : (
              <p className="text-muted-foreground">Não foi possível carregar.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FpdDataGrid;
