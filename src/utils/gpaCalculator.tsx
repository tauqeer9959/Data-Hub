// Enhanced GPA Calculator with new grading system
export interface GradeScale {
  grade: string;
  minMarks: number;
  maxMarks: number;
  gradePoint: number;
  description: string;
}

export const GRADE_SCALE: GradeScale[] = [
  { grade: 'A+', minMarks: 85, maxMarks: 100, gradePoint: 4.0, description: 'Excellent' },
  { grade: 'A-', minMarks: 80, maxMarks: 84, gradePoint: 3.7, description: 'Very Good' },
  { grade: 'B+', minMarks: 75, maxMarks: 79, gradePoint: 3.3, description: 'Good' },
  { grade: 'B-', minMarks: 70, maxMarks: 74, gradePoint: 3.0, description: 'Above Average' },
  { grade: 'C+', minMarks: 65, maxMarks: 69, gradePoint: 2.7, description: 'Average' },
  { grade: 'C-', minMarks: 60, maxMarks: 64, gradePoint: 2.3, description: 'Below Average' },
  { grade: 'D+', minMarks: 55, maxMarks: 59, gradePoint: 2.0, description: 'Poor' },
  { grade: 'D-', minMarks: 50, maxMarks: 54, gradePoint: 1.7, description: 'Very Poor' },
  { grade: 'F', minMarks: 0, maxMarks: 49, gradePoint: 0.0, description: 'Fail' }
];

export interface SubjectGrade {
  subjectName: string;
  marks: number;
  creditHours: number;
  grade: string;
  gradePoint: number;
  // Optional detailed breakdown
  assignment?: number;
  quizzes?: number;
  midExam?: number;
  finalExam?: number;
  totalMarks?: number;
}

export interface GPACalculation {
  subjects: SubjectGrade[];
  totalCreditHours: number;
  totalGradePoints: number;
  gpa: number;
  cgpa?: number;
  semester: string;
  educationLevel: string;
}

