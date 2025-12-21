import { Building2, MapPin, Bath, Bed, Square, ArrowLeft, Phone, MessageCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import imovel1 from "@/assets/imovel-1.jpg";
import imovel2 from "@/assets/imovel-2.jpg";
import imovel3 from "@/assets/imovel-3.jpg";
import imovel4 from "@/assets/imovel-4.jfif";

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allProperties = [
    {
      id: 1,
      title: "Apartamento T3 - Bloco A",
      type: "Venda",
      price: "12.500.000 MT",
      images: [imovel1, imovel2, imovel3, imovel4, imovel1, imovel2, imovel3, imovel4],
      beds: 3,
      baths: 2,
      area: "120m²",
      location: "Vila Olímpica - Zimpeto, Maputo",
      description: "Apartamento espaçoso com acabamentos de primeira qualidade. Sala ampla, cozinha equipada, varanda com vista privilegiada para as áreas verdes do condomínio.",
      fullDescription: "Este magnífico apartamento T3 oferece o equilíbrio perfeito entre conforto e funcionalidade. Localizado no prestigiado Bloco A do Condomínio Vila Olímpica, apresenta acabamentos premium e uma distribuição inteligente dos espaços. A sala de estar é ampla e luminosa, com acesso direto à varanda que proporciona uma vista deslumbrante para os jardins do condomínio. A cozinha moderna está totalmente equipada com eletrodomésticos de qualidade. Os três quartos são espaçosos, sendo a suite principal equipada com closet e casa de banho privativa.",
      features: ["Ar condicionado central", "Cozinha totalmente equipada", "Varanda espaçosa", "2 Vagas de garagem", "Armários embutidos", "Suite master com closet", "Piso porcelanato", "Janelas com vidro duplo"],
      amenities: ["Piscina comunitária", "Ginásio", "Área de lazer", "Segurança 24h", "Jardim privativo", "Parque infantil"],
    },
    {
      id: 2,
      title: "Apartamento T2 - Bloco B",
      type: "Arrendamento",
      price: "45.000 MT/mês",
      images: [imovel2, imovel1, imovel3, imovel4, imovel2, imovel1, imovel3, imovel4],
      beds: 2,
      baths: 1,
      area: "85m²",
      location: "Vila Olímpica - Zimpeto, Maputo",
      description: "Ideal para casais ou pequenas famílias. Ambiente acolhedor com ótima iluminação natural.",
      fullDescription: "Apartamento T2 moderno e funcional, perfeito para casais jovens ou pequenas famílias. Destaca-se pela excelente iluminação natural em todos os compartimentos e pela distribuição prática dos espaços. A sala integrada com a cozinha cria um ambiente social agradável. Os dois quartos são acolhedores, com roupeiros embutidos. Localização privilegiada próximo às áreas comerciais do condomínio.",
      features: ["Ar condicionado", "Armários embutidos", "1 Vaga de garagem", "Cozinha americana", "Varanda", "Piso laminado"],
      amenities: ["Piscina comunitária", "Área de lazer", "Segurança 24h", "Parque infantil"],
    },
    {
      id: 3,
      title: "Apartamento T4 - Vila Premium",
      type: "Venda",
      price: "18.000.000 MT",
      images: [imovel3, imovel1, imovel2, imovel4, imovel3, imovel1, imovel2, imovel4],
      beds: 4,
      baths: 3,
      area: "200m²",
      location: "Vila Olímpica - Zona Premium, Maputo",
      description: "Cobertura duplex com acabamentos de luxo. Suite master com closet, terraço privativo com churrasqueira.",
      fullDescription: "Excepcional cobertura duplex na zona mais exclusiva do Vila Olímpica. Este apartamento de luxo combina espaço, sofisticação e vistas panorâmicas incomparáveis. O piso inferior conta com uma ampla sala de estar e jantar, cozinha gourmet totalmente equipada e lavabo social. O piso superior abriga os quatro quartos espaçosos, incluindo a suite master com closet walk-in e casa de banho em mármore. O terraço privativo com churrasqueira é o cenário perfeito para entretenimento.",
      features: ["Terraço privativo", "Churrasqueira", "Suite master", "3 Vagas de garagem", "Vista panorâmica", "Cozinha gourmet", "Closet walk-in", "Casa de banho em mármore", "Lareira"],
      amenities: ["Piscina privativa", "Ginásio", "Spa", "Segurança 24h", "Concierge", "Jardim privativo"],
    },
    {
      id: 4,
      title: "Apartamento T2 - Bloco C",
      type: "Venda",
      price: "9.800.000 MT",
      images: [imovel4, imovel1, imovel2, imovel3, imovel4, imovel1, imovel2, imovel3],
      beds: 2,
      baths: 2,
      area: "95m²",
      location: "Vila Olímpica - Zimpeto, Maputo",
      description: "Excelente oportunidade de investimento. Apartamento novo, nunca habitado, pronto para morar.",
      fullDescription: "Oportunidade única de adquirir um apartamento completamente novo, nunca habitado. Este T2 oferece dois quartos espaçosos, cada um com sua própria casa de banho, proporcionando privacidade e conforto. A cozinha americana cria um ambiente moderno e integrado. Ideal tanto para moradia quanto para investimento, com excelente potencial de valorização.",
      features: ["Ar condicionado", "Cozinha americana", "2 Vagas de garagem", "Dois banheiros", "Varanda", "Acabamentos novos"],
      amenities: ["Piscina comunitária", "Área de lazer", "Segurança 24h", "Jardim"],
    },
    {
      id: 5,
      title: "Apartamento T3 - Bloco D",
      type: "Arrendamento",
      price: "65.000 MT/mês",
      images: [imovel1, imovel2, imovel3, imovel4, imovel1, imovel2, imovel3, imovel4],
      beds: 3,
      baths: 2,
      area: "140m²",
      location: "Vila Olímpica - Zona Central, Maputo",
      description: "Apartamento mobilado e equipado, pronto para mudança imediata. Localização privilegiada.",
      fullDescription: "Apartamento totalmente mobilado e equipado com móveis de design moderno e eletrodomésticos de alta qualidade. Pronto para mudança imediata, ideal para profissionais ou famílias que buscam praticidade. Localização central no condomínio, próximo a todas as comodidades. Os três quartos são amplos e confortáveis, com roupa de cama e toalhas incluídas.",
      features: ["Mobilado completo", "Ar condicionado", "Cozinha equipada", "2 Vagas de garagem", "Internet incluída", "TV por cabo"],
      amenities: ["Piscina comunitária", "Ginásio", "Área de lazer", "Segurança 24h"],
    },
    {
      id: 6,
      title: "Apartamento T1 - Bloco E",
      type: "Arrendamento",
      price: "28.000 MT/mês",
      images: [imovel2, imovel1, imovel3, imovel4, imovel2, imovel1, imovel3, imovel4],
      beds: 1,
      baths: 1,
      area: "55m²",
      location: "Vila Olímpica - Zimpeto, Maputo",
      description: "Perfeito para solteiros ou estudantes. Compacto mas funcional, com todas as comodidades.",
      fullDescription: "Estúdio moderno e funcional, perfeito para solteiros, estudantes ou jovens profissionais. Apesar do tamanho compacto, o espaço foi otimizado para oferecer todo o conforto necessário. A kitchenette está equipada com o essencial, e o quarto é acolhedor. Excelente custo-benefício com acesso a todas as áreas comuns do condomínio.",
      features: ["Ar condicionado", "Kitchenette", "1 Vaga de garagem", "Armário embutido", "Internet incluída"],
      amenities: ["Piscina comunitária", "Área de lazer", "Segurança 24h"],
    },
  ];

  const property = allProperties.find(p => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Imóvel não encontrado</h1>
          <Link to="/imoveis">
            <Button variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Imóveis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Condomínio</span>
              </div>
            </Link>
            <Link to="/imoveis">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-4">
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.title} - Imagem ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
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
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm text-foreground">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Location */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{property.title}</h1>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.location}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 p-6 bg-secondary rounded-xl">
                <div className="flex items-center gap-2">
                  <Bed className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{property.beds}</p>
                    <p className="text-sm text-muted-foreground">Quartos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{property.baths}</p>
                    <p className="text-sm text-muted-foreground">Casas de Banho</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{property.area}</p>
                    <p className="text-sm text-muted-foreground">Área</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">{property.fullDescription}</p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Características do Imóvel</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Comodidades do Condomínio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preço</p>
                  <p className="text-3xl font-bold text-primary">{property.price}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => window.open(`https://wa.me/258843001234?text=Olá! Tenho interesse no ${property.title}`, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contactar via WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('tel:+258843001234')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar Agora
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Horário de Atendimento</p>
                  <p className="text-foreground">Segunda a Sexta: 8h - 18h</p>
                  <p className="text-foreground">Sábado: 9h - 13h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
};

export default PropertyDetailsPage;
