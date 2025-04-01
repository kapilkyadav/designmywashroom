
import React, { useEffect } from 'react';
import { CalculatorProvider, useCalculator } from '@/hooks/calculator';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Toaster } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Debug wrapper component to log important state changes
const CalculatorDebugWrapper = ({ children }: { children: React.ReactNode }) => {
  const { state } = useCalculator();
  
  // Log whenever the estimate changes
  useEffect(() => {
    if (state.estimate && state.estimate.total > 0) {
      console.log('Estimate updated:', {
        fixtureCost: state.estimate.fixtureCost,
        plumbingCost: state.estimate.plumbingCost,
        tilingCost: state.estimate.tilingCost,
        productCost: state.estimate.productCost,
        total: state.estimate.total
      });
    }
  }, [state.estimate]);
  
  // Log brand selection
  useEffect(() => {
    if (state.selectedBrand) {
      console.log('Brand selected:', state.selectedBrand);
    }
  }, [state.selectedBrand]);
  
  return <>{children}</>;
};

const Calculator = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster richColors position="top-center" closeButton={true} />
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
            <CalculatorDebugWrapper>
              <CalculatorForm />
            </CalculatorDebugWrapper>
          </CalculatorProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;
