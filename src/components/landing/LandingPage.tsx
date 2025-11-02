import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { FeaturesSection } from './FeaturesSection';
import { ContactSection } from './ContactSection';
import { AuthModal } from './AuthModal';
import { Header } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { NavigationSidebar } from './NavigationSidebar';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showNavSidebar, setShowNavSidebar] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenAuth={handleOpenAuth} 
        onOpenNav={() => setShowNavSidebar(true)}
      />
      
      <main>
        <HeroSection onOpenAuth={handleOpenAuth} />
        <AboutSection />
        <FeaturesSection />
        <ContactSection />
      </main>
      
      <LandingFooter />
      
      <NavigationSidebar
        isOpen={showNavSidebar}
        onClose={() => setShowNavSidebar(false)}
        onOpenAuth={handleOpenAuth}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  );
}