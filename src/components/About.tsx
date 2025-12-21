import { Building2, Shield, Users, Heart } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Building2,
      title: "Infraestrutura Moderna",
      description: "Instalações de alta qualidade com áreas de lazer completas e segurança 24 horas.",
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Acesso completo a relatórios financeiros e decisões da administração.",
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Eventos regulares e espaços para conexão entre moradores.",
    },
    {
      icon: Heart,
      title: "Qualidade de Vida",
      description: "Localização privilegiada com acesso fácil a serviços essenciais.",
    },
  ];

  return (
    <section id="sobre" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Sobre Nós
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Condomínio Vila Olímpica
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Localizado no Bairro do Zimpeto, Maputo. Um espaço pensado para o bem-estar, 
            segurança e qualidade de vida das famílias moçambicanas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-all group hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-accent/15 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Faça Parte da Nossa Comunidade
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
            Descubra as oportunidades de viver em um dos condomínios mais bem estruturados da região.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#imoveis" className="inline-flex items-center justify-center px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all shadow-md hover:shadow-lg">
              Ver Imóveis Disponíveis
            </a>
            <a href="#contato" className="inline-flex items-center justify-center px-8 py-3 bg-primary-foreground/20 border border-primary-foreground/30 text-primary-foreground rounded-lg font-semibold hover:bg-primary-foreground/30 transition-all">
              Entre em Contato
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
