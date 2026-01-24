import { Phone, ExternalLink, Store, ShoppingBag, Utensils, Truck, Scissors, Sprout, MapPin, Star, Clock, MessageCircle, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import EntrepreneurDetailsDialog from "@/components/EntrepreneurDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import empreendedor1 from "@/assets/empreendedor-1.jpg";
import empreendedor2 from "@/assets/empreendedor-2.jpg";
import empreendedor3 from "@/assets/empreendedor-3.jpg";
import empreendedor4 from "@/assets/empreendedor-4.jpg";
import empreendedor5 from "@/assets/empreendedor-5.jpg";
import empreendedor6 from "@/assets/empreendedor-6.webp";

interface MarketplaceService {
  id: string;
  business_name: string;
  owner_name: string;
  category: string;
  description: string;
  full_description: string | null;
  image_url: string | null;
  phone: string;
  email: string;
  location: string | null;
  hours: string | null;
  isExample?: boolean;
}

// Dados de exemplo para exibição inicial
const exampleServices: MarketplaceService[] = [
  {
    id: "example-1",
    owner_name: "Amina Mutemba",
    business_name: "Vendedora de Produtos Frescos",
    category: "Alimentação",
    description: "Frutas e vegetais frescos diariamente. Apoie o comércio local!",
    full_description: "Oferecemos uma variedade de frutas e vegetais frescos cultivados localmente. Entregas ao domicílio dentro do condomínio. Qualidade garantida todos os dias.",
    image_url: empreendedor1,
    phone: "+258 84 123 4567",
    email: "amina.mutemba@gmail.com",
    location: "Vila Olímpica - Zimpeto",
    hours: "06:00 - 18:00",
    isExample: true,
  },
  {
    id: "example-2",
    owner_name: "Carlos Mahumane",
    business_name: "Mini-Mercado",
    category: "Comércio",
    description: "Produtos essenciais para o dia a dia, sempre à disposição.",
    full_description: "Mini-mercado completo com produtos de primeira necessidade, bebidas, snacks e muito mais. Aberto todos os dias para sua conveniência.",
    image_url: empreendedor2,
    phone: "+258 82 234 5678",
    email: "minimercado.carlos@outlook.com",
    location: "Bloco 15 - Vila Olímpica",
    hours: "07:00 - 22:00",
    isExample: true,
  },
  {
    id: "example-3",
    owner_name: "Beatriz Nhachungue",
    business_name: "Espaço de Coworking",
    category: "Serviços",
    description: "Ambiente profissional para trabalhar e realizar reuniões.",
    full_description: "Espaço de trabalho compartilhado com internet de alta velocidade, salas de reunião e ambiente climatizado. Ideal para freelancers e pequenas equipas.",
    image_url: empreendedor3,
    phone: "+258 87 345 6789",
    email: "beatriz.coworking@gmail.com",
    location: "Vila Olímpica - Zona Central",
    hours: "08:00 - 20:00",
    isExample: true,
  },
  {
    id: "example-4",
    owner_name: "Nádia Cossa",
    business_name: "Atelier de Moda",
    category: "Moda",
    description: "Criação e confecção de roupas sob medida e exclusivas.",
    full_description: "Atelier especializado em moda africana contemporânea. Criamos peças únicas e sob medida para todas as ocasiões. Capulanas, vestidos, fatos e muito mais.",
    image_url: empreendedor4,
    phone: "+258 85 456 7890",
    email: "nadia.atelier@gmail.com",
    location: "Bloco 22 - Vila Olímpica",
    hours: "09:00 - 18:00",
    isExample: true,
  },
  {
    id: "example-5",
    owner_name: "José Machel",
    business_name: "Transporte e Logística",
    category: "Transporte",
    description: "Serviços de transporte confiável e mudanças em Maputo.",
    full_description: "Serviços de transporte de carga e mudanças em toda a região de Maputo. Veículos seguros e equipa profissional. Orçamento gratuito.",
    image_url: empreendedor5,
    phone: "+258 86 567 8901",
    email: "jose.transporte@hotmail.com",
    location: "Vila Olímpica - Zimpeto",
    hours: "06:00 - 20:00",
    isExample: true,
  },
  {
    id: "example-6",
    owner_name: "Fernando Sitoe",
    business_name: "Produtos Agrícolas",
    category: "Agricultura",
    description: "Produtos frescos direto da machamba para sua mesa.",
    full_description: "Produtos agrícolas frescos e orgânicos, cultivados com dedicação. Oferecemos entregas ao domicílio dentro do condomínio. Variedade de frutas, vegetais e legumes da época.",
    image_url: empreendedor6,
    phone: "+258 84 678 9012",
    email: "fernando.agricultura@gmail.com",
    location: "Vila Olímpica - Zimpeto, Maputo",
    hours: "05:00 - 17:00",
    isExample: true,
  },
];

const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dbServices, setDbServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Todos", icon: Store },
    { name: "Alimentação", icon: Utensils },
    { name: "Comércio", icon: ShoppingBag },
    { name: "Serviços", icon: Store },
    { name: "Moda", icon: Scissors },
    { name: "Transporte", icon: Truck },
    { name: "Agricultura", icon: Sprout },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_services')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combinar serviços do banco de dados com exemplos
  const allServices = [...dbServices, ...exampleServices];

  const filteredServices = selectedCategory === "Todos"
    ? allServices
    : allServices.filter((s) => s.category === selectedCategory);

  const handleViewDetails = (service: MarketplaceService) => {
    setSelectedEntrepreneur({
      id: service.id,
      name: service.owner_name,
      service: service.business_name,
      category: service.category,
      description: service.description,
      fullDescription: service.full_description,
      image: service.image_url || '/placeholder.svg',
      phone: service.phone,
      email: service.email,
      location: service.location,
      hours: service.hours,
    });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-accent to-accent-glow text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent-foreground/80 font-semibold text-sm uppercase tracking-wider">Empreendedores Locais</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Marketplace da Vila</h1>
            <p className="text-xl text-accent-foreground/90 max-w-2xl mx-auto">
              Conecte-se com profissionais talentosos que fazem parte da nossa comunidade. Apoie os negócios locais!
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-secondary/50 border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredServices.length}</span> negócios
              {selectedCategory !== "Todos" && ` em ${selectedCategory}`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <Store className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory !== "Todos" 
                  ? `Não há serviços aprovados na categoria "${selectedCategory}".`
                  : "Ainda não há serviços aprovados no marketplace."}
              </p>
              <Link to="/marketplace/cadastrar">
                <Button>
                  <Store className="w-4 h-4 mr-2" />
                  Seja o primeiro a cadastrar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-card rounded-xl border border-border hover:shadow-elegant transition-all group overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image_url || '/placeholder.svg'}
                      alt={service.business_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1">{service.owner_name}</h3>
                    <p className="text-accent font-semibold text-sm mb-2">{service.business_name}</p>
                    
                    {service.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>{service.location}</span>
                      </div>
                    )}

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {service.hours && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <Clock className="w-3 h-3" />
                        <span>{service.hours}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(service)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => window.open(`https://wa.me/${service.phone.replace(/\s/g, '').replace('+', '')}`, '_blank')}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Divulgue Seu Negócio</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Você é morador e tem um negócio ou serviço? Anuncie aqui!
          </p>
          <Link to="/marketplace/cadastrar">
            <Button variant="default">
              <Store className="w-4 h-4 mr-2" />
              Cadastrar Meu Serviço
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold text-center mb-6 text-foreground">Explore Outras Áreas</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
            </Link>
            <Link to="/imoveis">
              <Button variant="outline" size="sm">
                Imóveis
              </Button>
            </Link>
            <Link to="/reservas">
              <Button variant="outline" size="sm">
                Reservas
              </Button>
            </Link>
            <Link to="/noticias">
              <Button variant="outline" size="sm">
                Notícias
              </Button>
            </Link>
            <Link to="/transparencia">
              <Button variant="outline" size="sm">
                Transparência
              </Button>
            </Link>
            <Link to="/sobre">
              <Button variant="outline" size="sm">
                Sobre
              </Button>
            </Link>
            <Link to="/contacto">
              <Button variant="outline" size="sm">
                Contacto
              </Button>
            </Link>
            <Link to="/area-morador">
              <Button variant="outline" size="sm">
                Área do Morador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de Detalhes */}
      <EntrepreneurDetailsDialog
        entrepreneur={selectedEntrepreneur}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default MarketplacePage;
