import { Building2, MapPin, Bath, Bed, Square, Home, ArrowLeft, Filter, Search, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import imovel1 from "@/assets/imovel-1.jpg";
import imovel2 from "@/assets/imovel-2.jpg";
import imovel3 from "@/assets/imovel-3.jpg";
import imovel4 from "@/assets/imovel-4.jfif";

const PropertiesPage = () => {
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const properties = [
    {
      id: 1,
      title: "Apartamento T3 - Bloco A",
      type: "Venda",
      price: "12.500.000 MT",
      image: imovel1,
      beds: 3,
      baths: 2,
      area: "120m²",
      location: "Vila Olímpica - Zimpeto",
      description: "Apartamento espaçoso com acabamentos de primeira qualidade. Sala ampla, cozinha equipada, varanda com vista privilegiada.",
      features: ["Ar condicionado", "Cozinha equipada", "Varanda", "2 Vagas de garagem"],
    },
    {
      id: 2,
      title: "Apartamento T2 - Bloco B",
      type: "Arrendamento",
      price: "45.000 MT/mês",
      image: imovel2,
      beds: 2,
      baths: 1,
      area: "85m²",
      location: "Vila Olímpica - Zimpeto",
      description: "Ideal para casais ou pequenas famílias. Ambiente acolhedor com ótima iluminação natural.",
      features: ["Ar condicionado", "Armários embutidos", "1 Vaga de garagem"],
    },
    {
      id: 3,
      title: "Apartamento T4 - Vila Premium",
      type: "Venda",
      price: "18.000.000 MT",
      image: imovel3,
      beds: 4,
      baths: 3,
      area: "200m²",
      location: "Vila Olímpica - Zona Premium",
      description: "Cobertura duplex com acabamentos de luxo. Suite master com closet, terraço privativo com churrasqueira.",
      features: ["Terraço privativo", "Churrasqueira", "Suite master", "3 Vagas de garagem", "Vista panorâmica"],
    },
    {
      id: 4,
      title: "Apartamento T2 - Bloco C",
      type: "Venda",
      price: "9.800.000 MT",
      image: imovel4,
      beds: 2,
      baths: 2,
      area: "95m²",
      location: "Vila Olímpica - Zimpeto",
      description: "Excelente oportunidade de investimento. Apartamento novo, nunca habitado, pronto para morar.",
      features: ["Ar condicionado", "Cozinha americana", "2 Vagas de garagem"],
    },
    {
      id: 5,
      title: "Apartamento T3 - Bloco D",
      type: "Arrendamento",
      price: "65.000 MT/mês",
      image: imovel1,
      beds: 3,
      baths: 2,
      area: "140m²",
      location: "Vila Olímpica - Zona Central",
      description: "Apartamento mobilado e equipado, pronto para mudança imediata. Localização privilegiada.",
      features: ["Mobilado", "Ar condicionado", "Cozinha equipada", "2 Vagas de garagem"],
    },
    {
      id: 6,
      title: "Apartamento T1 - Bloco E",
      type: "Arrendamento",
      price: "28.000 MT/mês",
      image: imovel2,
      beds: 1,
      baths: 1,
      area: "55m²",
      location: "Vila Olímpica - Zimpeto",
      description: "Perfeito para solteiros ou estudantes. Compacto mas funcional, com todas as comodidades.",
      features: ["Ar condicionado", "Kitchenette", "1 Vaga de garagem"],
    },
  ];

  const types = ["Todos", "Venda", "Arrendamento"];

  const filteredProperties = properties.filter((property) => {
    const matchesType = selectedType === "Todos" || property.type === selectedType;
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

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
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Imóveis</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Imóveis Disponíveis</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Encontre a casa dos seus sonhos dentro do Vila Olímpica. Imóveis selecionados para venda e arrendamento.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {types.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar imóveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredProperties.length}</span> imóveis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-all group"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      property.type === "Venda" 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {property.type}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.beds}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.baths}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>{property.area}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-2xl font-bold text-primary">{property.price}</div>
                    <Link to={`/imoveis/${property.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-accent to-accent-glow text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <Home className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Não Encontrou o Imóvel Ideal?</h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e nossos consultores irão ajudá-lo a encontrar a melhor opção para você.
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-background/20 backdrop-blur-sm border-2 border-accent-foreground/30 text-accent-foreground hover:bg-background/30"
            onClick={() => window.open('https://wa.me/258843001234', '_blank')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com Consultor
          </Button>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default PropertiesPage;
