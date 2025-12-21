import { Building2, ArrowLeft, Store, Phone, Mail, MapPin, Clock, Image, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppButton from "@/components/WhatsAppButton";

const RegisterServicePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    category: "",
    phone: "",
    email: "",
    location: "",
    description: "",
    fullDescription: "",
    hours: "",
  });

  const categories = [
    "Alimentação",
    "Comércio",
    "Serviços",
    "Moda",
    "Transporte",
    "Agricultura",
    "Tecnologia",
    "Saúde",
    "Educação",
    "Outro"
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.ownerName || !formData.businessName || !formData.category || !formData.phone || !formData.email || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simular envio do formulário
    try {
      // Construir mensagem para WhatsApp
      const message = `
*Novo Cadastro de Serviço - Marketplace Vila Olímpica*

*Proprietário:* ${formData.ownerName}
*Nome do Negócio:* ${formData.businessName}
*Categoria:* ${formData.category}
*Telefone:* ${formData.phone}
*Email:* ${formData.email}
*Localização:* ${formData.location}
*Horário:* ${formData.hours}

*Descrição:*
${formData.description}

*Descrição Completa:*
${formData.fullDescription}
      `.trim();

      // Abrir WhatsApp com a mensagem
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/258843001234?text=${encodedMessage}`, '_blank');

      toast({
        title: "Solicitação enviada!",
        description: "A sua solicitação foi enviada. Entraremos em contacto em breve para confirmar o cadastro.",
      });

      // Limpar formulário
      setFormData({
        ownerName: "",
        businessName: "",
        category: "",
        phone: "",
        email: "",
        location: "",
        description: "",
        fullDescription: "",
        hours: "",
      });

    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Condomínio</span>
              </div>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Store className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cadastre Seu Serviço</h1>
            <p className="text-primary-foreground/90">
              Divulgue seu negócio para toda a comunidade do Vila Olímpica. Preencha o formulário abaixo.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações do Proprietário */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Informações do Proprietário
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ownerName">Nome Completo *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Seu nome completo"
                      value={formData.ownerName}
                      onChange={(e) => handleChange("ownerName", e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+258 84 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          className="pl-10"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="pl-10"
                          maxLength={255}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Negócio */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5 text-accent" />
                  Informações do Negócio
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Nome do Negócio/Serviço *</Label>
                    <Input
                      id="businessName"
                      placeholder="Ex: Salão de Beleza Elegância"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Ex: Vila Olímpica - Bloco A"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="pl-10"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hours">Horário de Funcionamento</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="hours"
                        placeholder="Ex: Segunda a Sexta: 8h - 18h"
                        value={formData.hours}
                        onChange={(e) => handleChange("hours", e.target.value)}
                        className="pl-10"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição Curta *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva brevemente o seu negócio (máx. 150 caracteres)"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      maxLength={150}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/150 caracteres
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fullDescription">Descrição Completa</Label>
                    <Textarea
                      id="fullDescription"
                      placeholder="Descreva em detalhes os seus produtos/serviços, diferenciais, etc."
                      value={formData.fullDescription}
                      onChange={(e) => handleChange("fullDescription", e.target.value)}
                      maxLength={1000}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.fullDescription.length}/1000 caracteres
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações sobre o Processo */}
              <div className="bg-secondary/50 border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Como funciona?</h2>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Preencha o formulário com os dados do seu negócio</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>A sua solicitação será enviada para nossa equipe</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Entraremos em contacto para validar as informações</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>O seu negócio será publicado no Marketplace!</span>
                  </li>
                </ol>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
                <Link to="/marketplace" className="sm:flex-shrink-0">
                  <Button type="button" variant="outline" size="lg" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default RegisterServicePage;
