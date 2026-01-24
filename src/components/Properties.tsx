import { Button } from "@/components/ui/button";
import { Home, MapPin, Building2, ArrowRight, Key, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Properties = () => {
  return (
    <section id="imoveis" className="py-24 bg-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Content Card */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-primary-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-foreground/20">
                <Building2 className="w-10 h-10 text-primary-foreground" />
              </div>

              {/* Header */}
              <span className="inline-block px-4 py-1.5 bg-accent/20 border border-accent/30 rounded-full text-accent text-sm font-semibold mb-4">
                Imobiliária
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Imóveis Disponíveis
              </h2>
              <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto mb-8">
                Encontre a casa dos seus sonhos dentro do Vila Olímpica. 
                Apartamentos T3 modernos para venda e arrendamento, com toda a 
                infraestrutura que sua família merece.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-10 max-w-md mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-foreground/10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-primary-foreground/20">
                    <Home className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-primary-foreground">1.120</p>
                  <p className="text-sm text-primary-foreground/70">Apartamentos</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Key className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-primary-foreground">T3</p>
                  <p className="text-sm text-primary-foreground/70">Tipologia</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-foreground/10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-primary-foreground/20">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-primary-foreground">35</p>
                  <p className="text-sm text-primary-foreground/70">Blocos</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-center gap-2 text-primary-foreground/80 mb-8">
                <MapPin className="w-5 h-5" />
                <span>Vila Olímpica, Zimpeto - Maputo</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/imoveis">
                  <Button variant="accent" size="lg" className="shadow-lg group">
                    Ver Imóveis Disponíveis
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contato">
                  <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Fale com um Consultor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Properties;
