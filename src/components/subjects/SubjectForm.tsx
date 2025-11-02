import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Info } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { projectId } from '../../utils/supabase/info';
import { toast } from '../ui/sonner';
import { calculateMarksFromComponents } from '../../utils/gpaCalculator';

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
  gpa: number;
  totalCredits: number;
}

interface SubjectFormProps {
  subject: Subject | null;
  semesters: Semester[];
  onSave: () => void;
  onCancel: () => void;
}

export function SubjectForm({ subject, semesters, onSave, onCancel }: SubjectFormProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    semesterId: '',
    name: '',
    code: '',
    creditHours: 3,
    marks: 0,
    grade: 'F',
    assignment: 0,
    quizzes: 0,
    midExam: 0,
    finalExam: 0,
    totalMarks: 0,
    useComponents: true
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        semesterId: subject.semesterId,
        name: subject.name,
        code: subject.code,
        creditHours: subject.creditHours,
        marks: subject.marks,
        grade: subject.grade,
        assignment: subject.assignment || 0,
        quizzes: subject.quizzes || 0,
        midExam: subject.midExam || 0,
        finalExam: subject.finalExam || 0,
        totalMarks: subject.totalMarks || subject.marks || 0,
        useComponents: subject.useComponents !== undefined ? subject.useComponents : false
      });
    }
  }, [subject]);

  // Auto-calculate marks and grade
  useEffect(() => {
    const calculateGrade = (marks: number) => {
      if (marks >= 85) return 'A+';
      if (marks >= 80) return 'A-';
      if (marks >= 75) return 'B+';
      if (marks >= 70) return 'B-';
      if (marks >= 65) return 'C+';
      if (marks >= 60) return 'C-';
      if (marks >= 55) return 'D+';
      if (marks >= 50) return 'D-';
      return 'F';
    };

    let finalMarks = 0;
    if (formData.useComponents) {
      finalMarks = calculateMarksFromComponents(
        formData.assignment,
        formData.quizzes,
        formData.midExam,
        formData.finalExam
      );
    } else {
      finalMarks = formData.totalMarks;
    }

    const calculatedGrade = calculateGrade(finalMarks);
    if (finalMarks !== formData.marks || calculatedGrade !== formData.grade) {
      setFormData(prev => ({ ...prev, marks: finalMarks, grade: calculatedGrade }));
    }
  }, [formData.assignment, formData.quizzes, formData.midExam, formData.finalExam, formData.totalMarks, formData.useComponents]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = ['creditHours', 'marks', 'assignment', 'quizzes', 'midExam', 'finalExam', 'totalMarks'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditHours' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    if (!formData.semesterId) {
      toast.error('Please select a semester');
      return;
    }

    if (formData.marks < 0 || formData.marks > 100) {
      toast.error('Marks must be between 0 and 100');
      return;
    }

    if (formData.creditHours < 1 || formData.creditHours > 6) {
      toast.error('Credit hours must be between 1 and 6');
      return;
    }

    setLoading(true);

    try {
      const url = subject 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/subjects/${subject.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/subjects`;
      
      const method = subject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(subject ? 'Subject updated successfully' : 'Subject created successfully');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save subject');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="semesterId">Semester</Label>
        <Select 
          value={formData.semesterId} 
          onValueChange={(value) => handleSelectChange('semesterId', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                Semester {semester.semesterNo} ({semester.year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Subject Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Data Structures"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Subject Code</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., CS201"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="creditHours">Credit Hours</Label>
        <Select 
          value={formData.creditHours.toString()} 
          onValueChange={(value) => handleSelectChange('creditHours', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((hours) => (
              <SelectItem key={hours} value={hours.toString()}>
                {hours} {hours === 1 ? 'hour' : 'hours'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Grading Method</Label>
        <Tabs 
          value={formData.useComponents ? 'components' : 'total'} 
          onValueChange={(v) => setFormData({ ...formData, useComponents: v === 'components' })}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="components">Component Marks</TabsTrigger>
            <TabsTrigger value="total">Total Marks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Assignment (10%), Quizzes (15%), Mid Exam (25%), Final Exam (50%)
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignment">Assignment (10%)</Label>
                <Input
                  id="assignment"
                  name="assignment"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.assignment}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quizzes">Quizzes (15%)</Label>
                <Input
                  id="quizzes"
                  name="quizzes"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.quizzes}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="midExam">Mid Exam (25%)</Label>
                <Input
                  id="midExam"
                  name="midExam"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.midExam}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finalExam">Final Exam (50%)</Label>
                <Input
                  id="finalExam"
                  name="finalExam"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.finalExam}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="total" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks (%)</Label>
              <Input
                id="totalMarks"
                name="totalMarks"
                type="number"
                min="0"
                max="100"
                value={formData.totalMarks}
                onChange={handleInputChange}
                placeholder="0-100"
                disabled={loading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div className="space-y-2">
          <Label>Calculated Marks</Label>
          <div className="text-2xl font-bold">{formData.marks.toFixed(2)}%</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Select 
            value={formData.grade} 
            onValueChange={(value) => handleSelectChange('grade', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: 'A+', label: 'A+ (85-100)' },
                { value: 'A-', label: 'A- (80-85)' },
                { value: 'B+', label: 'B+ (75-80)' },
                { value: 'B-', label: 'B- (70-75)' },
                { value: 'C+', label: 'C+ (65-70)' },
                { value: 'C-', label: 'C- (60-65)' },
                { value: 'D+', label: 'D+ (55-60)' },
                { value: 'D-', label: 'D- (50-55)' },
                { value: 'F', label: 'F (<50)' }
              ].map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name.trim() || !formData.code.trim() || !formData.semesterId}>
          {loading ? 'Saving...' : subject ? 'Update Subject' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
}