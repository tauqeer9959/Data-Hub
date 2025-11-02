import React from 'react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenNav: () => void;
}

export function Header({ onOpenAuth, onOpenNav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenNav}
          className="h-9 w-9 sm:h-10 sm:w-10 p-0"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sr-only">Open navigation menu</span>
        </Button>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs sm:text-sm font-semibold">DH</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground hidden sm:inline">Data Hub</span>
        </div>

        {/* Right: Theme Toggle & Auth Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            onClick={() => onOpenAuth('login')}
            className="hidden sm:inline-flex h-9"
            size="sm"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => onOpenAuth('register')}
            className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
            size="sm"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}