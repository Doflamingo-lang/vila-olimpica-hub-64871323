import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-vila-olimpica.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Condomínio Vila Olímpica"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full text-accent-foreground text-sm font-semibold">
              Portal Oficial do Condomínio
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Bem-vindo ao
            <span className="block bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              Vila Olímpica
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            Sua plataforma completa de serviços, transparência e comunidade. 
            Descubra imóveis, conecte-se com empreendedores locais e acompanhe tudo sobre o condomínio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button variant="accent" size="lg" className="group">
              Explorar Imóveis
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="bg-background/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Saiba Mais
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
              <Home className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">150+</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Residências</div>
            </div>
            <div className="text-center p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
              <Users className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">500+</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Moradores</div>
            </div>
            <div className="text-center p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
              <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">25+</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Empreendedores</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
