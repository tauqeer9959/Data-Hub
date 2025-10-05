import { Plus, BookOpen, Briefcase, Award, Calendar, BarChart3, Upload, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../../utils/mobileOptimization';

interface QuickActionsProps {
  onNavigate: (view: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const isMobile = useIsMobile();
  
  const quickActions = [
    {
      id: 'semesters',
      icon: BookOpen,
      label: 'Semesters',
      description: 'Manage your academic semesters',
      color: 'text-blue-600'
    },
    {
      id: 'projects',
      icon: Briefcase,
      label: 'Projects',
      description: 'Add portfolio projects',
      color: 'text-green-600'
    },
    {
      id: 'certificates',
      icon: Award,
      label: 'Certificates',
      description: 'Upload certificates',
      color: 'text-purple-600'
    },
    {
      id: 'calendar',
      icon: Calendar,
      label: 'Calendar',
      description: 'Schedule deadlines',
      color: 'text-orange-600'
    },
    {
      id: 'enhanced-dashboard',
      icon: BarChart3,
      label: 'Analytics',
      description: 'View detailed analytics',
      color: 'text-indigo-600'
    },
    {
      id: 'files',
      icon: FileText,
      label: 'Files',
      description: 'Manage documents',
      color: 'text-red-600'
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
            : 'grid-cols-3 lg:grid-cols-6'
        }`}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`${
                  isMobile ? 'h-16' : 'h-20'
                } flex flex-col gap-2 text-center`}
                variant="outline"
              >
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