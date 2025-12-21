import { Building2, ArrowLeft, FileText, Download, Eye, Calendar, Search, FolderArchive, BarChart3, Users, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppButton from "@/components/WhatsAppButton";
import DocumentPreviewDialog from "@/components/DocumentPreviewDialog";

interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_name: string;
  file_size: string | null;
  file_type: string | null;
  created_at: string;
}

const ArchivePage = () => {
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const documentTypes = ["Todos", "Financeiro", "Ata", "Regulamento", "Relatório", "Contrato"];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setDocuments(data || []);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const stats = [
    { icon: FileText, label: "Documentos Disponíveis", value: documents.length.toString() },
    { icon: BarChart3, label: "Relatórios Financeiros", value: documents.filter(d => d.category === "Financeiro").length.toString() },
    { icon: Users, label: "Atas de Assembleia", value: documents.filter(d => d.category === "Ata").length.toString() },
    { icon: Shield, label: "Contratos", value: documents.filter(d => d.category === "Contrato").length.toString() },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = selectedType === "Todos" || doc.category === selectedType;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesType && matchesSearch;
  });

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const handleDownload = (doc: Document) => {
    window.open(doc.file_url, "_blank");
  };

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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Arquivo</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Documentos e Relatórios</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Acesso completo a toda documentação oficial do condomínio. Visualize antes de baixar.
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
            {isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-24">
                <FolderArchive className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Nenhum documento disponível no momento.</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-primary to-primary-glow p-6">
                  <div className="flex items-center gap-3">
                    <FolderArchive className="w-8 h-8 text-primary-foreground" />
                    <div>
                      <h3 className="text-2xl font-bold text-primary-foreground">Documentação Oficial</h3>
                      <p className="text-primary-foreground/90">Clique no ícone de olho para visualizar antes de baixar</p>
                    </div>
                  </div>
                </div>

                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum documento encontrado com esses filtros.</p>
                  </div>
                ) : (
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
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                                {doc.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.created_at)}
                              </span>
                              {doc.file_size && <span>{doc.file_size}</span>}
                            </div>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Visualizar"
                              onClick={() => handlePreview(doc)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              title="Download"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

      <DocumentPreviewDialog
        document={selectedDocument}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <WhatsAppButton />
    </div>
  );
};

export default ArchivePage;
