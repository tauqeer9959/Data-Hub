import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { X, Plus, Upload, Image } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Project {
  id: string;
  title: string;
  description: string;
  techTags: string[];
  links: string[];
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormProps {
  project: Project | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techTags: [] as string[],
    links: [] as string[],
    screenshots: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        techTags: project.techTags,
        links: project.links,
        screenshots: project.screenshots || []
      });
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.techTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        techTags: [...prev.techTags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      techTags: prev.techTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addLink = () => {
    if (newLink.trim() && !formData.links.includes(newLink.trim())) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const removeLink = (linkToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter(link => link !== linkToRemove)
    }));
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !session?.access_token) return;

    setLoading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Please select only image files');
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size must be less than 10MB');
        }

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
        return fileData.file_path;
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, ...uploadedPaths]
      }));
      
      toast.success(`${uploadedPaths.length} screenshot(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading screenshots:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload screenshots');
    } finally {
      setLoading(false);
    }
  };

  const removeScreenshot = (screenshotToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(screenshot => screenshot !== screenshotToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setLoading(true);

    try {
      const url = project 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/projects/${project.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/projects`;
      
      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          techTags: formData.techTags,
          links: formData.links,
          screenshots: formData.screenshots
        })
      });

      if (response.ok) {
        toast.success(project ? 'Project updated successfully' : 'Project created successfully');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter project title"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your project..."
          rows={4}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>Technologies Used</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add technology (e.g., React, Node.js)"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" onClick={addTag} disabled={loading || !newTag.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.techTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.techTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4"
                  onClick={() => removeTag(tag)}
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Project Links</Label>
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Add project link (GitHub, Demo, etc.)"
            type="url"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <Button type="button" onClick={addLink} disabled={loading || !newLink.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.links.length > 0 && (
          <div className="space-y-2 mt-2">
            {formData.links.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="flex-1 text-sm truncate">{link}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(link)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Project Screenshots</Label>
        <div className="space-y-2">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleScreenshotUpload}
            disabled={loading}
            className="hidden"
            id="screenshot-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('screenshot-upload')?.click()}
            disabled={loading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Screenshots
          </Button>
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, WebP (max 10MB each)
          </p>
        </div>
        
        {formData.screenshots.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {formData.screenshots.map((screenshot, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeScreenshot(screenshot)}
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Screenshot {index + 1}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.title.trim()}>
          {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}