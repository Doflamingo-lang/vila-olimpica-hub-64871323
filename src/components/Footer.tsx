import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoVilaOlimpica} 
                alt="Logo Vila Olímpica" 
                className="w-14 h-14 object-contain bg-white/90 rounded-lg p-1"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">Vila Olímpica</span>
                <span className="text-xs text-primary-foreground/80">Condomínio</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Mais que um condomínio, uma verdadeira comunidade de qualidade e bem-estar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Início
                </a>
              </li>
              <li>
                <a href="#sobre" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#imoveis" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Imóveis
                </a>
              </li>
              <li>
                <a href="#noticias" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Notícias
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Serviços</h4>
            <ul className="space-y-2">
              <li>
                <a href="#empreendedores" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Empreendedores
                </a>
              </li>
              <li>
                <a href="#transparencia" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Transparência
                </a>
              </li>
              <li>
                <a href="#contato" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-bold text-lg mb-4">Conecte-se</h4>
            <div className="space-y-3 mb-4">
              <a 
                href="https://wa.me/258843001234" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-accent transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                +258 84 300 1234
              </a>
            </div>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/80">
          <p>
            © {currentYear} Condomínio Vila Olímpica. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
