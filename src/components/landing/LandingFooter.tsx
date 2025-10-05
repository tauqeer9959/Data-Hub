import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Dashboard Overview', href: 'https://github.com/tawqeer/data-hub/wiki/dashboard', external: true },
      { name: 'Academic Analytics', href: 'https://datahub.edu/analytics', external: true },
      { name: 'Progress Reports', href: 'https://help.datahub.edu/reports', external: true },
      { name: 'GPA Calculator', href: 'https://calculator.datahub.edu', external: true },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Contact', href: '#contact' },
      { name: 'Privacy Policy', href: 'https://datahub.edu/privacy', external: true },
      { name: 'Terms of Service', href: 'https://datahub.edu/terms', external: true },
      { name: 'Our Mission', href: '#about' },
    ],
    support: [
      { name: 'Help Center', href: 'https://help.datahub.edu', external: true },
      { name: 'Documentation', href: 'https://docs.datahub.edu', external: true },
      { name: 'Contact Support', href: '#contact' },
      { name: 'System Status', href: 'https://status.datahub.edu', external: true },
      { name: 'User Guides', href: 'https://guides.datahub.edu', external: true },
    ],
    resources: [
      { name: 'Academic Blog', href: 'https://blog.datahub.edu', external: true },
      { name: 'Study Guides', href: 'https://guides.datahub.edu/study', external: true },
      { name: 'Student Success Stories', href: 'https://stories.datahub.edu', external: true },
      { name: 'Community Forum', href: 'https://community.datahub.edu', external: true },
      { name: 'Best Practices', href: 'https://datahub.edu/best-practices', external: true },
    ]
  };

  const handleLinkClick = (link: { href: string; external?: boolean }) => {
    if (link.external) {
      // Open external links in new tab
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else if (link.href.startsWith('#') && link.href !== '#') {
      const element = document.getElementById(link.href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Data Hub</span>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Empowering students to excel in their academic journey with comprehensive 
              management tools and analytics.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com/datahub.edu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/datahub_edu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/datahub-edu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com/tawqeer/data-hub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center"
                  >
                    {link.name}
                    {link.external && (
                      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center"
                  >
                    {link.name}
                    {link.external && (
                      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center"
                  >
                    {link.name}
                    {link.external && (
                      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => handleLinkClick(link)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center"
                  >
                    {link.name}
                    {link.external && (
                      <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">Email</div>
                <a 
                  href="mailto:tawqeer462@gmail.com" 
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  tawqeer462@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">Phone</div>
                <a 
                  href="tel:+923329959202" 
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  +92 332 995 9202
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">Location</div>
                <div className="text-muted-foreground text-sm">Buner, Pakistan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm">
            © {currentYear} Data Hub. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button 
              onClick={() => window.open('https://datahub.edu/privacy', '_blank', 'noopener,noreferrer')}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => window.open('https://datahub.edu/terms', '_blank', 'noopener,noreferrer')}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => window.open('https://datahub.edu/cookies', '_blank', 'noopener,noreferrer')}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}