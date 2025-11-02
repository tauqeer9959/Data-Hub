import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  BarChart3, 
  GraduationCap, 
  FolderOpen, 
  Award, 
  Calendar, 
  FileText,
  Shield,
  Smartphone,
  Cloud,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Advanced GPA calculations, progress tracking, and performance insights with interactive charts.',
      badge: 'Popular',
      badgeVariant: 'default' as const
    },
    {
      icon: GraduationCap,
      title: 'Academic Management',
      description: 'Organize semesters, subjects, and courses across Bachelor, Master, and PhD levels.',
      badge: 'Essential',
      badgeVariant: 'secondary' as const
    },
    {
      icon: FolderOpen,
      title: 'Project Portfolio',
      description: 'Showcase your projects with file uploads, descriptions, and achievement tracking.',
      badge: 'New',
      badgeVariant: 'destructive' as const
    },
    {
      icon: Award,
      title: 'Certificate Manager',
      description: 'Store and organize your certificates, achievements, and professional credentials.',
      badge: null,
      badgeVariant: null
    },
    {
      icon: Calendar,
      title: 'Academic Calendar',
      description: 'Track important dates, deadlines, exams, and academic events with smart reminders.',
      badge: 'Updated',
      badgeVariant: 'outline' as const
    },
    {
      icon: FileText,
      title: 'Document Storage',
      description: 'Secure cloud storage for all your academic documents with advanced search.',
      badge: null,
      badgeVariant: null
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Enterprise-grade security with encrypted data storage and privacy controls.',
      badge: 'Secure',
      badgeVariant: 'secondary' as const
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works perfectly on all devices and screen sizes.',
      badge: null,
      badgeVariant: null
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Real-time synchronization across all your devices with offline support.',
      badge: null,
      badgeVariant: null
    },
    {
      icon: Users,
      title: 'Multi-User Support',
      description: 'Admin panel for educators and institutions with comprehensive user management.',
      badge: 'Pro',
      badgeVariant: 'default' as const
    },
    {
      icon: Zap,
      title: 'Fast Performance',
      description: 'Lightning-fast loading times with intelligent caching and optimization.',
      badge: null,
      badgeVariant: null
    },
    {
      icon: RefreshCw,
      title: 'Regular Updates',
      description: 'Continuous improvements and new features based on user feedback.',
      badge: null,
      badgeVariant: null
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to excel in your academic journey, from basic organization 
              to advanced analytics and reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      {feature.badge && (
                        <Badge variant={feature.badgeVariant!} className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-left text-base md:text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs md:text-sm text-muted-foreground text-left leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Highlight */}
          <div className="bg-gradient-to-r from-primary/5 via-success/5 to-info/5 rounded-2xl p-8 md:p-12">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-6 text-left">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Built for Academic Excellence
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Data Hub combines the power of modern technology with deep understanding 
                  of academic workflows. Our platform grows with you, adapting to your 
                  changing needs from freshman year to graduation and beyond.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    Real-time Updates
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    Offline Support
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    Multi-Platform
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    Data Export
                  </Badge>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-block p-8 bg-card rounded-2xl shadow-md">
                  <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">4.9/5</div>
                    <div className="text-sm text-muted-foreground">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}