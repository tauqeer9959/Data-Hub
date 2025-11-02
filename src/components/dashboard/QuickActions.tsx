import { Plus, BookOpen, Briefcase, Award, Calendar, BarChart3, Upload, FileText, Calculator, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../../utils/mobileOptimization';
import { useAuth } from '../auth/AuthProvider';

interface QuickActionsProps {
  onNavigate: (view: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const isPro = profile?.subscription === 'pro';
  
  const quickActions = [
    {
      id: 'semesters',
      icon: BookOpen,
      label: 'Semesters',
      description: 'Manage your academic semesters',
      color: 'text-blue-600',
      proBadge: false
    },
    {
      id: 'gpa-calculator',
      icon: Calculator,
      label: 'GPA Calc',
      description: 'Calculate GPA',
      color: 'text-cyan-600',
      proBadge: false
    },
    {
      id: 'projects',
      icon: Briefcase,
      label: 'Projects',
      description: 'Add portfolio projects',
      color: 'text-green-600',
      proBadge: true
    },
    {
      id: 'certificates',
      icon: Award,
      label: 'Certificates',
      description: 'Upload certificates',
      color: 'text-purple-600',
      proBadge: true
    },
    {
      id: 'calendar',
      icon: Calendar,
      label: 'Calendar',
      description: 'Schedule deadlines',
      color: 'text-orange-600',
      proBadge: true
    },
    {
      id: 'enhanced-dashboard',
      icon: BarChart3,
      label: 'Analytics',
      description: 'View detailed analytics',
      color: 'text-indigo-600',
      proBadge: true
    },
    {
      id: 'files',
      icon: FileText,
      label: 'Files',
      description: 'Manage documents',
      color: 'text-red-600',
      proBadge: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Quickly navigate to different sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${
          isMobile 
            ? 'grid-cols-2' 
            : 'grid-cols-3 lg:grid-cols-7'
        }`}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            const showProBadge = action.proBadge && !isPro;
            return (
              <Button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`${
                  isMobile ? 'h-16' : 'h-20'
                } flex flex-col gap-2 text-center relative`}
                variant="outline"
              >
                {showProBadge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  >
                    <Crown className="h-2.5 w-2.5" />
                  </Badge>
                )}
                <Icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
