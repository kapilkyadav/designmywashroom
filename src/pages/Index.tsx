import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, CheckCircle, Smartphone, Ruler, Clock, Sparkles, Star, Quote } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const testimonials = [{
    name: "Rajesh Kumar",
    role: "Homeowner",
    content: "The washroom renovation exceeded our expectations. The team's attention to detail and use of premium fixtures transformed our space completely.",
    rating: 5
  }, {
    name: "Priya Sharma",
    role: "Interior Designer",
    content: "Working with this team has been fantastic. Their extensive range of premium brands and professional installation services make them my go-to choice for clients.",
    rating: 5
  }, {
    name: "Amit Patel",
    role: "Property Developer",
    content: "Outstanding service and quality. The estimation calculator helped us plan our budget accurately, and the final result was exactly what we envisioned.",
    rating: 5
  }];
  const brands = [{
    name: "Jaquar",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/Jaguar.png"
  }, {
    name: "Astral Pipes",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/ASTRAL-PIPES.png"
  }, {
    name: "Grohe",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/GROHE.png"
  }, {
    name: "Cera",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/CERA.png"
  }, {
    name: "Kajaria",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/Kajaria.png"
  }, {
    name: "Kohler",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/KOHLER.png"
  }, {
    name: "Anchor",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/Anchor.png"
  }, {
    name: "Asian Paints",
    logo: "https://ydsindia.co.in/wp-content/uploads/2024/10/Asian-Paints.png"
  }];
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, {
      threshold: 0.1
    });
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-16 sm:pb-20 md:pb-24 lg:pb-32 px-4 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
                Design Your Dream Washroom with Confidence
              </h1>
              <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground animate-fade-in" style={{
              animationDelay: '0.2s'
            }}>
                Get instant estimates, explore premium fixtures, and transform your washroom with our interactive design calculator.
              </p>
              <div className="mt-6 md:mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4 animate-fade-in" style={{
              animationDelay: '0.4s'
            }}>
                <Button size={isMobile ? "default" : "lg"} className={isMobile ? "text-base px-4 py-2" : "text-lg px-8 py-6"} asChild>
                  <Link to="/calculator">
                    Start Designing
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </Button>
                
              </div>
            </div>
            
            <div className="md:w-1/2 animate-fade-in mt-8 md:mt-0" style={{
            animationDelay: '0.3s'
          }}>
              <div className="relative">
                <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-primary/5 rounded-full"></div>
                <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-primary/5 rounded-full"></div>
                <div className="relative overflow-hidden rounded-xl border border-border shadow-lg">
                  <img src="/lovable-uploads/b31d2c04-d06b-47b1-9748-54f38a30b99c.png" alt="Modern washroom design" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                    <div className="inline-block backdrop-blur-sm rounded-lg px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-zinc-900">
                      Premium Design • Quality Materials
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 reveal opacity-0">How It Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground reveal opacity-0">
              Our calculator makes it easy to get an accurate estimate for your washroom project in just a few steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[{
            icon: <Smartphone className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Select Project Type",
            description: "Choose between new construction or renovation for your washroom project."
          }, {
            icon: <Ruler className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Enter Dimensions",
            description: "Specify your washroom dimensions for precise material calculations."
          }, {
            icon: <Sparkles className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Choose Fixtures",
            description: "Select from premium fixtures and brand options for your perfect washroom."
          }, {
            icon: <Clock className="h-8 w-8 md:h-10 md:w-10" />,
            title: "Get Instant Estimate",
            description: "Receive a detailed breakdown of costs and timeline for your project."
          }].map((feature, index) => <Card key={index} className="p-4 sm:p-6 border border-border hover:shadow-md transition-all duration-300 reveal opacity-0" style={{
            animationDelay: `${0.1 * (index + 1)}s`
          }}>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
              </Card>)}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 reveal opacity-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Why Choose Our Service?</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                We combine precision, quality, and transparency to deliver washroom designs that exceed expectations.
              </p>
              
              <div className="space-y-3 md:space-y-4">
                {["Accurate cost estimates with no hidden charges", "Premium fixtures from leading Indian and international brands", "Professional design and installation services", "Comprehensive project management from start to finish", "Post-installation support and maintenance"].map((benefit, index) => <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{benefit}</span>
                  </div>)}
              </div>
              
              <div className="mt-8 md:mt-10">
                <Button size={isMobile ? "default" : "lg"} asChild>
                  <Link to="/calculator">
                    Start Your Project
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 reveal opacity-0 mt-8 md:mt-0" style={{
            animationDelay: '0.2s'
          }}>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" alt="Elegant washroom fixture" className="rounded-xl h-48 sm:h-56 md:h-64 object-cover w-full object-center" />
                <img src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="Modern bath design" className="rounded-xl h-48 sm:h-56 md:h-64 object-cover w-full" />
                <img src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" alt="Contemporary shower" className="rounded-xl h-48 sm:h-56 md:h-64 object-cover w-full" />
                <img alt="Luxury washroom design" className="rounded-xl h-48 sm:h-56 md:h-64 object-cover w-full" src="/lovable-uploads/ee3720e2-027e-4df6-953d-e88409b8edda.jpg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 reveal opacity-0">
              What Our Clients Say
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground reveal opacity-0">
              Real experiences from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="p-6 reveal opacity-0" style={{
            animationDelay: `${0.1 * (index + 1)}s`
          }}>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                </div>
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-sm md:text-base mb-4">{testimonial.content}</p>
                <div className="mt-auto">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Partner Brands Section */}
      <section className="py-16 sm:py-20 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 reveal opacity-0">
              Our Partner Brands
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground reveal opacity-0">Partnered with India's Leading Brands</p>
          </div>

          <div className="relative px-12 reveal opacity-0">
            <Carousel opts={{
            align: "start",
            loop: true
          }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {brands.map((brand, index) => <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Card className="p-6">
                      <div className="aspect-[3/2] relative">
                        <img src={brand.logo} alt={`${brand.name} logo`} className="object-contain w-full h-full" />
                      </div>
                    </Card>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 reveal opacity-0">Ready to Transform Your Washroom?</h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto reveal opacity-0" style={{
          animationDelay: '0.1s'
        }}>
            Get started today with our design calculator and take the first step towards your dream washroom.
          </p>
          <Button size={isMobile ? "default" : "lg"} variant="secondary" className={`text-base md:text-lg ${isMobile ? "px-4 py-2" : "px-8 py-6"} reveal opacity-0`} style={{
          animationDelay: '0.2s'
        }} asChild>
            <Link to="/calculator">
              Design Your Washroom Now
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default Index;