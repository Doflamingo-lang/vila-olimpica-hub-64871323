import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Receipt, Loader2, Trash2, Edit2, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CondominiumFee {
  id: string;
  user_id: string;
  reference_month: string;
  reference_year: number;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  created_at: string;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const FeesManagement = () => {
  const [fees, setFees] = useState<CondominiumFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<CondominiumFee | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchUserId, setSearchUserId] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    user_id: "",
    reference_month: "",
    reference_year: new Date().getFullYear(),
    amount: "",
    due_date: "",
    status: "pending",
    payment_method: "",
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("condominium_fees")
      .select("*")
      .order("reference_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching fees:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as taxas.",
        variant: "destructive",
      });
    } else {
      setFees(data || []);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      reference_month: "",
      reference_year: new Date().getFullYear(),
      amount: "",
      due_date: "",
      status: "pending",
      payment_method: "",
    });
    setEditingFee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || !formData.reference_month || !formData.amount || !formData.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const feeData = {
      user_id: formData.user_id,
      reference_month: formData.reference_month,
      reference_year: formData.reference_year,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      status: formData.status,
      payment_method: formData.payment_method || null,
      paid_at: formData.status === "paid" ? new Date().toISOString() : null,
    };

    if (editingFee) {
      const { error } = await supabase
        .from("condominium_fees")
        .update(feeData)
        .eq("id", editingFee.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a taxa.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Taxa atualizada com sucesso.",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchFees();
      }
    } else {
      const { error } = await supabase
        .from("condominium_fees")
        .insert([feeData]);

      if (error) {
        console.error("Error creating fee:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a taxa.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Taxa cadastrada com sucesso.",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchFees();
      }
    }
  };

  const handleEdit = (fee: CondominiumFee) => {
    setEditingFee(fee);
    setFormData({
      user_id: fee.user_id,
      reference_month: fee.reference_month,
      reference_year: fee.reference_year,
      amount: fee.amount.toString(),
      due_date: fee.due_date,
      status: fee.status,
      payment_method: fee.payment_method || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("condominium_fees")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a taxa.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Taxa excluída com sucesso.",
      });
      fetchFees();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const updateData: { status: string; paid_at?: string | null } = { 
      status: newStatus 
    };
    
    if (newStatus === "paid") {
      updateData.paid_at = new Date().toISOString();
    } else {
      updateData.paid_at = null;
    }

    const { error } = await supabase
      .from("condominium_fees")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
      fetchFees();
    }
  };

  const filteredFees = fees.filter((fee) => {
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const matchesUser = !searchUserId || fee.user_id.toLowerCase().includes(searchUserId.toLowerCase());
    return matchesStatus && matchesUser;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "overdue":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Taxas Condominiais
              </CardTitle>
              <CardDescription>
                Gerencie as taxas condominiais dos moradores
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Taxa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingFee ? "Editar Taxa" : "Cadastrar Taxa"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFee 
                      ? "Atualize os dados da taxa condominial"
                      : "Preencha os dados para cadastrar uma nova taxa"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="user_id">ID do Usuário *</Label>
                    <Input
                      id="user_id"
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      placeholder="UUID do morador"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilize o ID do usuário do sistema de autenticação
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference_month">Mês de Referência *</Label>
                      <Select
                        value={formData.reference_month}
                        onValueChange={(value) => setFormData({ ...formData, reference_month: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reference_year">Ano *</Label>
                      <Input
                        id="reference_year"
                        type="number"
                        value={formData.reference_year}
                        onChange={(e) => setFormData({ ...formData, reference_year: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Valor (MZN) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="due_date">Data de Vencimento *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment_method">Método de Pagamento</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="emola">e-Mola</SelectItem>
                        <SelectItem value="transfer">Transferência Bancária</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingFee ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID do usuário..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredFees.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma taxa encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>ID Usuário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">
                        {fee.reference_month}/{fee.reference_year}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">
                          {fee.user_id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-MZ", {
                          style: "currency",
                          currency: "MZN",
                        }).format(fee.amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(fee.due_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusBadge(fee.status)
                        )}>
                          {getStatusLabel(fee.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {fee.paid_at ? (
                          <div className="text-xs">
                            <p>{format(new Date(fee.paid_at), "dd/MM/yyyy")}</p>
                            {fee.payment_method && (
                              <p className="text-muted-foreground capitalize">
                                {fee.payment_method}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={fee.status}
                            onValueChange={(value) => handleUpdateStatus(fee.id, value)}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(fee)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(fee.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesManagement;
