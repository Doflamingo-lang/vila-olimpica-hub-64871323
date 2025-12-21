import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ResidentArea from "./pages/ResidentArea";
import AboutPage from "./pages/AboutPage";
import PropertiesPage from "./pages/PropertiesPage";
import MarketplacePage from "./pages/MarketplacePage";
import NewsPage from "./pages/NewsPage";
import TransparencyPage from "./pages/TransparencyPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/area-morador" element={<ResidentArea />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/imoveis" element={<PropertiesPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/transparencia" element={<TransparencyPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
