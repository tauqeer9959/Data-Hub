import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Upload, File } from 'lucide-react';
import { cn } from '../ui/utils';
import { useAuth } from '../auth/AuthProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
}

interface CertificateFormProps {
  certificate: Certificate | null;
  onSave: () => void;
  onCancel: () => void;
}

export function CertificateForm({ certificate, onSave, onCancel }: CertificateFormProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: new Date(),
    filePath: ''
  });

  useEffect(() => {
    if (certificate) {
      setFormData({
        title: certificate.title,
        issuer: certificate.issuer,
        issueDate: new Date(certificate.issueDate),
        filePath: certificate.filePath || ''
      });
    }
  }, [certificate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        issueDate: date
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.access_token) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PDF or image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/files/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const fileData = await response.json();
      
      setFormData(prev => ({
        ...prev,
        filePath: fileData.file_path
      }));
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setLoading(true);

    try {
      const url = certificate 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/certificates/${certificate.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/certificates`;
      
      const method = certificate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: formData.title,
          issuer: formData.issuer,
          issueDate: formData.issueDate.toISOString(),
          filePath: formData.filePath
        })
      });

      if (response.ok) {
        toast.success(certificate ? 'Certificate updated successfully' : 'Certificate added successfully');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save certificate');
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error('Failed to save certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Certificate Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., AWS Certified Solutions Architect"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="issuer">Issuing Organization</Label>
        <Input
          id="issuer"
          name="issuer"
          value={formData.issuer}
          onChange={handleInputChange}
          placeholder="e.g., Amazon Web Services"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>Issue Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.issueDate && "text-muted-foreground"
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.issueDate ? formData.issueDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.issueDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-file">Certificate File (Optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="certificate-file"
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={loading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('certificate-file')?.click()}
            disabled={loading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {formData.filePath ? 'Change File' : 'Upload Certificate'}
          </Button>
        </div>
        {formData.filePath && (
          <p className="text-sm text-muted-foreground">
            Selected: {formData.filePath}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, JPG, PNG (max 10MB)
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.title.trim() || !formData.issuer.trim()}>
          {loading ? 'Saving...' : certificate ? 'Update Certificate' : 'Add Certificate'}
        </Button>
      </div>
    </form>
  );
}