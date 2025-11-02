import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';
import { Github, Linkedin, Mail, Globe, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { profile } = useAuth();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/tauqeerahmad',
      color: 'hover:text-gray-900 dark:hover:text-gray-100'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/in/tauqeer-ahmad',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:tawqeer462@gmail.com',
      color: 'hover:text-green-600'
    }
  ];

  const productLinks = [
    { name: 'Dashboard', href: '#', id: 'dashboard', key: 'product-dashboard' },
    { name: 'Analytics', href: '#', id: 'enhanced-dashboard', key: 'product-analytics' },
    { name: 'Reports', href: '#', id: 'reports', key: 'product-reports' },
    { name: 'Calendar', href: '#', id: 'calendar', key: 'product-calendar' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '#', id: 'dashboard', key: 'company-about' },
    { name: 'Academic Records', href: '#', id: 'semesters', key: 'company-semesters' },
    { name: 'Projects', href: '#', id: 'projects', key: 'company-projects' },
    { name: 'Certificates', href: '#', id: 'certificates', key: 'company-certificates' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#', id: 'support', key: 'support-help' },
    { name: 'Documentation', href: '#', id: 'support', key: 'support-docs' },
    { name: 'Contact Support', href: '#', id: 'support', key: 'support-contact' },
    { name: 'File Manager', href: '#', id: 'files', key: 'support-files' }
  ];

  const resourceLinks = [
    { name: 'Profile Settings', href: '#', id: 'profile', key: 'resource-profile' },
    { name: 'Academic Guides', href: '#', id: 'support', key: 'resource-guides' },
    { name: 'Data Export', href: '#', id: 'reports', key: 'resource-export' },
    { name: 'Study Resources', href: '#', id: 'subjects', key: 'resource-study' }
  ];

  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">DH</span>
              </div>
              <h3 className="font-semibold">Data Hub</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive academic and project management platform for students and professionals.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.name}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`${link.color} transition-colors`}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-medium">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.key}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: link.id }));
                    }}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-medium">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.key}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: link.id }));
                    }}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-medium">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.key}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: link.id }));
                    }}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-medium">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.key}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: link.id }));
                    }}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact</h4>
            <div className="space-y-3">
              {profile?.publicProfile && (
                <>
                  {profile.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${profile.email}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${profile.phone}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Default contact if profile is not public */}
              {!profile?.publicProfile && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href="mailto:tawqeer462@gmail.com"
                      className="hover:text-foreground transition-colors"
                    >
                      tawqeer462@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a
                      href="tel:+923329959202"
                      className="hover:text-foreground transition-colors"
                    >
                      +92 332 9959202
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Buner, Pakistan</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tauqeer Ahmad. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'privacy' }));
                }}
              >
                Privacy Policy
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'terms' }));
                }}
              >
                Terms of Service
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'support' }));
                }}
              >
                Help & Support
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'cookies' }));
                }}
              >
                Cookie Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}