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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Receipt, Loader2, Trash2, Edit2, Search, Users, User, Eye, FileText, AlertTriangle, Image, Download, Mail, History, Clock } from "lucide-react";
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
  receipt_url: string | null;
  created_at: string;
}

interface Resident {
  id: string;
  email: string;
  created_at: string;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const FeesManagement = () => {
  const [fees, setFees] = useState<CondominiumFee[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResidents, setIsLoadingResidents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<CondominiumFee | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchUserId, setSearchUserId] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptIsPdf, setReceiptIsPdf] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<Array<{
    id: string;
    user_id: string;
    email: string;
    notification_type: string;
    fees_count: number;
    total_amount: number;
    sent_by: string;
    created_at: string;
  }>>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    user_id: "",
    reference_months: [] as string[],
    reference_year: new Date().getFullYear(),
    amount: "",
    due_date: "",
    status: "pending",
    payment_method: "",
  });

  useEffect(() => {
    fetchFees();
    fetchResidents();
    fetchNotificationLogs();
  }, []);

  const fetchNotificationLogs = async () => {
    const { data, error } = await supabase
      .from("notification_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setNotificationLogs(data as typeof notificationLogs);
    }
  };

  const fetchResidents = async () => {
    setIsLoadingResidents(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-residents");
      if (error) throw error;
      setResidents(data.residents || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
    } finally {
      setIsLoadingResidents(false);
    }
  };

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
      reference_months: [],
      reference_year: new Date().getFullYear(),
      amount: "",
      due_date: "",
      status: "pending",
      payment_method: "",
    });
    setEditingFee(null);
    setSendToAll(false);
  };

  const sendFeeNotification = async (
    emails: string[],
    feeData: { reference_month: string; reference_year: number; amount: number; due_date: string }
  ) => {
    try {
      const { error } = await supabase.functions.invoke("send-fee-notification", {
        body: {
          emails,
          referenceMonth: feeData.reference_month,
          referenceYear: feeData.reference_year,
          amount: feeData.amount,
          dueDate: feeData.due_date,
        },
      });
      if (error) throw error;
      toast({ title: "Notificação", description: `Email enviado para ${emails.length} morador(es).` });
    } catch (err) {
      console.error("Error sending fee notification:", err);
      toast({
        title: "Aviso",
        description: "Taxa criada, mas não foi possível enviar a notificação por email.",
        variant: "destructive",
      });
    }
  };

  const getResidentEmail = (userId: string) => {
    const resident = residents.find((r) => r.id === userId);
    return resident?.email || userId.slice(0, 8) + "...";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedMonths = editingFee ? [formData.reference_months[0]] : formData.reference_months;

    if (!selectedMonths.length || !formData.amount || !formData.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!sendToAll && !formData.user_id && !editingFee) {
      toast({
        title: "Erro",
        description: "Selecione um morador ou ative 'Enviar para todos'.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const buildFeeData = (month: string) => ({
      reference_month: month,
      reference_year: formData.reference_year,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      status: formData.status,
      payment_method: formData.payment_method || null,
      paid_at: formData.status === "paid" ? new Date().toISOString() : null,
    });

    if (editingFee) {
      const feeData = buildFeeData(selectedMonths[0]);
      const { error } = await supabase
        .from("condominium_fees")
        .update({ ...feeData, user_id: formData.user_id })
        .eq("id", editingFee.id);

      if (error) {
        toast({ title: "Erro", description: "Não foi possível atualizar a taxa.", variant: "destructive" });
      } else {
        toast({ title: "Sucesso", description: "Taxa atualizada com sucesso." });
        setIsDialogOpen(false);
        resetForm();
        fetchFees();
      }
    } else if (sendToAll) {
      // Create fee for all residents × all selected months
      const feesToInsert = selectedMonths.flatMap((month) =>
        residents.map((r) => ({
          ...buildFeeData(month),
          user_id: r.id,
        }))
      );

      if (feesToInsert.length === 0) {
        toast({ title: "Erro", description: "Nenhum morador cadastrado.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("condominium_fees")
        .insert(feesToInsert);

      if (error) {
        console.error("Error creating fees:", error);
        toast({ title: "Erro", description: "Não foi possível criar as taxas.", variant: "destructive" });
      } else {
        toast({
          title: "Sucesso",
          description: `${selectedMonths.length} taxa(s) enviada(s) para ${residents.length} moradores.`,
        });
        const emails = residents.map((r) => r.email);
        sendFeeNotification(emails, buildFeeData(selectedMonths[0]));
        setIsDialogOpen(false);
        resetForm();
        fetchFees();
      }
    } else {
      // Single resident, multiple months
      const feesToInsert = selectedMonths.map((month) => ({
        ...buildFeeData(month),
        user_id: formData.user_id,
      }));

      const { error } = await supabase
        .from("condominium_fees")
        .insert(feesToInsert);

      if (error) {
        console.error("Error creating fee:", error);
        toast({ title: "Erro", description: "Não foi possível criar a taxa.", variant: "destructive" });
      } else {
        toast({ title: "Sucesso", description: `${selectedMonths.length} taxa(s) cadastrada(s) com sucesso.` });
        const resident = residents.find((r) => r.id === formData.user_id);
        if (resident) {
          sendFeeNotification([resident.email], buildFeeData(selectedMonths[0]));
        }
        setIsDialogOpen(false);
        resetForm();
        fetchFees();
      }
    }
    setIsSubmitting(false);
  };

  const handleEdit = (fee: CondominiumFee) => {
    setEditingFee(fee);
    setSendToAll(false);
    setFormData({
      user_id: fee.user_id,
      reference_months: [fee.reference_month],
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
      toast({ title: "Erro", description: "Não foi possível excluir a taxa.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Taxa excluída com sucesso." });
      fetchFees();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const updateData: { status: string; paid_at?: string | null } = { status: newStatus };
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
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Status atualizado com sucesso." });
      fetchFees();
    }
  };

  const filteredFees = fees.filter((fee) => {
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const residentEmail = getResidentEmail(fee.user_id).toLowerCase();
    const matchesUser = !searchUserId || 
      fee.user_id.toLowerCase().includes(searchUserId.toLowerCase()) ||
      residentEmail.includes(searchUserId.toLowerCase());
    return matchesStatus && matchesUser;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "pending_verification": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "overdue": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "pending": return "Pendente";
      case "pending_verification": return "Em Verificação";
      case "overdue": return "Atrasado";
      default: return status;
    }
  };

  const handleViewReceipt = async (fee: CondominiumFee) => {
    if (!fee.receipt_url) {
      toast({ title: "Sem comprovativo", description: "Esta taxa não possui comprovativo anexado.", variant: "destructive" });
      return;
    }
    setReceiptLoading(true);
    setReceiptDialogOpen(true);
    setReceiptUrl(null);
    setReceiptIsPdf(fee.receipt_url.toLowerCase().endsWith(".pdf"));

    const { data } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(fee.receipt_url, 300);

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const receipts = fees.filter((f) => f.receipt_url);
  const defaulters = fees.filter((f) => f.status === "overdue" || (f.status === "pending" && new Date(f.due_date) < new Date()));

  const exportDefaultersPDF = () => {
    const sortedDefaulters = [...defaulters].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    const totalAmount = sortedDefaulters.reduce((sum, f) => sum + Number(f.amount), 0);
    const formatCurrency = (v: number) => new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v);
    
    const rows = sortedDefaulters.map((fee) => {
      const daysOverdue = Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24));
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${getResidentEmail(fee.user_id)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${fee.reference_month}/${fee.reference_year}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;">${formatCurrency(Number(fee.amount))}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;">${format(new Date(fee.due_date), "dd/MM/yyyy")}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;color:#dc2626;font-weight:600;">${daysOverdue} dias</td>
        </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Relatório de Inadimplência</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,sans-serif;padding:30px;background:#fff}
      .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #1a365d;padding-bottom:20px}
      .header h1{font-size:20px;color:#1a365d}
      .header p{font-size:13px;color:#6b7280;margin-top:4px}
      .summary{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px;display:flex;justify-content:space-between}
      .summary div{text-align:center}.summary .label{font-size:12px;color:#6b7280}.summary .val{font-size:18px;font-weight:700;color:#dc2626}
      table{width:100%;border-collapse:collapse}
      th{padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb}
      .footer{margin-top:30px;text-align:center;font-size:11px;color:#9ca3af}
      @media print{body{padding:15px}.summary{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
    </head><body>
      <div class="header"><h1>Vila Olímpica — Condomínio Residencial</h1><p>Relatório de Inadimplência — ${format(new Date(), "dd/MM/yyyy")}</p></div>
      <div class="summary">
        <div><span class="label">Total de Taxas em Atraso</span><br><span class="val">${sortedDefaulters.length}</span></div>
        <div><span class="label">Valor Total em Dívida</span><br><span class="val">${formatCurrency(totalAmount)}</span></div>
        <div><span class="label">Moradores Afectados</span><br><span class="val">${new Set(sortedDefaulters.map(f => f.user_id)).size}</span></div>
      </div>
      <table><thead><tr>
        <th>Morador</th><th>Referência</th><th style="text-align:right">Valor</th><th style="text-align:center">Vencimento</th><th style="text-align:center">Atraso</th>
      </tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2" style="padding:12px 8px;font-weight:700;border-top:2px solid #e5e7eb">Total</td>
        <td style="padding:12px 8px;text-align:right;font-weight:700;font-size:16px;color:#dc2626;border-top:2px solid #e5e7eb">${formatCurrency(totalAmount)}</td>
        <td colspan="2" style="border-top:2px solid #e5e7eb"></td></tr></tfoot></table>
      <div class="footer"><p>Documento gerado automaticamente em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p></div>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleNotifyDefaulters = async () => {
    if (defaulters.length === 0) return;
    setIsNotifying(true);
    
    const overdueFees = defaulters.map((fee) => ({
      email: getResidentEmail(fee.user_id),
      referenceMonth: fee.reference_month,
      referenceYear: fee.reference_year,
      amount: Number(fee.amount),
      dueDate: format(new Date(fee.due_date), "dd/MM/yyyy"),
      daysOverdue: Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    try {
      const { data, error } = await supabase.functions.invoke("send-overdue-notification", {
        body: { overdueFees },
      });
      if (error) throw error;

      // Log notifications per resident
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const grouped: Record<string, typeof overdueFees> = {};
        for (const fee of overdueFees) {
          if (!grouped[fee.email]) grouped[fee.email] = [];
          grouped[fee.email].push(fee);
        }
        const logs = Object.entries(grouped).map(([email, fees]) => {
          const matchingFee = defaulters.find(d => getResidentEmail(d.user_id) === email);
          return {
            user_id: matchingFee?.user_id || currentUser.id,
            email,
            notification_type: "overdue",
            fees_count: fees.length,
            total_amount: fees.reduce((s, f) => s + f.amount, 0),
            sent_by: currentUser.id,
          };
        });
        await supabase.from("notification_logs").insert(logs);
        fetchNotificationLogs();
      }

      toast({
        title: "Notificações enviadas",
        description: `${data?.sent || 0} morador(es) notificado(s) com sucesso.`,
      });
    } catch (err) {
      console.error("Error sending overdue notifications:", err);
      toast({
        title: "Erro",
        description: "Não foi possível enviar as notificações.",
        variant: "destructive",
      });
    }
    setIsNotifying(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="fees">
            <Receipt className="w-4 h-4 mr-2" />
            Taxas
          </TabsTrigger>
          <TabsTrigger value="receipts">
            <Image className="w-4 h-4 mr-2" />
            Comprovativos
          </TabsTrigger>
          <TabsTrigger value="defaulters">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Inadimplência
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB: TAXAS ===== */}
        <TabsContent value="fees">
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
              <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                <DialogHeader>
                  <DialogTitle>
                    {editingFee ? "Editar Taxa" : "Cadastrar Taxa"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFee 
                      ? "Atualize os dados da taxa condominial"
                      : "Preencha os dados e escolha enviar para todos ou para um morador específico"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary/60" style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--primary) / 0.4) hsl(var(--muted) / 0.3)' }}>
                  {!editingFee && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-2">
                        {sendToAll ? <Users className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-primary" />}
                        <div>
                          <p className="text-sm font-medium">{sendToAll ? "Enviar para todos os moradores" : "Morador específico"}</p>
                          <p className="text-xs text-muted-foreground">{sendToAll ? `${residents.length} moradores cadastrados` : "Selecione um morador abaixo"}</p>
                        </div>
                      </div>
                      <Switch checked={sendToAll} onCheckedChange={setSendToAll} />
                    </div>
                  )}
                  {(!sendToAll || editingFee) && (
                    <div>
                      <Label htmlFor="user_id">Morador *</Label>
                      {isLoadingResidents ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Carregando moradores...</span>
                        </div>
                      ) : residents.length > 0 ? (
                        <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                          <SelectTrigger><SelectValue placeholder="Selecione um morador" /></SelectTrigger>
                          <SelectContent>
                            {residents.map((resident) => (
                              <SelectItem key={resident.id} value={resident.id}>{resident.email}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div>
                          <Input id="user_id" value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} placeholder="UUID do morador" required={!sendToAll} />
                          <p className="text-xs text-muted-foreground mt-1">Nenhum morador encontrado. Insira o ID manualmente.</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <Label>Ano *</Label>
                    <Input type="number" value={formData.reference_year} onChange={(e) => setFormData({ ...formData, reference_year: parseInt(e.target.value) })} required />
                  </div>
                  <div>
                    <Label>{editingFee ? "Mês de Referência *" : "Meses de Referência * (selecione um ou mais)"}</Label>
                    {editingFee ? (
                      <Select value={formData.reference_months[0] || ""} onValueChange={(value) => setFormData({ ...formData, reference_months: [value] })}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (<SelectItem key={month} value={month}>{month}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 mt-2 p-3 border rounded-lg max-h-[200px] overflow-y-auto">
                        {months.map((month) => (
                          <label key={month} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-muted/50 rounded px-2 py-1.5">
                            <Checkbox
                              checked={formData.reference_months.includes(month)}
                              onCheckedChange={(checked) => {
                                const updated = checked ? [...formData.reference_months, month] : formData.reference_months.filter((m) => m !== month);
                                setFormData({ ...formData, reference_months: updated });
                              }}
                            />
                            {month}
                          </label>
                        ))}
                      </div>
                    )}
                    {!editingFee && formData.reference_months.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{formData.reference_months.length} mês(es) selecionado(s)</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor (MZN) *</Label>
                    <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Data de Vencimento *</Label>
                    <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_method">Método de Pagamento</Label>
                    <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="emola">e-Mola</SelectItem>
                        <SelectItem value="card">Cartão Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t mt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancelar</Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingFee ? "Atualizar" : sendToAll ? `Enviar para ${residents.length} moradores` : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por email ou ID do morador..." value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="pending_verification">Em Verificação</SelectItem>
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
                    <TableHead>Morador</TableHead>
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
                      <TableCell className="font-medium">{fee.reference_month}/{fee.reference_year}</TableCell>
                      <TableCell><span className="text-xs">{getResidentEmail(fee.user_id)}</span></TableCell>
                      <TableCell>{new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(fee.amount)}</TableCell>
                      <TableCell>{format(new Date(fee.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(fee.status))}>
                          {getStatusLabel(fee.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {fee.paid_at ? (
                          <div className="text-xs">
                            <p>{format(new Date(fee.paid_at), "dd/MM/yyyy")}</p>
                            {fee.payment_method && <p className="text-muted-foreground capitalize">{fee.payment_method === "bank_transfer" ? "Transf. Bancária" : fee.payment_method}</p>}
                          </div>
                        ) : fee.status === "pending_verification" ? (
                          <div className="text-xs">
                            <p className="text-blue-600 font-medium">Aguarda verificação</p>
                            {fee.payment_method && <p className="text-muted-foreground capitalize">{fee.payment_method === "bank_transfer" ? "Transf. Bancária" : fee.payment_method}</p>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {fee.status === "pending_verification" && fee.receipt_url && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleViewReceipt(fee)}>Ver Comprovativo</Button>
                          )}
                          <Select value={fee.status} onValueChange={(value) => handleUpdateStatus(fee.id, value)}>
                            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="pending_verification">Em Verificação</SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(fee)}><Edit2 className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(fee.id)}><Trash2 className="w-4 h-4" /></Button>
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
        </TabsContent>

        {/* ===== TAB: COMPROVATIVOS ===== */}
        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Comprovativos de Pagamento
              </CardTitle>
              <CardDescription>
                Lista de todos os comprovativos enviados pelos moradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum comprovativo enviado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead>Morador</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.reference_month}/{fee.reference_year}</TableCell>
                          <TableCell><span className="text-xs">{getResidentEmail(fee.user_id)}</span></TableCell>
                          <TableCell>{new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(fee.amount)}</TableCell>
                          <TableCell className="text-xs capitalize">{fee.payment_method === "bank_transfer" ? "Transf. Bancária" : fee.payment_method || "—"}</TableCell>
                          <TableCell>
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(fee.status))}>
                              {getStatusLabel(fee.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleViewReceipt(fee)}>
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                              {fee.status === "pending_verification" && (
                                <Button size="sm" className="h-8 text-xs" onClick={() => handleUpdateStatus(fee.id, "paid")}>
                                  Aprovar
                                </Button>
                              )}
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
        </TabsContent>

        {/* ===== TAB: INADIMPLÊNCIA ===== */}
        <TabsContent value="defaulters">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Lista de Inadimplência
                  </CardTitle>
                  <CardDescription>
                    Moradores com taxas pendentes ou vencidas
                  </CardDescription>
                </div>
                {defaulters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportDefaultersPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button size="sm" onClick={handleNotifyDefaulters} disabled={isNotifying} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      {isNotifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      Notificar Todos
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {defaulters.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma inadimplência registada. Todos os moradores estão em dia!</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      {defaulters.length} taxa(s) em atraso ou vencida(s) — Total: {new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(defaulters.reduce((sum, f) => sum + Number(f.amount), 0))}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Morador</TableHead>
                          <TableHead>Referência</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Dias em Atraso</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {defaulters
                          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                          .map((fee) => {
                            const daysOverdue = Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                              <TableRow key={fee.id}>
                                <TableCell><span className="text-xs font-medium">{getResidentEmail(fee.user_id)}</span></TableCell>
                                <TableCell className="font-medium">{fee.reference_month}/{fee.reference_year}</TableCell>
                                <TableCell>{new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(fee.amount)}</TableCell>
                                <TableCell>{format(new Date(fee.due_date), "dd/MM/yyyy")}</TableCell>
                                <TableCell>
                                  <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    daysOverdue > 60 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                    daysOverdue > 30 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                                    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  )}>
                                    {daysOverdue} dias
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Select value={fee.status} onValueChange={(value) => handleUpdateStatus(fee.id, value)}>
                                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="overdue">Atrasado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Preview Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Comprovativo de Pagamento
            </DialogTitle>
            <DialogDescription>
              Pré-visualização do comprovativo enviado pelo morador
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4 flex items-center justify-center min-h-[300px]">
            {receiptLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">A carregar comprovativo...</p>
              </div>
            ) : receiptUrl ? (
              <div className="w-full space-y-4">
                {receiptIsPdf ? (
                  <iframe src={receiptUrl} className="w-full h-[60vh] rounded-lg border border-border" title="Comprovativo PDF" />
                ) : (
                  <div className="flex justify-center">
                    <img src={receiptUrl} alt="Comprovativo de pagamento" className="max-w-full max-h-[60vh] rounded-lg border border-border object-contain" />
                  </div>
                )}
                <div className="flex justify-end">
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir em nova aba
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Não foi possível carregar o comprovativo.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesManagement;
