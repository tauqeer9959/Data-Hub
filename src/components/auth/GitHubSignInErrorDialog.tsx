import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertCircle, RefreshCw, Mail } from 'lucide-react';

interface GitHubSignInErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onUseEmail: () => void;
  errorType: 'popup_blocked' | 'cancelled' | 'network' | 'config' | 'timeout' | 'unknown';
  errorMessage?: string;
}

export function GitHubSignInErrorDialog({
  isOpen,
  onClose,
  onRetry,
  onUseEmail,
  errorType,
  errorMessage
}: GitHubSignInErrorDialogProps) {
  const getErrorContent = () => {
    switch (errorType) {
      case 'popup_blocked':
        return {
          title: 'Popup Blocked',
          description: 'Your browser blocked the GitHub sign-in popup. Please allow popups for this site and try again.',
          showRetry: true,
          showEmailOption: true
        };
      case 'cancelled':
        return {
          title: 'Sign-in Cancelled',
          description: 'You cancelled the GitHub sign-in process. Would you like to try again?',
          showRetry: true,
          showEmailOption: true
        };
      case 'network':
        return {
          title: 'Network Error',
          description: 'Unable to connect to GitHub. Please check your internet connection and try again.',
          showRetry: true,
          showEmailOption: true
        };
      case 'config':
        return {
          title: 'Configuration Error',
          description: 'GitHub authentication is not properly configured. Please contact support or use email sign-in.',
          showRetry: false,
          showEmailOption: true
        };
      case 'timeout':
        return {
          title: 'Connection Timeout',
          description: 'The sign-in process took too long. Please try again.',
          showRetry: true,
          showEmailOption: true
        };
      default:
        return {
          title: 'Sign-in Failed',
          description: errorMessage || 'An unexpected error occurred during GitHub sign-in. Please try again or use email sign-in.',
          showRetry: true,
          showEmailOption: true
        };
    }
  };

  const { title, description, showRetry, showEmailOption } = getErrorContent();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
          {showEmailOption && (
            <AlertDialogAction
              onClick={onUseEmail}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Mail className="mr-2 h-4 w-4" />
              Use Email Instead
            </AlertDialogAction>
          )}
          {showRetry && (
            <AlertDialogAction onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
