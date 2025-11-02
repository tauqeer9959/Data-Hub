import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { Home, Info, Sparkles, Mail, LogIn, UserPlus } from 'lucide-react';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function NavigationSidebar({ isOpen, onClose, onOpenAuth }: NavigationSidebarProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      onClose();
    }
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    onClose();
    setTimeout(() => {
      onOpenAuth(mode);
    }, 300);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="text-left">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">DH</span>
            </div>
            <SheetTitle className="text-xl">Data Hub</SheetTitle>
          </div>
          <SheetDescription className="text-left">
            Your academic management solution
          </SheetDescription>
        </SheetHeader>

        <nav className="mt-8 flex flex-col space-y-1">
          <Button
            variant="ghost"
            onClick={() => scrollToSection('hero')}
            className="justify-start w-full h-12 px-4"
          >
            <Home className="mr-3 h-5 w-5" />
            <span>Home</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => scrollToSection('about')}
            className="justify-start w-full h-12 px-4"
          >
            <Info className="mr-3 h-5 w-5" />
            <span>About</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => scrollToSection('features')}
            className="justify-start w-full h-12 px-4"
          >
            <Sparkles className="mr-3 h-5 w-5" />
            <span>Features</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => scrollToSection('contact')}
            className="justify-start w-full h-12 px-4"
          >
            <Mail className="mr-3 h-5 w-5" />
            <span>Contact</span>
          </Button>
        </nav>

        <div className="mt-8 border-t pt-6 space-y-3">
          <div className="flex items-center justify-between px-4 mb-4">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          <Button
            variant="outline"
            onClick={() => handleAuthClick('login')}
            className="w-full h-11 justify-start px-4"
          >
            <LogIn className="mr-3 h-5 w-5" />
            <span>Sign In</span>
          </Button>

          <Button
            onClick={() => handleAuthClick('register')}
            className="w-full h-11 justify-start px-4"
          >
            <UserPlus className="mr-3 h-5 w-5" />
            <span>Get Started</span>
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Data Hub. All rights reserved.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
