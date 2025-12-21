import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, Tag } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content?: string;
  image: string;
  category: string;
  author?: string;
  readTime?: string;
}

interface NewsDetailsDialogProps {
  news: NewsItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsDetailsDialog = ({ news, open, onOpenChange }: NewsDetailsDialogProps) => {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Header */}
        <div className="relative h-64 w-full">
          <img
            src={news.image}
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
                <time>{news.date}</time>
              </div>
              {news.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>{news.readTime} de leitura</span>
                </div>
              )}
              {news.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-accent" />
                  <span>{news.author}</span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed text-base">
              {news.content || news.excerpt}
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
