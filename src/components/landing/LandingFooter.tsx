import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Dashboard Overview', href: '#features' },
      { name: 'Academic Analytics', href: '#features' },
      { name: 'Progress Reports', href: '#features' },
      { name: 'GPA Calculator', href: '#features' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Contact', href: '#contact' },
      { name: 'Privacy Policy', href: '#about' },
      { name: 'Terms of Service', href: '#about' },
      { name: 'Our Mission', href: '#about' },
    ],
    support: [
      { name: 'Help Center', href: '#contact' },
      { name: 'Documentation', href: '#features' },
      { name: 'Contact Support', href: '#contact' },
      { name: 'System Status', href: '#contact' },
      { name: 'User Guides', href: '#features' },
    ],
    resources: [
      { name: 'Academic Blog', href: '#about' },
      { name: 'Study Guides', href: '#features' },
      { name: 'Student Success Stories', href: '#about' },
      { name: 'Community Forum', href: '#contact' },
      { name: 'Best Practices', href: '#features' },
    ]
  };

  const handleLinkClick = (link: { href: string }) => {
    if (link.href.startsWith('#') && link.href !== '#') {
      const element = document.getElementById(link.href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">DH</span>
              </div>
              <span className="text-lg sm:text-xl font-bold">Data Hub</span>
            </div>
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm leading-relaxed">
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
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
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
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
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
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
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
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
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
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm text-center md:text-left">
            © {currentYear} Data Hub. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <button 
              onClick={() => {
                const element = document.getElementById('about');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('about');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('about');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
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
