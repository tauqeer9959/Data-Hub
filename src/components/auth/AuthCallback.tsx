import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export function AuthCallback() {
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(0);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log('[AuthCallback]', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      const maxTimeout = setTimeout(() => {
        console.error('Auth callback timeout');
        addDebugInfo('Timeout after 20 seconds');
        setStatus('error');
        toast.error('Authentication timed out. Please try again.', { duration: 5000 });
      }, 20000); // 20 second timeout

      try {
        setStatus('processing');
        setProgress(10);
        addDebugInfo('Starting auth callback processing');
        
        // Step 1: Check URL for auth fragments first
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        addDebugInfo(`URL hash params: ${window.location.hash}`);
        addDebugInfo(`URL query params: ${window.location.search}`);
        
        // Check for error in URL parameters
        const error = hashParams.get('error') || urlParams.get('error');
        const errorDescription = hashParams.get('error_description') || urlParams.get('error_description');
        
        if (error) {
          clearTimeout(maxTimeout);
          addDebugInfo(`OAuth error: ${error} - ${errorDescription}`);
          console.error('OAuth error from URL:', error, errorDescription);
          setStatus('error');
          
          let errorMessage = 'Authentication failed';
          if (error === 'access_denied') {
            errorMessage = 'You cancelled the GitHub sign-in process.';
          } else if (error === 'invalid_request') {
            errorMessage = 'Invalid authentication request. Please try again.';
          } else if (errorDescription) {
            errorMessage = errorDescription.replace(/\+/g, ' ');
          }
          
          toast.error(errorMessage, { duration: 5000 });
          return;
        }
        
        setProgress(30);
        
        // Step 2: Exchange the OAuth code for a session
        // First check if there's a code in the URL (for PKCE OAuth callback)
        const code = urlParams.get('code');
        
        if (code) {
          addDebugInfo('OAuth code found in URL, exchanging for session...');
          console.log('OAuth code found, exchanging for session...');
          
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          setProgress(60);
          clearTimeout(maxTimeout);
          
          if (exchangeError) {
            addDebugInfo(`Code exchange error: ${exchangeError.message}`);
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            toast.error('Failed to complete sign-in. Please try again.', { duration: 5000 });
            return;
          }
          
          if (!exchangeData?.session) {
            addDebugInfo('No session returned from code exchange');
            console.error('No session after code exchange');
            setStatus('no_session');
            toast.warning('No session was created. Please try signing in again.', { duration: 5000 });
            return;
          }
          
          // Session created successfully
          addDebugInfo(`Session created successfully for ${exchangeData.user?.email}`);
          setProgress(80);
          const user = exchangeData.user;
          const userName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'User';
          
          setUserInfo({
            name: userName,
            email: user.email || ''
          });
          
          setProgress(100);
          setStatus('success');
          
          console.log('Successfully authenticated with GitHub:', user.email);
          addDebugInfo('Authentication successful, redirecting...');
          
          toast.success(`Welcome back, ${userName}!`, { 
            duration: 3000,
            icon: <CheckCircle className="h-4 w-4" />
          });
          
          // Wait a moment for user to see success, then redirect
          setTimeout(() => {
            window.location.replace('/');
          }, 1500);
          
          return;
        }
        
        addDebugInfo('No OAuth code found, checking for existing session...');
        
        // Fallback: Try to get existing session (for hash-based flow or page refresh)
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        setProgress(60);
        clearTimeout(maxTimeout);
        
        if (sessionError) {
          addDebugInfo(`Session error: ${sessionError.message}`);
          console.error('Auth callback session error:', sessionError);
          setStatus('error');
          
          let errorMessage = 'Failed to establish session';
          if (sessionError.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid authentication credentials. Please try signing in again.';
          } else if (sessionError.message.includes('Email not confirmed')) {
            errorMessage = 'Email verification required. Please check your email.';
          }
          
          toast.error(errorMessage, { duration: 5000 });
          return;
        }

        setProgress(80);

        if (data?.session && data?.user) {
          addDebugInfo(`Session found for ${data.user.email}`);
          const user = data.user;
          const userName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'User';
          
          setUserInfo({
            name: userName,
            email: user.email || ''
          });
          
          setProgress(100);
          setStatus('success');
          
          console.log('Successfully authenticated with GitHub:', user.email);
          addDebugInfo('Authentication successful, redirecting...');
          
          // Show success message with user info
          toast.success(`Welcome back, ${userName}!`, { 
            duration: 3000,
            icon: <CheckCircle className="h-4 w-4" />
          });
          
          // Wait a moment for user to see success, then redirect
          setTimeout(() => {
            // Use replace to prevent back button issues
            window.location.replace('/');
          }, 1500);
          
        } else {
          addDebugInfo('No session found in fallback check');
          console.log('No session found after OAuth callback');
          setStatus('no_session');
          toast.warning('No session was created. Please try signing in again.', { 
            duration: 5000 
          });
        }
      } catch (err) {
        clearTimeout(maxTimeout);
        console.error('Unexpected auth callback error:', err);
        setStatus('error');
        
        let errorMessage = 'An unexpected error occurred';
        if (err instanceof Error) {
          if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = err.message;
          }
        }
        
        toast.error(errorMessage, { duration: 5000 });
      }
    };

    handleAuthCallback();
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Completing GitHub sign-in...';
      case 'success':
        return userInfo ? `Welcome back, ${userInfo.name}!` : 'Sign in successful!';
      case 'error':
        return 'Authentication failed';
      case 'no_session':
        return 'Session not created';
      default:
        return 'Processing authentication...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'no_session':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />;
      case 'no_session':
        return <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>;
    }
  };

  const getSubMessage = () => {
    switch (status) {
      case 'processing':
        return `Authenticating... ${progress}%`;
      case 'success':
        return 'Redirecting to your dashboard...';
      case 'error':
        return 'Something went wrong during sign-in';
      case 'no_session':
        return 'Please try signing in again';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-xl font-semibold mb-2 ${getStatusColor()}`}>
          {getStatusMessage()}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {getSubMessage()}
        </p>

        {/* Progress bar for processing */}
        {status === 'processing' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* User info display */}
        {status === 'success' && userInfo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <p className="font-medium text-green-800 dark:text-green-200">{userInfo.name}</p>
              <p className="text-green-600 dark:text-green-400">{userInfo.email}</p>
            </div>
          </div>
        )}

        {/* Error actions */}
        {(status === 'error' || status === 'no_session') && (
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/'}
              variant="default"
              className="w-full"
            >
              Return to Sign In
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <p className="text-xs text-muted-foreground">
              Having trouble? Try using email/password sign-in instead.
            </p>
            
            {/* Debug info for troubleshooting */}
            {debugInfo.length > 0 && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Show debug information
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                  {debugInfo.map((info, i) => (
                    <div key={i} className="text-muted-foreground">{info}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}