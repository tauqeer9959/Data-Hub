import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw, Mail, HelpCircle } from 'lucide-react';

interface GoogleSignInErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onUseEmail: () => void;
  errorType: 'popup_blocked' | 'cancelled' | 'network' | 'config' | 'timeout' | 'unknown';
  errorMessage?: string;
}

export function GoogleSignInErrorDialog({
  isOpen,
  onClose,
  onRetry,
  onUseEmail,
  errorType,
  errorMessage
}: GoogleSignInErrorDialogProps) {
  const getErrorDetails = () => {
    switch (errorType) {
      case 'popup_blocked':
        return {
          title: 'Popup Blocked',
          description: 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.',
          showBrowserHelp: true
        };
      case 'cancelled':
        return {
          title: 'Sign-In Cancelled',
          description: 'You cancelled the Google sign-in process. You can try again or use email/password instead.',
          showBrowserHelp: false
        };
      case 'network':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to Google. Please check your internet connection and try again.',
          showBrowserHelp: true
        };
      case 'config':
        return {
          title: 'Configuration Error',
          description: 'Google Sign-In is temporarily unavailable. Please try email/password sign-in.',
          showBrowserHelp: false
        };
      case 'timeout':
        return {
          title: 'Request Timeout',
          description: 'Google sign-in took too long to respond. Please check your connection and try again.',
          showBrowserHelp: true
        };
      default:
        return {
          title: 'Sign-In Failed',
          description: errorMessage || 'An unexpected error occurred during Google sign-in.',
          showBrowserHelp: true
        };
    }
  };

  const { title, description, showBrowserHelp } = getErrorDetails();

  const openBrowserHelp = () => {
    const helpText = `
To fix Google Sign-In issues:

1. Allow popups for this website
2. Check your internet connection
3. Disable ad blockers temporarily
4. Try in incognito/private mode
5. Clear browser cache and cookies

If problems persist, try using email/password sign-in instead.
    `.trim();
    
    // Create a simple help modal
    alert(helpText);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={onUseEmail}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Use Email/Password
            </Button>
            
            <Button
              onClick={onRetry}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
          
          {showBrowserHelp && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openBrowserHelp}
              className="w-full sm:w-auto"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Browser Help
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}