import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { clearBachelorData } from '../../utils/academicData';
import { toast } from '../ui/sonner';

interface ClearBachelorDataProps {
  onDataCleared?: () => void;
}

export function ClearBachelorData({ onDataCleared }: ClearBachelorDataProps) {
  const { session } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClearData = async () => {
    if (!session?.access_token) {
      toast.error('Authentication required');
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearBachelorData(session.access_token);
      
      if (result.success) {
        toast.success(
          `Successfully cleared ${result.deletedSemesters} semesters and ${result.deletedSubjects} subjects`,
          {
            description: 'All bachelor\'s level data has been removed',
            duration: 5000,
          }
        );
        
        setIsOpen(false);
        
        // Call the callback to refresh data
        if (onDataCleared) {
          onDataCleared();
        }
        
        // Dispatch event to refresh dashboard stats
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      } else {
        throw new Error('Failed to clear data');
      }
    } catch (error) {
      console.error('Error clearing bachelor data:', error);
      toast.error('Failed to clear bachelor data', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Clear Bachelor's Data
        </CardTitle>
        <CardDescription>
          Permanently remove all semesters and subjects from your bachelor's degree records.
          This action cannot be undone.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={isClearing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Bachelor's Data
            </Button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Data Deletion
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <div>
                    <strong>This action is irreversible!</strong> You are about to permanently delete:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All bachelor's degree semesters</li>
                    <li>All subjects and grades within those semesters</li>
                    <li>All calculated GPAs for those semesters</li>
                  </ul>
                  <div className="text-sm text-muted-foreground">
                    Your master's and PhD data (if any) will remain untouched.
                  </div>
                  <div>
                    Are you absolutely sure you want to proceed?
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isClearing}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Yes, Clear All Data
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}