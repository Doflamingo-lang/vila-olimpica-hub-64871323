import { Button } from "@/components/ui/button";
import { Briefcase, Phone, Mail, ExternalLink, Store, ShoppingBag, Utensils, Truck, Scissors, Sprout, Filter } from "lucide-react";
import { useState } from "react";
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
    <section id="empreendedores" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Empreendedores Locais
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Marketplace da Vila
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conecte-se com profissionais talentosos que fazem parte da nossa comunidade. 
            Apoie os negócios locais!
          </p>
        </div>

        {/* Filtros por Categoria */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
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

        {/* Grid de Negócios */}
        {/* Grid de Negócios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEntrepreneurs.map((entrepreneur) => (
            <div
              key={entrepreneur.id}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-elegant transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={entrepreneur.image}
                  alt={entrepreneur.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {entrepreneur.name}
                  </h3>
                  <p className="text-accent font-semibold text-sm">
                    {entrepreneur.service}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                    {entrepreneur.category}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 text-sm">
                {entrepreneur.description}
              </p>

              <div className="space-y-2 mb-4">
                <a 
                  href={`tel:${entrepreneur.phone}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {entrepreneur.phone}
                </a>
                <a 
                  href={`mailto:${entrepreneur.email}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {entrepreneur.email}
                </a>
              </div>

              <Button 
                variant="outline" 
                className="w-full group"
                onClick={() => handleViewDetails(entrepreneur)}
              >
                Ver Detalhes
                <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-secondary via-accent to-accent-glow rounded-2xl p-8 md:p-12 text-center shadow-glow">
          <Briefcase className="w-16 h-16 text-accent-foreground mx-auto mb-4" />
          <h3 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
            Divulgue Seu Negócio
          </h3>
          <p className="text-xl text-accent-foreground/90 mb-6 max-w-2xl mx-auto">
            Você é morador e tem um negócio ou serviço? 
            Anuncie aqui e alcance toda a comunidade!
          </p>
          <Button variant="default" size="lg" className="shadow-lg">
            Cadastrar Meu Serviço
          </Button>
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
