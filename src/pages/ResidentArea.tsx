import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  Bell, 
  Users, 
  Home,
  ArrowLeft,
  Download,
  AlertCircle,
  MessageCircle,
  LogOut,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const ResidentArea = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Até logo!",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const services = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Pagamentos",
      description: "Consulte e pague suas taxas condominiais online",
      status: "Em dia",
      statusColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Reservas",
      description: "Reserve áreas comuns como salão de festas e churrasqueira",
      action: "Fazer Reserva",
      link: "/reservas"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Documentos",
      description: "Acesse regulamentos, atas e documentos importantes",
      action: "Ver Documentos"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Avisos",
      description: "Fique por dentro das novidades e comunicados",
      badge: "3 novos"
    }
  ];

  const recentNotices = [
    {
      title: "Manutenção Programada",
      date: "15 Jan 2025",
      description: "Manutenção no sistema de água no dia 20/01"
    },
    {
      title: "Assembleia Geral",
      date: "10 Jan 2025",
      description: "Convocação para assembleia ordinária em 30/01"
    },
    {
      title: "Nova Área de Lazer",
      date: "05 Jan 2025",
      description: "Inauguração da nova área kids no próximo sábado"
    }
  ];

  const documents = [
    { name: "Regulamento Interno", date: "2025", icon: <FileText className="w-5 h-5" /> },
    { name: "Ata Última Assembleia", date: "Dez 2024", icon: <FileText className="w-5 h-5" /> },
    { name: "Convenção do Condomínio", date: "2024", icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Portal
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Área do Morador</h1>
              <p className="text-primary-foreground/80">
                {user?.email ? `Bem-vindo, ${user.email}` : "Bem-vindo ao seu portal personalizado"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Serviços Principais */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Serviços Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {service.status && (
                    <div className={`flex items-center gap-2 ${service.statusColor} font-semibold`}>
                      <AlertCircle className="w-4 h-4" />
                      {service.status}
                    </div>
                  )}
                  {service.action && service.link ? (
                    <Link to={service.link}>
                      <Button variant="outline" className="w-full mt-2">
                        {service.action}
                      </Button>
                    </Link>
                  ) : service.action ? (
                    <Button variant="outline" className="w-full mt-2">
                      {service.action}
                    </Button>
                  ) : null}
                  {service.badge && (
                    <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {service.badge}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avisos Recentes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Avisos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNotices.map((notice, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{notice.title}</h3>
                        <span className="text-xs text-muted-foreground">{notice.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notice.description}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Todos os Avisos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Documentos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {doc.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.date}</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contato Rápido */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Precisa falar com a administração?
                </p>
                <Button variant="default" className="w-full">
                  Abrir Chamado
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://wa.me/258843001234', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentArea;
