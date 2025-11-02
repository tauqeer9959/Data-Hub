import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../ui/sheet';
import { Switch } from '../ui/switch';
import { Moon, Sun, User, Settings, LogOut, Shield, Home, GraduationCap, BookOpen, FolderOpen, Award, FileText, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { cn } from '../ui/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HeaderProps {
  navigationItems?: NavigationItem[];
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function Header({ navigationItems = [], currentView, onViewChange }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Create effective profile for header display with OAuth data
  const effectiveProfile = profile || (user ? {
    fullName: user.user_metadata?.full_name || 
             user.user_metadata?.name || 
             user.user_metadata?.fullName || 
             (user.email ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User'),
    profilePicture: user.user_metadata?.picture || user.user_metadata?.avatar_url || '',
    role: 'user' as const
  } : null);

  useEffect(() => {
    // Check for saved dark mode preference or default to system preference
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedMode ? JSON.parse(savedMode) : prefersDark;
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left: Menu Button */}
        {navigationItems.length > 0 && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-10 sm:w-10 p-0">
                <span className="sr-only">Open navigation menu</span>
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
              <SheetHeader className="p-6 pb-4 border-b text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-sm font-semibold">DH</span>
                  </div>
                  <SheetTitle className="text-xl">Data Hub</SheetTitle>
                </div>
                <SheetDescription className="text-left">
                  Navigate to different sections of your academic dashboard
                </SheetDescription>
              </SheetHeader>
              
              <nav className="flex-1 overflow-y-auto py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
                </div>
                {navigationItems.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "justify-start px-6 py-3 h-11 w-full font-normal rounded-none transition-all hover:bg-accent/50",
                        isActive && "bg-accent text-accent-foreground border-r-4 border-primary font-medium"
                      )}
                      onClick={() => {
                        onViewChange?.(item.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
                
                {navigationItems.length > 3 && (
                  <>
                    <div className="px-4 py-2 mt-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Academic</p>
                    </div>
                    {navigationItems.slice(3).map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={cn(
                            "justify-start px-6 py-3 h-11 w-full font-normal rounded-none transition-all hover:bg-accent/50",
                            isActive && "bg-accent text-accent-foreground border-r-4 border-primary font-medium"
                          )}
                          onClick={() => {
                            onViewChange?.(item.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Button>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* User Profile Section */}
              <div className="border-t p-4 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={effectiveProfile?.profilePicture || profile?.profilePicture} 
                      alt={effectiveProfile?.fullName || user?.email || ''} 
                    />
                    <AvatarFallback>
                      {effectiveProfile?.fullName ? getInitials(effectiveProfile.fullName) : user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {effectiveProfile?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-10"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs sm:text-sm font-semibold">DH</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold hidden sm:inline">Data Hub</h1>
        </div>

        {/* Right: Dark Mode & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-4 w-4" />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={effectiveProfile?.profilePicture || profile?.profilePicture} 
                    alt={effectiveProfile?.fullName || user?.email || ''} 
                  />
                  <AvatarFallback>
                    {effectiveProfile?.fullName ? getInitials(effectiveProfile.fullName) : user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {effectiveProfile?.fullName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {effectiveProfile?.role === 'admin' && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Shield className="h-3 w-3" />
                      Administrator
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
