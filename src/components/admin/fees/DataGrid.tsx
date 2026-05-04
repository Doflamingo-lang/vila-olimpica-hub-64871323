import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableProperties, BarChart3, Plus, Loader2, Eye } from "lucide-react";
import { Unidade, Taxa, PaymentStatus, CategoriaUnidade, MESES_LABELS, CATEGORIAS_LABELS, CATEGORIAS_LIST, formatCurrency, calcStatus, getDividaHistorica } from "./types";
import TaxasGrid from "./TaxasGrid";
import ReportsView from "./ReportsView";
import TotalColectadoView from "./TotalColectadoView";
import GerarTaxasDialog from "./GerarTaxasDialog";
import AddRecordSheet from "./AddRecordSheet";
import { cn } from "@/lib/utils";
import { feesCache } from "./feesCache";

type TabValue = CategoriaUnidade | "total_colectado";

const FEE_PAGE_SIZE = 1000;
const FEE_COLUMNS = "id,unidade_id,user_id,reference_month,reference_year,amount,valor_pago,paid_at,status,due_date,receipt_url,payment_method";
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const parseReferenceMonth = (referenceMonth: string) => {
  const parsedMonth = parseInt(referenceMonth, 10);
  if (!Number.isNaN(parsedMonth)) return parsedMonth;
  return MONTH_NAMES.indexOf(referenceMonth) + 1;
};

const mapFeeStatus = (status: string, amount: number, valorPago: number): PaymentStatus => {
  if (status === "em_dia" || status === "paid") return "em_dia";
  if (status === "pendente" || status === "pending_verification") return "pendente";
  if (status === "em_atraso" || status === "overdue") return "em_atraso";
  if (status === "pending") return valorPago > 0 ? "pendente" : "em_atraso";
  return calcStatus(amount, valorPago);
};

