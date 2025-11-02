import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

export function GitHubAuthTroubleshooting() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>GitHub Authentication Troubleshooting</CardTitle>
        <CardDescription>
          Having issues signing in with GitHub? Here are some common solutions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Common Issues */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Common Issues</h3>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Not Created</AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>This usually means GitHub OAuth is not properly configured.</p>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                <li>Verify GitHub provider is enabled in Supabase Dashboard</li>
                <li>Check that callback URL is correctly set</li>
                <li>Ensure Client ID and Secret are valid</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Popup Blocked</AlertTitle>
            <AlertDescription className="text-sm">
              Your browser may be blocking popups. Please allow popups for this site, or use email/password sign-in instead.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription className="text-sm">
              Check your internet connection and try again. If the problem persists, it may be a temporary server issue.
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Fixes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Quick Fixes</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Clear browser cache and cookies</p>
                <p className="text-xs text-muted-foreground">Sometimes old session data can interfere</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Try a different browser</p>
                <p className="text-xs text-muted-foreground">Browser extensions can sometimes block OAuth flows</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Disable ad blockers temporarily</p>
                <p className="text-xs text-muted-foreground">Some ad blockers interfere with authentication</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Use email/password sign-in as alternative</p>
                <p className="text-xs text-muted-foreground">Reliable backup authentication method</p>
              </div>
            </div>
          </div>
        </div>

        {/* For Developers */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold">For Developers</h3>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Checklist</AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <ol className="list-decimal list-inside space-y-1 text-xs mt-2">
                <li>GitHub provider enabled in Supabase Dashboard</li>
                <li>Callback URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://[project].supabase.co/auth/v1/callback</code></li>
                <li>Valid GitHub OAuth App created</li>
                <li>Client ID and Secret entered in Supabase</li>
                <li>PKCE flow configured in Supabase client</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open('https://supabase.com/docs/guides/auth/social-login/auth-github', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Supabase GitHub Auth Docs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open('/GITHUB_AUTH_SETUP.md', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Setup Guide
            </Button>
          </div>
        </div>

        {/* Debug Tips */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-semibold">Debug Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
            <li>Check browser console (F12) for detailed error messages</li>
            <li>Look for debug information panel on error screens</li>
            <li>Verify network requests in browser DevTools</li>
            <li>Check Supabase dashboard logs for authentication attempts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
