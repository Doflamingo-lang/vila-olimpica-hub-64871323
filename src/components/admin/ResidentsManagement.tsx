import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .eq("status", "approved")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching residents:", error);
    } else {
      setResidents(data || []);
    }
    setIsLoading(false);
  };

  const filtered = residents.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.block.toLowerCase().includes(term) ||
      r.building.toLowerCase().includes(term) ||
      r.apartment.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Moradores ({residents.length})
            </CardTitle>
            <CardDescription>Lista de todos os moradores aprovados com os seus dados</CardDescription>
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
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Bloco</TableHead>
                  <TableHead>Edifício</TableHead>
                  <TableHead>Apartamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Registo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.full_name}</TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell>{resident.phone}</TableCell>
                    <TableCell>{resident.block}</TableCell>
                    <TableCell>{resident.building}</TableCell>
                    <TableCell>{resident.apartment}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {resident.resident_type === "owner" ? "Proprietário" :
                         resident.resident_type === "tenant" ? "Inquilino" : resident.resident_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(resident.created_at), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentsManagement;
