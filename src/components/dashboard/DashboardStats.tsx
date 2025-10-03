import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { GraduationCap, BookOpen, Trophy, Target } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useEducationLevel } from '../education/EducationLevelProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DashboardStatsData {
  totalSemesters: number;
  totalProjects: number;
  totalCertificates: number;
  overallGPA: number;
}

export function DashboardStats() {
  const { session } = useAuth();
  const { currentLevel, getLevelDisplay } = useEducationLevel();
  const [stats, setStats] = useState<DashboardStatsData>({
    totalSemesters: 0,
    totalProjects: 0,
    totalCertificates: 0,
    overallGPA: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/dashboard/stats?educationLevel=${currentLevel}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session?.access_token, currentLevel]);

  // Listen for data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      fetchStats();
    };

    window.addEventListener('dashboardRefresh', handleDataRefresh);
    return () => window.removeEventListener('dashboardRefresh', handleDataRefresh);
  }, [session?.access_token, currentLevel]);

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'bg-green-500';
    if (gpa >= 3.0) return 'bg-blue-500';
    if (gpa >= 2.3) return 'bg-yellow-500';
    if (gpa >= 1.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGPAGrade = (gpa: number) => {
    if (gpa >= 4.0) return 'A+';
    if (gpa >= 3.7) return 'A-';
    if (gpa >= 3.3) return 'B+';
    if (gpa >= 3.0) return 'B-';
    if (gpa >= 2.7) return 'C+';
    if (gpa >= 2.3) return 'C-';
    if (gpa >= 2.0) return 'D+';
    if (gpa >= 1.3) return 'D-';
    return 'F';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Academic Overview</h2>
            <p className="text-sm text-muted-foreground">
              Loading data for {getLevelDisplay(currentLevel)}...
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Loading...</CardTitle>
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-1" />
                <div className="h-4 w-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Academic Overview</h2>
          <p className="text-sm text-muted-foreground">
            Showing data for {getLevelDisplay(currentLevel)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Semesters</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSemesters}</div>
            <p className="text-xs text-muted-foreground">
              Academic progress
            </p>
          </CardContent>
        </Card>
      
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Overall GPA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.overallGPA.toFixed(2)}</div>
              <Badge 
                variant="secondary" 
                className={`text-white ${getGPAColor(stats.overallGPA)}`}
              >
                {getGPAGrade(stats.overallGPA)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative grade point average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Earned certificates
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}