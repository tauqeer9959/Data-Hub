import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, BarChart3, Shield, Cloud } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface HeroSectionProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  return (
    <section id="hero" className="py-12 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Manage Your{' '}
                <span className="text-primary">Academic Journey</span>{' '}
                with Confidence
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Comprehensive academic management system that helps students track their progress, 
                manage courses, projects, and certificates all in one secure platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => onOpenAuth('register')}
                className="text-lg px-8 py-4 h-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onOpenAuth('login')}
                className="text-lg px-8 py-4 h-auto"
              >
                Sign In
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Smart Analytics</p>
                  <p className="text-xs text-muted-foreground">Track your progress</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Secure & Private</p>
                  <p className="text-xs text-muted-foreground">Your data is safe</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Cloud Storage</p>
                  <p className="text-xs text-muted-foreground">Access anywhere</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1727790632675-204d26c2326c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzU5NDM1NzQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Student studying with Data Hub"
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating stats cards - hide on small screens */}
            <div className="hidden sm:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-card border rounded-xl p-3 lg:p-4 shadow-lg">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-semibold">GPA Tracking</p>
                  <p className="text-xs text-muted-foreground hidden lg:block">Real-time updates</p>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:block absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-card border rounded-xl p-3 lg:p-4 shadow-lg">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-semibold">Secure Platform</p>
                  <p className="text-xs text-muted-foreground hidden lg:block">Enterprise grade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}