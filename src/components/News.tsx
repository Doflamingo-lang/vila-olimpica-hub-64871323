import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import NewsDetailsDialog from "./NewsDetailsDialog";

const News = () => {
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const news = [
    {
      id: 1,
      title: "Nova Área de Lazer Inaugurada",
      date: "15 de Março, 2024",
      excerpt: "O condomínio inaugura uma nova área de lazer completa com piscina aquecida, sauna e sala de jogos.",
      content: "Com grande satisfação, anunciamos a inauguração da nova área de lazer do Vila Olímpica. O espaço conta com piscina aquecida, sauna seca e a vapor, sala de jogos com mesa de sinuca e ping pong, além de área kids para as crianças. O investimento de 5 milhões de meticais foi aprovado em assembleia e representa mais um passo na melhoria contínua do nosso condomínio.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      category: "Infraestrutura",
      author: "Administração",
      readTime: "3 min",
    },
    {
      id: 2,
      title: "Assembleia Geral de Março",
      date: "10 de Março, 2024",
      excerpt: "Convocamos todos os condóminos para a assembleia geral ordinária. Pontos importantes em discussão.",
      content: "Prezados moradores, convocamos todos para a Assembleia Geral Ordinária que será realizada no dia 25 de Março às 18h00 no Salão de Festas. Pauta: Prestação de contas 2023, aprovação do orçamento 2024, eleição do novo conselho fiscal e melhorias propostas para áreas comuns. A presença de todos é fundamental para as decisões do nosso condomínio.",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
      category: "Comunicado",
      author: "Síndico",
      readTime: "2 min",
    },
    {
      id: 3,
      title: "Melhorias no Sistema de Segurança",
      date: "5 de Março, 2024",
      excerpt: "Investimento em novas câmeras de vigilância e sistema de controle de acesso modernizado.",
      content: "O sistema de segurança do Vila Olímpica foi completamente modernizado. Instalamos 50 novas câmeras de alta definição com visão noturna, sistema de controle de acesso por biometria e reconhecimento facial, além de ronda motorizada 24 horas. Todas as imagens são armazenadas por 90 dias e podem ser consultadas em caso de necessidade.",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
      category: "Segurança",
      author: "Equipe de Segurança",
      readTime: "4 min",
    },
  ];

  const handleReadMore = (item: any) => {
    setSelectedNews(item);
    setDialogOpen(true);
  };

  return (
    <section id="noticias" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Notícias
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Últimas Atualizações
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fique por dentro de tudo que acontece no Vila Olímpica. 
            Comunicados, eventos e melhorias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item) => (
            <article
              key={item.id}
              className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-all group"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <time>{item.date}</time>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {item.excerpt}
                </p>

                <Button 
                  variant="ghost" 
                  className="p-0 h-auto font-semibold group/btn"
                  onClick={() => handleReadMore(item)}
                >
                  Ler mais
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/noticias">
            <Button variant="outline" size="lg">
              Ver Todas as Notícias
            </Button>
          </Link>
        </div>
      </div>

      <NewsDetailsDialog
        news={selectedNews}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default News;
