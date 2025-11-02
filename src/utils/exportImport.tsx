// Export/Import functionality for academic data
import { toast } from 'sonner@2.0.3';

export interface ExportData {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  exportDate: string;
  educationLevel: string;
  semesters: any[];
  subjects: any[];
  projects: any[];
  certificates: any[];
  metadata: {
    version: string;
    totalRecords: number;
  };
}

export class DataExporter {
  static async exportToJSON(data: ExportData): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-hub-export-${data.educationLevel}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  }

  static async exportToCSV(data: ExportData): Promise<void> {
    try {
      const csvContent = this.convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-hub-export-${data.educationLevel}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported to CSV successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export to CSV');
    }
  }

  static async exportToPDF(data: ExportData): Promise<void> {
    try {
      // Create a comprehensive academic report
      const reportContent = this.generatePDFContent(data);
      
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Academic Report - ${data.user.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .grade-a { color: green; font-weight: bold; }
            .grade-b { color: blue; font-weight: bold; }
            .grade-c { color: orange; font-weight: bold; }
            .grade-d { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          ${reportContent}
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `academic-report-${data.educationLevel}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Academic report generated successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate report');
    }
  }

  private static convertToCSV(data: ExportData): string {
    const subjects = data.subjects || [];
    if (subjects.length === 0) return 'No data available';

    const headers = ['Subject Name', 'Semester', 'Marks', 'Credit Hours', 'Grade', 'Grade Points'];
    const csvContent = [
      headers.join(','),
      ...subjects.map(subject => [
        `"${subject.name || ''}"`,
        `"${subject.semester || ''}"`,
        subject.marks || 0,
        subject.creditHours || 0,
        `"${subject.grade || ''}"`,
        subject.gradePoints || 0
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  private static generatePDFContent(data: ExportData): string {
    return `
      <div class="header">
        <h1>Academic Report</h1>
        <h2>${data.user.fullName}</h2>
        <p>Education Level: ${data.educationLevel}</p>
        <p>Report Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h3>Summary</h3>
        <p>Total Semesters: ${data.semesters?.length || 0}</p>
        <p>Total Subjects: ${data.subjects?.length || 0}</p>
        <p>Total Projects: ${data.projects?.length || 0}</p>
        <p>Total Certificates: ${data.certificates?.length || 0}</p>
      </div>

      <div class="section">
        <h3>Subjects</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Semester</th>
              <th>Marks</th>
              <th>Credit Hours</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${data.subjects?.map(subject => `
              <tr>
                <td>${subject.name || 'N/A'}</td>
                <td>${subject.semester || 'N/A'}</td>
                <td>${subject.marks || 0}</td>
                <td>${subject.creditHours || 0}</td>
                <td class="grade-${subject.grade?.charAt(0).toLowerCase() || 'f'}">${subject.grade || 'N/A'}</td>
              </tr>
            `).join('') || '<tr><td colspan="5">No subjects found</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }
}

export class DataImporter {
  static async importFromJSON(file: File): Promise<ExportData | null> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!this.validateImportData(data)) {
        toast.error('Invalid data format');
        return null;
      }
      
      toast.success('Data imported successfully');
      return data;
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
      return null;
    }
  }

  static async importFromCSV(file: File): Promise<any[] | null> {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim().replace(/"/g, '');
        });
        return obj;
      });
      
      toast.success('CSV data imported successfully');
      return data;
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error('Failed to import CSV data');
      return null;
    }
  }

  private static validateImportData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.user &&
      data.exportDate &&
      Array.isArray(data.semesters) &&
      Array.isArray(data.subjects)
    );
  }
}

export function generateBackupData(
  user: any,
  semesters: any[],
  subjects: any[],
  projects: any[],
  certificates: any[],
  educationLevel: string
): ExportData {
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName || user.email?.split('@')[0] || 'User'
    },
    exportDate: new Date().toISOString(),
    educationLevel,
    semesters: semesters || [],
    subjects: subjects || [],
    projects: projects || [],
    certificates: certificates || [],
    metadata: {
      version: '1.0.0',
      totalRecords: (semesters?.length || 0) + (subjects?.length || 0) + (projects?.length || 0) + (certificates?.length || 0)
    }
  };
}