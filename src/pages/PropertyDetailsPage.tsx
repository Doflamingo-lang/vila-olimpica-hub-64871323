import { Building2, MapPin, Bath, Bed, Car, Ruler, ArrowLeft, MessageCircle, Share2, Heart, Check, Phone, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Fallback images
import imovel1 from "@/assets/imovel-1.jpg";
import imovel2 from "@/assets/imovel-2.jpg";
import imovel3 from "@/assets/imovel-3.jpg";
import imovel4 from "@/assets/imovel-4.jfif";

interface Property {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  property_type: string;
  transaction_type: string;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  features: string[] | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  is_featured: boolean;
  created_at: string;
}

const PROPERTY_TYPES: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  commercial: "Comercial",
  land: "Terreno",
  studio: "Studio",
  penthouse: "Cobertura",
};

const TRANSACTION_TYPES: Record<string, string> = {
  sale: "Venda",
  rent: "Aluguel",
  seasonal: "Temporada",
};

const WHATSAPP_NUMBER = "258843001234";
const PHONE_NUMBER = "+258 84 300 1234";

const fallbackImages = [imovel1, imovel2, imovel3, imovel4];

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching property:", error);
      toast({
        title: "Imóvel não encontrado",
        description: "O imóvel que você está procurando não existe ou foi removido.",
        variant: "destructive",
      });
      navigate("/imoveis");
    } else {
      setProperty(data);
    }
    setIsLoading(false);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Consulte";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAllImages = () => {
    const images: string[] = [];
    if (property?.image_url) {
      images.push(property.image_url);
    }
    if (property?.gallery_urls) {
      images.push(...property.gallery_urls);
    }
    if (images.length === 0) {
      images.push(...fallbackImages.slice(0, 3));
    }
    return images;
  };

  const images = property ? getAllImages() : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getWhatsAppLink = () => {
    if (!property) return "";
    const message = encodeURIComponent(
      `Olá! Tenho interesse no imóvel: ${property.title}.\n\nDetalhes:\n- Tipo: ${PROPERTY_TYPES[property.property_type] || property.property_type}\n- Preço: ${formatPrice(property.price)}\n\nGostaria de mais informações e agendar uma visita.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Confira este imóvel: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do imóvel foi copiado para a área de transferência.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return null;
  }

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
                <span className="font-bold text-lg text-foreground leading-tight">
                  Vila Olímpica
                </span>
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
      <main className="pt-20 pb-24 lg:pb-16">
        <div className="container mx-auto px-4">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <div className="aspect-video relative">
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {property.is_featured && (
                  <Badge className="bg-accent text-accent-foreground">
                    Destaque
                  </Badge>
                )}
                <Badge
                  variant={property.transaction_type === "sale" ? "default" : "secondary"}
                >
                  {TRANSACTION_TYPES[property.transaction_type] || property.transaction_type}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <Button variant="secondary" size="icon" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Price */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {PROPERTY_TYPES[property.property_type] || property.property_type}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      {property.title}
                    </h1>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {TRANSACTION_TYPES[property.transaction_type] || property.transaction_type}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </p>
                    {property.transaction_type === "rent" && (
                      <p className="text-sm text-muted-foreground">/mês</p>
                    )}
                  </div>
                </div>

                {(property.neighborhood || property.city) && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>
                      {[property.address, property.neighborhood, property.city, property.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms !== null && property.bedrooms > 0 && (
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Bed className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bedrooms}</p>
                        <p className="text-sm text-muted-foreground">Quartos</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {property.bathrooms !== null && property.bathrooms > 0 && (
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Bath className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bathrooms}</p>
                        <p className="text-sm text-muted-foreground">Banheiros</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {property.parking_spots !== null && property.parking_spots > 0 && (
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Car className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.parking_spots}</p>
                        <p className="text-sm text-muted-foreground">Vagas</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {property.area && (
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Ruler className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.area}</p>
                        <p className="text-sm text-muted-foreground">m²</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Description */}
              {(property.description || property.full_description) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {property.full_description || property.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <Check className="w-5 h-5 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Interessado neste imóvel?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Entre em contato conosco para mais informações ou agendar uma visita.
                  </p>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => window.open(getWhatsAppLink(), "_blank")}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contato via WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => window.open(`tel:${PHONE_NUMBER}`, "_self")}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {PHONE_NUMBER}
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Horário de atendimento: Seg-Sex, 8h às 18h
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border lg:hidden z-40">
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => window.open(getWhatsAppLink(), "_blank")}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`tel:${PHONE_NUMBER}`, "_self")}
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default PropertyDetailsPage;
