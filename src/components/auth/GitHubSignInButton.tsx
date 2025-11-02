import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { GitHubSignInErrorDialog } from './GitHubSignInErrorDialog';

interface GitHubSignInButtonProps {
  onSuccess: () => void;
  disabled?: boolean;
  showFallbackOption?: boolean;
}

export function GitHubSignInButton({ onSuccess, disabled, showFallbackOption = true }: GitHubSignInButtonProps) {
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

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      
      // Show initial loading toast with shorter duration
      toast.loading('Connecting to GitHub...', {
        id: 'github-signin',
        duration: 2000
      });
      
      // Check if we're in a popup-blocking environment
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (!testPopup) {
        toast.dismiss('github-signin');
        showErrorWithDialog('popup_blocked');
        return;
      }
      testPopup.close();

      // Trigger GitHub OAuth - ensure no localhost redirects
      const redirectUrl = window.location.origin.includes('localhost') 
        ? `${window.location.protocol}//${window.location.host}/auth/callback`
        : `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error('GitHub sign-in error:', error);
        toast.dismiss('github-signin');
        
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
      toast.dismiss('github-signin');
      toast.success('Redirecting to GitHub...', {
        id: 'github-redirect',
        duration: 1500
      });
      
      setSuccess(true);
      
      // The OAuth flow will redirect to /auth/callback
      // Success handling happens there
      
    } catch (err) {
      console.error('Unexpected GitHub sign-in error:', err);
      toast.dismiss('github-signin');
      
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
        onClick={handleGitHubSignIn}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : success ? (
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
        ) : (
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {loading ? 'Connecting...' : success ? 'Redirecting...' : 'Continue with GitHub'}
      </Button>

      {/* Error Dialog */}
      <GitHubSignInErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onRetry={() => {
          setShowErrorDialog(false);
          setTimeout(() => handleGitHubSignIn(), 100);
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
