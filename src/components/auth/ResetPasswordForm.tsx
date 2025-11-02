import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { supabase } from '../../utils/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function ResetPasswordForm({ onSuccess, onSwitchToLogin }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto border-0 shadow-none">
        <CardHeader className="space-y-1 px-2 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-sm">
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                Please check your email and click the reset link to create a new password.
                The link will expire in 24 hours.
              </AlertDescription>
            </Alert>
            
            <Button onClick={onSwitchToLogin} variant="outline" className="w-full h-9 sm:h-10 text-sm">
              <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="space-y-1 px-2 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Reset Password</CardTitle>
        <CardDescription className="text-sm">
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
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
          
          <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />}
            Send Reset Link
          </Button>
          
          <Button onClick={onSwitchToLogin} variant="outline" className="w-full h-9 sm:h-10 text-sm">
            <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Back to Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}