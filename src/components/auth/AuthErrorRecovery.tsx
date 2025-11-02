import React from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { RefreshCw, AlertTriangle, Home, X } from 'lucide-react';

interface AuthErrorRecoveryProps {
  error: string;
  onRetry: () => void;
  onClear: () => void;
  onGoHome: () => void;
}

export function AuthErrorRecovery({ error, onRetry, onClear, onGoHome }: AuthErrorRecoveryProps) {
  const isGitHubAuthError = error.toLowerCase().includes('github') || 
                           error.toLowerCase().includes('oauth') ||
                           error.toLowerCase().includes('profile');

  return (
    <div className="p-4 border-b bg-destructive/5">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="font-medium mb-1">Authentication Issue</div>
            <div className="text-sm">{error}</div>
            {isGitHubAuthError && (
              <div className="text-xs mt-2 text-muted-foreground">
                This may be a temporary issue with GitHub Sign-In. Try refreshing or signing in with email/password.
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isGitHubAuthError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGoHome}
                className="h-8"
              >
                <Home className="h-3 w-3 mr-1" />
                Home
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}