import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { GitHubSignInButton } from './GitHubSignInButton';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Wait a moment for the profile to be created
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="space-y-1 px-2 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
        <CardDescription className="text-sm">
          Enter your information to create a new account
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
            <Label htmlFor="fullName" className="text-sm">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
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
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-9 sm:h-10 text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 sm:px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={setAgreeToTerms}
              disabled={loading}
              className="mt-0.5 h-4 w-4"
            />
            <Label htmlFor="terms" className="text-xs sm:text-sm text-muted-foreground leading-snug">
              I agree to the{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs sm:text-sm underline"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'terms' }))}
              >
                Terms of Service
              </Button>
              {' '}and{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs sm:text-sm underline"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'privacy' }))}
              >
                Privacy Policy
              </Button>
            </Label>
          </div>
          
          <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={loading || !agreeToTerms}>
            {loading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            Create Account
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
          
          <div className="text-center pt-2">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs sm:text-sm"
                onClick={onSwitchToLogin}
              >
                Sign in
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}