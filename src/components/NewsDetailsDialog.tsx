import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, Tag } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

interface NewsDetailsDialogProps {
  news: NewsItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsDetailsDialog = ({ news, open, onOpenChange }: NewsDetailsDialogProps) => {
  if (!news) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Header */}
        <div className="relative h-64 w-full">
          <img
            src={news.image_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
              {news.category}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {news.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes completos da notícia
            </DialogDescription>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-accent" />
                <time>{formatDate(news.created_at)}</time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-accent" />
                <span>{getReadTime(news.content)} de leitura</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-accent" />
                <span>Administração</span>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
              {news.content}
            </p>
          </div>

          {/* Category Tag */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium text-foreground">
                {news.category}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailsDialog;
