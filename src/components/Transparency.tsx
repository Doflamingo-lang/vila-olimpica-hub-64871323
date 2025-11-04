import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

const Transparency = () => {
  const documents = [
    {
      id: 1,
      title: "Relatório Financeiro - Março 2024",
      type: "Financeiro",
      date: "01/03/2024",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Ata da Assembleia Geral - Fevereiro 2024",
      type: "Ata",
      date: "20/02/2024",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "Orçamento Anual 2024",
      type: "Financeiro",
      date: "15/01/2024",
      size: "3.2 MB",
    },
    {
      id: 4,
      title: "Regulamento Interno Atualizado",
      type: "Regulamento",
      date: "10/01/2024",
      size: "1.5 MB",
    },
    {
      id: 5,
      title: "Relatório de Manutenção - Q4 2023",
      type: "Relatório",
      date: "28/12/2023",
      size: "2.1 MB",
    },
  ];

  return (
    <section id="transparencia" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Transparência
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Documentos e Relatórios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acesso completo a toda documentação oficial do condomínio. 
            Transparência total para todos os moradores.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-primary to-primary-glow p-6">
              <h3 className="text-2xl font-bold text-primary-foreground">
                Documentação Oficial
              </h3>
              <p className="text-primary-foreground/90 mt-2">
                Todos os documentos estão disponíveis para consulta e download
              </p>
            </div>

            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        {doc.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                          {doc.type}
                        </span>
                        <span>{doc.date}</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button variant="hero" size="lg">
              <FileText className="mr-2" />
              Ver Arquivo Completo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transparency;
