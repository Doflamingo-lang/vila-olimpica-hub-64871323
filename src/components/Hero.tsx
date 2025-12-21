import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, TrendingUp, Play, ChevronDown } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";

const Hero = () => {
  const scrollToNext = () => {
    document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={logoVilaOlimpica}
          alt="Condomínio Vila Olímpica"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full blur-2xl" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
              <span className="px-4 py-2 bg-accent/20 backdrop-blur-md border border-accent/30 rounded-full text-primary-foreground text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Portal Oficial do Condomínio
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-[1.1] animate-fade-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              Bem-vindo a
              <span className="block mt-2 bg-gradient-to-r from-accent via-accent-glow to-accent bg-clip-text text-transparent">
                Vila Olímpica
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-primary-foreground/85 mb-8 leading-relaxed max-w-xl animate-fade-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
              Sua plataforma completa de serviços, transparência e comunidade. 
              Descubra imóveis, conecte-se com empreendedores locais e acompanhe tudo sobre o condomínio.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <a href="#imoveis">
                <Button size="lg" className="group bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 h-14 text-base shadow-glow w-full sm:w-auto">
                  <Home className="mr-2 w-5 h-5" />
                  Explorar Imóveis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="#sobre">
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 font-semibold px-8 h-14 text-base w-full sm:w-auto">
                  <Play className="mr-2 w-5 h-5" />
                  Saiba Mais
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 animate-fade-up opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              <div className="text-center p-4 md:p-6 bg-primary-foreground/10 backdrop-blur-md rounded-2xl border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Home className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary-foreground">150+</div>
                <div className="text-xs md:text-sm text-primary-foreground/70 font-medium">Residências</div>
              </div>
              <div className="text-center p-4 md:p-6 bg-primary-foreground/10 backdrop-blur-md rounded-2xl border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary-foreground">500+</div>
                <div className="text-xs md:text-sm text-primary-foreground/70 font-medium">Moradores</div>
              </div>
              <div className="text-center p-4 md:p-6 bg-primary-foreground/10 backdrop-blur-md rounded-2xl border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary-foreground">25+</div>
                <div className="text-xs md:text-sm text-primary-foreground/70 font-medium">Empreendedores</div>
              </div>
            </div>
          </div>

          {/* Right side - Featured card (hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="relative animate-fade-up opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary-foreground/10 rounded-3xl blur-2xl" />
              <div className="relative bg-primary-foreground/10 backdrop-blur-xl rounded-3xl border border-primary-foreground/20 p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={logoVilaOlimpica} 
                    alt="Logo Vila Olímpica" 
                    className="w-16 h-16 object-contain rounded-2xl bg-white/90 p-1"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">Qualidade de Vida</h3>
                    <p className="text-primary-foreground/70 text-sm">Infraestrutura completa</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Segurança 24 horas",
                    "Áreas de lazer completas",
                    "Gestão transparente",
                    "Comunidade ativa",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-primary-foreground/90">
                      <span className="w-2 h-2 bg-accent rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-primary-foreground/60 hover:text-primary-foreground transition-colors animate-bounce hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-sm font-medium">Descobrir mais</span>
        <ChevronDown className="w-6 h-6" />
      </button>
    </section>
  );
};

export default Hero;