export function getGradeFromMarks(marks: number): GradeScale {
  return GRADE_SCALE.find(scale => marks >= scale.minMarks && marks <= scale.maxMarks) || GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function calculateSubjectGrade(marks: number, creditHours: number): SubjectGrade {
  const gradeScale = getGradeFromMarks(marks);
  return {
    subjectName: '',
    marks,
    creditHours,
    grade: gradeScale.grade,
    gradePoint: gradeScale.gradePoint
  };
}

export function calculateMarksFromComponents(
  assignment?: number,
  quizzes?: number,
  midExam?: number,
  finalExam?: number
): number {
  // Calculate total marks based on weightage
  // Assignment: 10%, Quizzes: 15%, Mid: 25%, Final: 50%
  const assignmentMarks = (assignment || 0) * 0.10;
  const quizzesMarks = (quizzes || 0) * 0.15;
  const midMarks = (midExam || 0) * 0.25;
  const finalMarks = (finalExam || 0) * 0.50;
  
  return Math.round((assignmentMarks + quizzesMarks + midMarks + finalMarks) * 100) / 100;
}

export function calculateSemesterGPA(subjects: SubjectGrade[]): GPACalculation {
  const validSubjects = subjects.filter(subject => subject.creditHours > 0);
  
  if (validSubjects.length === 0) {
    return {
      subjects: [],
      totalCreditHours: 0,
      totalGradePoints: 0,
      gpa: 0,
      semester: '',
      educationLevel: ''
    };
  }

  const totalCreditHours = validSubjects.reduce((sum, subject) => sum + subject.creditHours, 0);
  const totalGradePoints = validSubjects.reduce((sum, subject) => 
    sum + (subject.gradePoint * subject.creditHours), 0
  );
  
  const gpa = totalGradePoints / totalCreditHours;

  return {
    subjects: validSubjects,
    totalCreditHours,
    totalGradePoints,
    gpa: Math.round(gpa * 100) / 100,
    semester: '',
    educationLevel: ''
  };
}

export function calculateCGPA(semesterGPAs: GPACalculation[]): number {
  const validSemesters = semesterGPAs.filter(sem => sem.totalCreditHours > 0);
  
  if (validSemesters.length === 0) return 0;

  const totalCreditHours = validSemesters.reduce((sum, sem) => sum + sem.totalCreditHours, 0);
  const totalGradePoints = validSemesters.reduce((sum, sem) => sum + sem.totalGradePoints, 0);
  
  return Math.round((totalGradePoints / totalCreditHours) * 100) / 100;
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+': return 'text-green-600 dark:text-green-400';
    case 'A-': return 'text-green-500 dark:text-green-300';
    case 'B+': return 'text-blue-600 dark:text-blue-400';
    case 'B-': return 'text-blue-500 dark:text-blue-300';
    case 'C+': return 'text-yellow-600 dark:text-yellow-400';
    case 'C-': return 'text-yellow-500 dark:text-yellow-300';
    case 'D+': return 'text-orange-600 dark:text-orange-400';
    case 'D-': return 'text-orange-500 dark:text-orange-300';
    case 'F': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

export function getPerformanceLevel(gpa: number): { level: string; color: string; description: string } {
  if (gpa >= 3.7) return { level: 'Excellent', color: 'text-green-600', description: 'Outstanding performance' };
  if (gpa >= 3.3) return { level: 'Very Good', color: 'text-blue-600', description: 'Above average performance' };
  if (gpa >= 3.0) return { level: 'Good', color: 'text-blue-500', description: 'Satisfactory performance' };
  if (gpa >= 2.7) return { level: 'Average', color: 'text-yellow-600', description: 'Average performance' };
  if (gpa >= 2.0) return { level: 'Below Average', color: 'text-orange-600', description: 'Needs improvement' };
  return { level: 'Poor', color: 'text-red-600', description: 'Significant improvement needed' };
}

export function generateGPAReport(semesterGPAs: GPACalculation[]): {
  cgpa: number;
  totalCreditHours: number;
  totalSubjects: number;
  gradeDistribution: Record<string, number>;
  trendAnalysis: { semester: string; gpa: number }[];
  performanceMetrics: {
    highestGPA: number;
    lowestGPA: number;
    averageGPA: number;
    improvement: number;
  };
} {
  const cgpa = calculateCGPA(semesterGPAs);
  const totalCreditHours = semesterGPAs.reduce((sum, sem) => sum + sem.totalCreditHours, 0);
  const totalSubjects = semesterGPAs.reduce((sum, sem) => sum + sem.subjects.length, 0);
  
  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  GRADE_SCALE.forEach(scale => gradeDistribution[scale.grade] = 0);
  
  semesterGPAs.forEach(sem => {
    sem.subjects.forEach(subject => {
      gradeDistribution[subject.grade] = (gradeDistribution[subject.grade] || 0) + 1;
    });
  });

  // Trend analysis
  const trendAnalysis = semesterGPAs.map(sem => ({
    semester: sem.semester,
    gpa: sem.gpa
  }));

  // Performance metrics
  const gpas = semesterGPAs.map(sem => sem.gpa).filter(gpa => gpa > 0);
  const highestGPA = Math.max(...gpas, 0);
  const lowestGPA = Math.min(...gpas, 0);
  const averageGPA = gpas.length > 0 ? gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length : 0;
  const improvement = gpas.length > 1 ? gpas[gpas.length - 1] - gpas[0] : 0;

  return {
    cgpa,
    totalCreditHours,
    totalSubjects,
    gradeDistribution,
    trendAnalysis,
    performanceMetrics: {
      highestGPA: Math.round(highestGPA * 100) / 100,
      lowestGPA: Math.round(lowestGPA * 100) / 100,
      averageGPA: Math.round(averageGPA * 100) / 100,
      improvement: Math.round(improvement * 100) / 100
    }
  };
}