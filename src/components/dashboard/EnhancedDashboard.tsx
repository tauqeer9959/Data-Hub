import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useEducationLevel } from '../education/EducationLevelProvider';
import { calculateCGPA, generateGPAReport, getPerformanceLevel } from '../../utils/gpaCalculator';
import { DataExporter, generateBackupData } from '../../utils/exportImport';
import { dashboardCache, CacheKeys } from '../../utils/caching';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface DashboardData {
  stats: {
    totalSemesters: number;
    totalSubjects: number;
    totalProjects: number;
    totalCertificates: number;
    overallGPA: number;
    completionRate: number;
  };
  gradeDistribution: { grade: string; count: number; percentage: number }[];
  semesterProgress: { semester: string; gpa: number; subjects: number }[];
  recentAchievements: any[];
  upcomingDeadlines: any[];
  performanceMetrics: {
    improvement: number;
    trend: 'up' | 'down' | 'stable';
    strongSubjects: string[];
    weakSubjects: string[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function EnhancedDashboard() {
  const { user, session } = useAuth();
  const { currentLevel } = useEducationLevel();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  const fetchDashboardData = async (useCache = true) => {
    if (!session?.access_token || !user) return;

    const cacheKey = CacheKeys.dashboardStats(user.id, currentLevel);
    
    if (useCache) {
      const cachedData = dashboardCache.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      setRefreshing(!loading);
      
      // Fetch real data from APIs
      const [semestersRes, projectsRes, certificatesRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters?educationLevel=${currentLevel}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/projects`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/certificates`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
      ]);

      const semesters = semestersRes.ok ? await semestersRes.json() : [];
      const projects = projectsRes.ok ? await projectsRes.json() : [];
      const certificates = certificatesRes.ok ? await certificatesRes.json() : [];

      // Fetch subjects for each semester
      const allSubjects = [];
      for (const semester of semesters) {
        try {
          const subjectsRes = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters/${semester.id}/subjects`,
            { headers: { 'Authorization': `Bearer ${session.access_token}` } }
          );
          if (subjectsRes.ok) {
            const subjects = await subjectsRes.json();
            allSubjects.push(...subjects);
          }
        } catch (error) {
          console.error(`Error fetching subjects for semester ${semester.id}:`, error);
        }
      }

      // Calculate analytics from real data
      const totalSemesters = semesters.length;
      const totalSubjects = allSubjects.length;
      const totalProjects = projects.length;
      const totalCertificates = certificates.length;

      // Calculate overall GPA
      let overallGPA = 0;
      if (semesters.length > 0) {
        const validGPAs = semesters.filter(sem => sem.gpa != null && !isNaN(sem.gpa));
        if (validGPAs.length > 0) {
          overallGPA = validGPAs.reduce((sum, sem) => sum + sem.gpa, 0) / validGPAs.length;
        }
      }

      // Calculate completion rate (based on subjects with grades)
      const completedSubjects = allSubjects.filter(s => s.grade && s.grade !== 'F' && s.grade !== '').length;
      const completionRate = totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;

      // Grade distribution
      const gradeCounts = {};
      allSubjects.forEach(subject => {
        if (subject.grade && subject.grade.trim() !== '') {
          gradeCounts[subject.grade] = (gradeCounts[subject.grade] || 0) + 1;
        }
      });

      const gradeDistribution = Object.entries(gradeCounts).map(([grade, count]) => ({
        grade,
        count: count as number,
        percentage: totalSubjects > 0 ? Math.round(((count as number) / totalSubjects * 100) * 10) / 10 : 0
      }));

      // Semester progress
      const semesterProgress = semesters.map(semester => ({
        semester: `Semester ${semester.semesterNo} (${semester.year})`,
        gpa: semester.gpa,
        subjects: allSubjects.filter(s => s.semesterId === semester.id).length
      }));

      // Recent achievements (from projects and certificates)
      const recentAchievements = [
        ...projects.slice(0, 3).map(p => ({
          type: 'project',
          title: p.title,
          date: p.createdAt
        })),
        ...certificates.slice(0, 3).map(c => ({
          type: 'certificate', 
          title: c.title,
          date: c.createdAt
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      // Add high GPA subjects as achievements if we have few other achievements
      if (recentAchievements.length < 3) {
        const highGradeSubjects = allSubjects
          .filter(s => s.grade && (s.grade === 'A+' || s.grade === 'A-'))
          .slice(0, 3 - recentAchievements.length)
          .map(s => ({
            type: 'grade',
            title: `${s.name} - ${s.grade}`,
            date: s.updatedAt
          }));
        recentAchievements.push(...highGradeSubjects);
      }

      // Performance analysis
      const gradePoints = {
        'A+': 4.0, 'A-': 3.7, 'B+': 3.3, 'B-': 3.0, 'C+': 2.7, 'C-': 2.3, 
        'D+': 2.0, 'D-': 1.7, 'F': 0.0
      };

      const strongSubjects = allSubjects
        .filter(s => s.grade && gradePoints[s.grade] >= 3.3)
        .map(s => s.name)
        .slice(0, 5);

      const weakSubjects = allSubjects
        .filter(s => s.grade && gradePoints[s.grade] && gradePoints[s.grade] < 2.7)
        .map(s => s.name)
        .slice(0, 5);

      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (semesters.length >= 2) {
        const lastTwo = semesters.slice(-2);
        const diff = lastTwo[1].gpa - lastTwo[0].gpa;
        trend = diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'stable';
      }

      const dashboardData: DashboardData = {
        stats: {
          totalSemesters,
          totalSubjects,
          totalProjects,
          totalCertificates,
          overallGPA,
          completionRate
        },
        gradeDistribution,
        semesterProgress,
        recentAchievements,
        upcomingDeadlines: [], // Could be enhanced with calendar events
        performanceMetrics: {
          improvement: semesters.length >= 2 ? semesters[semesters.length - 1].gpa - semesters[0].gpa : 0,
          trend,
          strongSubjects,
          weakSubjects
        }
      };

      setData(dashboardData);
      dashboardCache.set(cacheKey, dashboardData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session?.access_token, currentLevel]);

  const handleRefresh = async () => {
    // Clear cache for this user and education level
    const cacheKey = CacheKeys.dashboardStats(user!.id, currentLevel);
    dashboardCache.delete(cacheKey);
    
    // Refresh data
    await fetchDashboardData(false);
    toast.success('Dashboard data refreshed successfully');
  };

  const handleExport = async () => {
    if (!data || !user) return;

    try {
      const exportData = generateBackupData(
        user,
        [], // semesters
        [], // subjects  
        [], // projects
        [], // certificates
        currentLevel
      );

      await DataExporter.exportToJSON(exportData);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const performanceLevel = data ? getPerformanceLevel(data.stats.overallGPA) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load dashboard data</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Enhanced Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your academic journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Overall GPA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.overallGPA.toFixed(2)}</div>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className={performanceLevel?.color}>
                {performanceLevel?.level}
              </Badge>
              {data.performanceMetrics.trend === 'up' && (
                <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
              )}
              {data.performanceMetrics.trend === 'down' && (
                <TrendingDown className="h-4 w-4 text-red-500 ml-2" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completionRate}%</div>
            <Progress value={data.stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Subjects</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Across {data.stats.totalSemesters} semesters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Achievement Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalProjects + data.stats.totalCertificates}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects & Certificates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Grades</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GPA Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.semesterProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { subject: 'Technical Skills', value: 85 },
                    { subject: 'Problem Solving', value: 90 },
                    { subject: 'Communication', value: 75 },
                    { subject: 'Teamwork', value: 80 },
                    { subject: 'Time Management', value: 70 },
                    { subject: 'Leadership', value: 65 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Skills"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, percentage }) => `${grade} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Semester Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.semesterProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="subjects" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.type}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(achievement.date).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strong Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.performanceMetrics.strongSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                    <span>{subject}</span>
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                      Strong
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.performanceMetrics.weakSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <span>{subject}</span>
                    <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100">
                      Focus
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">{deadline.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={deadline.priority === 'high' ? 'destructive' : deadline.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {deadline.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(deadline.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}