import { projectId, publicAnonKey } from './supabase/info';

export interface ClearDataResponse {
  success: boolean;
  deletedSemesters: number;
  deletedSubjects: number;
  message: string;
}

export async function clearBachelorData(accessToken: string): Promise<ClearDataResponse> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/education/bachelor/clear`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clear bachelor data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error clearing bachelor data:', error);
    throw error;
  }
}