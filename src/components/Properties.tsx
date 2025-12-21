import { Button } from "@/components/ui/button";
import { Home, MapPin, Bath, Bed, Square, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import imovel1 from "@/assets/imovel-1.jpg";
import imovel2 from "@/assets/imovel-2.jpg";
import imovel3 from "@/assets/imovel-3.jpg";

const Properties = () => {
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
      location: "Vila Olímpica - Maputo",
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
      location: "Vila Olímpica - Matola",
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
    },
  ];

  return (
    <section id="imoveis" className="py-24 bg-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
              Imóveis
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Imóveis Disponíveis
            </h2>
            <p className="text-lg text-muted-foreground">
              Encontre a casa dos seus sonhos dentro do Vila Olímpica. 
              Imóveis selecionados para venda e arrendamento.
            </p>
          </div>
          
          <Link to="/imoveis" className="shrink-0">
            <Button variant="outline" size="lg" className="group">
              Ver Todos
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${
                    property.type === "Venda" 
                      ? "bg-accent/90 text-accent-foreground" 
                      : "bg-primary/90 text-primary-foreground"
                  }`}>
                    {property.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 mb-5 p-3 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Bed className="w-4 h-4 text-primary" />
                    <span className="font-medium">{property.beds}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Bath className="w-4 h-4 text-primary" />
                    <span className="font-medium">{property.baths}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Square className="w-4 h-4 text-primary" />
                    <span className="font-medium">{property.area}</span>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Preço</span>
                    <div className="text-2xl font-bold text-primary">
                      {property.price}
                    </div>
                  </div>
                  <Link to={`/imoveis/${property.id}`}>
                    <Button className="group/btn">
                      Detalhes
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-12 lg:hidden">
          <Link to="/imoveis">
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              <Home className="mr-2" />
              Ver Todos os Imóveis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Properties;
