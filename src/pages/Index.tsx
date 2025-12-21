import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Leadership from "@/components/Leadership";
import Properties from "@/components/Properties";
import Entrepreneurs from "@/components/Entrepreneurs";
import News from "@/components/News";
import Archive from "@/components/Archive";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Testimonials />
      <Leadership />
      <Properties />
      <Entrepreneurs />
      <News />
      <Archive />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
