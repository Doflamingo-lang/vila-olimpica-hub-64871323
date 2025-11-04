import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contato" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Contato
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estamos aqui para ajudar. Entre em contato conosco para qualquer dúvida ou informação.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Informações de Contato
            </h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Endereço</h4>
                  <p className="text-muted-foreground">
                    Rua Vila Olímpica, 123<br />
                    1000-001 Lisboa, Portugal
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Telefone</h4>
                  <p className="text-muted-foreground">
                    +351 21 123 4567<br />
                    +351 912 345 678
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <p className="text-muted-foreground">
                    geral@vilaolimpica.pt<br />
                    administracao@vilaolimpica.pt
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                  <p className="text-muted-foreground">
                    Segunda a Sexta: 9h00 - 18h00<br />
                    Sábado: 9h00 - 13h00
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-glow rounded-xl p-6 text-primary-foreground">
              <h4 className="text-xl font-bold mb-2">Emergências 24/7</h4>
              <p className="text-primary-foreground/90 mb-4">
                Para situações urgentes, nossa equipe está disponível 24 horas por dia.
              </p>
              <p className="text-2xl font-bold">+351 800 123 456</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-card rounded-xl border border-border p-8 shadow-elegant">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Envie uma Mensagem
              </h3>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Nome Completo
                  </label>
                  <Input 
                    id="name"
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Telefone
                  </label>
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder="+351 912 345 678"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Mensagem
                  </label>
                  <Textarea 
                    id="message"
                    placeholder="Como podemos ajudar?"
                    rows={5}
                    className="w-full"
                  />
                </div>

                <Button variant="hero" size="lg" className="w-full">
                  Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
