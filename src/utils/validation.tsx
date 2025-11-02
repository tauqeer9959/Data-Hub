// Comprehensive validation utilities
import { toast } from 'sonner@2.0.3';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => { isValid: boolean; message?: string; isWarning?: boolean };
  required?: boolean;
}

export class FormValidator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): FormValidator<T> {
    this.rules.push(rule);
    return this;
  }

  validate(data: Partial<T>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      const value = data[rule.field];
      
      // Check if required field is missing
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${String(rule.field)} is required`);
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      const result = rule.validator(value);
      if (!result.isValid) {
        if (result.isWarning) {
          warnings.push(result.message || `Invalid ${String(rule.field)}`);
        } else {
          errors.push(result.message || `Invalid ${String(rule.field)}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Common validators
export const Validators = {
  email: (value: string) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }),

  phone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return {
      isValid: phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')),
      message: 'Please enter a valid phone number'
    };
  },

  name: (value: string) => ({
    isValid: value.length >= 2 && value.length <= 50 && /^[a-zA-Z\s]+$/.test(value),
    message: 'Name must be 2-50 characters and contain only letters and spaces'
  }),

  marks: (value: number) => ({
    isValid: value >= 0 && value <= 100,
    message: 'Marks must be between 0 and 100'
  }),

  creditHours: (value: number) => ({
    isValid: value >= 1 && value <= 6,
    message: 'Credit hours must be between 1 and 6'
  }),

  semesterName: (value: string) => ({
    isValid: value.length >= 3 && value.length <= 30,
    message: 'Semester name must be 3-30 characters'
  }),

  subjectName: (value: string) => ({
    isValid: value.length >= 2 && value.length <= 100,
    message: 'Subject name must be 2-100 characters'
  }),

  projectTitle: (value: string) => ({
    isValid: value.length >= 5 && value.length <= 200,
    message: 'Project title must be 5-200 characters'
  }),

  url: (value: string) => {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: 'Please enter a valid URL'
      };
    }
  },

  date: (value: string) => {
    const date = new Date(value);
    return {
      isValid: !isNaN(date.getTime()),
      message: 'Please enter a valid date'
    };
  },

  futureDate: (value: string) => {
    const date = new Date(value);
    const now = new Date();
    return {
      isValid: date > now,
      message: 'Date must be in the future',
      isWarning: true
    };
  },

  pastDate: (value: string) => {
    const date = new Date(value);
    const now = new Date();
    return {
      isValid: date < now,
      message: 'Date should be in the past',
      isWarning: true
    };
  },

  strongPassword: (value: string) => {
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const minLength = value.length >= 8;

    const missing = [];
    if (!hasLower) missing.push('lowercase letter');
    if (!hasUpper) missing.push('uppercase letter');
    if (!hasNumber) missing.push('number');
    if (!hasSpecial) missing.push('special character');
    if (!minLength) missing.push('8+ characters');

    return {
      isValid: hasLower && hasUpper && hasNumber && hasSpecial && minLength,
      message: missing.length > 0 ? `Password missing: ${missing.join(', ')}` : ''
    };
  },

  fileSize: (maxSizeMB: number) => (file: File) => ({
    isValid: file.size <= maxSizeMB * 1024 * 1024,
    message: `File size must be less than ${maxSizeMB}MB`
  }),

  fileType: (allowedTypes: string[]) => (file: File) => ({
    isValid: allowedTypes.includes(file.type),
    message: `File type must be one of: ${allowedTypes.join(', ')}`
  })
};

// Pre-configured validators for common forms
export const SubjectValidator = new FormValidator<{
  name: string;
  marks: number;
  creditHours: number;
  semester: string;
}>()
  .addRule({ field: 'name', validator: Validators.subjectName, required: true })
  .addRule({ field: 'marks', validator: Validators.marks, required: true })
  .addRule({ field: 'creditHours', validator: Validators.creditHours, required: true })
  .addRule({ field: 'semester', validator: (v) => ({ isValid: !!v }), required: true });

export const SemesterValidator = new FormValidator<{
  name: string;
  startDate: string;
  endDate: string;
}>()
  .addRule({ field: 'name', validator: Validators.semesterName, required: true })
  .addRule({ field: 'startDate', validator: Validators.date, required: true })
  .addRule({ field: 'endDate', validator: Validators.date, required: true });

export const ProjectValidator = new FormValidator<{
  title: string;
  description: string;
  techStack: string[];
  startDate: string;
  endDate: string;
  projectUrl?: string;
  githubUrl?: string;
}>()
  .addRule({ field: 'title', validator: Validators.projectTitle, required: true })
  .addRule({ field: 'description', validator: (v) => ({ isValid: v.length >= 10 && v.length <= 1000 }), required: true })
  .addRule({ field: 'startDate', validator: Validators.date, required: true })
  .addRule({ field: 'endDate', validator: Validators.date, required: true })
  .addRule({ field: 'projectUrl', validator: Validators.url, required: false })
  .addRule({ field: 'githubUrl', validator: Validators.url, required: false });

export const ProfileValidator = new FormValidator<{
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}>()
  .addRule({ field: 'fullName', validator: Validators.name, required: true })
  .addRule({ field: 'email', validator: Validators.email, required: true })
  .addRule({ field: 'phone', validator: Validators.phone, required: false })
  .addRule({ field: 'bio', validator: (v) => ({ isValid: v.length <= 500 }), required: false });

// Real-time validation hook
export function useFormValidation<T>(
  validator: FormValidator<T>,
  data: Partial<T>,
  showToasts = false
) {
  const result = validator.validate(data);
  
  if (showToasts) {
    result.errors.forEach(error => toast.error(error));
    result.warnings.forEach(warning => toast.warning(warning));
  }
  
  return result;
}

// Sanitization utilities
export const Sanitizers = {
  name: (value: string): string => 
    value.trim().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '),
  
  email: (value: string): string => 
    value.trim().toLowerCase(),
  
  phone: (value: string): string => 
    value.replace(/[^\d\+\-\(\)\s]/g, ''),
  
  text: (value: string): string => 
    value.trim().replace(/\s+/g, ' '),
  
  number: (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  },
  
  url: (value: string): string => {
    const trimmed = value.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }
};

export function sanitizeFormData<T>(data: Partial<T>, sanitizers: Partial<Record<keyof T, (value: any) => any>>): Partial<T> {
  const sanitized = { ...data };
  
  for (const [field, sanitizer] of Object.entries(sanitizers)) {
    if (sanitized[field as keyof T] !== undefined && typeof sanitizer === 'function') {
      sanitized[field as keyof T] = sanitizer(sanitized[field as keyof T]);
    }
  }
  
  return sanitized;
}