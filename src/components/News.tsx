import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NewsDetailsDialog from "./NewsDetailsDialog";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

const News = () => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching news:", error);
    } else {
      setNews(data || []);
    }
    setIsLoading(false);
  };

  const handleReadMore = (item: NewsItem) => {
    setSelectedNews(item);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma notícia disponível no momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-all group"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
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
                    <time>{formatDate(item.created_at)}</time>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {item.summary}
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
        )}

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
