import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Archive, 
  X, 
  Check,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Validators } from '../../utils/validation';

interface FileUploadItem {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

interface DragDropUploadProps {
  onFilesUploaded?: (files: FileUploadItem[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  showPreview?: boolean;
  multiple?: boolean;
  className?: string;
}

export function DragDropUpload({
  onFilesUploaded,
  maxFiles = 10,
  maxSizePerFile = 10,
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  showPreview = true,
  multiple = true,
  className = ''
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (file.type.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="h-8 w-8 text-yellow-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return { isValid: false, error: `File size exceeds ${maxSizePerFile}MB limit` };
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    // Check total number of files
    if (files.length >= maxFiles) {
      return { isValid: false, error: `Maximum ${maxFiles} files allowed` };
    }

    return { isValid: true };
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/') && showPreview) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const processFiles = async (fileList: FileList) => {
    const newFiles: FileUploadItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);

      if (!validation.isValid) {
        toast.error(validation.error);
        continue;
      }

      const preview = await createFilePreview(file);
      
      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        preview,
        progress: 0,
        status: 'pending'
      });
    }

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [files.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFile = async (fileItem: FileUploadItem): Promise<FileUploadItem> => {
    return new Promise((resolve) => {
      // Simulate file upload
      const uploadProgress = () => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: Math.min(f.progress + 10, 100) }
            : f
        ));
      };

      const interval = setInterval(() => {
        uploadProgress();
        
        const currentFile = files.find(f => f.id === fileItem.id);
        if (currentFile && currentFile.progress >= 100) {
          clearInterval(interval);
          
          // Simulate upload completion
          const completedFile: FileUploadItem = {
            ...fileItem,
            status: 'completed',
            progress: 100,
            url: `https://example.com/files/${fileItem.file.name}`
          };
          
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? completedFile : f
          ));
          
          resolve(completedFile);
        }
      }, 200);
    });
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = pendingFiles.map(uploadFile);
      const uploadedFiles = await Promise.all(uploadPromises);
      
      onFilesUploaded?.(uploadedFiles);
      toast.success(`${uploadedFiles.length} files uploaded successfully`);
    } catch (error) {
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const retryUpload = async (fileId: string) => {
    const fileItem = files.find(f => f.id === fileId);
    if (!fileItem) return;

    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'pending', progress: 0, error: undefined }
        : f
    ));

    try {
      await uploadFile(fileItem);
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: 'Upload failed' }
          : f
      ));
    }
  };

  const clearAll = () => {
    setFiles([]);
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Drag and drop files here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Supported formats: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}</p>
            <p>Maximum file size: {maxSizePerFile}MB</p>
            <p>Maximum files: {maxFiles}</p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h4 className="font-medium">Files ({files.length})</h4>
                {completedCount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {completedCount} completed
                  </Badge>
                )}
                {pendingCount > 0 && (
                  <Badge variant="secondary">
                    {pendingCount} pending
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    {errorCount} failed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <Button 
                    onClick={uploadAllFiles} 
                    disabled={uploading}
                    size="sm"
                  >
                    Upload All
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {fileItem.preview ? (
                      <img 
                        src={fileItem.preview} 
                        alt={fileItem.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(fileItem.file)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {fileItem.status === 'completed' && (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {fileItem.status === 'error' && (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => retryUpload(fileItem.id)}
                            >
                              Retry
                            </Button>
                          </>
                        )}
                        
                        {fileItem.status === 'uploading' && (
                          <div className="w-16">
                            <Progress value={fileItem.progress} className="h-2" />
                          </div>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="mt-2 h-1" />
                    )}
                    
                    {fileItem.error && (
                      <p className="text-sm text-red-500 mt-1">{fileItem.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}