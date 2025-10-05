import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, FileText, AlertTriangle, Scale, Users } from 'lucide-react';

interface TermsOfServiceProps {
  onGoBack: () => void;
}

export function TermsOfService({ onGoBack }: TermsOfServiceProps) {
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
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Terms of Service</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing and using Data Hub ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Description of Service</h3>
              <p className="text-muted-foreground">
                Data Hub is an academic management platform that allows users to track their academic progress, manage semesters and subjects, calculate GPA, store project portfolios, manage certificates, and upload academic files. The service is provided by Tauqeer Ahmad and hosted on secure cloud infrastructure.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">User Accounts and Registration</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">• You must provide accurate and complete information when creating an account</p>
                <p className="text-muted-foreground">• You are responsible for maintaining the confidentiality of your account credentials</p>
                <p className="text-muted-foreground">• You must be at least 13 years old to use this service</p>
                <p className="text-muted-foreground">• One person may not maintain more than one account</p>
                <p className="text-muted-foreground">• You are responsible for all activities that occur under your account</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Acceptable Use Policy</h3>
            <p className="text-muted-foreground mb-3">You agree not to use the service to:</p>
            <div className="space-y-1">
              <p className="text-muted-foreground">• Upload malicious software, viruses, or harmful code</p>
              <p className="text-muted-foreground">• Share inappropriate, offensive, or illegal content</p>
              <p className="text-muted-foreground">• Attempt to gain unauthorized access to other user accounts</p>
              <p className="text-muted-foreground">• Use the service for any commercial purposes without permission</p>
              <p className="text-muted-foreground">• Interfere with or disrupt the service or servers</p>
              <p className="text-muted-foreground">• Impersonate another person or entity</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Data and Content</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">• You retain ownership of all content you upload to the service</p>
                <p className="text-muted-foreground">• You grant us permission to store and process your data to provide the service</p>
                <p className="text-muted-foreground">• You are responsible for backing up your important data</p>
                <p className="text-muted-foreground">• We reserve the right to remove content that violates these terms</p>
                <p className="text-muted-foreground">• File uploads are limited to 10MB per file for images and PDFs only</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
            <p className="text-muted-foreground">
              While we strive to maintain high availability, we do not guarantee that the service will be available 100% of the time. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We will make reasonable efforts to minimize downtime and provide advance notice when possible.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Privacy and Security</h3>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. We implement security measures to protect your data, but no system is completely secure. You should take precautions to protect your account credentials.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Limitation of Liability</h3>
            <p className="text-muted-foreground">
              The service is provided "as is" without any warranties. We are not liable for any damages arising from your use of the service, including but not limited to data loss, service interruptions, or security breaches. Your use of the service is at your own risk.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Termination</h3>
            <p className="text-muted-foreground">
              We may terminate or suspend your account at any time for violating these terms. You may also terminate your account at any time through your account settings. Upon termination, your access to the service will cease, and your data may be deleted according to our data retention policy.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of significant changes by posting the updated terms on this page and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-muted-foreground">Email: tawqeer462@gmail.com</p>
              <p className="text-muted-foreground">Phone: +92 332 9959202</p>
              <p className="text-muted-foreground">Location: Buner, Pakistan</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              By using Data Hub, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}