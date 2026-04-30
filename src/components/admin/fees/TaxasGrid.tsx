import { useState, useMemo, useCallback, memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Receipt, Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";
import FeesPaymentDialog from "./PaymentDialog";
import { Taxa, Unidade, PaymentStatus, MESES_SHORT, formatCurrency } from "./types";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaxasGridProps {
  taxas: Taxa[];
  unidades: Unidade[];
  anoFiltro: number;
  mesFiltro: number | null;
  onRefresh: () => void;
  onUpdateTaxaLocal?: (taxaId: string, patch: Partial<Taxa>) => void;
  onDeleteUnidade: (id: string) => void;
  onViewReceipt: (receiptUrl: string) => void;
}

const PAGE_INCREMENT = 200;

const STATUS_MAP: Record<PaymentStatus, string> = {
  em_dia: "paid",
  pendente: "pending",
  em_atraso: "overdue",
  arquivado: "pending",
};

interface RowProps {
  taxa: Taxa;
  unidade: Unidade;
  onStatusChange: (id: string, status: PaymentStatus) => void;
  onOpenPayment: (taxa: Taxa, divida: number) => void;
  onViewReceipt: (url: string) => void;
  onDeleteUnidade: (id: string) => void;
}

const TaxaRow = memo(({ taxa, unidade, onStatusChange, onOpenPayment, onViewReceipt, onDeleteUnidade }: RowProps) => {
  const divida = Math.max(0, taxa.valor - taxa.valor_pago);
  return (
    <TableRow className="group hover:bg-accent/50">
      <TableCell className="text-xs text-muted-foreground tabular-nums">{unidade.ord}</TableCell>
      <TableCell className="font-medium text-xs">{MESES_SHORT[taxa.mes_referencia]}</TableCell>
      <TableCell className="tabular-nums text-xs">{unidade.bloco}</TableCell>
      <TableCell className="tabular-nums text-xs">{unidade.edificio}/{unidade.apartamento}</TableCell>
      <TableCell className="max-w-[150px] truncate text-sm font-medium">{unidade.nome}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{unidade.contacto || "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{formatCurrency(taxa.valor)}</TableCell>
      <TableCell className="text-right tabular-nums text-sm text-emerald-600 font-medium">{formatCurrency(taxa.valor_pago)}</TableCell>
      <TableCell className={cn("text-right tabular-nums text-sm font-medium", divida > 0 ? "text-red-600" : "")}>
        {divida > 0 ? formatCurrency(divida) : "—"}
      </TableCell>
      <TableCell>
        <StatusBadge status={taxa.status} onStatusChange={(s) => onStatusChange(taxa.id, s)} />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpenPayment(taxa, divida)}>Registar Pagamento</DropdownMenuItem>
            {taxa.receipt_url && (
              <DropdownMenuItem onClick={() => onViewReceipt(taxa.receipt_url!)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Comprovativo
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteUnidade(unidade.id)}>
              Remover Unidade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
TaxaRow.displayName = "TaxaRow";

const TaxasGrid = ({ taxas, unidades, anoFiltro, mesFiltro, onRefresh, onUpdateTaxaLocal, onDeleteUnidade, onViewReceipt }: TaxasGridProps) => {
  const [statusFiltro, setStatusFiltro] = useState<PaymentStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<Taxa | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_INCREMENT);
  const { toast } = useToast();

  const unidadeMap = useMemo(() => {
    const map: Record<string, Unidade> = {};
    unidades.forEach(u => { map[u.id] = u; });
    return map;
  }, [unidades]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return taxas
      .filter(t => {
        if (t.ano_referencia !== anoFiltro) return false;
        if (mesFiltro !== null && t.mes_referencia !== mesFiltro) return false;
        if (statusFiltro !== "todos" && t.status !== statusFiltro) return false;
        if (search) {
          const u = unidadeMap[t.unidade_id];
          if (!u) return false;
          const text = `${u.nome} ${u.contacto}`.toLowerCase();
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
  }, [taxas, anoFiltro, mesFiltro, statusFiltro, search, unidadeMap]);

  // Reset pagination when filters change
  const visibleSlice = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const handleStatusChange = useCallback(async (taxaId: string, newStatus: PaymentStatus) => {
    // Optimistic update
    onUpdateTaxaLocal?.(taxaId, { status: newStatus });
    const { error } = await supabase
      .from("condominium_fees")
      .update({ status: STATUS_MAP[newStatus] })
      .eq("id", taxaId);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
      onRefresh();
    }
  }, [onUpdateTaxaLocal, onRefresh, toast]);

  const handleOpenPayment = useCallback((taxa: Taxa, _divida: number) => {
    setPaymentDialog(taxa);
    setPaymentDialogOpen(true);
  }, []);

  const handlePaymentSuccess = useCallback((taxaId: string, patch: any) => {
    onUpdateTaxaLocal?.(taxaId, {
      valor_pago: patch.valor_pago,
      status: patch.status,
      data_pagamento: patch.data_pagamento,
      payment_method: patch.payment_method,
    });
  }, [onUpdateTaxaLocal]);

  const statusChips: { value: PaymentStatus | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "em_dia", label: "Em Dia" },
    { value: "pendente", label: "Pendente" },
    { value: "em_atraso", label: "Em Atraso" },
  ];

  return (
    <div className="space-y-4">
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
            placeholder="Pesquisar nome ou contacto..."
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
                  <TableHead>Bloco</TableHead>
                  <TableHead>Ed/Apt</TableHead>
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
                  return (
                    <TaxaRow
                      key={taxa.id}
                      taxa={taxa}
                      unidade={u}
                      onStatusChange={handleStatusChange}
                      onOpenPayment={handleOpenPayment}
                      onViewReceipt={onViewReceipt}
                      onDeleteUnidade={onDeleteUnidade}
                    />
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

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={(o) => !o && setPaymentDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registar Pagamento</DialogTitle>
            <DialogDescription>
              {paymentDialog && unidadeMap[paymentDialog.unidade_id] && (
                <>
                  {unidadeMap[paymentDialog.unidade_id].nome} — {MESES_SHORT[paymentDialog.mes_referencia]}/{paymentDialog.ano_referencia}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {paymentDialog && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dívida actual:</span>
                <span className="font-semibold text-red-600">{formatCurrency(Math.max(0, paymentDialog.valor - paymentDialog.valor_pago))}</span>
              </div>
              <div>
                <Label>Valor do Pagamento (MT)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentValue}
                  onChange={(e) => setPaymentValue(e.target.value)}
                  autoFocus
                />
              </div>
              <Button className="w-full" onClick={handlePayment} disabled={isSubmitting || !paymentValue}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar Pagamento
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxasGrid;
