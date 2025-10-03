import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { GoogleSignInErrorDialog } from './GoogleSignInErrorDialog';

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  disabled?: boolean;
  showFallbackOption?: boolean;
}

export function GoogleSignInButton({ onSuccess, disabled, showFallbackOption = true }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorType, setErrorType] = useState<'popup_blocked' | 'cancelled' | 'network' | 'config' | 'timeout' | 'unknown'>('unknown');
  const [errorMessage, setErrorMessage] = useState('');

  const showErrorWithDialog = (type: typeof errorType, message?: string) => {
    setErrorType(type);
    setErrorMessage(message || '');
    setShowErrorDialog(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      
      // Show initial loading toast
      toast.loading('Opening Google Sign-In...', {
        id: 'google-signin'
      });
      
      // Check if we're in a popup-blocking environment
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (!testPopup) {
        toast.dismiss('google-signin');
        showErrorWithDialog('popup_blocked');
        return;
      }
      testPopup.close();

      // Trigger Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Changed from 'consent' to allow account selection
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.dismiss('google-signin');
        
        // Handle specific error cases
        if (error.message.includes('popup_closed_by_user') || error.message.includes('popup_closed')) {
          showErrorWithDialog('cancelled');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          showErrorWithDialog('network');
        } else if (error.message.includes('unauthorized') || error.message.includes('invalid_client')) {
          showErrorWithDialog('config');
        } else {
          showErrorWithDialog('unknown', error.message);
        }
        return;
      }

      // Show success state briefly
      toast.dismiss('google-signin');
      toast.success('Redirecting to Google...', {
        id: 'google-redirect',
        duration: 2000
      });
      
      setSuccess(true);
      
      // The OAuth flow will redirect to /auth/callback
      // Success handling happens there
      
    } catch (err) {
      console.error('Unexpected Google sign-in error:', err);
      toast.dismiss('google-signin');
      
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.name === 'TimeoutError') {
          showErrorWithDialog('timeout');
        } else {
          showErrorWithDialog('unknown', err.message);
        }
      } else {
        showErrorWithDialog('unknown');
      }
    } finally {
      setLoading(false);
      // Reset success state after a delay
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : success ? (
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {loading ? 'Connecting to Google...' : success ? 'Redirecting...' : 'Continue with Google'}
      </Button>

      {/* Error Dialog */}
      <GoogleSignInErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onRetry={() => {
          setShowErrorDialog(false);
          setTimeout(() => handleGoogleSignIn(), 100);
        }}
        onUseEmail={() => {
          setShowErrorDialog(false);
          window.dispatchEvent(new CustomEvent('show-email-login'));
        }}
        errorType={errorType}
        errorMessage={errorMessage}
      />
    </>
  );
}