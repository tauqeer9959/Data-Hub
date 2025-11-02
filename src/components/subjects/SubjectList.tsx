import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { SubjectForm } from './SubjectForm';
import { EducationLevelTabs } from '../education/EducationLevelTabs';
import { useEducationLevel } from '../education/EducationLevelProvider';
import { Plus, Search, BookOpen, Edit, Trash2, GraduationCap } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { projectId } from '../../utils/supabase/info';
import { toast } from '../ui/sonner';

interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code: string;
  creditHours: number;
  marks: number;
  grade: string;
  assignment?: number;
  quizzes?: number;
  midExam?: number;
  finalExam?: number;
  totalMarks?: number;
  useComponents?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Semester {
  id: string;
  semesterNo: number;
  year: number;
  educationLevel: string;
  gpa: number;
  totalCredits: number;
}

export function SubjectList() {
  const { session } = useAuth();
  const { currentLevel } = useEducationLevel();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    if (!session?.access_token) return;

    try {
      const semestersResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters?educationLevel=${currentLevel}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      let semestersData: Semester[] = [];
      if (semestersResponse.ok) {
        semestersData = await semestersResponse.json();
        setSemesters(semestersData);
      }

      // Get subjects from each semester individually
      const allSubjects: Subject[] = [];
      
      for (const semester of semestersData) {
        try {
          const subjectsResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters/${semester.id}/subjects`,
            {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }
          );
          
          if (subjectsResponse.ok) {
            const semesterSubjects = await subjectsResponse.json();
            allSubjects.push(...semesterSubjects);
          }
        } catch (error) {
          console.error(`Error fetching subjects for semester ${semester.id}:`, error);
        }
      }
      
      setSubjects(allSubjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session, currentLevel]);

  const handleDelete = async (subjectId: string) => {
    if (!session?.access_token || !confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Subject deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    }
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleSubjectSaved = () => {
    fetchData();
    setIsDialogOpen(false);
    setSelectedSubject(null);
  };

  const getSemesterName = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? `Semester ${semester.semesterNo} (${semester.year})` : 'Unknown Semester';
  };

  const getGradeColor = (grade: string) => {
    const gradePoints: { [key: string]: string } = {
      'A+': 'text-green-700 bg-green-100',
      'A': 'text-green-700 bg-green-100',
      'A-': 'text-green-600 bg-green-50',
      'B+': 'text-blue-700 bg-blue-100',
      'B': 'text-blue-600 bg-blue-50',
      'B-': 'text-blue-500 bg-blue-50',
      'C+': 'text-yellow-700 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-50',
      'C-': 'text-yellow-500 bg-yellow-50',
      'D+': 'text-orange-700 bg-orange-100',
      'D': 'text-orange-600 bg-orange-50',
      'F': 'text-red-700 bg-red-100'
    };
    return gradePoints[grade] || 'text-gray-600 bg-gray-50';
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || subject.semesterId === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <EducationLevelTabs onDataCleared={fetchData} />
        
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
      <EducationLevelTabs onDataCleared={fetchData} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  Semester {semester.semesterNo} ({semester.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSubject(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSubject ? 'Edit Subject' : 'Add New Subject'}
              </DialogTitle>
              <DialogDescription>
                {selectedSubject 
                  ? 'Update subject information and grades'
                  : 'Add a new subject to track your academic performance'
                }
              </DialogDescription>
            </DialogHeader>
            <SubjectForm 
              subject={selectedSubject}
              semesters={semesters}
              onSave={handleSubjectSaved}
              onCancel={() => {
                setIsDialogOpen(false);
                setSelectedSubject(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground mb-4">
              {subjects.length === 0 ? 'No subjects found' : 'No subjects match your search'}
            </div>
            {subjects.length === 0 && semesters.length === 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                You need to create a semester first before adding subjects.
              </p>
            )}
            {semesters.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedSubject(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>
                      Add a new subject to track your academic performance
                    </DialogDescription>
                  </DialogHeader>
                  <SubjectForm 
                    subject={null}
                    semesters={semesters}
                    onSave={handleSubjectSaved}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setSelectedSubject(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{subject.name}</CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                      <span className="font-mono text-sm">{subject.code}</span>
                      <span className="text-xs">{getSemesterName(subject.semesterId)}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(subject)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subject.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Credit Hours</span>
                    <Badge variant="outline">{subject.creditHours}</Badge>
                  </div>
                  
                  {subject.useComponents && (
                    <div className="text-xs space-y-1 py-2 border-t border-b">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assignment (10%):</span>
                        <span>{subject.assignment || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quizzes (15%):</span>
                        <span>{subject.quizzes || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mid Exam (25%):</span>
                        <span>{subject.midExam || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Final Exam (50%):</span>
                        <span>{subject.finalExam || 0}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Marks</span>
                    <span className="font-medium">{subject.marks.toFixed(2)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Grade</span>
                    <Badge variant="secondary" className={getGradeColor(subject.grade)}>
                      {subject.grade}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-4">
                  Updated {new Date(subject.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}