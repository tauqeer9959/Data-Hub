import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../../utils/supabase/info';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Contact form submitting:', { name: formData.name, email: formData.email });

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-0603cad1/contact`;
      console.log('Sending request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Failed to send message';
        try {
          const result = await response.json();
          console.error('Error response:', result);
          errorMessage = result.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
          // Try to get the response as text
          try {
            const text = await response.text();
            console.error('Response text:', text);
          } catch (textError) {
            console.error('Could not read response text:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      setIsSubmitted(true);
      toast.success(result.message || 'Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Contact form error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'tawqeer462@gmail.com',
      link: 'mailto:tawqeer462@gmail.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+92 332 995 9202',
      link: 'tel:+923329959202'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Buner, Pakistan',
      link: null
    }
  ];

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Get in Touch</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Have questions, feedback, or need support? We'd love to hear from you. 
              Our team is here to help you succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Contact Information */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{info.title}</p>
                          {info.link ? (
                            <a 
                              href={info.link}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-muted-foreground">{info.value}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Why Contact Us?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Technical Support</p>
                        <p className="text-sm text-muted-foreground">Get help with any technical issues</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Feature Requests</p>
                        <p className="text-sm text-muted-foreground">Suggest new features or improvements</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Partnership Inquiries</p>
                        <p className="text-sm text-muted-foreground">Explore collaboration opportunities</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">General Questions</p>
                        <p className="text-sm text-muted-foreground">Any questions about our platform</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <CheckCircle className="h-16 w-16 text-success mx-auto" />
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold">Message Sent!</h4>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="bg-background resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}