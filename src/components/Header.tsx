
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 w-full z-50 py-4 transition-all duration-300 ease-in-out',
        isScrolled
          ? 'glassmorphism shadow-sm py-3'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center"
        >
          <span className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {isMobile ? 'Dream Space' : 'Your Dream Space'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
          <NavItem to="/" label="Home" delay="0.2s" />
          <NavItem to="/calculator" label="Calculator" delay="0.3s" />
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button asChild className="btn-transition">
              <Link to="/calculator">Get Started</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X size={24} className="animate-fade-in" />
          ) : (
            <Menu size={24} className="animate-fade-in" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glassmorphism shadow-lg animate-fade-in z-50">
          <nav className="flex flex-col py-4 px-6">
            <MobileNavItem to="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem to="/calculator" label="Calculator" onClick={() => setMobileMenuOpen(false)} />
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link to="/calculator">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  delay: string;
}

const NavItem = ({ to, label, delay }: NavItemProps) => (
  <Link
    to={to}
    className="relative text-foreground/80 hover:text-foreground transition-colors duration-300 animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <span className="relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
      {label}
    </span>
  </Link>
);

interface MobileNavItemProps {
  to: string;
  label: string;
  onClick: () => void;
}

const MobileNavItem = ({ to, label, onClick }: MobileNavItemProps) => (
  <Link
    to={to}
    className="py-3 text-foreground/80 hover:text-foreground border-b border-border/50 transition-colors duration-300"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Header;
