import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Upload, File, X, Image, Crown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../auth/AuthProvider';
import { Alert, AlertDescription } from '../ui/alert';

interface FileUploadProps {
  onUploadSuccess?: (file: any) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ 
  onUploadSuccess, 
  accept = "image/*,.pdf",
  maxSize = 10485760, // 10MB
  className = ""
}: FileUploadProps) {
  const { session, profile } = useAuth();
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const isPro = profile?.subscription === 'pro';
  const storageLimit = isPro ? Infinity : 104857600; // 100MB for free users
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch total storage used
  useEffect(() => {
    const fetchStorageUsed = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/files`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const files = await response.json();
          const total = files.reduce((sum: number, file: any) => sum + (file.fileSize || 0), 0);
          setTotalStorageUsed(total);
        }
      } catch (error) {
        console.error('Error fetching storage used:', error);
      }
    };

    fetchStorageUsed();
  }, [session?.access_token]);

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not allowed. Please upload images or PDF files only.');
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      toast.error(`File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return false;
    }

    // Check storage limit for free users
    if (!isPro && totalStorageUsed + file.size > storageLimit) {
      const remaining = Math.max(0, storageLimit - totalStorageUsed);
      toast.error(
        `Storage limit exceeded. Free plan allows 100MB total. You have ${(remaining / 1024 / 1024).toFixed(2)}MB remaining. Upgrade to PRO for unlimited storage.`
      );
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    if (!session?.access_token) {
      toast.error('You must be logged in to upload files');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

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
      setUploadProgress(100);
      
      toast.success('File uploaded successfully!');
      onUploadSuccess?.(fileData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload File
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : (
                <Upload className="h-6 w-6 text-primary" />
              )}
            </div>
            
            {uploading ? (
              <div className="w-full max-w-xs">
                <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports images and PDF files up to {formatFileSize(maxSize)}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        {/* Storage Usage Indicator */}
        {!isPro && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-medium">
                {formatFileSize(totalStorageUsed)} / {formatFileSize(storageLimit)}
              </span>
            </div>
            <Progress 
              value={(totalStorageUsed / storageLimit) * 100} 
              className="h-2"
            />
            {totalStorageUsed / storageLimit > 0.8 && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're running low on storage. 
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('navigate', { detail: 'pricing' }));
                    }}
                    className="ml-1 underline font-medium"
                  >
                    Upgrade to PRO
                  </a> for unlimited storage.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {isPro && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <Crown className="h-4 w-4" />
            <span>Unlimited storage - PRO Member</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}