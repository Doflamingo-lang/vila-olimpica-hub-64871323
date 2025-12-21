import { Building2, ArrowLeft, Phone, Mail, ExternalLink, Store, ShoppingBag, Utensils, Truck, Scissors, Sprout, MapPin, Star, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import EntrepreneurDetailsDialog from "@/components/EntrepreneurDetailsDialog";
import empreendedor1 from "@/assets/empreendedor-1.jpg";
import empreendedor2 from "@/assets/empreendedor-2.jpg";
import empreendedor3 from "@/assets/empreendedor-3.jpg";
import empreendedor4 from "@/assets/empreendedor-4.jpg";
import empreendedor5 from "@/assets/empreendedor-5.jpg";
import empreendedor6 from "@/assets/empreendedor-6.webp";

const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = [
    { name: "Todos", icon: Store },
    { name: "Alimentação", icon: Utensils },
    { name: "Comércio", icon: ShoppingBag },
    { name: "Serviços", icon: Store },
    { name: "Moda", icon: Scissors },
    { name: "Transporte", icon: Truck },
    { name: "Agricultura", icon: Sprout },
  ];

  const entrepreneurs = [
    {
      id: 1,
      name: "Amina Mutemba",
      service: "Vendedora de Produtos Frescos",
      category: "Alimentação",
      description: "Frutas e vegetais frescos diariamente. Apoie o comércio local!",
      fullDescription: "Especialista em produtos frescos e orgânicos, trabalhando diretamente com produtores locais para garantir a melhor qualidade. Entrega ao domicílio disponível dentro do condomínio.",
      image: empreendedor1,
      phone: "+258 84 123 4567",
      email: "amina.mutemba@gmail.com",
      location: "Vila Olímpica - Bloco A",
      rating: 4.8,
      reviews: 45,
      hours: "Segunda a Sábado: 6h00 - 14h00",
    },
    {
      id: 2,
      name: "Carlos Mahumane",
      service: "Mini-Mercado Vila Express",
      category: "Comércio",
      description: "Produtos essenciais para o dia a dia, sempre à disposição.",
      fullDescription: "Mini-mercado completo com variedade de produtos alimentares, bebidas, produtos de limpeza e higiene pessoal. Aberto todos os dias para sua comodidade.",
      image: empreendedor2,
      phone: "+258 82 234 5678",
      email: "minimercado.carlos@outlook.com",
      location: "Vila Olímpica - Zona Comercial",
      rating: 4.6,
      reviews: 89,
      hours: "Todos os dias: 7h00 - 22h00",
    },
    {
      id: 3,
      name: "Beatriz Nhachungue",
      service: "Espaço de Coworking & Eventos",
      category: "Serviços",
      description: "Ambiente profissional para trabalhar e realizar reuniões.",
      fullDescription: "Espaço moderno equipado com internet de alta velocidade, salas de reunião, área de café e ambiente climatizado. Ideal para profissionais remotos e pequenas empresas.",
      image: empreendedor3,
      phone: "+258 87 345 6789",
      email: "beatriz.coworking@gmail.com",
      location: "Vila Olímpica - Bloco Comercial",
      rating: 4.9,
      reviews: 32,
      hours: "Segunda a Sexta: 8h00 - 20h00",
    },
    {
      id: 4,
      name: "Nádia Cossa",
      service: "Atelier de Moda Nádia",
      category: "Moda",
      description: "Criação e confecção de roupas sob medida e exclusivas.",
      fullDescription: "Atelier especializado em alta costura africana e ocidental. Criamos peças exclusivas para ocasiões especiais, vestidos de noiva e roupas do dia a dia com tecidos de primeira qualidade.",
      image: empreendedor4,
      phone: "+258 85 456 7890",
      email: "nadia.atelier@gmail.com",
      location: "Vila Olímpica - Bloco B",
      rating: 4.7,
      reviews: 67,
      hours: "Segunda a Sábado: 9h00 - 18h00",
    },
    {
      id: 5,
      name: "José Machel",
      service: "TransLog Moçambique",
      category: "Transporte",
      description: "Serviços de transporte confiável e mudanças em Maputo.",
      fullDescription: "Serviços completos de transporte e logística: mudanças residenciais e comerciais, entregas de mercadorias, transporte de móveis. Frota própria e equipe especializada.",
      image: empreendedor5,
      phone: "+258 86 567 8901",
      email: "jose.transporte@hotmail.com",
      location: "Vila Olímpica - Estacionamento",
      rating: 4.5,
      reviews: 78,
      hours: "Todos os dias: 6h00 - 20h00",
    },
    {
      id: 6,
      name: "Fernando Sitoe",
      service: "Horta Orgânica do Fernando",
      category: "Agricultura",
      description: "Produtos frescos direto da machamba para sua mesa.",
      fullDescription: "Produtos agrícolas 100% orgânicos, cultivados sem pesticidas. Oferecemos cestas semanais com frutas, vegetais e legumes da época. Entrega ao domicílio incluída.",
      image: empreendedor6,
      phone: "+258 84 678 9012",
      email: "fernando.agricultura@gmail.com",
      location: "Vila Olímpica - Zimpeto",
      rating: 4.9,
      reviews: 56,
      hours: "Terça a Sábado: 7h00 - 13h00",
    },
    {
      id: 7,
      name: "Maria Tembe",
      service: "Salão de Beleza Elegância",
      category: "Serviços",
      description: "Cabeleireiro, manicure, pedicure e tratamentos estéticos.",
      fullDescription: "Salão completo com serviços de cabeleireiro, manicure, pedicure, maquilhagem e tratamentos capilares. Profissionais qualificados e produtos de alta qualidade.",
      image: empreendedor1,
      phone: "+258 84 789 0123",
      email: "salao.elegancia@gmail.com",
      location: "Vila Olímpica - Bloco C",
      rating: 4.8,
      reviews: 124,
      hours: "Segunda a Sábado: 8h00 - 19h00",
    },
    {
      id: 8,
      name: "António Mondlane",
      service: "Restaurante Sabores da Terra",
      category: "Alimentação",
      description: "Culinária moçambicana tradicional com ingredientes frescos.",
      fullDescription: "Restaurante familiar especializado em pratos típicos moçambicanos. Menu variado com opções de peixe, marisco, caril e grelhados. Almoços executivos e encomendas para eventos.",
      image: empreendedor2,
      phone: "+258 85 890 1234",
      email: "sabores.terra@gmail.com",
      location: "Vila Olímpica - Zona Comercial",
      rating: 4.7,
      reviews: 203,
      hours: "Todos os dias: 11h00 - 22h00",
    },
  ];

  const filteredEntrepreneurs = selectedCategory === "Todos"
    ? entrepreneurs
    : entrepreneurs.filter((e) => e.category === selectedCategory);

  const handleViewDetails = (entrepreneur: any) => {
    setSelectedEntrepreneur(entrepreneur);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Condomínio</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

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

      {/* Entrepreneurs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredEntrepreneurs.length}</span> negócios
              {selectedCategory !== "Todos" && ` em ${selectedCategory}`}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntrepreneurs.map((entrepreneur) => (
              <div
                key={entrepreneur.id}
                className="bg-card rounded-xl border border-border hover:shadow-elegant transition-all group overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={entrepreneur.image}
                    alt={entrepreneur.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                      {entrepreneur.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-foreground">{entrepreneur.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-1">{entrepreneur.name}</h3>
                  <p className="text-accent font-semibold text-sm mb-2">{entrepreneur.service}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{entrepreneur.location}</span>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {entrepreneur.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{entrepreneur.hours}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(entrepreneur)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.open(`https://wa.me/${entrepreneur.phone.replace(/\s/g, '').replace('+', '')}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Store className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Divulgue Seu Negócio</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Você é morador e tem um negócio ou serviço? Anuncie aqui e alcance toda a comunidade!
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-background/20 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground hover:bg-background/30"
            onClick={() => window.open('https://wa.me/258843001234?text=Olá! Gostaria de cadastrar meu negócio no Marketplace da Vila.', '_blank')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Cadastrar Meu Serviço
          </Button>
        </div>
      </section>

      {/* Modal de Detalhes */}
      <EntrepreneurDetailsDialog
        entrepreneur={selectedEntrepreneur}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <WhatsAppButton />
    </div>
  );
};

export default MarketplacePage;
