import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Search, Loader2, UserX, UserCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface ApprovedResident {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  block: string;
  building: string;
  apartment: string;
  resident_type: string;
  created_at: string;
  status: string;
}

const ResidentsManagement = () => {
  const [residents, setResidents] = useState<ApprovedResident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<{ resident: ApprovedResident; action: "deactivate" | "reactivate" | "remove" } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const moradorId = (r: ApprovedResident) => {
    const b = String(r.block || "").replace(/\D/g, "");
    const e = String(r.building || "").replace(/\D/g, "");
    const a = String(r.apartment || "").replace(/\D/g, "");
    return `${parseInt(b || "0", 10)}${parseInt(e || "0", 10)}${parseInt(a || "0", 10)}`;
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .in("status", ["approved", "deactivated"])
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching residents:", error);
    } else {
      setResidents(data || []);
    }
    setIsLoading(false);
  };

  const filtered = residents.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      r.full_name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      (r.phone || "").toLowerCase().includes(term) ||
      r.block.toLowerCase().includes(term) ||
      r.building.toLowerCase().includes(term) ||
      r.apartment.toLowerCase().includes(term) ||
      moradorId(r).includes(term.replace(/\D/g, ""))
    );
  });

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const { resident, action } = confirmTarget;
    setProcessingId(resident.id);
    try {
      if (action === "remove") {
        const { error } = await supabase.from("access_requests").delete().eq("id", resident.id);
        if (error) throw error;
        toast.success("Morador removido com sucesso");
      } else {
        const { data, error } = await supabase.functions.invoke("toggle-resident-status", {
          body: { request_id: resident.id, action },
        });
        if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
        toast.success(action === "deactivate" ? "Morador desativado com sucesso" : "Morador reativado com sucesso");
      }
      setConfirmTarget(null);
      await fetchResidents();
    } catch (e: any) {
      toast.error(e.message || "Erro ao processar pedido");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = residents.filter((r) => r.status === "approved").length;
  const inactiveCount = residents.filter((r) => r.status === "deactivated").length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Moradores ({residents.length})
              </CardTitle>
              <CardDescription>
                {activeCount} ativos · {inactiveCount} desativados
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar morador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum morador encontrado para esta pesquisa." : "Nenhum morador aprovado ainda."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Morador</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Bloco</TableHead>
                    <TableHead>Edifício</TableHead>
                    <TableHead>Apartamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data de Registo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((resident) => {
                    const isInactive = resident.status === "deactivated";
                    return (
                      <TableRow key={resident.id} className={isInactive ? "opacity-60" : ""}>
                        <TableCell className="font-mono font-semibold text-primary">{moradorId(resident)}</TableCell>
                        <TableCell className="font-medium">{resident.full_name}</TableCell>
                        <TableCell>{resident.phone}</TableCell>
                        <TableCell>{resident.email}</TableCell>
                        <TableCell>{resident.block}</TableCell>
                        <TableCell>{resident.building}</TableCell>
                        <TableCell>{resident.apartment}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {resident.resident_type === "owner" ? "Proprietário" :
                             resident.resident_type === "tenant" ? "Inquilino" : resident.resident_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isInactive ? (
                            <Badge variant="destructive">Desativado</Badge>
                          ) : (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30">Ativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(resident.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isInactive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === resident.id}
                                onClick={() => setConfirmTarget({ resident, action: "reactivate" })}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Reativar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === resident.id}
                                onClick={() => setConfirmTarget({ resident, action: "deactivate" })}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Desativar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingId === resident.id}
                              onClick={() => setConfirmTarget({ resident, action: "remove" })}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.action === "deactivate" ? "Desativar morador?" :
               confirmTarget?.action === "reactivate" ? "Reativar morador?" : "Remover morador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget?.action === "deactivate" ? (
                <>Tem certeza que deseja desativar <strong>{confirmTarget?.resident.full_name}</strong>? O morador deixará de poder iniciar sessão. Os dados são preservados.</>
              ) : confirmTarget?.action === "reactivate" ? (
                <>Reativar <strong>{confirmTarget?.resident.full_name}</strong>? O morador voltará a poder aceder ao sistema.</>
              ) : (
                <>Esta ação <strong>removerá permanentemente</strong> o registo de <strong>{confirmTarget?.resident.full_name}</strong>. Esta operação não pode ser revertida.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={!!processingId}>
              {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ResidentsManagement;
