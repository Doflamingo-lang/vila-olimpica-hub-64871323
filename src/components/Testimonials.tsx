import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Maria da Conceição",
      role: "Moradora há 5 anos",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      quote: "Morar no Vila Olímpica transformou a qualidade de vida da minha família. A segurança, a infraestrutura e o senso de comunidade são incomparáveis. Recomendo a todos que buscam um lar seguro e acolhedor.",
      rating: 5,
      location: "Bloco A",
    },
    {
      id: 2,
      name: "António Machava",
      role: "Morador há 3 anos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "A administração do condomínio é transparente e sempre atenta às necessidades dos moradores. As áreas de lazer são excelentes para as crianças e a manutenção é impecável.",
      rating: 5,
      location: "Bloco B",
    },
    {
      id: 3,
      name: "Fátima Nguenha",
      role: "Moradora há 2 anos",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "O que mais aprecio é a comunidade unida. Os eventos organizados pela administração aproximam os vizinhos e criam laços de amizade. É muito mais do que apenas um lugar para morar.",
      rating: 5,
      location: "Bloco C",
    },
    {
      id: 4,
      name: "Carlos Sitoe",
      role: "Morador há 4 anos",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "A localização privilegiada e o acesso fácil aos serviços essenciais fazem toda a diferença no dia a dia. O Vila Olímpica superou todas as minhas expectativas.",
      rating: 5,
      location: "Bloco D",
    },
    {
      id: 5,
      name: "Joana Macuácua",
      role: "Moradora há 6 anos",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      quote: "Desde que me mudei para cá, sinto-me verdadeiramente em casa. A segurança 24 horas nos dá paz de espírito, e as instalações são sempre bem mantidas.",
      rating: 5,
      location: "Bloco A",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return result;
  };

  return (
    <section id="depoimentos" className="py-24 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
            Depoimentos
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            O Que Dizem Nossos Moradores
          </h2>
          <p className="text-lg text-muted-foreground">
            Histórias reais de famílias que escolheram o Vila Olímpica como seu lar.
          </p>
        </div>

        {/* Testimonials Carousel - Desktop */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-6 mb-8">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className={`group bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all duration-500 ${
                  index === 1 ? "scale-105 shadow-elegant z-10" : "hover:shadow-card"
                }`}
              >
                <Quote className="w-10 h-10 text-accent/30 mb-4" />
                
                <p className="text-foreground leading-relaxed mb-6 min-h-[120px]">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary font-medium">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full w-12 h-12 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full w-12 h-12 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Testimonials Carousel - Mobile/Tablet */}
        <div className="lg:hidden">
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-2"
                  >
                    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-card">
                      <Quote className="w-8 h-8 text-accent/30 mb-4" />
                      
                      <p className="text-foreground leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </p>
                      
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                        />
                        <div>
                          <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          <p className="text-xs text-primary font-medium">{testimonial.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-primary w-6"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { value: "98%", label: "Satisfação" },
            { value: "500+", label: "Famílias Felizes" },
            { value: "9+", label: "Anos de História" },
            { value: "4.9", label: "Avaliação Média" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 md:p-6 bg-card rounded-xl border border-border">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