// Loads only fees for a specific year — drastically reduces payload
const fetchFeesByYear = async (year: number) => {
  const fees: any[] = [];
  for (let from = 0; ; from += FEE_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("condominium_fees")
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

// Lightweight: only fetches distinct years, used to populate the year selector
const fetchAvailableYears = async (): Promise<number[]> => {
  const { data, error } = await supabase
    .from("condominium_fees")
    .select("reference_year")
    .order("reference_year", { ascending: false })
    .limit(1000);
  if (error) return [];
  const set = new Set<number>(data?.map((r: any) => r.reference_year) || []);
  set.add(new Date().getFullYear());
  return [...set].sort((a, b) => b - a);
};

const TAB_LIST: { value: TabValue; label: string }[] = [
  ...CATEGORIAS_LIST.map(c => ({ value: c as TabValue, label: CATEGORIAS_LABELS[c] })),
  { value: "total_colectado", label: "Total Colectado" },
];

const DataGrid = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [taxas, setTaxas] = useState<Taxa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("quitadas");
  const [vista, setVista] = useState<"tabela" | "relatorios">("tabela");
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [gerarOpen, setGerarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptIsPdf, setReceiptIsPdf] = useState(false);
  const { toast } = useToast();

  const [availableYears, setAvailableYearsState] = useState<number[]>([new Date().getFullYear()]);

  const fetchData = useCallback(async (opts: { force?: boolean } = {}) => {
    const cacheKey = `ffh:${anoFiltro}`;
    const cached = !opts.force ? feesCache.get<{ unidades: Unidade[]; taxas: Taxa[]; years: number[] }>(cacheKey) : null;

    if (cached) {
      setUnidades(cached.unidades);
      setTaxas(cached.taxas);
      setAvailableYearsState(cached.years);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [unidadesRes, taxasData, years] = await Promise.all([
        supabase.from("unidades").select("*").order("ord"),
        fetchFeesByYear(anoFiltro),
        fetchAvailableYears(),
      ]);

      if (unidadesRes.error) throw unidadesRes.error;

      const mappedUnidades: Unidade[] = (unidadesRes.data || []).map((u: any) => ({
        id: u.id,
        ord: u.ord,
        bloco: u.bloco,
        edificio: u.edificio,
        apartamento: u.apartamento,
        nome: u.nome,
        contacto: u.contacto,
        via: u.via,
        categoria: u.categoria || "quitadas",
        divida_inicial: Number(u.divida_inicial ?? 0),
        divida_anterior: Number(u.divida_anterior ?? u.divida_inicial ?? 0),
        pagamentos_historicos: Number(u.pagamentos_historicos ?? 0),
      }));

      const mappedTaxas: Taxa[] = taxasData.map((t: any) => {
        const valor = Number(t.amount);
        const valorPago = Number(t.valor_pago || 0);
        return {
          id: t.id,
          unidade_id: t.unidade_id || "",
          user_id: t.user_id,
          mes_referencia: parseReferenceMonth(t.reference_month) || 1,
          ano_referencia: t.reference_year,
          valor,
          valor_pago: valorPago,
          data_pagamento: t.paid_at,
          status: mapFeeStatus(t.status, valor, valorPago),
          due_date: t.due_date,
          receipt_url: t.receipt_url,
          payment_method: t.payment_method,
        };
      }).filter((t: Taxa) => t.unidade_id);

      setAvailableYearsState(years);
      setUnidades(mappedUnidades);
      setTaxas(mappedTaxas);
      feesCache.set(cacheKey, { unidades: mappedUnidades, taxas: mappedTaxas, years });
    } catch (error) {
      console.error("Erro ao carregar taxas:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as taxas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, anoFiltro]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = useCallback(() => {
    feesCache.invalidate("ffh:");
    fetchData({ force: true });
  }, [fetchData]);


  // Optimistic local update — avoids full refetch on row edits
  const updateTaxaLocal = useCallback((taxaId: string, patch: Partial<Taxa>) => {
    setTaxas(prev => prev.map(t => t.id === taxaId ? { ...t, ...patch } : t));
  }, []);

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>(availableYears);
    set.add(new Date().getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [availableYears]);

  // Filter unidades and taxas by active category
  const filteredUnidades = useMemo(() => {
    if (activeTab === "total_colectado") return unidades;
    return unidades.filter(u => u.categoria === activeTab);
  }, [unidades, activeTab]);

  const filteredUnidadeIds = useMemo(() => new Set(filteredUnidades.map(u => u.id)), [filteredUnidades]);

  const filteredTaxas = useMemo(() => {
    if (activeTab === "total_colectado") return taxas;
    return taxas.filter(t => filteredUnidadeIds.has(t.unidade_id));
  }, [taxas, activeTab, filteredUnidadeIds]);

  const taxasAnoAtual = useMemo(() => filteredTaxas.filter(t => t.ano_referencia === anoFiltro), [filteredTaxas, anoFiltro]);

  const stats = useMemo(() => {
    const arr = taxasAnoAtual;
    return {
      total: arr.length,
      arrecadado: arr.reduce((s, t) => s + t.valor_pago, 0),
      divida: arr.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
      emDia: arr.filter(t => t.status === "em_dia").length,
      emAtraso: arr.filter(t => t.status === "em_atraso").length,
    };
  }, [taxasAnoAtual]);

  // Dívida acumulada histórica do escopo activo (categoria filtrada)
  const dividaAcumulada = useMemo(() => {
    let total = 0;
    let unidadesComDivida = 0;
    for (const u of filteredUnidades) {
      const d = getDividaHistorica(u);
      if (d > 0) { total += d; unidadesComDivida++; }
    }
    return { total, unidadesComDivida };
  }, [filteredUnidades]);

  const dataHoje = useMemo(() => new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }), []);

  const handleGerarTaxas = async (mes: number | null, ano: number, valor: number) => {
    const targetUnidades = activeTab !== "total_colectado" ? filteredUnidades : unidades;
    if (targetUnidades.length === 0) {
      toast({ title: "Erro", description: "Adicione unidades primeiro.", variant: "destructive" });
      return;
    }

    const meses = mes ? [mes] : Array.from({ length: 12 }, (_, i) => i + 1);
    const existingKeys = new Set(
      taxas.filter(t => t.ano_referencia === ano).map(t => `${t.unidade_id}-${t.mes_referencia}`)
    );

    const toInsert: any[] = [];
    for (const m of meses) {
      for (const u of targetUnidades) {
        const key = `${u.id}-${m}`;
        if (!existingKeys.has(key)) {
          toInsert.push({
            unidade_id: u.id,
            user_id: u.id,
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
      toast({ title: "Aviso", description: "Todas as taxas já existem para este período." });
      return;
    }

    const { error } = await supabase.from("condominium_fees").insert(toInsert);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível gerar as taxas.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: `${toInsert.length} taxa(s) gerada(s).` });
      refresh();
    }
  };

  const handleAddUnidade = async (data: { nome: string; bloco: number; edificio: number; apartamento: number; contacto: string; via: string; categoria: CategoriaUnidade }) => {
    const { error } = await supabase.from("unidades").insert(data);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar a unidade.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Unidade adicionada." });
      refresh();
    }
  };

  const handleDeleteUnidade = async (id: string) => {
    const { error } = await supabase.from("unidades").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível remover a unidade.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Unidade e taxas associadas removidas." });
      refresh();
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
          <h2 className="text-2xl font-bold tracking-tight">Taxa de Condomínio</h2>
          <p className="text-muted-foreground text-sm">Sistema de gestão de pagamentos FFH</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-0.5 border">
            <button
              onClick={() => setVista("tabela")}
              className={cn(
                "p-2 rounded-md transition-colors",
                vista === "tabela" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableProperties className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista("relatorios")}
              className={cn(
                "p-2 rounded-md transition-colors",
                vista === "relatorios" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b">
        {TAB_LIST.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2",
              activeTab === tab.value
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
            {tab.value !== "total_colectado" && (
              <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full tabular-nums">
                {unidades.filter(u => u.categoria === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={String(anoFiltro)} onValueChange={(v) => setAnoFiltro(Number(v))}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anosDisponiveis.map(a => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab !== "total_colectado" && (
          <Select value={mesFiltro === null ? "todos" : String(mesFiltro)} onValueChange={(v) => setMesFiltro(v === "todos" ? null : Number(v))}>
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
        )}

        <div className="flex-1" />

        {activeTab !== "total_colectado" && (
          <>
            <Button variant="outline" size="sm" onClick={() => setGerarOpen(true)}>
              Gerar Taxas
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nova Unidade
            </Button>
          </>
        )}
      </div>

      {/* Highlighted: Dívida acumulada histórica */}
      {vista === "tabela" && activeTab !== "total_colectado" && dividaAcumulada.total > 0 && (
        <Card className="border-2 border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 px-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-destructive font-semibold">
                Dívida Acumulada até {dataHoje}
              </p>
              <p className="text-3xl font-bold tabular-nums mt-1 text-destructive">
                {formatCurrency(dividaAcumulada.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Unidades</p>
              <p className="text-xl font-semibold tabular-nums text-foreground">{dividaAcumulada.unidadesComDivida}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards (tabela view, not total_colectado) */}
      {vista === "tabela" && activeTab !== "total_colectado" && (
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
      )}

      {/* Main Content */}
      {activeTab === "total_colectado" ? (
        <TotalColectadoView taxas={taxas} unidades={unidades} anoFiltro={anoFiltro} />
      ) : vista === "tabela" ? (
        <TaxasGrid
          taxas={filteredTaxas}
          unidades={filteredUnidades}
          anoFiltro={anoFiltro}
          mesFiltro={mesFiltro}
          onRefresh={refresh}
          onUpdateTaxaLocal={updateTaxaLocal}
          onDeleteUnidade={handleDeleteUnidade}
          onViewReceipt={handleViewReceipt}
        />
      ) : (
        <ReportsView taxas={filteredTaxas} unidades={filteredUnidades} />
      )}

      {/* Dialogs */}
      <GerarTaxasDialog
        open={gerarOpen}
        onOpenChange={setGerarOpen}
        anosDisponiveis={anosDisponiveis}
        onGerar={handleGerarTaxas}
      />
      <AddRecordSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddUnidade}
        defaultCategoria={activeTab !== "total_colectado" ? activeTab : "quitadas"}
      />

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
              <div className="w-full space-y-4">
                {receiptIsPdf ? (
                  <iframe src={receiptUrl} className="w-full h-[60vh] rounded-lg border" title="Comprovativo PDF" />
                ) : (
                  <div className="flex justify-center">
                    <img src={receiptUrl} alt="Comprovativo" className="max-w-full max-h-[60vh] rounded-lg border object-contain" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Não foi possível carregar.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataGrid;
