import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, Building2, Play, ChevronDown, MapPin, Calendar } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";
import heroBackground from "@/assets/vila-olimpica-aerial-1.jpg";

const Hero = () => {
  const scrollToNext = () => {
    document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="Vista aérea do Condomínio Vila Olímpica"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-24 lg:pt-0">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Main Content - Takes 3 columns */}
          <div className="lg:col-span-3 max-w-2xl">
            {/* Logo and Badge */}
            <div className="flex items-center gap-4 mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
              <img 
                src={logoVilaOlimpica} 
                alt="Logo Vila Olímpica" 
                className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-xl bg-white/95 p-1.5 shadow-lg"
              />
              <div>
                <span className="px-3 py-1 bg-accent/25 backdrop-blur-md border border-accent/40 rounded-full text-primary-foreground text-xs font-semibold inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Portal Oficial
                </span>
                <p className="text-primary-foreground/70 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Zimpeto, Maputo
                </p>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-[1.05] animate-fade-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              Bem-vindo ao
              <span className="block mt-1 text-accent drop-shadow-lg">
                Condomínio
              </span>
              <span className="block text-accent drop-shadow-lg">
                Vila Olímpica
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed max-w-xl animate-fade-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
              Um projecto emblemático do <span className="font-semibold text-accent">Fundo para o Fomento de Habitação (FFH)</span>, 
              nascido em 2011 como legado dos X Jogos Africanos. Uma comunidade vibrante com mais de 
              <span className="font-semibold"> 2.643 moradores</span> focada na excelência e transparência.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <a href="#imoveis">
                <Button size="lg" className="group bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 h-14 text-base shadow-xl hover:shadow-accent/25 transition-all w-full sm:w-auto">
                  <Home className="mr-2 w-5 h-5" />
                  Explorar Imóveis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="#lideranca">
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 backdrop-blur-md border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/60 font-semibold px-8 h-14 text-base w-full sm:w-auto transition-all">
                  <Play className="mr-2 w-5 h-5" />
                  Conhecer Gestão
                </Button>
              </a>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 md:gap-6 animate-fade-up opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              <div className="flex items-center gap-3 px-4 py-3 bg-primary-foreground/10 backdrop-blur-md rounded-xl border border-primary-foreground/20">
                <div className="w-10 h-10 bg-accent/25 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary-foreground">1.024</div>
                  <div className="text-xs text-primary-foreground/70">Apartamentos</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-primary-foreground/10 backdrop-blur-md rounded-xl border border-primary-foreground/20">
                <div className="w-10 h-10 bg-accent/25 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary-foreground">32</div>
                  <div className="text-xs text-primary-foreground/70">Blocos</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-primary-foreground/10 backdrop-blur-md rounded-xl border border-primary-foreground/20">
                <div className="w-10 h-10 bg-accent/25 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary-foreground">2.643+</div>
                  <div className="text-xs text-primary-foreground/70">Moradores</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Feature Cards (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="space-y-4 animate-fade-up opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
              {/* Main Feature Card */}
              <div className="relative">
                <div className="absolute -inset-2 bg-accent/20 rounded-3xl blur-xl" />
                <div className="relative bg-primary-foreground/10 backdrop-blur-xl rounded-2xl border border-primary-foreground/25 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary-foreground">Desde 2011</h3>
                      <p className="text-primary-foreground/70 text-sm">Legado dos X Jogos Africanos</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Tipologia T3", desc: "Em todos os blocos" },
                      { label: "Vista privilegiada", desc: "Estádio Nacional do Zimpeto" },
                      { label: "Gestão 2025-2027", desc: "É Tempo de Agir" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-primary-foreground/5 rounded-xl border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors">
                        <span className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                        <div>
                          <p className="text-primary-foreground font-medium text-sm">{item.label}</p>
                          <p className="text-primary-foreground/60 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Card */}
              <div className="bg-accent/20 backdrop-blur-md rounded-xl border border-accent/30 p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-primary-foreground font-semibold text-sm">Comunidade Activa</p>
                  <p className="text-primary-foreground/70 text-xs">Transparência, inclusão e desenvolvimento sustentável</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-primary-foreground/70 hover:text-primary-foreground transition-colors hidden md:flex flex-col items-center gap-1 group"
      >
        <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Descobrir</span>
        <div className="w-8 h-12 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </button>
    </section>
  );
};

export default Hero;
