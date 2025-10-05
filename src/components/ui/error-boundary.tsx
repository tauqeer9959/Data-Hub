import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import { Badge } from './badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  ChevronDown,
  Copy,
  Send,
  Home
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (if enabled)
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Here you would integrate with your error reporting service
      // e.g., Sentry, LogRocket, Bugsnag, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };

      // Simulate API call to error reporting service
      console.log('Error report:', errorReport);
      
      // You could also send this to your backend
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    });
  };

  handleCopyError = () => {
    const errorText = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  handleReportIssue = () => {
    const subject = encodeURIComponent(`Bug Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:


Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
    `);

    // Open email client or issue tracker
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    An unexpected error occurred while rendering this page
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Error ID: {this.state.errorId}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date().toLocaleString()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button onClick={this.handleRetry} className="flex-1 sm:flex-none">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="flex-1 sm:flex-none">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  <Button variant="outline" onClick={this.handleCopyError} size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                  {this.props.enableReporting && (
                    <Button variant="outline" onClick={this.handleReportIssue} size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  )}
                </div>

                {this.props.showErrorDetails && (
                  <Collapsible open={this.state.showDetails} onOpenChange={this.setState.bind(this, { showDetails: !this.state.showDetails })}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Technical Details</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Error Message</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                            {this.state.error?.message}
                          </pre>
                        </div>
                        
                        {this.state.error?.stack && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Stack Trace</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Component Stack</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <p>
                  If this problem persists, please contact support with the error ID above.
                  We apologize for the inconvenience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary context
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // This would integrate with your error boundary context
    console.error('Manual error report:', error, errorInfo);
    throw error;
  };
}