import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
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

  // Create effective profile for header display with Google OAuth data
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
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">DH</span>
          </div>
          <h1 className="font-semibold">Data Hub</h1>
        </div>

        {/* Navigation */}
        {navigationItems.length > 0 && (
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'flex items-center gap-2',
                    currentView === item.id && 'bg-secondary'
                  )}
                  onClick={() => onViewChange?.(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {/* Mobile Navigation - Left Side Sheet */}
          {navigationItems.length > 0 && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <span className="sr-only">Open navigation menu</span>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-6 pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Data Hub
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "justify-start px-6 py-3 h-auto font-normal rounded-none",
                          isActive && "bg-accent text-accent-foreground border-r-2 border-primary"
                        )}
                        onClick={() => {
                          onViewChange?.(item.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}

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