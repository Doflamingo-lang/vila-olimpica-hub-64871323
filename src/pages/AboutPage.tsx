import { Building2, Shield, Users, Heart, MapPin, Award, Target, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import WhatsAppButton from "@/components/WhatsAppButton";
import heroImage from "@/assets/hero-condominio.jpg";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";

const AboutPage = () => {
  const features = [
    {
      icon: Building2,
      title: "Infraestrutura Moderna",
      description: "Instalações de alta qualidade com áreas de lazer completas, piscinas, ginásio e segurança 24 horas.",
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Acesso completo a relatórios financeiros, atas de reuniões e decisões da administração.",
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Eventos regulares, grupos de interesse e espaços para conexão entre moradores.",
    },
    {
      icon: Heart,
      title: "Qualidade de Vida",
      description: "Localização privilegiada com acesso fácil a serviços essenciais, escolas e hospitais.",
    },
  ];

  const values = [
    { title: "Segurança", description: "Vigilância 24h com tecnologia de ponta" },
    { title: "Sustentabilidade", description: "Práticas ecológicas em todas as operações" },
    { title: "Comunidade", description: "Fortalecimento dos laços entre moradores" },
    { title: "Inovação", description: "Soluções modernas para gestão condominial" },
  ];

  const timeline = [
    { year: "2018", event: "Fundação do Condomínio Vila Olímpica" },
    { year: "2019", event: "Inauguração das primeiras residências" },
    { year: "2020", event: "Conclusão das áreas de lazer" },
    { year: "2022", event: "Expansão com novos blocos residenciais" },
    { year: "2024", event: "Modernização do sistema de segurança" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logoVilaOlimpica} 
                alt="Logo Vila Olímpica" 
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
              />
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Sobre Nós</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Condomínio Vila Olímpica</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Um espaço pensado para o bem-estar, segurança e qualidade de vida das famílias moçambicanas no coração de Zimpeto.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Nossa História</h2>
              <p className="text-lg text-muted-foreground mb-4">
                O Condomínio Vila Olímpica nasceu em 2018 com a visão de criar um espaço residencial de excelência 
                em Maputo. Localizado no prestigiado Bairro do Zimpeto, o empreendimento foi concebido para oferecer 
                aos seus moradores um ambiente seguro, confortável e repleto de comodidades.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Ao longo dos anos, expandimos nossas instalações e aprimoramos nossos serviços, sempre com foco 
                na satisfação dos nossos residentes. Hoje, somos referência em qualidade de vida e gestão condominial 
                transparente em Moçambique.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-foreground font-medium">Zimpeto, Maputo</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Vila Olímpica Condomínio" 
                className="rounded-2xl shadow-elegant w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-lg">
                <p className="text-4xl font-bold">6+</p>
                <p className="text-sm">Anos de Excelência</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Nossos Diferenciais</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-all group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-gradient-to-br from-primary to-primary-glow rounded-2xl p-8 text-primary-foreground">
              <Target className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
              <p className="text-primary-foreground/90 text-lg">
                Proporcionar aos nossos moradores um ambiente residencial de excelência, 
                onde segurança, conforto e qualidade de vida se unem para criar a comunidade 
                ideal para famílias moçambicanas.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8">
              <Award className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Nossos Valores</h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{value.title}</p>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Nossa Jornada</h2>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-2xl font-bold text-accent">{item.year}</span>
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-lg p-4">
                    <p className="text-foreground">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Faça Parte da Nossa Comunidade</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra as oportunidades de viver em um dos condomínios mais bem estruturados da região.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/imoveis">
              <Button variant="hero" size="lg">Ver Imóveis Disponíveis</Button>
            </Link>
            <Link to="/contato">
              <Button variant="outline" size="lg">Entre em Contato</Button>
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;
