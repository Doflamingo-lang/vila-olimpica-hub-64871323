import { Building2, ArrowLeft, FileText, Download, Eye, Calendar, Filter, Search, FolderOpen, BarChart3, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

const TransparencyPage = () => {
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const documentTypes = ["Todos", "Financeiro", "Ata", "Regulamento", "Relatório", "Contrato"];

  const documents = [
    {
      id: 1,
      title: "Relatório Financeiro - Março 2024",
      type: "Financeiro",
      date: "01/03/2024",
      size: "2.4 MB",
      description: "Demonstrativo completo de receitas e despesas do mês de Março.",
    },
    {
      id: 2,
      title: "Ata da Assembleia Geral - Fevereiro 2024",
      type: "Ata",
      date: "20/02/2024",
      size: "1.8 MB",
      description: "Registro oficial das deliberações da assembleia geral ordinária.",
    },
    {
      id: 3,
      title: "Orçamento Anual 2024",
      type: "Financeiro",
      date: "15/01/2024",
      size: "3.2 MB",
      description: "Planejamento financeiro aprovado para o exercício de 2024.",
    },
    {
      id: 4,
      title: "Regulamento Interno Atualizado",
      type: "Regulamento",
      date: "10/01/2024",
      size: "1.5 MB",
      description: "Normas e regras para convivência no condomínio.",
    },
    {
      id: 5,
      title: "Relatório de Manutenção - Q4 2023",
      type: "Relatório",
      date: "28/12/2023",
      size: "2.1 MB",
      description: "Detalhamento de todas as manutenções realizadas no último trimestre.",
    },
    {
      id: 6,
      title: "Contrato de Segurança 2024",
      type: "Contrato",
      date: "15/12/2023",
      size: "4.5 MB",
      description: "Contrato com empresa de segurança patrimonial.",
    },
    {
      id: 7,
      title: "Ata da Assembleia Extraordinária - Dezembro 2023",
      type: "Ata",
      date: "10/12/2023",
      size: "1.2 MB",
      description: "Deliberações sobre investimentos em infraestrutura.",
    },
    {
      id: 8,
      title: "Relatório Financeiro - Fevereiro 2024",
      type: "Financeiro",
      date: "05/02/2024",
      size: "2.3 MB",
      description: "Demonstrativo completo de receitas e despesas do mês de Fevereiro.",
    },
    {
      id: 9,
      title: "Política de Privacidade",
      type: "Regulamento",
      date: "01/01/2024",
      size: "0.8 MB",
      description: "Política de tratamento de dados pessoais dos moradores.",
    },
    {
      id: 10,
      title: "Contrato de Manutenção de Elevadores",
      type: "Contrato",
      date: "20/11/2023",
      size: "3.1 MB",
      description: "Contrato de manutenção preventiva e corretiva dos elevadores.",
    },
  ];

  const stats = [
    { icon: FileText, label: "Documentos Disponíveis", value: "156" },
    { icon: BarChart3, label: "Relatórios Financeiros", value: "48" },
    { icon: Users, label: "Atas de Assembleia", value: "32" },
    { icon: Shield, label: "Contratos Vigentes", value: "12" },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = selectedType === "Todos" || doc.type === selectedType;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Transparência</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Documentos e Relatórios</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Acesso completo a toda documentação oficial do condomínio. Transparência total para todos os moradores.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border text-center">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {documentTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  size="sm"
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredDocuments.length}</span> documentos
              {selectedType !== "Todos" && ` do tipo ${selectedType}`}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-primary to-primary-glow p-6">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-8 h-8 text-primary-foreground" />
                  <div>
                    <h3 className="text-2xl font-bold text-primary-foreground">Documentação Oficial</h3>
                    <p className="text-primary-foreground/90">Todos os documentos estão disponíveis para consulta e download</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-foreground mb-1">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                            {doc.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {doc.date}
                          </span>
                          <span>{doc.size}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" title="Visualizar">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Document CTA */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Não Encontrou o Documento?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Solicite qualquer documento ou informação adicional através do nosso canal de atendimento.
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => window.open('https://wa.me/258843001234?text=Olá! Gostaria de solicitar um documento do condomínio.', '_blank')}
          >
            Solicitar Documento
          </Button>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default TransparencyPage;
