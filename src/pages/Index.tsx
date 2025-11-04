import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Properties from "@/components/Properties";
import Entrepreneurs from "@/components/Entrepreneurs";
import News from "@/components/News";
import Transparency from "@/components/Transparency";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Properties />
      <Entrepreneurs />
      <News />
      <Transparency />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
