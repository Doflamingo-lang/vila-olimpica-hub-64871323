import { useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MoreVertical, Loader2, Receipt, Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Taxa, Unidade, PaymentStatus, MESES_SHORT, formatCurrency, calcStatus } from "./types";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaxasGridProps {
  taxas: Taxa[];
  unidades: Unidade[];
  anoFiltro: number;
  mesFiltro: number | null;
  onRefresh: () => void;
  onDeleteUnidade: (id: string) => void;
  onViewReceipt: (receiptUrl: string) => void;
}

const TaxasGrid = ({ taxas, unidades, anoFiltro, mesFiltro, onRefresh, onDeleteUnidade, onViewReceipt }: TaxasGridProps) => {
  const [statusFiltro, setStatusFiltro] = useState<PaymentStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<Taxa | null>(null);
  const [paymentValue, setPaymentValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const unidadeMap = useMemo(() => {
    const map: Record<string, Unidade> = {};
    unidades.forEach(u => { map[u.id] = u; });
    return map;
  }, [unidades]);

  const filtered = useMemo(() => {
    return taxas
      .filter(t => {
        if (t.ano_referencia !== anoFiltro) return false;
        if (mesFiltro !== null && t.mes_referencia !== mesFiltro) return false;
        if (statusFiltro !== "todos" && t.status !== statusFiltro) return false;
        if (search) {
          const u = unidadeMap[t.unidade_id];
          if (!u) return false;
          const text = `${u.nome} ${u.contacto}`.toLowerCase();
          if (!text.includes(search.toLowerCase())) return false;
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

  const handleStatusChange = useCallback(async (taxaId: string, newStatus: PaymentStatus) => {
    const statusMap: Record<PaymentStatus, string> = {
      em_dia: "paid",
      pendente: "pending",
      em_atraso: "overdue",
      arquivado: "pending",
    };
    const { error } = await supabase
      .from("condominium_fees")
      .update({ status: statusMap[newStatus] })
      .eq("id", taxaId);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
    } else {
      onRefresh();
    }
  }, [onRefresh, toast]);

  const handlePayment = async () => {
    if (!paymentDialog || !paymentValue) return;
    setIsSubmitting(true);
    const novoValorPago = paymentDialog.valor_pago + parseFloat(paymentValue);
    const novoStatus = calcStatus(paymentDialog.valor, novoValorPago);
    const statusMap: Record<PaymentStatus, string> = {
      em_dia: "paid", pendente: "pending", em_atraso: "overdue", arquivado: "pending"
    };

    const { error } = await supabase
      .from("condominium_fees")
      .update({
        valor_pago: novoValorPago,
        status: statusMap[novoStatus],
        paid_at: novoStatus === "em_dia" ? new Date().toISOString() : null,
      })
      .eq("id", paymentDialog.id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível registar o pagamento.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Pagamento registado." });
      setPaymentDialog(null);
      onRefresh();
    }
    setIsSubmitting(false);
  };

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
              onClick={() => setStatusFiltro(chip.value)}
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
            onChange={(e) => setSearch(e.target.value)}
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
              <AnimatePresence>
                {filtered.map((taxa, i) => {
                  const u = unidadeMap[taxa.unidade_id];
                  if (!u) return null;
                  const divida = Math.max(0, taxa.valor - taxa.valor_pago);
                  return (
                    <motion.tr
                      key={taxa.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, delay: i * 0.01 }}
                      className="border-b group hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{u.ord}</TableCell>
                      <TableCell className="font-medium text-xs">{MESES_SHORT[taxa.mes_referencia]}</TableCell>
                      <TableCell className="tabular-nums text-xs">{u.bloco}</TableCell>
                      <TableCell className="tabular-nums text-xs">{u.edificio}/{u.apartamento}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm font-medium">{u.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.contacto || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{formatCurrency(taxa.valor)}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-emerald-600 font-medium">{formatCurrency(taxa.valor_pago)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums text-sm font-medium", divida > 0 ? "text-red-600" : "")}>
                        {divida > 0 ? formatCurrency(divida) : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={taxa.status}
                          onStatusChange={(s) => handleStatusChange(taxa.id, s)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setPaymentDialog(taxa);
                              setPaymentValue(String(divida));
                            }}>
                              Registar Pagamento
                            </DropdownMenuItem>
                            {taxa.receipt_url && (
                              <DropdownMenuItem onClick={() => onViewReceipt(taxa.receipt_url!)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Comprovativo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteUnidade(u.id)}
                            >
                              Remover Unidade
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
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
