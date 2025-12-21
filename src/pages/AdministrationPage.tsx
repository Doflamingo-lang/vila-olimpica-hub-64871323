import { ArrowLeft, Award, Calendar, Target, Heart, Users, Shield, Building2, Phone, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import presidenteImage from "@/assets/presidente-sindico.jpg";
import equipe1 from "@/assets/equipe-1.jpg";
import equipe2 from "@/assets/equipe-2.jpg";
import equipe3 from "@/assets/equipe-3.jpg";
import equipe4 from "@/assets/equipe-4.jpg";
import equipe5 from "@/assets/equipe-5.jpg";

const AdministrationPage = () => {
  const timeline = [
    {
      year: "2015",
      title: "Fundação do Condomínio",
      description: "O Condomínio Vila Olímpica foi oficialmente fundado no Bairro do Zimpeto.",
    },
    {
      year: "2017",
      title: "Primeira Gestão",
      description: "Eleição do primeiro conselho administrativo e estruturação da gestão condominial.",
    },
    {
      year: "2020",
      title: "Nova Administração",
      description: "João Manuel Cossa assume como presidente, trazendo uma visão de modernização.",
    },
    {
      year: "2022",
      title: "Digitalização",
      description: "Implementação do portal digital para moradores e transparência total.",
    },
    {
      year: "2024",
      title: "Expansão",
      description: "Ampliação das áreas de lazer e melhorias na infraestrutura geral.",
    },
  ];

  const teamMembers = [
    {
      role: "Vice-Presidente",
      name: "Maria Santos",
      department: "Administração",
      image: equipe1,
      bio: "Responsável pela gestão administrativa e coordenação das atividades do condomínio. Com mais de 10 anos de experiência em gestão predial.",
      email: "maria.santos@vilaolimpica.co.mz",
    },
    {
      role: "Tesoureiro",
      name: "Carlos Machava",
      department: "Finanças",
      image: equipe2,
      bio: "Gerencia as finanças do condomínio, incluindo orçamentos, pagamentos e relatórios financeiros mensais.",
      email: "carlos.machava@vilaolimpica.co.mz",
    },
    {
      role: "Secretária",
      name: "Ana Sitoe",
      department: "Comunicação",
      image: equipe3,
      bio: "Coordena a comunicação interna e externa, organizando reuniões, eventos e mantendo os moradores informados.",
      email: "ana.sitoe@vilaolimpica.co.mz",
    },
    {
      role: "Conselheiro",
      name: "Pedro Langa",
      department: "Infraestrutura",
      image: equipe4,
      bio: "Supervisiona a manutenção das instalações e coordena projetos de melhoria na infraestrutura do condomínio.",
      email: "pedro.langa@vilaolimpica.co.mz",
    },
    {
      role: "Conselheira",
      name: "Fátima Nhaca",
      department: "Eventos e Comunidade",
      image: equipe5,
      bio: "Organiza eventos comunitários e promove a integração entre os moradores do condomínio.",
      email: "fatima.nhaca@vilaolimpica.co.mz",
    },
  ];

  const values = [
    { icon: Shield, title: "Segurança", description: "Proteção e tranquilidade para todas as famílias" },
    { icon: Target, title: "Transparência", description: "Gestão aberta e prestação de contas clara" },
    { icon: Heart, title: "Comunidade", description: "Foco no bem-estar coletivo e união" },
    { icon: Building2, title: "Qualidade", description: "Excelência em todos os serviços prestados" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Link>
            
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
                Nossa Administração
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Conheça a Equipe que Cuida do Seu Lar
              </h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Uma equipe dedicada e comprometida com a excelência, trabalhando todos os dias 
                para garantir a melhor qualidade de vida para você e sua família.
              </p>
            </div>
          </div>
        </section>

        {/* President Biography */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 rounded-full mb-6">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-semibold">Presidente do Síndico</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  João Manuel Cossa
                </h2>
                
                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Síndico desde 2020</span>
                  </div>
                </div>
                
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed mb-8">
                  <p>
                    João Manuel Cossa é um líder visionário com mais de 15 anos de experiência 
                    em gestão imobiliária e administração condominial. Natural de Maputo, ele 
                    traz consigo uma paixão genuína pelo desenvolvimento comunitário e pela 
                    melhoria contínua das condições de vida dos moradores.
                  </p>
                  <p>
                    Sob sua liderança, o Condomínio Vila Olímpica passou por uma transformação 
                    significativa, implementando sistemas digitais de gestão, melhorando a 
                    infraestrutura e promovendo uma cultura de transparência e participação 
                    comunitária.
                  </p>
                  <p>
                    "Acredito que um condomínio é muito mais do que um conjunto de casas. 
                    É uma comunidade viva, onde cada família merece sentir-se segura, 
                    respeitada e parte de algo maior. Meu compromisso é trabalhar 
                    incansavelmente para que o Vila Olímpica seja um exemplo de qualidade 
                    de vida em Moçambique."
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:presidente@vilaolimpica.co.mz" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                    <Mail className="w-4 h-4" />
                    Enviar E-mail
                  </a>
                  <a href="#contato" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-all">
                    <Phone className="w-4 h-4" />
                    Agendar Reunião
                  </a>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-2xl">
                    <img
                      src={presidenteImage}
                      alt="João Manuel Cossa - Presidente do Síndico"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Valores</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Os princípios que guiam nossa gestão e todas as decisões do condomínio.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-elegant transition-all">
                  <div className="w-14 h-14 bg-accent/15 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 rounded-full mb-4">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Equipe de Trabalho</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Conselho Administrativo
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Profissionais dedicados que trabalham juntos para garantir o melhor funcionamento do condomínio.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant transition-all group"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      {member.role}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mt-1 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-3">
                      {member.department}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {member.bio}
                    </p>
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 rounded-full mb-4">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Nossa História</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Histórico da Administração
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A evolução do Condomínio Vila Olímpica ao longo dos anos.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                
                {timeline.map((item, index) => (
                  <div key={index} className="relative pl-20 pb-12 last:pb-0">
                    <div className="absolute left-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-elegant transition-all">
                      <span className="text-accent font-bold text-lg">{item.year}</span>
                      <h3 className="text-xl font-bold text-foreground mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Tem Alguma Dúvida ou Sugestão?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Nossa equipe está sempre disponível para ouvir você. Entre em contato conosco.
            </p>
            <Link to="/contato">
              <Button variant="accent" size="lg">
                Fale Conosco
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdministrationPage;
