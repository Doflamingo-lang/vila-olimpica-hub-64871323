import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableProperties, BarChart3, Plus, Loader2, Eye } from "lucide-react";
import { Unidade, Taxa, PaymentStatus, MESES_LABELS, formatCurrency, VALOR_TAXA_MENSAL } from "./types";
import TaxasGrid from "./TaxasGrid";
import ReportsView from "./ReportsView";
import GerarTaxasDialog from "./GerarTaxasDialog";
import AddRecordSheet from "./AddRecordSheet";
import { cn } from "@/lib/utils";

const DataGrid = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [taxas, setTaxas] = useState<Taxa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [unidadesRes, taxasRes] = await Promise.all([
      supabase.from("unidades").select("*").order("ord"),
      supabase.from("condominium_fees").select("*").order("reference_year", { ascending: false }),
    ]);

    if (unidadesRes.data) {
      setUnidades(unidadesRes.data.map((u: any) => ({
        id: u.id, ord: u.ord, bloco: u.bloco, edificio: u.edificio,
        apartamento: u.apartamento, nome: u.nome, contacto: u.contacto, via: u.via,
      })));
    }

    if (taxasRes.data) {
      setTaxas(taxasRes.data.map((t: any) => {
        const mesNum = parseInt(t.reference_month) || 
          ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
            .indexOf(t.reference_month) + 1;
        
        let status: PaymentStatus = "em_atraso";
        if (t.status === "paid") status = "em_dia";
        else if (t.status === "pending" || t.status === "pending_verification") status = "pendente";
        else if (t.status === "overdue") status = "em_atraso";

        return {
          id: t.id,
          unidade_id: t.unidade_id || "",
          user_id: t.user_id,
          mes_referencia: mesNum || 1,
          ano_referencia: t.reference_year,
          valor: Number(t.amount),
          valor_pago: Number(t.valor_pago || 0),
          data_pagamento: t.paid_at,
          status,
          due_date: t.due_date,
          receipt_url: t.receipt_url,
          payment_method: t.payment_method,
        };
      }).filter((t: Taxa) => t.unidade_id));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(taxas.map(t => t.ano_referencia));
    anos.add(new Date().getFullYear());
    return [...anos].sort((a, b) => b - a);
  }, [taxas]);

  const taxasAnoAtual = useMemo(() => taxas.filter(t => t.ano_referencia === anoFiltro), [taxas, anoFiltro]);

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

  const handleGerarTaxas = async (mes: number | null, ano: number, valor: number) => {
    if (unidades.length === 0) {
      toast({ title: "Erro", description: "Adicione unidades primeiro.", variant: "destructive" });
      return;
    }

    const meses = mes ? [mes] : Array.from({ length: 12 }, (_, i) => i + 1);
    const existingKeys = new Set(
      taxas.filter(t => t.ano_referencia === ano).map(t => `${t.unidade_id}-${t.mes_referencia}`)
    );

    const toInsert: any[] = [];
    for (const m of meses) {
      for (const u of unidades) {
        const key = `${u.id}-${m}`;
        if (!existingKeys.has(key)) {
          toInsert.push({
            unidade_id: u.id,
            user_id: u.id, // placeholder
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
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível gerar as taxas.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: `${toInsert.length} taxa(s) gerada(s).` });
      fetchData();
    }
  };

  const handleAddUnidade = async (data: { nome: string; bloco: number; edificio: number; apartamento: number; contacto: string; via: string }) => {
    const { error } = await supabase.from("unidades").insert(data);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar a unidade.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Unidade adicionada." });
      fetchData();
    }
  };

  const handleDeleteUnidade = async (id: string) => {
    const { error } = await supabase.from("unidades").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível remover a unidade.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Unidade e taxas associadas removidas." });
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
          {/* Vista Toggle */}
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

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={() => setGerarOpen(true)}>
          Gerar Taxas
        </Button>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nova Unidade
        </Button>
      </div>

      {/* Summary Cards (only on tabela view) */}
      {vista === "tabela" && (
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
      {vista === "tabela" ? (
        <TaxasGrid
          taxas={taxas}
          unidades={unidades}
          anoFiltro={anoFiltro}
          mesFiltro={mesFiltro}
          onRefresh={fetchData}
          onDeleteUnidade={handleDeleteUnidade}
          onViewReceipt={handleViewReceipt}
        />
      ) : (
        <ReportsView taxas={taxas} unidades={unidades} />
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
