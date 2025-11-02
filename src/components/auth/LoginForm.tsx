import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { supabase } from '../../utils/supabase/client';
import { GitHubSignInButton } from './GitHubSignInButton';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister, onSwitchToReset }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        }
        setError(errorMessage);
        return;
      }

      if (data.session && data.user) {
        console.log('Login successful, session created');
        onSuccess();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="space-y-1 px-2 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Sign In</CardTitle>
        <CardDescription className="text-sm">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-9 sm:h-10 text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 sm:px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              disabled={loading}
              className="h-4 w-4"
            />
            <Label htmlFor="remember" className="text-xs sm:text-sm text-muted-foreground">
              Remember me
            </Label>
          </div>
          
          <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            Sign In
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <GitHubSignInButton onSuccess={onSuccess} disabled={loading} showFallbackOption={false} />
          
          <div className="text-center space-y-1 sm:space-y-2 pt-2">
            <Button
              type="button"
              variant="link"
              className="text-xs sm:text-sm h-auto py-1"
              onClick={onSwitchToReset}
            >
              Forgot your password?
            </Button>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs sm:text-sm"
                onClick={onSwitchToRegister}
              >
                Sign up
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}