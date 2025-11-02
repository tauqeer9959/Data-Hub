import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  Award,
  Clock,
  Filter,
  Share,
  Mail,
  Printer,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { DataVisualization } from '../analytics/DataVisualization';
import { DataExporter } from '../../utils/exportImport';
import { generateGPAReport, calculateCGPA } from '../../utils/gpaCalculator';
import { useAuth } from '../auth/AuthProvider';
import { useEducationLevel } from '../education/EducationLevelProvider';
import { dashboardCache, CacheKeys } from '../../utils/caching';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface ReportConfig {
  type: 'academic' | 'performance' | 'progress' | 'comprehensive';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  includeDetails: boolean;
  format: 'pdf' | 'html' | 'csv' | 'json';
}

export function AcademicReports() {
  const { user, session } = useAuth();
  const { currentLevel } = useEducationLevel();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1), // Start of current year
      end: new Date()
    },
    includeCharts: true,
    includeDetails: true,
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realData, setRealData] = useState<any>(null);

  // Fetch real data from APIs
  const fetchReportsData = async (useCache = true) => {
    if (!session?.access_token || !user) return;

    const cacheKey = CacheKeys.dashboardStats(user.id, currentLevel) + '_reports';
    
    if (useCache) {
      const cachedData = dashboardCache.get(cacheKey);
      if (cachedData) {
        setRealData(cachedData);
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
            allSubjects.push(...subjects.map(s => ({ ...s, semesterName: `Semester ${semester.semesterNo} (${semester.year})` })));
          }
        } catch (error) {
          console.error(`Error fetching subjects for semester ${semester.id}:`, error);
        }
      }

      // Transform data to match expected format
      const transformedData = {
        semesters: semesters.map(sem => ({
          name: `Semester ${sem.semesterNo} (${sem.year})`,
          gpa: sem.gpa || 0,
          subjects: allSubjects.filter(s => s.semesterId === sem.id).length,
          credits: sem.totalCreditHours || 0
        })),
        subjects: allSubjects.map(sub => ({
          name: sub.name,
          grade: sub.grade || 'N/A',
          credits: sub.creditHours || 0,
          semester: sub.semesterName
        })),
        projects: projects.map(proj => ({
          title: proj.title,
          status: proj.status || 'completed',
          startDate: proj.startDate || proj.createdAt,
          endDate: proj.endDate || proj.updatedAt
        })),
        certificates: certificates.map(cert => ({
          title: cert.title,
          issuer: cert.issuer || 'Unknown',
          date: cert.issueDate || cert.createdAt
        }))
      };

      setRealData(transformedData);
      dashboardCache.set(cacheKey, transformedData);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to load reports data');
      // Fallback to empty data
      setRealData({
        semesters: [],
        subjects: [],
        projects: [],
        certificates: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [session?.access_token, currentLevel]);

  const handleRefresh = async () => {
    const cacheKey = CacheKeys.dashboardStats(user!.id, currentLevel) + '_reports';
    dashboardCache.delete(cacheKey);
    await fetchReportsData(false);
    toast.success('Reports data refreshed successfully');
  };

  const reportData = useMemo(() => {
    // Default data structure
    const defaultData = {
      overview: {
        cgpa: 0,
        totalCredits: 0,
        totalSubjects: 0,
        totalProjects: 0,
        totalCertificates: 0,
        completionRate: 0
      },
      performance: {
        semesterProgress: [],
        gradeDistribution: [],
        strongAreas: ['No strong areas identified yet'],
        improvementAreas: ['Keep up the good work!']
      },
      achievements: {
        recentGrades: [],
        completedProjects: [],
        earnedCertificates: []
      }
    };

    if (!realData || !realData.semesters || !realData.subjects || !realData.projects || !realData.certificates) {
      return defaultData;
    }

    // Ensure arrays are valid
    const semesters = Array.isArray(realData.semesters) ? realData.semesters : [];
    const subjects = Array.isArray(realData.subjects) ? realData.subjects : [];
    const projects = Array.isArray(realData.projects) ? realData.projects : [];
    const certificates = Array.isArray(realData.certificates) ? realData.certificates : [];

    const cgpa = semesters.length > 0 ? calculateCGPA(semesters.map(sem => ({
      subjects: [],
      totalCreditHours: sem.credits || 0,
      totalGradePoints: (sem.gpa || 0) * (sem.credits || 0),
      gpa: sem.gpa || 0,
      semester: sem.name || 'Unknown',
      educationLevel: currentLevel
    }))) : 0;

    const gradeDistribution = subjects.reduce((acc, subject) => {
      if (subject && subject.grade && subject.grade !== 'N/A' && subject.grade.trim() !== '') {
        acc[subject.grade] = (acc[subject.grade] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate completion rate based on subjects with grades
    const completedSubjects = subjects.filter(s => s && s.grade && s.grade !== 'N/A' && s.grade !== 'F' && s.grade !== '');
    const completionRate = subjects.length > 0 ? (completedSubjects.length / subjects.length) * 100 : 0;

    // Determine strong and weak areas based on grades
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A-': 3.7, 'B+': 3.3, 'B-': 3.0, 'C+': 2.7, 'C-': 2.3, 
      'D+': 2.0, 'D-': 1.7, 'F': 0.0
    };

    const strongSubjects = subjects
      .filter(s => s && s.grade && gradePoints[s.grade] >= 3.3)
      .map(s => s.name)
      .slice(0, 5);

    const weakSubjects = subjects
      .filter(s => s && s.grade && gradePoints[s.grade] && gradePoints[s.grade] < 2.7)
      .map(s => s.name)
      .slice(0, 5);

    return {
      overview: {
        cgpa,
        totalCredits: semesters.reduce((sum, sem) => sum + (sem.credits || 0), 0),
        totalSubjects: subjects.length,
        totalProjects: projects.length,
        totalCertificates: certificates.length,
        completionRate: Math.round(completionRate * 10) / 10
      },
      performance: {
        semesterProgress: semesters,
        gradeDistribution: Object.entries(gradeDistribution).map(([grade, count]) => ({
          name: String(grade),
          value: Number(count)
        })),
        strongAreas: strongSubjects.length > 0 ? strongSubjects : ['No strong areas identified yet'],
        improvementAreas: weakSubjects.length > 0 ? weakSubjects : ['Keep up the good work!']
      },
      achievements: {
        recentGrades: subjects.slice(-5),
        completedProjects: projects.filter(p => p && p.status === 'completed'),
        earnedCertificates: certificates
      }
    };
  }, [realData, currentLevel]);

  const generateReport = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const reportContent = createReportContent();
      
      switch (reportConfig.format) {
        case 'pdf':
          await generatePDFReport(reportContent);
          break;
        case 'html':
          await generateHTMLReport(reportContent);
          break;
        case 'csv':
          await generateCSVReport();
          break;
        case 'json':
          await generateJSONReport();
          break;
        default:
          throw new Error('Unsupported format');
      }

      toast.success(`${reportConfig.type} report generated successfully`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const createReportContent = () => {
    const { overview, performance, achievements } = reportData;
    
    return `
      <div class="report-container">
        <header class="report-header">
          <h1>Academic Report</h1>
          <div class="report-meta">
            <p><strong>Student:</strong> ${user?.user_metadata?.fullName || user?.user_metadata?.full_name || user?.fullName || 'Student'}</p>
            <p><strong>Education Level:</strong> ${currentLevel}</p>
            <p><strong>Report Type:</strong> ${reportConfig.type}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Period:</strong> ${reportConfig.dateRange.start.toLocaleDateString()} - ${reportConfig.dateRange.end.toLocaleDateString()}</p>
          </div>
        </header>

        <section class="executive-summary">
          <h2>Executive Summary</h2>
          <div class="summary-stats">
            <div class="stat-item">
              <h3>Overall CGPA</h3>
              <p class="stat-value">${overview.cgpa.toFixed(2)}</p>
            </div>
            <div class="stat-item">
              <h3>Total Credits</h3>
              <p class="stat-value">${overview.totalCredits}</p>
            </div>
            <div class="stat-item">
              <h3>Completion Rate</h3>
              <p class="stat-value">${overview.completionRate}%</p>
            </div>
            <div class="stat-item">
              <h3>Total Achievements</h3>
              <p class="stat-value">${overview.totalProjects + overview.totalCertificates}</p>
            </div>
          </div>
        </section>

        ${reportConfig.type === 'comprehensive' || reportConfig.type === 'performance' ? `
        <section class="performance-analysis">
          <h2>Performance Analysis</h2>
          <div class="performance-content">
            <h3>Semester Progress</h3>
            <table class="performance-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>GPA</th>
                  <th>Subjects</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                ${performance.semesterProgress.map(sem => `
                  <tr>
                    <td>${sem.name}</td>
                    <td>${sem.gpa.toFixed(2)}</td>
                    <td>${sem.subjects}</td>
                    <td>${sem.credits}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h3>Strong Areas</h3>
            <ul>
              ${performance.strongAreas.map(area => `<li>${area}</li>`).join('')}
            </ul>

            <h3>Areas for Improvement</h3>
            <ul>
              ${performance.improvementAreas.map(area => `<li>${area}</li>`).join('')}
            </ul>
          </div>
        </section>
        ` : ''}

        ${reportConfig.type === 'comprehensive' || reportConfig.type === 'academic' ? `
        <section class="academic-details">
          <h2>Academic Details</h2>
          <h3>Subject Performance</h3>
          <table class="subjects-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Credits</th>
                <th>Semester</th>
              </tr>
            </thead>
            <tbody>
              ${achievements.recentGrades.map(subject => `
                <tr>
                  <td>${subject.name}</td>
                  <td>${subject.grade}</td>
                  <td>${subject.credits}</td>
                  <td>${subject.semester}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Projects</h3>
          <ul>
            ${achievements.completedProjects.map(project => `
              <li>
                <strong>${project.title}</strong> 
                (${project.startDate} - ${project.endDate})
              </li>
            `).join('')}
          </ul>

          <h3>Certificates</h3>
          <ul>
            ${achievements.earnedCertificates.map(cert => `
              <li>
                <strong>${cert.title}</strong> - ${cert.issuer} 
                (${cert.date})
              </li>
            `).join('')}
          </ul>
        </section>
        ` : ''}

        <footer class="report-footer">
          <p>This report was automatically generated by Data Hub Academic Management System.</p>
          <p>For questions or concerns, please contact support.</p>
        </footer>
      </div>

      <style>
        .report-container { 
          font-family: Arial, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          line-height: 1.6;
        }
        .report-header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
        }
        .report-meta { 
          margin-top: 15px; 
          text-align: left; 
        }
        .summary-stats { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 20px; 
          margin: 20px 0; 
        }
        .stat-item { 
          text-align: center; 
          padding: 15px; 
          border: 1px solid #ddd; 
          border-radius: 8px; 
        }
        .stat-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #333; 
          margin: 5px 0; 
        }
        .performance-table, .subjects-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0; 
        }
        .performance-table th, .performance-table td,
        .subjects-table th, .subjects-table td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .performance-table th, .subjects-table th { 
          background-color: #f2f2f2; 
          font-weight: bold; 
        }
        .report-footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #ddd; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
        }
        section { 
          margin-bottom: 30px; 
        }
        h2 { 
          color: #333; 
          border-bottom: 1px solid #ddd; 
          padding-bottom: 10px; 
        }
        ul { 
          padding-left: 20px; 
        }
        li { 
          margin-bottom: 5px; 
        }
      </style>
    `;
  };

  const generatePDFReport = async (content: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-report-${currentLevel}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateHTMLReport = async (content: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-report-${currentLevel}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = async () => {
    if (!realData) {
      toast.error('No data available to export');
      return;
    }

    const csvData = [
      ['Subject', 'Grade', 'Credits', 'Semester'],
      ...realData.subjects.map(subject => [
        subject.name,
        subject.grade,
        subject.credits.toString(),
        subject.semester
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-data-${currentLevel}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateJSONReport = async () => {
    const jsonData = {
      user: {
        name: user?.user_metadata?.fullName || user?.user_metadata?.full_name || user?.fullName || 'Student',
        educationLevel: currentLevel
      },
      reportType: reportConfig.type,
      generatedAt: new Date().toISOString(),
      data: reportData
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-report-${currentLevel}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Academic Report',
          text: `Academic report for ${currentLevel} level`,
          url: window.location.href
        });
      } catch (error) {
        toast.error('Failed to share report');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Check out my academic progress: CGPA ${reportData.overview.cgpa.toFixed(2)}, ${reportData.overview.totalCredits} credits completed!`;
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Report summary copied to clipboard');
      });
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Academic Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports of your academic progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Overall CGPA</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(reportData.overview.cgpa || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Cumulative Grade Point Average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Credits</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.overview.totalCredits || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Credit hours completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.overview.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Program completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(reportData.overview.totalProjects || 0) + (reportData.overview.totalCertificates || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projects & Certificates
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(reportData.achievements.recentGrades) ? reportData.achievements.recentGrades.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{String(subject.name || 'N/A')}</span>
                    <Badge variant="secondary">{String(subject.grade || 'N/A')}</Badge>
                  </div>
                )) : <div className="text-muted-foreground">No recent grades available</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strong Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.isArray(reportData.performance.strongAreas) ? reportData.performance.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{String(area || 'N/A')}</span>
                  </div>
                )) : <div className="text-muted-foreground">No strong areas identified</div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataVisualization
              config={{
                title: 'GPA Progress',
                data: Array.isArray(reportData.performance.semesterProgress) && reportData.performance.semesterProgress.length > 0
                  ? reportData.performance.semesterProgress.map(sem => ({
                      name: String(sem.name || 'Unknown'),
                      value: Number(sem.gpa || 0)
                    }))
                  : [{ name: 'No Data', value: 0 }],
                type: 'line',
                height: 300,
                showGrid: true,
                showTooltip: true
              }}
            />

            <DataVisualization
              config={{
                title: 'Grade Distribution',
                data: Array.isArray(reportData.performance.gradeDistribution) && reportData.performance.gradeDistribution.length > 0
                  ? reportData.performance.gradeDistribution.map(item => ({
                      name: String(item.name || 'Unknown'),
                      value: Number(item.value || 0)
                    }))
                  : [{ name: 'No Data', value: 0 }],
                type: 'pie',
                height: 300,
                showLegend: true,
                showTooltip: true
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select
                    value={reportConfig.type}
                    onValueChange={(value) => setReportConfig(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Only</SelectItem>
                      <SelectItem value="performance">Performance Analysis</SelectItem>
                      <SelectItem value="progress">Progress Report</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={reportConfig.format}
                    onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="html">HTML Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={generateReport} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
                
                <Button variant="outline" onClick={shareReport}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Overall Data Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overall Academic Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* High-level Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{reportData.overview.cgpa.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Overall CGPA</div>
                </div>
                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">{reportData.overview.totalSubjects}</div>
                  <div className="text-sm text-muted-foreground">Total Subjects</div>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-lg">
                  <div className="text-2xl font-bold text-warning">{reportData.overview.totalProjects}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center p-4 bg-info/5 rounded-lg">
                  <div className="text-2xl font-bold text-info">{reportData.overview.totalCertificates}</div>
                  <div className="text-sm text-muted-foreground">Certificates</div>
                </div>
              </div>

              {/* Grade Distribution Chart */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Grade Distribution</h4>
                  <div className="space-y-2">
                    {Array.isArray(reportData.performance.gradeDistribution) && reportData.performance.gradeDistribution.length > 0 ? (
                      reportData.performance.gradeDistribution.map((item, idx) => {
                        const grade = String(item.name || 'Unknown');
                        const count = Number(item.value || 0);
                        const maxCount = Math.max(...reportData.performance.gradeDistribution.map(d => Number(d.value || 0)), 1);
                        
                        return (
                          <div key={`${grade}-${idx}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{grade}</Badge>
                              <span className="text-sm">{count} {count === 1 ? 'subject' : 'subjects'}</span>
                            </div>
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ 
                                  width: `${(count / maxCount) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground">No grade data available yet</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Academic Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <div className="font-medium text-success">Strong Areas</div>
                      <div className="text-sm text-muted-foreground">
                        {reportData.performance.strongAreas.length > 0 
                          ? reportData.performance.strongAreas.slice(0, 3).join(', ')
                          : 'Data will appear as you add more subjects'
                        }
                      </div>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <div className="font-medium text-warning">Areas for Improvement</div>
                      <div className="text-sm text-muted-foreground">
                        {reportData.performance.improvementAreas.length > 0 
                          ? reportData.performance.improvementAreas.slice(0, 3).join(', ')
                          : 'Keep up the great work!'
                        }
                      </div>
                    </div>
                    <div className="p-3 bg-info/10 rounded-lg">
                      <div className="font-medium text-info">Completion Progress</div>
                      <div className="text-sm text-muted-foreground">
                        {reportData.overview.completionRate}% of program completed
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h4 className="font-semibold mb-3">Recent Achievements</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Latest Grades</div>
                    <div className="space-y-1">
                      {reportData.achievements.recentGrades.slice(0, 3).map((grade, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{grade.subject}</span>
                          <Badge variant="outline">{grade.grade}</Badge>
                        </div>
                      ))}
                      {reportData.achievements.recentGrades.length === 0 && (
                        <div className="text-xs text-muted-foreground">No recent grades</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-sm">Completed Projects</div>
                    <div className="space-y-1">
                      {reportData.achievements.completedProjects.slice(0, 3).map((project, index) => (
                        <div key={index} className="text-sm">
                          {project.name}
                        </div>
                      ))}
                      {reportData.achievements.completedProjects.length === 0 && (
                        <div className="text-xs text-muted-foreground">No completed projects</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-sm">Earned Certificates</div>
                    <div className="space-y-1">
                      {reportData.achievements.earnedCertificates.slice(0, 3).map((cert, index) => (
                        <div key={index} className="text-sm">
                          {cert.name}
                        </div>
                      ))}
                      {reportData.achievements.earnedCertificates.length === 0 && (
                        <div className="text-xs text-muted-foreground">No certificates earned</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Charts */}
          <div className="grid grid-cols-1 gap-6">
            <DataVisualization
              config={{
                title: 'Semester Comparison',
                data: reportData.performance.semesterProgress.map(sem => ({
                  name: sem.name,
                  value: sem.gpa,
                  category: 'GPA'
                })),
                type: 'bar',
                height: 400,
                showGrid: true,
                showTooltip: true
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}