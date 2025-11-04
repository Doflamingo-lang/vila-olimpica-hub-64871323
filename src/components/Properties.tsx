import { Button } from "@/components/ui/button";
import { Home, MapPin, Bath, Bed, Square } from "lucide-react";
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
    <section id="imoveis" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Imóveis
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Imóveis Disponíveis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre a casa dos seus sonhos dentro do Vila Olímpica. 
            Imóveis selecionados para venda e arrendamento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-all group"
            >
              {/* Image */}
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

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {property.title}
                </h3>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Features */}
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

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-primary">
                    {property.price}
                  </div>
                  <Button variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            <Home className="mr-2" />
            Ver Todos os Imóveis
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Properties;
