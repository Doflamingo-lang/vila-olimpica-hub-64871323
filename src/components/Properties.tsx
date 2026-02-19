import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Properties = () => {
  return (
    <section id="imoveis" className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
            Imóveis
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Imóveis Disponíveis
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Encontre a casa dos seus sonhos dentro do Vila Olímpica. 
            Imóveis selecionados para venda e arrendamento.
          </p>

          <Link to="/imoveis">
            <Button size="lg" className="group shadow-lg">
              <Home className="mr-2 w-5 h-5" />
              Ver Todos os Imóveis
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Properties;
