import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { EducationLevelProvider } from './components/education/EducationLevelProvider';
import { LandingPage } from './components/landing/LandingPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';
import { QuickActions } from './components/dashboard/QuickActions';
import { ProfileForm } from './components/profile/ProfileForm';
import { SemesterList } from './components/semesters/SemesterList';
import { SubjectList } from './components/subjects/SubjectList';
import { ProjectList } from './components/projects/ProjectList';
import { CertificateList } from './components/certificates/CertificateList';
import { FileManager } from './components/files/FileManager';
import { AdminPanel } from './components/admin/AdminPanel';
import { AcademicCalendar } from './components/calendar/AcademicCalendar';
import { AcademicReports } from './components/reports/AcademicReports';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsOfService } from './components/pages/TermsOfService';
import { HelpSupport } from './components/pages/HelpSupport';
import { CookiePolicy } from './components/pages/CookiePolicy';
import { ErrorBoundary } from './components/ui/error-boundary';
import { LoadingOverlay } from './components/ui/loading-states';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  Home, 
  User, 
  GraduationCap, 
  BookOpen, 
  FolderOpen, 
  Award,
  FileText,
  Settings,
  Shield,
  Calendar,
  BarChart3,
  FileOutput,
  Sparkles
} from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { AuthErrorRecovery } from './components/auth/AuthErrorRecovery';
import { startCacheCleanup } from './utils/caching';
import { initMobileOptimizations } from './utils/mobileOptimization';
import { navigationManager } from './utils/navigation';

type AppView = 'dashboard' | 'enhanced-dashboard' | 'profile' | 'semesters' | 'subjects' | 'projects' | 'certificates' | 'files' | 'calendar' | 'reports' | 'admin' | 'privacy' | 'terms' | 'support' | 'cookies';

