// Fallback component to provide descriptions for accessibility
import { DialogDescription } from './dialog';

interface MissingDescriptionFallbackProps {
  children: React.ReactNode;
  fallbackDescription?: string;
}

export function DialogWithFallbackDescription({ 
  children, 
  fallbackDescription = "Dialog content" 
}: MissingDescriptionFallbackProps) {
  return (
    <>
      {children}
      {/* Add hidden fallback description if none exists */}
      <DialogDescription className="sr-only">
        {fallbackDescription}
      </DialogDescription>
    </>
  );
}