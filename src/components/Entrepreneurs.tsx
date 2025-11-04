import { Button } from "@/components/ui/button";
import { Briefcase, Phone, Mail, ExternalLink } from "lucide-react";

const Entrepreneurs = () => {
  const entrepreneurs = [
    {
      id: 1,
      name: "Maria Silva",
      service: "Designer de Interiores",
      category: "Decoração",
      description: "Transforme sua casa com design personalizado e moderno.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      phone: "+351 912 345 678",
      email: "maria@design.com",
    },
    {
      id: 2,
      name: "João Santos",
      service: "Personal Trainer",
      category: "Fitness",
      description: "Treinos personalizados e acompanhamento nutricional.",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80",
      phone: "+351 923 456 789",
      email: "joao@fitness.com",
    },
    {
      id: 3,
      name: "Ana Costa",
      service: "Passeadora de Cães",
      category: "Pet Care",
      description: "Passeios diários e cuidados com seu melhor amigo.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      phone: "+351 934 567 890",
      email: "ana@petcare.com",
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      service: "Chef Particular",
      category: "Gastronomia",
      description: "Refeições gourmet no conforto da sua casa.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      phone: "+351 945 678 901",
      email: "pedro@chef.com",
    },
    {
      id: 5,
      name: "Sofia Martins",
      service: "Professora de Yoga",
      category: "Bem-estar",
      description: "Aulas de yoga e meditação para todos os níveis.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
      phone: "+351 956 789 012",
      email: "sofia@yoga.com",
    },
    {
      id: 6,
      name: "Ricardo Ferreira",
      service: "Reparações Domésticas",
      category: "Manutenção",
      description: "Soluções rápidas para problemas do dia a dia.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
      phone: "+351 967 890 123",
      email: "ricardo@repairs.com",
    },
  ];

  return (
    <section id="empreendedores" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Empreendedores
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Serviços da Comunidade
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conecte-se com profissionais talentosos que fazem parte da nossa comunidade. 
            Apoie os negócios locais!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {entrepreneurs.map((entrepreneur) => (
            <div
              key={entrepreneur.id}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-elegant transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={entrepreneur.image}
                  alt={entrepreneur.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {entrepreneur.name}
                  </h3>
                  <p className="text-accent font-semibold text-sm">
                    {entrepreneur.service}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                    {entrepreneur.category}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 text-sm">
                {entrepreneur.description}
              </p>

              <div className="space-y-2 mb-4">
                <a 
                  href={`tel:${entrepreneur.phone}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {entrepreneur.phone}
                </a>
                <a 
                  href={`mailto:${entrepreneur.email}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {entrepreneur.email}
                </a>
              </div>

              <Button variant="outline" className="w-full group">
                Entrar em Contato
                <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-accent to-accent-glow rounded-2xl p-8 md:p-12 text-center shadow-glow">
          <Briefcase className="w-16 h-16 text-accent-foreground mx-auto mb-4" />
          <h3 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
            Divulgue Seu Negócio
          </h3>
          <p className="text-xl text-accent-foreground/90 mb-6 max-w-2xl mx-auto">
            Você é morador e tem um negócio ou serviço? 
            Anuncie aqui e alcance toda a comunidade!
          </p>
          <Button variant="outline" size="lg" className="bg-background/20 backdrop-blur-sm border-2 border-accent-foreground/30 text-accent-foreground hover:bg-background/30">
            Cadastrar Meu Serviço
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Entrepreneurs;
