import { 
  Building2, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Store,
  Check,
  X,
  Eye,
  Newspaper
} from "lucide-react";
import NewsManagement from "@/components/admin/NewsManagement";
import DocumentsManagement from "@/components/admin/DocumentsManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Reservation {
  id: string;
  user_id: string;
  area_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  created_at: string;
  common_areas?: {
    name: string;
  };
}

interface MarketplaceService {
  id: string;
  owner_name: string;
  business_name: string;
  category: string;
  phone: string;
  email: string;
  location: string | null;
  description: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

interface Stats {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  pendingReservations: number;
  totalAreas: number;
  reservationsThisMonth: number;
  pendingServices: number;
  approvedServices: number;
}

const AdminDashboard = () => {
  const { user, session, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    pendingReservations: 0,
    totalAreas: 0,
    reservationsThisMonth: 0,
    pendingServices: 0,
    approvedServices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive",
        });
        navigate("/area-morador");
      } else {
        fetchData();
      }
    }
  }, [authLoading, session, isAdmin, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchReservations(), fetchServices(), fetchStats()]);
    setIsLoading(false);
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*, common_areas(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reservations:", error);
    } else {
      setReservations(data || []);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("marketplace_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching services:", error);
    } else {
      setServices(data || []);
    }
  };

  const fetchStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all reservations for stats
    const { data: allReservations } = await supabase
      .from("reservations")
      .select("status, created_at");

    // Fetch areas count
    const { count: areasCount } = await supabase
      .from("common_areas")
      .select("*", { count: "exact", head: true });

    // Fetch services stats
    const { data: allServices } = await supabase
      .from("marketplace_services")
      .select("status");

    const pendingServices = allServices?.filter(s => s.status === 'pending').length || 0;
    const approvedServices = allServices?.filter(s => s.status === 'approved').length || 0;

    if (allReservations) {
      const thisMonth = allReservations.filter(
        (r) => new Date(r.created_at) >= startOfMonth
      );

      setStats({
        totalReservations: allReservations.length,
        confirmedReservations: allReservations.filter((r) => r.status === "confirmed").length,
        cancelledReservations: allReservations.filter((r) => r.status === "cancelled").length,
        pendingReservations: allReservations.filter((r) => r.status === "pending").length,
        totalAreas: areasCount || 0,
        reservationsThisMonth: thisMonth.length,
        pendingServices,
        approvedServices,
      });
    }
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", reservationId);

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
      fetchData();
    }
  };

  const handleUpdateServiceStatus = async (serviceId: string, newStatus: string) => {
    const { error } = await supabase
      .from("marketplace_services")
      .update({ status: newStatus })
      .eq("id", serviceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do serviço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: newStatus === 'approved' ? "Serviço aprovado!" : "Status atualizado.",
      });
      fetchData();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const { error } = await supabase
      .from("marketplace_services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Serviço excluído.",
      });
      fetchData();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const filteredReservations = statusFilter === "all" 
    ? reservations 
    : reservations.filter((r) => r.status === statusFilter);

  const filteredServices = serviceFilter === "all"
    ? services
    : services.filter((s) => s.status === serviceFilter);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Calendar, label: "Reservas", path: "/admin/reservas" },
    { icon: Store, label: "Marketplace", path: "/admin/marketplace" },
    { icon: Users, label: "Moradores", path: "/admin/moradores" },
    { icon: FileText, label: "Documentos", path: "/admin/documentos" },
    { icon: Bell, label: "Avisos", path: "/admin/avisos" },
    { icon: Settings, label: "Configurações", path: "/admin/config" },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground">Síndico</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn("w-full mt-3", sidebarCollapsed && "px-0")}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie o condomínio Vila Olímpica</p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Reservas</CardDescription>
                <CardTitle className="text-3xl">{stats.totalReservations}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.reservationsThisMonth} este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Confirmadas</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.confirmedReservations}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {((stats.confirmedReservations / (stats.totalReservations || 1)) * 100).toFixed(0)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Canceladas</CardDescription>
                <CardTitle className="text-3xl text-red-600">{stats.cancelledReservations}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {((stats.cancelledReservations / (stats.totalReservations || 1)) * 100).toFixed(0)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Serviços Pendentes</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{stats.pendingServices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.approvedServices} aprovados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="reservations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="reservations">Reservas</TabsTrigger>
              <TabsTrigger value="services">
                Marketplace
                {stats.pendingServices > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                    {stats.pendingServices}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="news">
                <Newspaper className="w-4 h-4 mr-1" />
                Notícias
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-1" />
                Documentos
              </TabsTrigger>
            </TabsList>

            {/* Reservations Tab */}
            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reservas Recentes</CardTitle>
                      <CardDescription>Gerencie todas as reservas do condomínio</CardDescription>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="confirmed">Confirmadas</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Área</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.slice(0, 10).map((reservation) => (
                          <TableRow key={reservation.id}>
                            <TableCell className="font-medium">
                              {reservation.common_areas?.name}
                            </TableCell>
                            <TableCell>
                              {format(new Date(reservation.reservation_date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>
                              {reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)}
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                reservation.status === "confirmed"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : reservation.status === "cancelled"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              )}>
                                {reservation.status === "confirmed" ? "Confirmada" :
                                 reservation.status === "cancelled" ? "Cancelada" : "Pendente"}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(reservation.created_at), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={reservation.status}
                                onValueChange={(value) => handleUpdateStatus(reservation.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="confirmed">Confirmar</SelectItem>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="cancelled">Cancelar</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketplace Services Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Serviços do Marketplace</CardTitle>
                      <CardDescription>Aprove ou rejeite serviços cadastrados</CardDescription>
                    </div>
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="approved">Aprovados</SelectItem>
                        <SelectItem value="rejected">Rejeitados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum serviço encontrado.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Negócio</TableHead>
                          <TableHead>Proprietário</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredServices.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {service.image_url && (
                                  <img
                                    src={service.image_url}
                                    alt={service.business_name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{service.business_name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{service.owner_name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-secondary rounded text-xs">
                                {service.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p>{service.phone}</p>
                                <p className="text-muted-foreground">{service.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                service.status === "approved"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : service.status === "rejected"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              )}>
                                {service.status === "approved" ? "Aprovado" :
                                 service.status === "rejected" ? "Rejeitado" : "Pendente"}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(service.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {service.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleUpdateServiceStatus(service.id, 'approved')}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleUpdateServiceStatus(service.id, 'rejected')}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news">
              <NewsManagement />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <DocumentsManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
