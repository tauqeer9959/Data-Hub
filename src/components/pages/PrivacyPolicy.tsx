import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react';

interface PrivacyPolicyProps {
  onGoBack: () => void;
}

export function PrivacyPolicy({ onGoBack }: PrivacyPolicyProps) {
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
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Privacy Policy</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Introduction</h3>
            <p className="text-muted-foreground">
              This Privacy Policy describes how Data Hub ("we", "our", or "us") collects, uses, and protects your information when you use our academic management platform. We are committed to protecting your privacy and ensuring the security of your personal data.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground"><strong>Personal Information:</strong> Name, email address, phone number, and location when you create an account or update your profile.</p>
                <p className="text-muted-foreground"><strong>Academic Data:</strong> Semester information, subject details, grades, GPA calculations, project portfolios, and certificates.</p>
                <p className="text-muted-foreground"><strong>Files:</strong> Documents, images, and certificates you upload to our platform.</p>
                <p className="text-muted-foreground"><strong>Usage Data:</strong> Information about how you interact with our platform, including activity logs and system access patterns.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">• To provide and maintain our academic management services</p>
                <p className="text-muted-foreground">• To calculate and track your academic progress and GPA</p>
                <p className="text-muted-foreground">• To store and organize your academic records securely</p>
                <p className="text-muted-foreground">• To provide customer support and respond to your inquiries</p>
                <p className="text-muted-foreground">• To improve our platform's functionality and user experience</p>
                <p className="text-muted-foreground">• To ensure the security and integrity of our systems</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Data Security</h3>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest, stored on secure servers with access controls, and backed up regularly. We use Supabase's secure infrastructure with Row Level Security (RLS) policies to ensure your data remains private and accessible only to you.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Data Sharing</h3>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information only in the following circumstances:
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-muted-foreground">• With your explicit consent</p>
              <p className="text-muted-foreground">• To comply with legal obligations or court orders</p>
              <p className="text-muted-foreground">• To protect our rights, property, or safety</p>
              <p className="text-muted-foreground">• In connection with a business transfer or merger</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
            <p className="text-muted-foreground">You have the right to:</p>
            <div className="mt-2 space-y-1">
              <p className="text-muted-foreground">• Access your personal data</p>
              <p className="text-muted-foreground">• Correct inaccurate or incomplete data</p>
              <p className="text-muted-foreground">• Delete your account and associated data</p>
              <p className="text-muted-foreground">• Export your data in a portable format</p>
              <p className="text-muted-foreground">• Withdraw consent for data processing</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Data Retention</h3>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your account is active or as needed to provide our services. If you delete your account, we will permanently delete your data within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-muted-foreground">Email: tawqeer462@gmail.com</p>
              <p className="text-muted-foreground">Phone: +92 332 9959202</p>
              <p className="text-muted-foreground">Location: Buner, Pakistan</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              This privacy policy may be updated from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}