
import React from 'react';
import { CalculatorProvider } from '@/hooks/useCalculator';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Calculator = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster />
      <Header />
      <main className="flex-grow pt-20 md:pt-24 pb-10 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 animate-fade-in">
              {isMobile ? 'Design Your Dream Washroom' : 'Design Your Dream Washroom'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Create a detailed estimate for your washroom project in just a few simple steps.
            </p>
          </div>
          
          <Separator className="max-w-4xl mx-auto mb-8 md:mb-12" />
          
          <CalculatorProvider>
            <CalculatorForm />
          </CalculatorProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;
