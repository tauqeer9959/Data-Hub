import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { FeaturesSection } from './FeaturesSection';
import { ContactSection } from './ContactSection';
import { AuthModal } from './AuthModal';
import { Header } from './LandingHeader';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={handleOpenAuth} />
      
      <main>
        <HeroSection onOpenAuth={handleOpenAuth} />
        <AboutSection />
        <FeaturesSection />
        <ContactSection />
      </main>
      
      <LandingFooter />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  );
}