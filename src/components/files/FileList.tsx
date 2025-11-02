import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  File, 
  Image, 
  Download, 
  MoreHorizontal, 
  Trash2, 
  Eye,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../../utils/supabase/info';
import { useAuth } from '../auth/AuthProvider';

interface FileItem {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  signedUrl: string;
  createdAt: string;
}

interface FileListProps {
  onFileDeleted?: () => void;
}

export function FileList({ onFileDeleted }: FileListProps) {
  const { session } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      fetchFiles();
    }
  }, [session]);

  const fetchFiles = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/files`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Fetch files error:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (file: FileItem) => {
    if (file.signedUrl) {
      const link = document.createElement('a');
      link.href = file.signedUrl;
      link.download = file.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('File URL not available');
    }
  };

  const handleView = (file: FileItem) => {
    if (file.signedUrl) {
      window.open(file.signedUrl, '_blank');
    } else {
      toast.error('File URL not available');
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    
    if (!session?.access_token) {
      toast.error('You must be logged in to delete files');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
      onFileDeleted?.();
    } catch (error) {
      console.error('Delete file error:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) {
      return <File className="h-5 w-5 text-gray-500" />;
    }
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeBadge = (fileType: string) => {
    if (!fileType) {
      return <Badge variant="outline">File</Badge>;
    }
    
    if (fileType.startsWith('image/')) {
      return <Badge variant="secondary">Image</Badge>;
    } else if (fileType === 'application/pdf') {
      return <Badge variant="destructive">PDF</Badge>;
    }
    return <Badge variant="outline">File</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session?.access_token) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to view your files.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          My Files ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No files uploaded</h3>
            <p className="text-muted-foreground">Upload your first file to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.fileName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(file.createdAt)}</span>
                      <span>•</span>
                      {getFileTypeBadge(file.fileType)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(file)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(file.id, file.fileName)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}