import React, { useState, useEffect } from 'react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface ThemeToggleProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function ThemeToggle({ className, size = 'default', variant = 'ghost' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemTheme;
      
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    } catch (error) {
      console.warn('Theme initialization failed, using light theme:', error);
      setTheme('light');
    } finally {
      setMounted(true);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = async () => {
    setLoading(true);
    
    // Add a small delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    setLoading(false);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="sr-only">Loading theme</span>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={toggleTheme}
            disabled={loading}
            className={className}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">
              {loading ? 'Switching theme...' : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{loading ? 'Switching...' : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}