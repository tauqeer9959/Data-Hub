import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { EducationLevelProvider } from './components/education/EducationLevelProvider';
import { LandingPage } from './components/landing/LandingPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/ui/error-boundary';
import { MinimalLoading } from './components/ui/minimal-loading';
import { Toaster } from './components/ui/sonner';
import { AuthErrorRecovery } from './components/auth/AuthErrorRecovery';

// Lazy load heavy components to improve initial load time
const DashboardStats = React.lazy(() => import('./components/dashboard/DashboardStats').then(m => ({ default: m.DashboardStats })));
const EnhancedDashboard = React.lazy(() => import('./components/dashboard/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })));
const QuickActions = React.lazy(() => import('./components/dashboard/QuickActions').then(m => ({ default: m.QuickActions })));
const ProfileForm = React.lazy(() => import('./components/profile/ProfileForm').then(m => ({ default: m.ProfileForm })));
const SemesterList = React.lazy(() => import('./components/semesters/SemesterList').then(m => ({ default: m.SemesterList })));
const SubjectList = React.lazy(() => import('./components/subjects/SubjectList').then(m => ({ default: m.SubjectList })));
const ProjectList = React.lazy(() => import('./components/projects/ProjectList').then(m => ({ default: m.ProjectList })));
const CertificateList = React.lazy(() => import('./components/certificates/CertificateList').then(m => ({ default: m.CertificateList })));
const FileManager = React.lazy(() => import('./components/files/FileManager').then(m => ({ default: m.FileManager })));
const AdminPanel = React.lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AcademicCalendar = React.lazy(() => import('./components/calendar/AcademicCalendar').then(m => ({ default: m.AcademicCalendar })));
const AcademicReports = React.lazy(() => import('./components/reports/AcademicReports').then(m => ({ default: m.AcademicReports })));
const GPACalculator = React.lazy(() => import('./components/calculator/GPACalculator').then(m => ({ default: m.GPACalculator })));
const PrivacyPolicy = React.lazy(() => import('./components/pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const HelpSupport = React.lazy(() => import('./components/pages/HelpSupport').then(m => ({ default: m.HelpSupport })));
const CookiePolicy = React.lazy(() => import('./components/pages/CookiePolicy').then(m => ({ default: m.CookiePolicy })));

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
  Sparkles,
  Calculator
} from 'lucide-react';
import { Button } from './components/ui/button';

type AppView = 'dashboard' | 'enhanced-dashboard' | 'profile' | 'semesters' | 'subjects' | 'projects' | 'certificates' | 'files' | 'calendar' | 'reports' | 'gpa-calculator' | 'admin' | 'privacy' | 'terms' | 'support' | 'cookies';

function MainApp() {
  const { user, profile, loading, authError, clearAuthError, retryFetchProfile } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [viewHistory, setViewHistory] = useState<AppView[]>(['dashboard']);

  // Listen for URL changes and handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      
      // If we have a previous view in history, go back to it
      if (viewHistory.length > 1) {
        const newHistory = [...viewHistory];
        newHistory.pop(); // Remove current view
        const previousView = newHistory[newHistory.length - 1];
        setViewHistory(newHistory);
        setCurrentView(previousView);
      } else {
        // Stay on current view (dashboard)
        setCurrentView('dashboard');
      }
      
      // Update the path to current location
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Push initial state to prevent accidental exit
    if (user && window.history.state === null) {
      window.history.pushState({ view: currentView, internal: true }, '', window.location.href);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, viewHistory, currentView]);

  // Handle auth callback route
  if (currentPath === '/auth/callback') {
    return <AuthCallback />;
  }

  // Navigation change handler with history tracking
  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    // Add to history if it's a different view
    if (view !== viewHistory[viewHistory.length - 1]) {
      setViewHistory(prev => [...prev, view]);
      // Push state to browser history
      window.history.pushState({ view, internal: true }, '', window.location.href);
    }
  };

  // Listen for navigation events
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

  // Simple loading check
  if (loading) {
    return <MinimalLoading />;
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
    { id: 'gpa-calculator', label: 'GPA Calculator', icon: Calculator },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileOutput },
    ...(effectiveProfile.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  const renderContent = () => {
    try {
      return (
        <React.Suspense fallback={<MinimalLoading />}>
          {(() => {
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
                return (
                  <div className="space-y-6">
                    <div>
                      <h1>Advanced Analytics</h1>
                      <p className="text-muted-foreground">
                        Get detailed insights with advanced data visualization and analytics
                      </p>
                    </div>
                    <EnhancedDashboard />
                  </div>
                );
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
              case 'gpa-calculator':
                return <GPACalculator />;
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
                return (
                  <div className="space-y-6">
                    <div>
                      <h1>Academic Calendar</h1>
                      <p className="text-muted-foreground">
                        Plan your academic schedule with an interactive calendar
                      </p>
                    </div>
                    <AcademicCalendar />
                  </div>
                );
              case 'reports':
                return (
                  <div className="space-y-6">
                    <div>
                      <h1>Advanced Reports</h1>
                      <p className="text-muted-foreground">
                        Generate comprehensive academic reports and export your data
                      </p>
                    </div>
                    <AcademicReports />
                  </div>
                );
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
          })()}
        </React.Suspense>
      );
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
      
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function App() {
  // Initialize app immediately without any delays
  React.useEffect(() => {
    // Set document title and meta tags immediately
    document.title = 'Data Hub - Academic Management System';
    
    // Add viewport meta tag for responsive design
    const addMetaTags = () => {
      // Viewport meta
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
      
      // Description meta
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', 'Comprehensive academic management system for students to track progress, manage courses, projects, and certificates.');
      
      // Theme color meta
      let themeMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeMeta);
      }
      themeMeta.setAttribute('content', '#2563eb');
    };
    
    addMetaTags();
    
    // Add or update favicon
    const setFavicon = () => {
      // Remove existing favicons
      const existingIcons = document.querySelectorAll('link[rel*="icon"]');
      existingIcons.forEach(icon => icon.remove());
      
      // Create new favicon link - using a data URI for a simple icon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%232563eb"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">DH</text></svg>';
      document.head.appendChild(link);
      
      // Also add apple-touch-icon for iOS devices
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = link.href;
      document.head.appendChild(appleLink);
    };
    
    setFavicon();
    
    // Run background tasks after app is already rendered
    const timeoutId = setTimeout(async () => {
      try {
        // Dynamically import and run background tasks
        const { startCacheCleanup } = await import('./utils/caching');
        const { initMobileOptimizations } = await import('./utils/mobileOptimization');
        
        startCacheCleanup();
        initMobileOptimizations();
      } catch (error) {
        console.warn('Background initialization failed (non-critical):', error);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Render app immediately without any loading states or emergency modes
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