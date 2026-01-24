import { Button } from "@/components/ui/button";
import { Briefcase, Store, ArrowRight, Users, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Entrepreneurs = () => {
  return (
    <section id="empreendedores" className="py-24 bg-secondary/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Content Card */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-accent" />
              </div>

              {/* Header */}
              <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
                Empreendedores Locais
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Marketplace da Vila
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Conecte-se com profissionais talentosos que fazem parte da nossa comunidade. 
                Descubra serviços de alimentação, comércio, moda, transporte e muito mais. 
                Apoie os negócios locais!
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-10 max-w-md mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">Empreendedores</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <ShoppingBag className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">6</p>
                  <p className="text-sm text-muted-foreground">Categorias</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Local</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/marketplace">
                  <Button size="lg" className="shadow-lg group">
                    Explorar Marketplace
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/marketplace/cadastrar">
                  <Button variant="outline" size="lg" className="group">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Cadastrar Meu Serviço
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

export default Entrepreneurs;
