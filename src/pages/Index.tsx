
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, CheckCircle, Smartphone, Ruler, Clock, Sparkles } from 'lucide-react';

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className="pt-32 pb-24 md:pt-40 md:pb-32 px-4 bg-gradient-to-b from-background to-secondary/20"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
                Design Your Dream Washroom with Confidence
              </h1>
              <p className="mt-6 text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Get instant estimates, explore premium fixtures, and transform your washroom with our interactive design calculator.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/calculator">
                    Start Designing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Explore Our Work
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 md:w-40 md:h-40 bg-primary/5 rounded-full"></div>
                <div className="relative overflow-hidden rounded-xl border border-border shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80" 
                    alt="Modern washroom design" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="inline-block bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium">
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
      <section 
        ref={featuresRef} 
        className="py-20 px-4 bg-background"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 reveal opacity-0">How It Works</h2>
            <p className="text-lg text-muted-foreground reveal opacity-0">
              Our calculator makes it easy to get an accurate estimate for your washroom project in just a few steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Smartphone className="h-10 w-10" />,
                title: "Select Project Type",
                description: "Choose between new construction or renovation for your washroom project.",
              },
              {
                icon: <Ruler className="h-10 w-10" />,
                title: "Enter Dimensions",
                description: "Specify your washroom dimensions for precise material calculations.",
              },
              {
                icon: <Sparkles className="h-10 w-10" />,
                title: "Choose Fixtures",
                description: "Select from premium fixtures and brand options for your perfect washroom.",
              },
              {
                icon: <Clock className="h-10 w-10" />,
                title: "Get Instant Estimate",
                description: "Receive a detailed breakdown of costs and timeline for your project.",
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 border border-border hover:shadow-md transition-all duration-300 reveal opacity-0"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 reveal opacity-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Service?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We combine precision, quality, and transparency to deliver washroom designs that exceed expectations.
              </p>
              
              <div className="space-y-4">
                {[
                  "Accurate cost estimates with no hidden charges",
                  "Premium fixtures from leading Indian and international brands",
                  "Professional design and installation services",
                  "Comprehensive project management from start to finish",
                  "Post-installation support and maintenance",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link to="/calculator">
                    Start Your Project
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 reveal opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Elegant washroom fixture" 
                  className="rounded-xl h-64 object-cover w-full object-center"
                />
                <img 
                  src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                  alt="Modern bath design" 
                  className="rounded-xl h-64 object-cover w-full"
                />
                <img 
                  src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Contemporary shower" 
                  className="rounded-xl h-64 object-cover w-full"
                />
                <img 
                  src="https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                  alt="Luxury vanity" 
                  className="rounded-xl h-64 object-cover w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 reveal opacity-0">Ready to Transform Your Washroom?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto reveal opacity-0" style={{ animationDelay: '0.1s' }}>
            Get started today with our design calculator and take the first step towards your dream washroom.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 reveal opacity-0" 
            style={{ animationDelay: '0.2s' }}
            asChild
          >
            <Link to="/calculator">
              Design Your Washroom Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
