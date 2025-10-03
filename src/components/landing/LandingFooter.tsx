import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Dashboard Overview', href: '#' },
      { name: 'Academic Analytics', href: '#' },
      { name: 'Progress Reports', href: '#' },
      { name: 'GPA Calculator', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Contact', href: '#contact' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Our Mission', href: '#about' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'Contact Support', href: '#contact' },
      { name: 'System Status', href: '#' },
      { name: 'User Guides', href: '#' },
    ],
    resources: [
      { name: 'Academic Blog', href: '#' },
      { name: 'Study Guides', href: '#' },
      { name: 'Student Success Stories', href: '#' },
      { name: 'Community Forum', href: '#' },
      { name: 'Best Practices', href: '#' },
    ]
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#') && href !== '#') {
      const element = document.getElementById(href.slice(1));
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
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
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
                    onClick={() => scrollToSection(link.href)}
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
                    onClick={() => scrollToSection(link.href)}
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
                    onClick={() => scrollToSection(link.href)}
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
                    onClick={() => scrollToSection(link.href)}
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
              onClick={() => scrollToSection('#')}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => scrollToSection('#')}
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => scrollToSection('#')}
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