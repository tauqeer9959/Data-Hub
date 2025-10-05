import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { Menu, X, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function Header({ onOpenAuth }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Data Hub</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('hero')}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Contact
          </button>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            onClick={() => onOpenAuth('login')}
            className="text-foreground hover:text-primary"
          >
            Sign In
          </Button>
          <Button onClick={() => onOpenAuth('register')}>
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <button 
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left text-foreground/80 hover:text-foreground py-2"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-foreground/80 hover:text-foreground py-2"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-foreground/80 hover:text-foreground py-2"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-foreground/80 hover:text-foreground py-2"
            >
              Contact
            </button>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle size="sm" />
              </div>
              <Button 
                variant="outline" 
                onClick={() => onOpenAuth('login')}
                className="w-full"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => onOpenAuth('register')}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}