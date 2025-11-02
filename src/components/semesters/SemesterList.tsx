import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { SemesterForm } from './SemesterForm';
import { EducationLevelTabs } from '../education/EducationLevelTabs';
import { useEducationLevel } from '../education/EducationLevelProvider';
import { Plus, Search, BookOpen, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { projectId } from '../../utils/supabase/info';
import { toast } from '../ui/sonner';

interface Semester {
  id: string;
  semesterNo: number;
  year: number;
  educationLevel: string;
  gpa: number;
  totalCredits: number;
  createdAt: string;
  updatedAt: string;
}

export function SemesterList() {
  const { session } = useAuth();
  const { currentLevel } = useEducationLevel();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSemesters = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters?educationLevel=${currentLevel}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
      } else {
        console.error('Failed to fetch semesters');
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [session, currentLevel]);

  const handleDelete = async (semesterId: string) => {
    if (!session?.access_token || !confirm('Are you sure you want to delete this semester? This will also delete all associated subjects.')) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters/${semesterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Semester deleted successfully');
        fetchSemesters();
      } else {
        toast.error('Failed to delete semester');
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
      toast.error('Failed to delete semester');
    }
  };

  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsDialogOpen(true);
  };

  const handleSemesterSaved = () => {
    fetchSemesters();
    setIsDialogOpen(false);
    setSelectedSemester(null);
  };

  const filteredSemesters = semesters.filter(semester =>
    semester.semesterNo.toString().includes(searchTerm) ||
    semester.year.toString().includes(searchTerm)
  );

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600 bg-green-50';
    if (gpa >= 3.0) return 'text-yellow-600 bg-yellow-50';
    if (gpa >= 2.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getGPAGrade = (gpa: number) => {
    if (gpa >= 3.7) return 'A';
    if (gpa >= 3.3) return 'B+';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.7) return 'C+';
    if (gpa >= 2.3) return 'C';
    if (gpa >= 2.0) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <EducationLevelTabs onDataCleared={fetchSemesters} />
        
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-10 w-24 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EducationLevelTabs onDataCleared={fetchSemesters} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search semesters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSemester(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSemester ? 'Edit Semester' : 'Add New Semester'}
              </DialogTitle>
              <DialogDescription>
                {selectedSemester 
                  ? 'Update semester information'
                  : 'Add a new semester to track your academic progress'
                }
              </DialogDescription>
            </DialogHeader>
            <SemesterForm 
              semester={selectedSemester}
              onSave={handleSemesterSaved}
              onCancel={() => {
                setIsDialogOpen(false);
                setSelectedSemester(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filteredSemesters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground mb-4">
              {semesters.length === 0 ? 'No semesters found' : 'No semesters match your search'}
            </div>
            {semesters.length === 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedSemester(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Semester
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Semester</DialogTitle>
                    <DialogDescription>
                      Add a new semester to track your academic progress
                    </DialogDescription>
                  </DialogHeader>
                  <SemesterForm 
                    semester={null}
                    onSave={handleSemesterSaved}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setSelectedSemester(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSemesters.map((semester) => (
            <Card key={semester.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Semester {semester.semesterNo}
                    </CardTitle>
                    <CardDescription>
                      Academic Year {semester.year}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(semester)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(semester.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">GPA</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getGPAColor(semester.gpa)}>
                        {semester.gpa.toFixed(2)}
                      </Badge>
                      <Badge variant="outline">
                        {getGPAGrade(semester.gpa)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Credits</span>
                    <span className="font-medium">{semester.totalCredits}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      {semester.gpa >= 3.5 ? 'Excellent' : 
                       semester.gpa >= 3.0 ? 'Good' :
                       semester.gpa >= 2.5 ? 'Average' : 'Below Average'}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-4">
                  Updated {new Date(semester.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}