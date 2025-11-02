import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  publicProfile: boolean;
  role: 'user' | 'admin';
  subscription?: 'free' | 'pro';
  subscriptionPlan?: 'monthly' | 'yearly';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAuthError: () => void;
  retryFetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Start with false to prevent blocking
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const createProfile = async (user: User, accessToken: string) => {
    try {
      // Validate token first
      if (!accessToken || accessToken.length < 10) {
        console.error('Invalid access token for profile creation');
        return null;
      }
      
      // Create an AbortController for timeout handling with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
      
      // Extract user data from OAuth provider metadata with better fallbacks
      const oauthUserData = user.user_metadata || {};
      const fullName = oauthUserData.full_name || 
                      oauthUserData.name || 
                      oauthUserData.fullName || 
                      (user.email ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User');
      
      const profilePicture = oauthUserData.picture || 
                            oauthUserData.avatar_url || 
                            '';
      
      console.log('Creating profile for OAuth user:', { fullName, email: user.email, profilePicture });
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email: user.email,
          phone: '',
          location: '',
          bio: `Joined via GitHub Sign-In on ${new Date().toLocaleDateString()}`,
          profilePicture,
          publicProfile: false,
          role: 'user'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        console.log('Profile created successfully for OAuth user:', profileData.fullName);
        return profileData;
      } else {
        const errorText = await response.text().catch(() => 'No response text');
        console.error('Failed to create profile:', response.status, errorText);
        
        // Return a fallback profile if server creation fails
        const fallbackProfile = {
          id: user.id,
          email: user.email || '',
          fullName,
          phone: '',
          location: '',
          bio: '',
          profilePicture,
          publicProfile: false,
          role: 'user' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        console.log('Using fallback profile after server error');
        return fallbackProfile;
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (error.name === 'AbortError') {
        console.error('Profile creation timed out');
      }
      
      // Always return a fallback profile for OAuth users
      const oauthUserData = user.user_metadata || {};
      const fallbackProfile = {
        id: user.id,
        email: user.email || '',
        fullName: oauthUserData.full_name || 
                 oauthUserData.name || 
                 user.email?.split('@')[0] || 
                 'User',
        phone: '',
        location: '',
        bio: '',
        profilePicture: oauthUserData.picture || oauthUserData.avatar_url || '',
        publicProfile: false,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProfile(fallbackProfile);
      console.log('Using fallback profile after error');
      return fallbackProfile;
    }
  };

  const fetchProfile = async (userId: string, accessToken: string, user?: User) => {
    try {
      setAuthError(null); // Clear any previous errors
      
      // Validate the access token before making the request
      if (!accessToken || accessToken.length < 10) {
        console.error('Invalid access token:', accessToken?.substring(0, 10) + '...');
        if (retryCount === 0) {
          // Try to refresh the session
          const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
          if (refreshedSession?.access_token && refreshedSession.access_token !== accessToken) {
            console.log('Using refreshed token');
            return fetchProfile(userId, refreshedSession.access_token, user);
          }
        }
        return null;
      }
      
      // Create an AbortController for timeout handling with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        return profileData;
      } else if (response.status === 404 && user) {
        // Profile doesn't exist, create one
        console.log('Profile not found, creating new profile...');
        const newProfile = await createProfile(user, accessToken);
        if (newProfile) {
          return newProfile;
        } else {
          // If profile creation fails, create a minimal fallback profile
          console.log('Profile creation failed, using fallback profile');
          const oauthUserData = user.user_metadata || {};
          const fallbackProfile = {
            id: user.id,
            email: user.email || '',
            fullName: oauthUserData.full_name || 
                     oauthUserData.name || 
                     oauthUserData.fullName || 
                     user.email?.split('@')[0] || 
                     'User',
            phone: '',
            location: '',
            bio: '',
            profilePicture: oauthUserData.picture || oauthUserData.avatar_url || '',
            publicProfile: false,
            role: 'user' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProfile(fallbackProfile);
          return fallbackProfile;
        }
      } else {
        console.error('Failed to fetch profile:', response.status, response.statusText);
        
        // Handle 401 specifically - token might be expired
        if (response.status === 401) {
          console.log('401 error - attempting to refresh session');
          try {
            const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
            if (error) {
              console.error('Session refresh error:', error);
              // Clear auth state on session error
              setUser(null);
              setSession(null);
              setProfile(null);
              return null;
            }
            
            if (refreshedSession?.access_token && refreshedSession.access_token !== accessToken) {
              console.log('Got refreshed session, retrying profile fetch');
              setSession(refreshedSession);
              setUser(refreshedSession.user);
              return fetchProfile(userId, refreshedSession.access_token, refreshedSession.user);
            }
          } catch (refreshError) {
            console.error('Error refreshing session:', refreshError);
          }
        }
        
        // Only show error if this is a retry attempt
        if (retryCount > 0) {
          const errorText = await response.text().catch(() => 'Server error');
          console.error('Error response:', errorText);
          setAuthError(`Failed to load profile (${response.status})`);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        console.warn('Profile fetch timed out - this is non-critical');
        // Create a minimal profile from user data as fallback
        if (user) {
          const fallbackProfile = {
            id: user.id,
            email: user.email || '',
            fullName: user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User',
            phone: '',
            location: '',
            bio: '',
            profilePicture: user.user_metadata?.picture || user.user_metadata?.avatar_url || '',
            publicProfile: false,
            role: 'user' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProfile(fallbackProfile);
          console.log('Using fallback profile after timeout');
        }
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error during profile fetch');
        if (retryCount > 0) {
          setAuthError('Network error. Please check your connection and try again.');
        }
      } else {
        console.error('Unexpected error during profile fetch:', error);
        if (retryCount > 0) {
          setAuthError('An unexpected error occurred. Please try again.');
        }
      }
    }
    return null;
  };

  const refreshProfile = async () => {
    if (session?.access_token && user) {
      setRetryCount(0); // Reset retry count
      await fetchProfile(user.id, session.access_token, user);
    }
  };

  const retryFetchProfile = async () => {
    if (session?.access_token && user && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setAuthError(null);
      await fetchProfile(user.id, session.access_token, user);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Check if we're on the callback page
    const isCallbackPage = window.location.pathname === '/auth/callback';
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        // If we're on the callback page, give it time to process
        if (isCallbackPage) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.warn('Session initialization error (non-blocking):', error.message);
          return;
        }
        
        console.log('Initial session loaded:', !!session, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session.access_token) {
          console.log('Starting profile fetch for user:', session.user.email);
          // Fetch profile in background without blocking the UI
          setTimeout(() => {
            fetchProfile(session.user.id, session.access_token, session.user);
          }, isCallbackPage ? 1000 : 500);
        }
      } catch (error) {
        console.warn('Session initialization failed (non-blocking):', error);
      }
    };
    
    // Start initialization after a short delay
    setTimeout(initializeAuth, 100);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Clear any auth errors on sign out or token refresh
          setAuthError(null);
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed, fetching profile...');
        }
        
        if (session?.user && session.access_token) {
          // Fetch profile in background without blocking
          const delay = (event === 'SIGNED_IN') ? 500 : 200;
          setTimeout(() => {
            fetchProfile(session.user.id, session.access_token, session.user);
          }, delay);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Mark that we're signing out to prevent beforeunload warning
      sessionStorage.setItem('signing-out', 'true');
      
      // Show immediate feedback
      toast.loading('Signing out...', { id: 'signout' });
      
      // Check if there's an active session before trying to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
          // Don't show error to user for sign out failures, just clear local state
        }
      }
      
      // Always clear local state regardless of Supabase signOut result
      setUser(null);
      setProfile(null);
      setSession(null);
      setAuthError(null);
      
      // Clear any cached data
      localStorage.removeItem('profile_cache');
      
      toast.dismiss('signout');
      toast.success('Signed out successfully');
      
      // Clear signing out flag and redirect to landing page
      setTimeout(() => {
        sessionStorage.removeItem('signing-out');
        sessionStorage.removeItem('user-active');
        window.location.href = '/';
      }, 300);
      
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Still clear local state even if there's an error
      setUser(null);
      setProfile(null);
      setSession(null);
      setAuthError(null);
      
      toast.dismiss('signout');
      toast.success('Signed out'); // Don't show error, just confirm sign out
      
      setTimeout(() => {
        sessionStorage.removeItem('signing-out');
        sessionStorage.removeItem('user-active');
        window.location.href = '/';
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    authError,
    signOut,
    refreshProfile,
    clearAuthError,
    retryFetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}