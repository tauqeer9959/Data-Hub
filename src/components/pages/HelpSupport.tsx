import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, HelpCircle, Mail, Phone, MapPin, MessageCircle, BookOpen, Lightbulb } from 'lucide-react';

interface HelpSupportProps {
  onGoBack: () => void;
}

export function HelpSupport({ onGoBack }: HelpSupportProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Help & Support</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Get help with Data Hub and find answers to common questions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us an email and we'll respond within 24 hours
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:tawqeer462@gmail.com">
                    Contact Support
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Call us directly for immediate assistance
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:+923329959202">
                    Call Now
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Location</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Buner, Pakistan
                </p>
                <Button variant="outline" size="sm" disabled>
                  Local Time Zone
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">How do I add a new semester?</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Semesters section and click "Add Semester". Enter the semester number and year, then save your changes.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">How is my GPA calculated?</h4>
                  <p className="text-sm text-muted-foreground">
                    GPA is calculated using the updated grading scale: A+ (85-100) = 4.0, A- (80-85) = 3.7, B+ (75-80) = 3.3, B- (70-75) = 3.0, C+ (65-70) = 2.7, C- (60-65) = 2.3, D+ (55-60) = 2.0, D- (50-55) = 1.3, F (&lt;50) = 0.0.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">What file types can I upload?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can upload image files (JPEG, PNG, GIF, WebP) and PDF documents. The maximum file size is 10MB per file.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">How do I backup my data?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your data is automatically backed up on our secure servers. You can also export your academic records from each section to keep local copies.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Can I delete my account?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can delete your account from the Profile settings. Please note that this action is permanent and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Getting Started Guide</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>Step 1:</strong> Complete your profile by adding your personal information and contact details.
                </p>
                <p className="text-muted-foreground">
                  <strong>Step 2:</strong> Add your academic semesters with the semester number and year.
                </p>
                <p className="text-muted-foreground">
                  <strong>Step 3:</strong> Add subjects to each semester with credit hours, marks, and grades.
                </p>
                <p className="text-muted-foreground">
                  <strong>Step 4:</strong> Upload your project portfolios and certificates.
                </p>
                <p className="text-muted-foreground">
                  <strong>Step 5:</strong> Use the file manager to organize your academic documents.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Academic Management</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Semester and subject tracking</li>
                    <li>• Automatic GPA calculation</li>
                    <li>• Grade management</li>
                    <li>• Academic progress monitoring</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Portfolio Management</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Project showcase</li>
                    <li>• Certificate storage</li>
                    <li>• File upload and management</li>
                    <li>• Secure cloud storage</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Security</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Encrypted data transmission</li>
                    <li>• Secure user authentication</li>
                    <li>• Regular data backups</li>
                    <li>• Privacy protection</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">User Experience</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Responsive design</li>
                    <li>• Dark/light mode support</li>
                    <li>• Intuitive navigation</li>
                    <li>• Real-time updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>tawqeer462@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+92 332 9959202</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Buner, Pakistan</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Need immediate assistance?</strong> Contact us directly via email or phone. We're here to help you make the most of your Data Hub experience and ensure your academic data is properly managed and secure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}