import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Users, Target, Zap, Heart } from 'lucide-react';

export function AboutSection() {
  const values = [
    {
      icon: Users,
      title: 'Student-Centered',
      description: 'Designed by students, for students. We understand the challenges of academic life.'
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'Help you set, track, and achieve your academic goals with precision and clarity.'
    },
    {
      icon: Zap,
      title: 'Efficiency First',
      description: 'Streamlined workflows that save time and reduce administrative overhead.'
    },
    {
      icon: Heart,
      title: 'Passion-Driven',
      description: 'Built with love for education and a commitment to student success.'
    }
  ];

  return (
    <section id="about" className="py-12 sm:py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">About Data Hub</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Data Hub is more than just an academic management system. It's your personal academic 
              companion that grows with you throughout your educational journey, from undergraduate 
              studies to doctoral research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-12 text-left">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Our Mission</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We believe that every student deserves access to powerful tools that help them 
                  succeed academically. Data Hub democratizes academic management by providing 
                  enterprise-grade features in an intuitive, accessible platform.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Whether you're tracking your GPA, managing projects, or preparing for your 
                  next academic milestone, Data Hub is designed to support your success every 
                  step of the way.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-2xl font-bold text-primary">0K</div>
                  <div className="text-sm text-muted-foreground">Students Served</div>
                </div>
                <div className="text-center p-4 bg-success/5 rounded-xl">
                  <div className="text-2xl font-bold text-success">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-xl">
                  <div className="text-2xl font-bold text-warning">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
                <div className="text-center p-4 bg-info/5 rounded-xl">
                  <div className="text-2xl font-bold text-info">5+</div>
                  <div className="text-sm text-muted-foreground">Universities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}