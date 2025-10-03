import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check server status periodically but don't block anything
    const checkServerStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced timeout
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/health`, {
          signal: controller.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        setServerStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        // Don't log errors for connection status checks to avoid spam
        setServerStatus('offline');
      }
    };

    // Initial check after a longer delay to not interfere with app startup
    const initialTimeout = setTimeout(checkServerStatus, 5000);
    
    // Then check every 60 seconds (less frequent)
    const interval = setInterval(checkServerStatus, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="gap-1">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  }

  if (serverStatus === 'offline') {
    return (
      <Badge variant="destructive" className="gap-1">
        <WifiOff className="h-3 w-3" />
        Server Offline
      </Badge>
    );
  }

  if (serverStatus === 'online') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Wifi className="h-3 w-3" />
        Connected
      </Badge>
    );
  }

  return null; // Don't show anything while checking
}