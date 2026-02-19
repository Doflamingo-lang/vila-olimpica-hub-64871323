import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Store } from "lucide-react";
import { Link } from "react-router-dom";

const Entrepreneurs = () => {
  return (
    <section id="empreendedores" className="py-24 bg-secondary/40 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
            Empreendedores Locais
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Marketplace da Vila
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Conecte-se com profissionais talentosos que fazem parte da nossa comunidade. 
            Apoie os negócios locais!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="group">
                <Store className="mr-2 w-5 h-5" />
                Ver Marketplace Completo
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/marketplace/cadastrar">
              <Button size="lg" className="shadow-lg">
                <Briefcase className="w-4 h-4 mr-2" />
                Cadastrar Meu Serviço
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Entrepreneurs;
