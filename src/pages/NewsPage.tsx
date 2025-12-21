import { Building2, ArrowLeft, Calendar, ArrowRight, Tag, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const categories = ["Todos", "Infraestrutura", "Comunicado", "Segurança", "Eventos", "Manutenção"];

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
      title: "Assembleia Geral de Março - Convocação",
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
    {
      id: 4,
      title: "Festival de Cultura Moçambicana",
      date: "1 de Março, 2024",
      excerpt: "Evento cultural celebra a diversidade e tradições de Moçambique com música, dança e gastronomia.",
      content: "No dia 20 de Março, o Vila Olímpica irá sediar o Festival de Cultura Moçambicana. O evento contará com apresentações de música tradicional, grupos de dança, feira de artesanato e praça de alimentação com pratos típicos de todas as regiões do país. A entrada é gratuita para moradores e seus convidados. Venha celebrar nossa rica cultura!",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      category: "Eventos",
      author: "Comissão de Eventos",
      readTime: "3 min",
    },
    {
      id: 5,
      title: "Manutenção Preventiva dos Elevadores",
      date: "25 de Fevereiro, 2024",
      excerpt: "Informamos sobre o cronograma de manutenção preventiva dos elevadores de todos os blocos.",
      content: "A manutenção preventiva semestral dos elevadores será realizada entre os dias 1 e 15 de Março. Cada bloco terá um elevador em manutenção por 2 dias, mantendo sempre um elevador em funcionamento. O cronograma completo está disponível na portaria. Agradecemos a compreensão de todos.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      category: "Manutenção",
      author: "Equipe Técnica",
      readTime: "2 min",
    },
    {
      id: 6,
      title: "Nova Política de Reciclagem",
      date: "20 de Fevereiro, 2024",
      excerpt: "Implementação do programa de coleta seletiva em todo o condomínio a partir de Abril.",
      content: "O Vila Olímpica está implementando um programa completo de reciclagem. A partir de Abril, teremos coletores específicos para papel, plástico, vidro e metal em todos os blocos. Serão realizadas oficinas educativas para moradores. O material reciclável será doado para cooperativas locais. Juntos, fazemos a diferença!",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      category: "Infraestrutura",
      author: "Comissão Ambiental",
      readTime: "3 min",
    },
  ];

  const filteredNews = selectedCategory === "Todos" 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const featuredNews = news[0];

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
                <span className="font-bold text-lg text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Condomínio</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Notícias</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Últimas Atualizações</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Fique por dentro de tudo que acontece no Vila Olímpica. Comunicados, eventos e melhorias.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-elegant">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                    Destaque
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                    {featuredNews.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {featuredNews.date}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">{featuredNews.title}</h2>
                <p className="text-muted-foreground mb-6">{featuredNews.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredNews.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredNews.readTime} de leitura
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredNews.length}</span> notícias
              {selectedCategory !== "Todos" && ` em ${selectedCategory}`}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time>{item.date}</time>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.readTime}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {item.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {item.author}
                    </span>
                    <Button variant="ghost" size="sm" className="group/btn">
                      Ler mais
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Receba Nossas Atualizações</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Fique por dentro de todas as novidades do condomínio via WhatsApp.
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => window.open('https://wa.me/258843001234?text=Olá! Gostaria de receber as atualizações do condomínio via WhatsApp.', '_blank')}
          >
            Receber Atualizações
          </Button>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default NewsPage;
