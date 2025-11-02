import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';
import { Progress } from './progress';
import { Badge } from './badge';
import { motion } from 'motion/react';
import { 
  Loader2, 
  Download, 
  Upload, 
  Wifi, 
  WifiOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Basic loading spinner
export function LoadingSpinner({ size = 'default', className = '' }: { 
  size?: 'sm' | 'default' | 'lg'; 
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Pulsing dots loader
export function PulsingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

// Skeleton loaders for different content types
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Progress indicators
export function ProgressLoader({ 
  progress, 
  label, 
  showPercentage = true,
  className = ''
}: { 
  progress: number; 
  label?: string; 
  showPercentage?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          {showPercentage && <span>{progress}%</span>}
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
}

export function StepProgress({ 
  steps, 
  currentStep, 
  className = '' 
}: { 
  steps: string[]; 
  currentStep: number; 
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }
            `}>
              {index < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                h-1 w-16 mx-2
                ${index < currentStep ? 'bg-green-500' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="text-sm text-center text-muted-foreground">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
      </div>
    </div>
  );
}

// Status indicators
export function ConnectionStatus({ 
  isConnected, 
  isConnecting = false,
  className = ''
}: { 
  isConnected: boolean; 
  isConnecting?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnecting ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="text-sm text-muted-foreground">Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">Disconnected</span>
        </>
      )}
    </div>
  );
}

export function OperationStatus({ 
  status, 
  message,
  className = ''
}: { 
  status: 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  className?: string;
}) {
  const icons = {
    loading: <LoadingSpinner size="sm" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />
  };

  const colors = {
    loading: 'text-muted-foreground',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icons[status]}
      {message && (
        <span className={`text-sm ${colors[status]}`}>
          {message}
        </span>
      )}
    </div>
  );
}

// Upload/Download progress
export function FileOperationProgress({ 
  type,
  fileName,
  progress,
  status,
  error,
  className = ''
}: {
  type: 'upload' | 'download';
  fileName: string;
  progress: number;
  status: 'pending' | 'active' | 'completed' | 'error';
  error?: string;
  className?: string;
}) {
  const Icon = type === 'upload' ? Upload : Download;

  return (
    <div className={`space-y-2 p-3 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
        <Badge variant={
          status === 'completed' ? 'secondary' : 
          status === 'error' ? 'destructive' : 
          'default'
        }>
          {status}
        </Badge>
      </div>
      
      {status === 'active' && (
        <ProgressLoader 
          progress={progress} 
          label={`${type === 'upload' ? 'Uploading' : 'Downloading'}...`}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Animated loading states
export function PulseLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-primary rounded-full ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

export function WaveLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={{
            height: [4, 20, 4]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...',
  progress,
  className = ''
}: {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-background/80 backdrop-blur-sm ${className}
      `}
    >
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" className="mx-auto" />
            <div>
              <p className="text-sm font-medium">{message}</p>
              {progress !== undefined && (
                <ProgressLoader 
                  progress={progress} 
                  showPercentage={true}
                  className="mt-3"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}