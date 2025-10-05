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
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <DialogTitle>
              {authView === 'reset' ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
            <DialogDescription>
              {authView === 'reset' 
                ? 'Enter your email address to receive a password reset link' 
                : mode === 'login' 
                ? 'Sign in to your Data Hub account to access your academic dashboard' 
                : 'Create a new account to start managing your academic journey'
              }
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => onSwitchMode('register')}
                onSwitchToReset={handleSwitchToReset}
              />
            </TabsContent>
            
            <TabsContent value="register" className="mt-6">
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