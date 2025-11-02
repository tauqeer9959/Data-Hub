import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calculator, Plus, Trash2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  getGradeFromMarks, 
  calculateMarksFromComponents, 
  getGradeColor,
  getPerformanceLevel,
  GRADE_SCALE 
} from '../../utils/gpaCalculator';
import { toast } from '../ui/sonner';

interface SubjectEntry {
  id: string;
  name: string;
  creditHours: number;
  // Option 1: Individual components
  assignment?: number;
  quizzes?: number;
  midExam?: number;
  finalExam?: number;
  // Option 2: Total marks directly
  totalMarks?: number;
  useComponents: boolean;
}

export function GPACalculator() {
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [newSubject, setNewSubject] = useState<SubjectEntry>({
    id: Date.now().toString(),
    name: '',
    creditHours: 3,
    assignment: 0,
    quizzes: 0,
    midExam: 0,
    finalExam: 0,
    totalMarks: 0,
    useComponents: true
  });

  const addSubject = () => {
    if (!newSubject.name.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    if (newSubject.creditHours < 1 || newSubject.creditHours > 6) {
      toast.error('Credit hours must be between 1 and 6');
      return;
    }

    // Validate marks
    if (newSubject.useComponents) {
      const components = [newSubject.assignment, newSubject.quizzes, newSubject.midExam, newSubject.finalExam];
      if (components.some(c => c === undefined || c < 0 || c > 100)) {
        toast.error('All component marks must be between 0 and 100');
        return;
      }
    } else {
      if (newSubject.totalMarks === undefined || newSubject.totalMarks < 0 || newSubject.totalMarks > 100) {
        toast.error('Total marks must be between 0 and 100');
        return;
      }
    }

    setSubjects([...subjects, { ...newSubject, id: Date.now().toString() }]);
    setNewSubject({
      id: Date.now().toString(),
      name: '',
      creditHours: 3,
      assignment: 0,
      quizzes: 0,
      midExam: 0,
      finalExam: 0,
      totalMarks: 0,
      useComponents: true
    });
    toast.success('Subject added successfully');
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast.success('Subject removed');
  };

  const calculateFinalMarks = (subject: SubjectEntry): number => {
    if (subject.useComponents) {
      return calculateMarksFromComponents(
        subject.assignment,
        subject.quizzes,
        subject.midExam,
        subject.finalExam
      );
    }
    return subject.totalMarks || 0;
  };

  const calculateGPA = () => {
    if (subjects.length === 0) return 0;

    let totalGradePoints = 0;
    let totalCreditHours = 0;

    subjects.forEach(subject => {
      const marks = calculateFinalMarks(subject);
      const grade = getGradeFromMarks(marks);
      totalGradePoints += grade.gradePoint * subject.creditHours;
      totalCreditHours += subject.creditHours;
    });

    return totalCreditHours > 0 ? Math.round((totalGradePoints / totalCreditHours) * 100) / 100 : 0;
  };

  const gpa = calculateGPA();
  const performance = getPerformanceLevel(gpa);

  return (
    <div className="space-y-6">
      <div>
        <h1>GPA Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your GPA with detailed grade breakdown or total marks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Add Subject
              </CardTitle>
              <CardDescription>
                Enter subject details with either component marks or total marks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Data Structures"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditHours">Credit Hours</Label>
                  <Input
                    id="creditHours"
                    type="number"
                    min="1"
                    max="6"
                    value={newSubject.creditHours}
                    onChange={(e) => setNewSubject({ ...newSubject, creditHours: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>

              <Tabs 
                value={newSubject.useComponents ? 'components' : 'total'} 
                onValueChange={(v) => setNewSubject({ ...newSubject, useComponents: v === 'components' })}
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
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={newSubject.assignment || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, assignment: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quizzes">Quizzes (15%)</Label>
                      <Input
                        id="quizzes"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={newSubject.quizzes || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, quizzes: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="midExam">Mid Exam (25%)</Label>
                      <Input
                        id="midExam"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={newSubject.midExam || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, midExam: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finalExam">Final Exam (50%)</Label>
                      <Input
                        id="finalExam"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={newSubject.finalExam || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, finalExam: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {newSubject.useComponents && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        Calculated Total: <span className="font-bold">
                          {calculateMarksFromComponents(
                            newSubject.assignment,
                            newSubject.quizzes,
                            newSubject.midExam,
                            newSubject.finalExam
                          ).toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="total" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks (%)</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={newSubject.totalMarks || ''}
                      onChange={(e) => setNewSubject({ ...newSubject, totalMarks: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={addSubject} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </CardContent>
          </Card>

          {/* Grade Scale Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Scale Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GRADE_SCALE.map((scale) => (
                  <div key={scale.grade} className="flex items-center justify-between p-2 bg-muted rounded">
                    <Badge variant="secondary" className={getGradeColor(scale.grade)}>
                      {scale.grade}
                    </Badge>
                    <span className="text-sm">{scale.minMarks}-{scale.maxMarks}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GPA Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{gpa.toFixed(2)}</div>
                <Badge variant="secondary" className={`text-white ${performance.color.replace('text-', 'bg-')}`}>
                  {performance.level}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{performance.description}</p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Subjects</span>
                  <span className="font-medium">{subjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Credits</span>
                  <span className="font-medium">{subjects.reduce((sum, s) => sum + s.creditHours, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject List */}
          {subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Added Subjects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjects.map((subject) => {
                  const marks = calculateFinalMarks(subject);
                  const grade = getGradeFromMarks(marks);
                  
                  return (
                    <div key={subject.id} className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.creditHours} credit {subject.creditHours === 1 ? 'hour' : 'hours'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubject(subject.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {subject.useComponents ? (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Assignment:</span>
                            <span>{subject.assignment}% × 10% = {((subject.assignment || 0) * 0.10).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quizzes:</span>
                            <span>{subject.quizzes}% × 15% = {((subject.quizzes || 0) * 0.15).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mid Exam:</span>
                            <span>{subject.midExam}% × 25% = {((subject.midExam || 0) * 0.25).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Final Exam:</span>
                            <span>{subject.finalExam}% × 50% = {((subject.finalExam || 0) * 0.50).toFixed(1)}</span>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Total: {marks.toFixed(2)}%</span>
                        <Badge variant="secondary" className={getGradeColor(grade.grade)}>
                          {grade.grade} ({grade.gradePoint})
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
