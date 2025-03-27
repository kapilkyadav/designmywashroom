
import React from 'react';
import { CalculatorProvider } from '@/hooks/useCalculator';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

const Calculator = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster />
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
              Design Your Dream Washroom
            </h1>
            <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Create a detailed estimate for your washroom project in just a few simple steps.
            </p>
          </div>
          
          <Separator className="max-w-4xl mx-auto mb-12" />
          
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
