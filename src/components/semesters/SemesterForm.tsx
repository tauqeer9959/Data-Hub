import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../auth/AuthProvider';
import { useEducationLevel } from '../education/EducationLevelProvider';
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

interface SemesterFormProps {
  semester: Semester | null;
  onSave: () => void;
  onCancel: () => void;
}

export function SemesterForm({ semester, onSave, onCancel }: SemesterFormProps) {
  const { session } = useAuth();
  const { currentLevel } = useEducationLevel();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    semesterNo: 1,
    year: new Date().getFullYear(),
    educationLevel: currentLevel
  });

  useEffect(() => {
    if (semester) {
      setFormData({
        semesterNo: semester.semesterNo,
        year: semester.year,
        educationLevel: semester.educationLevel || currentLevel
      });
    } else {
      setFormData(prev => ({
        ...prev,
        educationLevel: currentLevel
      }));
    }
  }, [semester, currentLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semesterNo' || name === 'year' ? parseInt(value) || 0 : value
    }));
  };

  const handleSemesterChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      semesterNo: parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    if (formData.semesterNo < 1 || formData.semesterNo > 8) {
      toast.error('Semester number must be between 1 and 8');
      return;
    }

    if (formData.year < 2000 || formData.year > 2030) {
      toast.error('Please enter a valid year');
      return;
    }

    setLoading(true);

    try {
      const url = semester 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters/${semester.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/semesters`;
      
      const method = semester ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(semester ? 'Semester updated successfully' : 'Semester created successfully');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save semester');
      }
    } catch (error) {
      console.error('Error saving semester:', error);
      toast.error('Failed to save semester');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="semesterNo">Semester Number</Label>
        <Select 
          value={formData.semesterNo.toString()} 
          onValueChange={handleSemesterChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                Semester {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Academic Year</Label>
        <Input
          id="year"
          name="year"
          type="number"
          value={formData.year}
          onChange={handleInputChange}
          placeholder="e.g., 2024"
          min="2000"
          max="2030"
          required
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || formData.semesterNo < 1 || formData.year < 2000}>
          {loading ? 'Saving...' : semester ? 'Update Semester' : 'Create Semester'}
        </Button>
      </div>
    </form>
  );
}