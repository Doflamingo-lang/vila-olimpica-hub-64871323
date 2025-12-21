import { Users, Award, Building2, Phone } from "lucide-react";
import presidenteImage from "@/assets/presidente-sindico.jpg";

const Leadership = () => {
  const teamMembers = [
    {
      role: "Vice-Presidente",
      name: "Maria Santos",
      department: "Administração",
    },
    {
      role: "Tesoureiro",
      name: "Carlos Machava",
      department: "Finanças",
    },
    {
      role: "Secretário",
      name: "Ana Sitoe",
      department: "Comunicação",
    },
    {
      role: "Conselheiro",
      name: "Pedro Langa",
      department: "Infraestrutura",
    },
  ];

  return (
    <section id="lideranca" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Nossa Liderança
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Administração do Condomínio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça a equipe dedicada que trabalha diariamente para garantir o bem-estar 
            e a qualidade de vida de todos os moradores.
          </p>
        </div>

        {/* President Section */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 md:p-12 mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary-foreground/30 shadow-2xl">
                <img
                  src={presidenteImage}
                  alt="Presidente do Síndico"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 rounded-full mb-4">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Presidente do Síndico</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                João Manuel Cossa
              </h3>
              <p className="text-primary-foreground/80 text-lg mb-4">
                Síndico desde 2020
              </p>
              <p className="text-primary-foreground/90 max-w-xl leading-relaxed mb-6">
                "É uma honra liderar este condomínio e trabalhar em prol do bem-estar de todas as famílias. 
                Nossa missão é garantir transparência, segurança e qualidade de vida para cada morador. 
                Juntos, construímos uma comunidade forte e unida."
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="#contato"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Entrar em Contato
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-accent/15 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Equipe de Trabalho</h3>
              <p className="text-muted-foreground">Membros do conselho administrativo</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-secondary/50 rounded-xl p-6 text-center hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  {member.role}
                </span>
                <h4 className="text-lg font-bold text-foreground mt-1 mb-1">
                  {member.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {member.department}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leadership;