function MainApp() {
  const { user, profile, loading, authError, clearAuthError, retryFetchProfile } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle auth callback route
  if (currentPath === '/auth/callback') {
    return <AuthCallback />;
  }

  // Navigation change handler - simplified
  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
  };

  // Listen for navigation events from footer and back navigation - simplified
  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        setCurrentView(customEvent.detail as AppView);
      }
    };

    const handleNavigateBack = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.view && typeof customEvent.detail.view === 'string') {
        setCurrentView(customEvent.detail.view as AppView);
      }
    };

    window.addEventListener('navigate', handleNavigate);
    window.addEventListener('navigate-back', handleNavigateBack);
    window.addEventListener('navigate-forward', handleNavigateBack);

    return () => {
      window.removeEventListener('navigate', handleNavigate);
      window.removeEventListener('navigate-back', handleNavigateBack);
      window.removeEventListener('navigate-forward', handleNavigateBack);
    };
  }, []);

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const loadingTimeout = setTimeout(() => {
        console.warn('Loading timeout reached, continuing without full auth');
      }, 20000); // 20 second timeout for loading

      return () => clearTimeout(loadingTimeout);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Create a fallback profile if none exists and user is authenticated
  const effectiveProfile = profile || (user ? {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || 
             user.user_metadata?.name || 
             user.user_metadata?.fullName || 
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
  } : null);

  if (!effectiveProfile) {
    return <LandingPage />;
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'enhanced-dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'semesters', label: 'Semesters', icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileOutput },
    ...(effectiveProfile.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  const renderContent = () => {
    try {
      switch (currentView) {
        case 'dashboard':
          return (
            <div className="space-y-6">
              <div>
                <h1>Welcome back, {effectiveProfile?.fullName || 'User'}!</h1>
                <p className="text-muted-foreground">
                  Here's an overview of your academic progress
                </p>
              </div>
              <DashboardStats />
              <QuickActions onNavigate={handleViewChange} />
            </div>
          );
        case 'enhanced-dashboard':
          return <EnhancedDashboard />;
        case 'profile':
          return (
            <div className="space-y-6">
              <div>
                <h1>Profile Settings</h1>
                <p className="text-muted-foreground">
                  Manage your personal information and preferences
                </p>
              </div>
              <ProfileForm />
            </div>
          );
        case 'semesters':
          return (
            <div className="space-y-6">
              <div>
                <h1>Semesters</h1>
                <p className="text-muted-foreground">
                  Manage your academic semesters and track your progress
                </p>
              </div>
              <SemesterList />
            </div>
          );
        case 'subjects':
          return (
            <div className="space-y-6">
              <div>
                <h1>Subjects</h1>
                <p className="text-muted-foreground">
                  Track your subjects, grades, and academic performance
                </p>
              </div>
              <SubjectList />
            </div>
          );
        case 'projects':
          return (
            <div className="space-y-6">
              <div>
                <h1>Projects</h1>
                <p className="text-muted-foreground">
                  Showcase your projects and achievements
                </p>
              </div>
              <ProjectList />
            </div>
          );
        case 'certificates':
          return (
            <div className="space-y-6">
              <div>
                <h1>Certificates</h1>
                <p className="text-muted-foreground">
                  Manage your certificates and professional achievements
                </p>
              </div>
              <CertificateList />
            </div>
          );
        case 'files':
          return (
            <div className="space-y-6">
              <div>
                <h1>File Manager</h1>
                <p className="text-muted-foreground">
                  Upload, manage, and share your files securely
                </p>
              </div>
              <FileManager />
            </div>
          );
        case 'calendar':
          return <AcademicCalendar />;
        case 'reports':
          return <AcademicReports />;
        case 'admin':
          return effectiveProfile?.role === 'admin' ? (
            <div className="space-y-6">
              <div>
                <h1>Admin Panel</h1>
                <p className="text-muted-foreground">
                  System administration and user management
                </p>
              </div>
              <AdminPanel />
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2>Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access this section.</p>
            </div>
          );
        case 'privacy':
          return <PrivacyPolicy onGoBack={() => handleViewChange('dashboard')} />;
        case 'terms':
          return <TermsOfService onGoBack={() => handleViewChange('dashboard')} />;
        case 'support':
          return <HelpSupport onGoBack={() => handleViewChange('dashboard')} />;
        case 'cookies':
          return <CookiePolicy onGoBack={() => handleViewChange('dashboard')} />;
        default:
          return (
            <div className="text-center py-12">
              <h2>Page Not Found</h2>
              <p className="text-muted-foreground">The requested page could not be found.</p>
              <Button onClick={() => handleViewChange('dashboard')} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="text-center py-12">
          <h2>Something went wrong</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
          <Button onClick={() => handleViewChange('dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        navigationItems={navigationItems}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      {authError && (
        <AuthErrorRecovery
          error={authError}
          onRetry={retryFetchProfile}
          onClear={clearAuthError}
          onGoHome={() => {
            clearAuthError();
            handleViewChange('dashboard');
          }}
        />
      )}
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function App() {
  // Add emergency recovery state
  const [emergencyMode, setEmergencyMode] = React.useState(false);

  // Initialize optimizations and set browser title/favicon
  React.useEffect(() => {
    // Set emergency timeout to prevent total app hang
    const emergencyTimeout = setTimeout(() => {
      console.warn('App taking too long to load, enabling emergency mode');
      setEmergencyMode(true);
    }, 30000); // 30 second emergency timeout

    startCacheCleanup();
    initMobileOptimizations();

    return () => clearTimeout(emergencyTimeout);
    
    // Set document title
    document.title = 'Data Hub - Academic Management System';
    
    // Create and set favicon
    const existingFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }
    
    // Create a simple data hub icon using SVG
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <rect width="32" height="32" rx="6" fill="#030213"/>
        <circle cx="16" cy="16" r="10" fill="none" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="12" r="1.5" fill="#ffffff"/>
        <circle cx="12" cy="18" r="1.5" fill="#ffffff"/>
        <circle cx="20" cy="18" r="1.5" fill="#ffffff"/>
        <circle cx="16" cy="22" r="1.5" fill="#ffffff"/>
        <line x1="16" y1="12" x2="12" y2="18" stroke="#ffffff" stroke-width="1"/>
        <line x1="16" y1="12" x2="20" y2="18" stroke="#ffffff" stroke-width="1"/>
        <line x1="12" y1="18" x2="16" y2="22" stroke="#ffffff" stroke-width="1"/>
        <line x1="20" y1="18" x2="16" y2="22" stroke="#ffffff" stroke-width="1"/>
      </svg>
    `;
    
    favicon.href = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    document.head.appendChild(favicon);
    
    // Also set apple-touch-icon for mobile devices
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    document.head.appendChild(appleTouchIcon);
  }, []);

  // Emergency mode fallback
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-xl font-semibold mb-4">Loading Issue Detected</h1>
          <p className="text-muted-foreground mb-6">
            The app is taking longer than expected to load. Please try refreshing the page.
          </p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setEmergencyMode(false)}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary showErrorDetails={true} enableReporting={true}>
      <AuthProvider>
        <EducationLevelProvider>
          <MainApp />
          <Toaster position="top-right" />
        </EducationLevelProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}