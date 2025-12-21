import { Button } from "@/components/ui/button";
import { Briefcase, Phone, Mail, ExternalLink, Store, ShoppingBag, Utensils, Truck, Scissors, Sprout, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import EntrepreneurDetailsDialog from "./EntrepreneurDetailsDialog";
import empreendedor1 from "@/assets/empreendedor-1.jpg";
import empreendedor2 from "@/assets/empreendedor-2.jpg";
import empreendedor3 from "@/assets/empreendedor-3.jpg";
import empreendedor4 from "@/assets/empreendedor-4.jpg";
import empreendedor5 from "@/assets/empreendedor-5.jpg";
import empreendedor6 from "@/assets/empreendedor-6.webp";

const Entrepreneurs = () => {
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
      image: empreendedor1,
      phone: "+258 84 123 4567",
      email: "amina.mutemba@gmail.com",
    },
    {
      id: 2,
      name: "Carlos Mahumane",
      service: "Mini-Mercado",
      category: "Comércio",
      description: "Produtos essenciais para o dia a dia, sempre à disposição.",
      image: empreendedor2,
      phone: "+258 82 234 5678",
      email: "minimercado.carlos@outlook.com",
    },
    {
      id: 3,
      name: "Beatriz Nhachungue",
      service: "Espaço de Coworking",
      category: "Serviços",
      description: "Ambiente profissional para trabalhar e realizar reuniões.",
      image: empreendedor3,
      phone: "+258 87 345 6789",
      email: "beatriz.coworking@gmail.com",
    },
    {
      id: 4,
      name: "Nádia Cossa",
      service: "Atelier de Moda",
      category: "Moda",
      description: "Criação e confecção de roupas sob medida e exclusivas.",
      image: empreendedor4,
      phone: "+258 85 456 7890",
      email: "nadia.atelier@gmail.com",
    },
    {
      id: 5,
      name: "José Machel",
      service: "Transporte e Logística",
      category: "Transporte",
      description: "Serviços de transporte confiável e mudanças em Maputo.",
      image: empreendedor5,
      phone: "+258 86 567 8901",
      email: "jose.transporte@hotmail.com",
    },
    {
      id: 6,
      name: "Fernando Sitoe",
      service: "Produtos Agrícolas",
      category: "Agricultura",
      description: "Produtos frescos direto da machamba para sua mesa.",
      image: empreendedor6,
      phone: "+258 84 678 9012",
      email: "fernando.agricultura@gmail.com",
      fullDescription: "Produtos agrícolas frescos e orgânicos, cultivados com dedicação. Oferecemos entregas ao domicílio dentro do condomínio. Variedade de frutas, vegetais e legumes da época.",
      location: "Vila Olímpica - Zimpeto, Maputo",
    },
  ];

  const filteredEntrepreneurs =
    selectedCategory === "Todos"
      ? entrepreneurs
      : entrepreneurs.filter((e) => e.category === selectedCategory);

  const handleViewDetails = (entrepreneur: any) => {
    setSelectedEntrepreneur(entrepreneur);
    setDialogOpen(true);
  };

  return (
    <section id="empreendedores" className="py-24 bg-secondary/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
            Empreendedores Locais
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Marketplace da Vila
          </h2>
          <p className="text-lg text-muted-foreground">
            Conecte-se com profissionais talentosos que fazem parte da nossa comunidade. 
            Apoie os negócios locais!
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.name;
            return (
              <Button
                key={category.name}
                variant={isActive ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className={`gap-2 transition-all ${
                  isActive 
                    ? "shadow-lg" 
                    : "bg-card hover:bg-card/80"
                }`}
                size="sm"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.slice(0, 4)}</span>
              </Button>
            );
          })}
        </div>

        {/* Entrepreneurs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEntrepreneurs.slice(0, 6).map((entrepreneur, index) => (
            <div
              key={entrepreneur.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={entrepreneur.image}
                      alt={entrepreneur.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-accent/20 group-hover:border-accent transition-colors"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <Store className="w-3 h-3 text-accent-foreground" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-0.5 truncate group-hover:text-primary transition-colors">
                      {entrepreneur.name}
                    </h3>
                    <p className="text-primary font-semibold text-sm truncate">
                      {entrepreneur.service}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-1 bg-secondary rounded-full text-xs text-muted-foreground font-medium">
                      {entrepreneur.category}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-5 text-sm leading-relaxed line-clamp-2">
                  {entrepreneur.description}
                </p>

                <div className="space-y-2 mb-5">
                  <a 
                    href={`tel:${entrepreneur.phone}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="truncate">{entrepreneur.phone}</span>
                  </a>
                  <a 
                    href={`mailto:${entrepreneur.email}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <span className="truncate">{entrepreneur.email}</span>
                  </a>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full group/btn"
                  onClick={() => handleViewDetails(entrepreneur)}
                >
                  Ver Detalhes
                  <ExternalLink className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/marketplace">
            <Button variant="outline" size="lg" className="group">
              Ver Marketplace Completo
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/marketplace/cadastrar">
            <Button size="lg" className="shadow-lg">
              <Briefcase className="w-4 h-4 mr-2" />
              Cadastrar Meu Serviço
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <EntrepreneurDetailsDialog
        entrepreneur={selectedEntrepreneur}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default Entrepreneurs;
