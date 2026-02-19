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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, Trash2, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

const AdminsManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      // Get all admin roles
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin");

      if (error) throw error;

      if (!roles || roles.length === 0) {
        setAdmins([]);
        setIsLoading(false);
        return;
      }

      // Fetch emails via edge function
      const { data: fnData, error: fnError } = await supabase.functions.invoke("list-residents");
      
      if (fnError) throw fnError;

      const users = fnData?.users || [];
      const adminList: AdminUser[] = roles.map((role) => {
        const found = users.find((u: any) => u.id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          email: found?.email || "Email desconhecido",
          created_at: role.created_at,
        };
      });

      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os administradores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    setIsAdding(true);
    try {
      // Find user by email via edge function
      const { data: fnData, error: fnError } = await supabase.functions.invoke("list-residents");
      if (fnError) throw fnError;

      const users = fnData?.users || [];
      const targetUser = users.find((u: any) => u.email === newAdminEmail.trim());

      if (!targetUser) {
        toast({
          title: "Utilizador não encontrado",
          description: "Nenhum utilizador cadastrado com este email. O utilizador precisa criar uma conta primeiro.",
          variant: "destructive",
        });
        setIsAdding(false);
        return;
      }

      // Check if already admin
      const existing = admins.find((a) => a.user_id === targetUser.id);
      if (existing) {
        toast({
          title: "Já é administrador",
          description: "Este utilizador já possui o papel de administrador.",
          variant: "destructive",
        });
        setIsAdding(false);
        return;
      }

      // Insert admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUser.id, role: "admin" });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${newAdminEmail} foi adicionado como administrador.`,
      });
      setNewAdminEmail("");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o administrador.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, adminUserId: string) => {
    if (adminUserId === user?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode remover a si mesmo como administrador.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Administrador removido com sucesso.",
      });
      fetchAdmins();
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o administrador.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Adicionar Administrador
          </CardTitle>
          <CardDescription>
            Adicione um novo administrador pelo email. O utilizador deve ter uma conta criada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="admin-email" className="sr-only">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Email do novo administrador"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
              />
            </div>
            <Button onClick={handleAddAdmin} disabled={isAdding || !newAdminEmail.trim()}>
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Administradores ({admins.length})</CardTitle>
          <CardDescription>Lista de todos os administradores do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum administrador encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.email}
                      {admin.user_id === user?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {admin.user_id !== user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover {admin.email} como administrador? 
                                Esta ação pode ser revertida adicionando novamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsManagement;
