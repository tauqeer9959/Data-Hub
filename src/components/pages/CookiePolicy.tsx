import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Cookie, Shield, Settings } from 'lucide-react';

interface CookiePolicyProps {
  onGoBack: () => void;
}

export function CookiePolicy({ onGoBack }: CookiePolicyProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="flex items-center gap-2">
            <Cookie className="h-6 w-6" />
            Cookie Policy
          </h1>
          <p className="text-muted-foreground">
            Learn how we use cookies to enhance your experience
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What Are Cookies</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
            They are widely used to make websites work more efficiently and provide information to website owners.
          </p>
          <p>
            At Data Hub, we use cookies to enhance your experience, remember your preferences, and provide personalized 
            content and features.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Types of Cookies We Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Essential Cookies
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are necessary for the website to function properly. They enable core functionality 
                such as security, network management, and accessibility.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Authentication and session management</li>
                <li>• Security and fraud prevention</li>
                <li>• Load balancing and site functionality</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Functional Cookies
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies allow us to remember choices you make and provide enhanced features and personalization.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Language preferences</li>
                <li>• Theme settings (dark/light mode)</li>
                <li>• Dashboard layout preferences</li>
                <li>• Educational level settings</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Performance Cookies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies help us understand how visitors interact with our website by collecting 
                and reporting information anonymously.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Page load times and performance metrics</li>
                <li>• Feature usage analytics</li>
                <li>• Error tracking and debugging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We may use third-party services that set cookies on our website:
          </p>
          <div className="space-y-3">
            <div className="border rounded p-3">
              <h4 className="font-medium">Supabase</h4>
              <p className="text-sm text-muted-foreground">
                Used for authentication, database operations, and real-time features. 
                Essential for providing core application functionality.
              </p>
            </div>
            <div className="border rounded p-3">
              <h4 className="font-medium">GitHub Sign-In</h4>
              <p className="text-sm text-muted-foreground">
                Used when you choose to sign in with your GitHub account. 
                Governed by GitHub's privacy policy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managing Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You can control and manage cookies in several ways:
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Browser Settings</h4>
              <p className="text-sm text-muted-foreground">
                Most browsers allow you to view, manage, and delete cookies through their settings. 
                You can typically find these options in the privacy or security section of your browser preferences.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Application Preferences</h4>
              <p className="text-sm text-muted-foreground">
                You can manage your preferences within the Data Hub application through your profile settings 
                and privacy controls.
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <p className="text-sm">
                <strong>Note:</strong> Disabling essential cookies may affect the functionality of our website 
                and prevent you from using certain features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Different cookies have different retention periods:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li>• <strong>Authentication cookies:</strong> Typically expire after 30 days of inactivity</li>
            <li>• <strong>Preference cookies:</strong> Stored for up to 1 year unless manually cleared</li>
            <li>• <strong>Performance cookies:</strong> Typically stored for 30 days</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Updates to This Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices 
            or for other operational, legal, or regulatory reasons. We will notify you of any 
            material changes by posting the updated policy on our website and updating the 
            "last updated" date.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> tawqeer462@gmail.com</p>
            <p><strong>Phone:</strong> +92 332 9959202</p>
            <p><strong>Address:</strong> Buner, Pakistan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}