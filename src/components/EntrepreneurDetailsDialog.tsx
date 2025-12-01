import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Tag, ExternalLink } from "lucide-react";

interface EntrepreneurDetailsDialogProps {
  entrepreneur: {
    id: number;
    name: string;
    service: string;
    category: string;
    description: string;
    image: string;
    phone: string;
    email: string;
    fullDescription?: string;
    location?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EntrepreneurDetailsDialog = ({
  entrepreneur,
  open,
  onOpenChange,
}: EntrepreneurDetailsDialogProps) => {
  if (!entrepreneur) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Negócio</DialogTitle>
          <DialogDescription>
            Informações completas sobre o serviço
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com foto e info básica */}
          <div className="flex items-start gap-4">
            <img
              src={entrepreneur.image}
              alt={entrepreneur.name}
              className="w-24 h-24 rounded-lg object-cover border-2 border-accent"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {entrepreneur.name}
              </h3>
              <p className="text-accent font-semibold text-lg mb-2">
                {entrepreneur.service}
              </p>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground">
                <Tag className="w-3 h-3" />
                {entrepreneur.category}
              </span>
            </div>
          </div>

          {/* Descrição completa */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-foreground">Sobre o Serviço</h4>
            <p className="text-muted-foreground leading-relaxed">
              {entrepreneur.fullDescription || entrepreneur.description}
            </p>
          </div>

          {/* Localização */}
          {entrepreneur.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 text-accent" />
              <span>{entrepreneur.location}</span>
            </div>
          )}

          {/* Contactos */}
          <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold text-lg text-foreground mb-3">Informações de Contacto</h4>
            
            <a
              href={`tel:${entrepreneur.phone}`}
              className="flex items-center gap-3 text-foreground hover:text-accent transition-colors p-2 hover:bg-secondary/50 rounded"
            >
              <Phone className="w-5 h-5 text-accent" />
              <span className="font-medium">{entrepreneur.phone}</span>
            </a>

            <a
              href={`mailto:${entrepreneur.email}`}
              className="flex items-center gap-3 text-foreground hover:text-accent transition-colors p-2 hover:bg-secondary/50 rounded"
            >
              <Mail className="w-5 h-5 text-accent" />
              <span className="font-medium">{entrepreneur.email}</span>
            </a>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={() => window.location.href = `tel:${entrepreneur.phone}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Ligar Agora
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.href = `mailto:${entrepreneur.email}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntrepreneurDetailsDialog;
