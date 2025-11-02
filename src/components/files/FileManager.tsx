import { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { useAuth } from '../auth/AuthProvider';

export function FileManager() {
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = useCallback(() => {
    // Trigger a refresh of the file list
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleFileDeleted = useCallback(() => {
    // Trigger a refresh of the file list
    setRefreshKey(prev => prev + 1);
  }, []);

  if (!session?.access_token) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to access file management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      <FileList key={refreshKey} onFileDeleted={handleFileDeleted} />
    </div>
  );
}