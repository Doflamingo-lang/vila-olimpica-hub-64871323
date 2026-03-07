import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentDialog from "./PaymentDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Loader2, CheckCircle, Clock, AlertCircle, Receipt, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Fee {
  id: string;
  reference_month: string;
  reference_year: number;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
}

const FeesSection = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [showAllFees, setShowAllFees] = useState(false);
  const [paymentFee, setPaymentFee] = useState<Fee | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchFees();
    }
  }, [user?.id]);

  const fetchFees = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("condominium_fees")
      .select("*")
      .eq("user_id", user?.id)
      .order("reference_year", { ascending: false })
      .order("reference_month", { ascending: false });

    if (error) {
      console.error("Error fetching fees:", error);
    } else {
      setFees(data || []);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending_verification":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending_verification":
        return "Em Verificação";
      case "overdue":
        return "Vencido";
      default:
        return "Pendente";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending_verification":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "overdue":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(value);
  };

  const getMonthName = (month: string) => {
    const months: Record<string, string> = {
      "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
      "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
      "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
    };
    return months[month] || month;
  };

  // Calculate summary
  const paidFees = fees.filter(f => f.status === "paid");
  const pendingFees = fees.filter(f => f.status === "pending");
  const overdueFees = fees.filter(f => f.status === "overdue");
  const totalPaid = paidFees.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPending = [...pendingFees, ...overdueFees].reduce((sum, f) => sum + Number(f.amount), 0);

  const displayedFees = showAllFees ? fees : fees.slice(0, 6);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700 dark:text-green-400">
                Total Pago
              </CardDescription>
              <CardTitle className="text-2xl text-green-700 dark:text-green-400">
                {formatCurrency(totalPaid)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 dark:text-green-500">
                {paidFees.length} {paidFees.length === 1 ? "taxa" : "taxas"} pagas
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2",
            totalPending > 0 
              ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
              : "bg-muted/50"
          )}>
            <CardHeader className="pb-2">
              <CardDescription className={totalPending > 0 ? "text-yellow-700 dark:text-yellow-400" : ""}>
                Pendente
              </CardDescription>
              <CardTitle className={cn(
                "text-2xl",
                totalPending > 0 ? "text-yellow-700 dark:text-yellow-400" : ""
              )}>
                {formatCurrency(totalPending)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm",
                totalPending > 0 ? "text-yellow-600 dark:text-yellow-500" : "text-muted-foreground"
              )}>
                {pendingFees.length + overdueFees.length} {pendingFees.length + overdueFees.length === 1 ? "taxa" : "taxas"} pendentes
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            overdueFees.length > 0 
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 border-2"
              : "bg-muted/50"
          )}>
            <CardHeader className="pb-2">
              <CardDescription className={overdueFees.length > 0 ? "text-red-700 dark:text-red-400" : ""}>
                Em Atraso
              </CardDescription>
              <CardTitle className={cn(
                "text-2xl",
                overdueFees.length > 0 ? "text-red-700 dark:text-red-400" : ""
              )}>
                {overdueFees.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm",
                overdueFees.length > 0 ? "text-red-600 dark:text-red-500" : "text-muted-foreground"
              )}>
                {overdueFees.length === 0 ? "Nenhuma taxa em atraso" : "Regularize para evitar multas"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fees List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Histórico de Taxas Condominiais
            </CardTitle>
            <CardDescription>
              Consulte todas as suas taxas condominiais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma taxa registrada.</p>
                <p className="text-sm mt-2">As taxas serão exibidas aqui quando disponíveis.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referência</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          {getMonthName(fee.reference_month)} / {fee.reference_year}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(fee.amount))}</TableCell>
                        <TableCell>
                          {format(new Date(fee.due_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit",
                            getStatusStyles(fee.status)
                          )}>
                            {getStatusIcon(fee.status)}
                            {getStatusLabel(fee.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedFee(fee)}
                            >
                              Detalhes
                            </Button>
                            {fee.status !== "paid" && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setPaymentFee(fee);
                                  setPaymentDialogOpen(true);
                                }}
                              >
                                Pagar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {fees.length > 6 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setShowAllFees(!showAllFees)}
                  >
                    {showAllFees ? "Ver menos" : `Ver todas as ${fees.length} taxas`}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Detail Dialog */}
      <Dialog open={!!selectedFee} onOpenChange={() => setSelectedFee(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedFee && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Detalhes da Taxa
                </DialogTitle>
                <DialogDescription>
                  {getMonthName(selectedFee.reference_month)} de {selectedFee.reference_year}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-xl font-bold">{formatCurrency(Number(selectedFee.amount))}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1",
                      getStatusStyles(selectedFee.status)
                    )}>
                      {getStatusIcon(selectedFee.status)}
                      {getStatusLabel(selectedFee.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Data de Vencimento
                  </p>
                  <p className="font-medium">
                    {format(new Date(selectedFee.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>

                {selectedFee.paid_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Data do Pagamento
                    </p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {format(new Date(selectedFee.paid_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}

                {selectedFee.payment_method && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                    <p className="font-medium">{selectedFee.payment_method}</p>
                  </div>
                )}

                {selectedFee.status !== "paid" && (
                  <Button 
                    className="w-full mt-4"
                    onClick={() => {
                      setPaymentFee(selectedFee);
                      setPaymentDialogOpen(true);
                      setSelectedFee(null);
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar Agora
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <PaymentDialog
        fee={paymentFee}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onPaymentSuccess={fetchFees}
      />
    </>
  );
};

export default FeesSection;
