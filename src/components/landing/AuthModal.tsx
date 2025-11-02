import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LoginForm } from '../auth/LoginForm';
import { RegisterForm } from '../auth/RegisterForm';
import { ResetPasswordForm } from '../auth/ResetPasswordForm';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  const [authView, setAuthView] = useState<'auth' | 'reset'>('auth');

  const handleAuthSuccess = () => {
    onClose();
  };

  const handleSwitchToReset = () => {
    setAuthView('reset');
  };

  const handleBackToAuth = () => {
    setAuthView('auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-md mx-auto max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-3 sm:pb-4">
          <div className="space-y-1 pr-8">
            <DialogTitle className="text-lg sm:text-xl">
              {authView === 'reset' ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {authView === 'reset' 
                ? 'Enter your email address to receive a password reset link' 
                : mode === 'login' 
                ? 'Sign in to your Data Hub account' 
                : 'Create your account to get started'
              }
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {authView === 'reset' ? (
          <ResetPasswordForm
            onSuccess={handleBackToAuth}
            onSwitchToLogin={handleBackToAuth}
          />
        ) : (
          <Tabs value={mode} onValueChange={(value) => onSwitchMode(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
              <TabsTrigger value="login" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-sm">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4 sm:mt-6">
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => onSwitchMode('register')}
                onSwitchToReset={handleSwitchToReset}
              />
            </TabsContent>
            
            <TabsContent value="register" className="mt-4 sm:mt-6">
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => onSwitchMode('login')}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}