import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket on startup
const initializeStorage = async () => {
  try {
    const bucketName = 'uploads';
    console.log('Checking if storage bucket exists...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('Creating storage bucket...');
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false, // Private bucket for security
        allowedMimeTypes: ['image/*', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket "uploads" created successfully');
      }
    } else {
      console.log('Storage bucket "uploads" already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Call initialization asynchronously to not block server startup
initializeStorage().catch(console.error);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to authenticate requests
async function authenticateUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authentication failed: No or invalid authorization header');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  // Basic token validation
  if (!token || token.length < 10) {
    console.log('Authentication failed: Invalid token format');
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('Authentication failed: Supabase auth error', error.message);
      return null;
    }
    
    if (!user) {
      console.log('Authentication failed: No user found');
      return null;
    }
    
    return user;
  } catch (err) {
    console.log('Authentication failed: Exception during auth', err);
    return null;
  }
}

// Helper function to convert grade to grade point
function getGradePoint(grade: string): number {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0,  // 85-100
    'A-': 3.7,  // 80-85
    'B+': 3.3,  // 75-80
    'B-': 3.0,  // 70-75
    'C+': 2.7,  // 65-70
    'C-': 2.3,  // 60-65
    'D+': 2.0,  // 55-60
    'D-': 1.3,  // 50-55
    'F': 0.0    // <50
  };
  return gradePoints[grade] || 0.0;
}

// Helper function to recalculate semester GPA
async function recalculateSemesterGPA(userId: string, semesterId: string) {
  try {
    const subjects = await kv.getByPrefix(`subject:${userId}:${semesterId}:`);
    const semester = await kv.get(`semester:${userId}:${semesterId}`);
    
    if (!semester) return;

    let totalGradePoints = 0;
    let totalCredits = 0;

    subjects.forEach(subject => {
      const gradePoint = getGradePoint(subject.grade);
      totalGradePoints += gradePoint * subject.creditHours;
      totalCredits += subject.creditHours;
    });

    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    const updatedSemester = {
      ...semester,
      gpa: parseFloat(gpa.toFixed(2)),
      totalCredits,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`semester:${userId}:${semesterId}`, updatedSemester);
  } catch (error) {
    console.error('Error recalculating GPA:', error);
  }
}

// Health check endpoint
app.get("/make-server-0603cad1/health", (c) => {
  return c.json({ status: "ok" });
});

// Dashboard stats endpoint
app.get("/make-server-0603cad1/dashboard/stats", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const educationLevel = c.req.query('educationLevel');
    
    // Get all semesters
    const allSemesters = await kv.getByPrefix(`semester:${user.id}:`);
    
    // Filter semesters by education level if specified
    let semesters = allSemesters;
    if (educationLevel && educationLevel !== 'all') {
      semesters = allSemesters.filter(s => s.educationLevel === educationLevel);
    }
    
    // Get all projects (projects are not education level specific currently)
    const projects = await kv.getByPrefix(`project:${user.id}:`);
    
    // Get all certificates (certificates are not education level specific currently)
    const certificates = await kv.getByPrefix(`certificate:${user.id}:`);
    
    // Calculate overall GPA (weighted average of filtered semesters only)
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    semesters.forEach(semester => {
      if (semester.gpa > 0 && semester.totalCredits > 0) {
        totalGradePoints += semester.gpa * semester.totalCredits;
        totalCredits += semester.totalCredits;
      }
    });
    
    const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    // Get all subjects for the filtered semesters
    const allSubjects = [];
    for (const semester of semesters) {
      const semesterSubjects = await kv.getByPrefix(`subject:${user.id}:${semester.id}:`);
      allSubjects.push(...semesterSubjects);
    }
    
    // Calculate average marks and grade distribution
    let totalMarks = 0;
    const gradeDistribution = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 
      'C+': 0, 'C-': 0, 'D+': 0, 'D-': 0, 'F': 0
    };
    
    allSubjects.forEach(subject => {
      totalMarks += subject.marks || 0;
      if (gradeDistribution[subject.grade] !== undefined) {
        gradeDistribution[subject.grade]++;
      }
    });
    
    const averageMarks = allSubjects.length > 0 ? totalMarks / allSubjects.length : 0;
    
    const stats = {
      totalSemesters: semesters.length,
      totalProjects: projects.length,
      totalCertificates: certificates.length,
      overallGPA: parseFloat(overallGPA.toFixed(2)),
      totalSubjects: allSubjects.length,
      averageMarks: parseFloat(averageMarks.toFixed(2)),
      gradeDistribution
    };
    
    return c.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({ error: 'Failed to get dashboard stats' }, 500);
  }
});

// User registration endpoint
app.post("/make-server-0603cad1/register", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { fullName },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Registration error:', error);
      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('already been registered')) {
        errorMessage = 'An account with this email address already exists. Please try signing in instead.';
      }
      return c.json({ error: errorMessage }, 400);
    }

    // Create user profile
    const profile = {
      id: data.user.id,
      email: data.user.email,
      fullName,
      phone: '',
      location: '',
      bio: '',
      profilePicture: '',
      publicProfile: false,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${data.user.id}`, profile);
    
    return c.json({ user: data.user, profile });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-0603cad1/profile", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const profile = await kv.get(`profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    return c.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Create user profile (for cases where profile doesn't exist)
app.post("/make-server-0603cad1/profile", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Check if profile already exists
    const existingProfile = await kv.get(`profile:${user.id}`);
    if (existingProfile) {
      return c.json(existingProfile);
    }

    const { fullName, email, phone, location, bio, profilePicture, publicProfile, role } = await c.req.json();
    
    // Create new profile
    const profile = {
      id: user.id,
      email: user.email || email,
      fullName: fullName || user.user_metadata?.fullName || user.email?.split('@')[0] || 'User',
      phone: phone || '',
      location: location || '',
      bio: bio || '',
      profilePicture: profilePicture || '',
      publicProfile: publicProfile || false,
      role: role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${user.id}`, profile);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'profile_created',
      timestamp: new Date().toISOString(),
      details: 'User profile created automatically'
    });

    return c.json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    return c.json({ error: 'Failed to create profile' }, 500);
  }
});

// Update user profile
app.put("/make-server-0603cad1/profile", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`profile:${user.id}`);
    
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${user.id}`, updatedProfile);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'profile_updated',
      timestamp: new Date().toISOString(),
      details: 'Profile information updated'
    });

    return c.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// File upload endpoint
app.post("/make-server-0603cad1/files/upload", async (c) => {
  console.log('POST /files/upload - Starting file upload');
  
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    console.log('POST /files/upload - Authentication failed');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('POST /files/upload - Parsing form data');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    console.log('POST /files/upload - File received:', file.name, file.type, file.size);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'File type not allowed. Please upload images or PDF files only.' }, 400);
    }

    // Validate file size (10MB)
    if (file.size > 10485760) {
      return c.json({ error: 'File size too large. Maximum size is 10MB.' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${user.id}/${timestamp}_${randomString}.${fileExtension}`;

    console.log('POST /files/upload - Uploading to storage:', fileName);

    // Convert File to ArrayBuffer for Supabase storage
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('POST /files/upload - Storage upload error:', uploadError);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    console.log('POST /files/upload - File uploaded successfully:', uploadData.path);

    // Create signed URL for accessing the file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      console.error('POST /files/upload - Signed URL creation error:', signedUrlError);
      return c.json({ error: `Failed to create signed URL: ${signedUrlError.message}` }, 500);
    }

    console.log('POST /files/upload - Signed URL created successfully');

    // Store file metadata in KV store
    const fileMetadata = {
      id: crypto.randomUUID(),
      userId: user.id,
      fileName: file.name,
      filePath: fileName,
      fileSize: file.size,
      fileType: file.type,
      signedUrl: signedUrlData.signedUrl,
      createdAt: new Date().toISOString()
    };

    await kv.set(`file:${user.id}:${fileMetadata.id}`, fileMetadata);

    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'file_uploaded',
      timestamp: new Date().toISOString(),
      details: `Uploaded file: ${file.name}`
    });

    console.log('POST /files/upload - Upload completed successfully');

    return c.json({
      id: fileMetadata.id,
      fileName: file.name,
      filePath: fileName,
      fileSize: file.size,
      fileType: file.type,
      signedUrl: signedUrlData.signedUrl,
      file_path: fileName, // For backward compatibility
      url: signedUrlData.signedUrl // For backward compatibility
    });

  } catch (error) {
    console.error('POST /files/upload - Unexpected error:', error);
    return c.json({ error: `Upload failed: ${error.message}` }, 500);
  }
});

// Get user files
app.get("/make-server-0603cad1/files", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const allFiles = await kv.getByPrefix(`file:${user.id}:`);
    
    // Filter out invalid files and clean up corrupted records
    const validFiles = [];
    for (const file of allFiles) {
      if (!file.id || !file.fileName) {
        console.warn('Found corrupted file record, removing:', file);
        // Try to remove the corrupted record
        try {
          const keys = await kv.getByPrefix(`file:${user.id}:`);
          for (const key of Object.keys(keys)) {
            if (keys[key] === file) {
              await kv.del(key);
              console.log('Removed corrupted file record');
              break;
            }
          }
        } catch (cleanupError) {
          console.error('Error cleaning up corrupted file record:', cleanupError);
        }
        continue;
      }
      validFiles.push(file);
    }
    
    const files = validFiles;
    
    // Update signed URLs if they're expired or about to expire
    const updatedFiles = await Promise.all(files.map(async (file) => {
      try {
        // Check if file has required properties
        if (!file.filePath || !file.id) {
          console.warn('File missing required properties:', { id: file.id, filePath: file.filePath, fileName: file.fileName });
          return file;
        }

        // Create new signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('uploads')
          .createSignedUrl(file.filePath, 60 * 60 * 24 * 365); // 1 year expiry

        if (!signedUrlError && signedUrlData) {
          const updatedFile = {
            ...file,
            signedUrl: signedUrlData.signedUrl
          };
          
          // Update the file record with new signed URL
          await kv.set(`file:${user.id}:${file.id}`, updatedFile);
          return updatedFile;
        } else if (signedUrlError) {
          console.error('Supabase storage error for file:', file.fileName, signedUrlError);
        }
        
        return file;
      } catch (error) {
        console.error('Error updating signed URL for file:', file.fileName, error);
        return file;
      }
    }));

    return c.json(updatedFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    console.error('Get files error:', error);
    return c.json({ error: 'Failed to get files' }, 500);
  }
});

// Delete file
app.delete("/make-server-0603cad1/files/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const fileId = c.req.param('id');
    const file = await kv.get(`file:${user.id}:${fileId}`);
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Delete from Supabase Storage (only if filePath exists)
    if (file.filePath) {
      const { error: deleteError } = await supabase.storage
        .from('uploads')
        .remove([file.filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue with metadata deletion even if storage deletion fails
      }
    } else {
      console.warn('File has no filePath, skipping storage deletion:', file.fileName);
    }

    // Delete metadata from KV store
    await kv.del(`file:${user.id}:${fileId}`);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'file_deleted',
      timestamp: new Date().toISOString(),
      details: `Deleted file: ${file.fileName}`
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// Get semesters
app.get("/make-server-0603cad1/semesters", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const educationLevel = c.req.query('educationLevel');
    const semesters = await kv.getByPrefix(`semester:${user.id}:`);
    
    let filteredSemesters = semesters;
    if (educationLevel && educationLevel !== 'all') {
      filteredSemesters = semesters.filter(s => s.educationLevel === educationLevel);
    }
    
    return c.json(filteredSemesters.sort((a, b) => a.semesterNo - b.semesterNo));
  } catch (error) {
    console.error('Get semesters error:', error);
    return c.json({ error: 'Failed to get semesters' }, 500);
  }
});

// Create semester
app.post("/make-server-0603cad1/semesters", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { semesterNo, year, educationLevel = 'bachelor' } = await c.req.json();
    const id = crypto.randomUUID();
    
    const semester = {
      id,
      userId: user.id,
      semesterNo,
      year,
      educationLevel,
      gpa: 0,
      totalCredits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`semester:${user.id}:${id}`, semester);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'semester_created',
      timestamp: new Date().toISOString(),
      details: `Created semester ${semesterNo} for year ${year}`
    });

    return c.json(semester);
  } catch (error) {
    console.error('Create semester error:', error);
    return c.json({ error: 'Failed to create semester' }, 500);
  }
});

// Update semester
app.put("/make-server-0603cad1/semesters/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const currentSemester = await kv.get(`semester:${user.id}:${id}`);
    
    if (!currentSemester) {
      return c.json({ error: 'Semester not found' }, 404);
    }

    const updatedSemester = {
      ...currentSemester,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`semester:${user.id}:${id}`, updatedSemester);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'semester_updated',
      timestamp: new Date().toISOString(),
      details: `Updated semester ${updatedSemester.semesterNo}`
    });

    return c.json(updatedSemester);
  } catch (error) {
    console.error('Update semester error:', error);
    return c.json({ error: 'Failed to update semester' }, 500);
  }
});

// Delete semester
app.delete("/make-server-0603cad1/semesters/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const semester = await kv.get(`semester:${user.id}:${id}`);
    
    if (!semester) {
      return c.json({ error: 'Semester not found' }, 404);
    }

    // Delete associated subjects
    const subjects = await kv.getByPrefix(`subject:${user.id}:${id}:`);
    for (const subject of subjects) {
      await kv.del(`subject:${user.id}:${id}:${subject.id}`);
    }

    await kv.del(`semester:${user.id}:${id}`);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'semester_deleted',
      timestamp: new Date().toISOString(),
      details: `Deleted semester ${semester.semesterNo}`
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete semester error:', error);
    return c.json({ error: 'Failed to delete semester' }, 500);
  }
});

// Get subjects for a semester
app.get("/make-server-0603cad1/semesters/:semesterId/subjects", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const semesterId = c.req.param('semesterId');
    const subjects = await kv.getByPrefix(`subject:${user.id}:${semesterId}:`);
    return c.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    return c.json({ error: 'Failed to get subjects' }, 500);
  }
});

// Create subject
app.post("/make-server-0603cad1/subjects", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { 
      semesterId, 
      name, 
      code, 
      creditHours, 
      marks, 
      grade,
      assignment,
      quizzes,
      midExam,
      finalExam,
      totalMarks,
      useComponents
    } = body;
    const id = crypto.randomUUID();
    
    const subject = {
      id,
      userId: user.id,
      semesterId,
      name,
      code,
      creditHours,
      marks,
      grade,
      assignment: assignment !== undefined ? assignment : null,
      quizzes: quizzes !== undefined ? quizzes : null,
      midExam: midExam !== undefined ? midExam : null,
      finalExam: finalExam !== undefined ? finalExam : null,
      totalMarks: totalMarks !== undefined ? totalMarks : null,
      useComponents: useComponents !== undefined ? useComponents : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`subject:${user.id}:${semesterId}:${id}`, subject);
    
    // Recalculate semester GPA
    await recalculateSemesterGPA(user.id, semesterId);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'subject_created',
      timestamp: new Date().toISOString(),
      details: `Created subject ${name} (${code})`
    });

    return c.json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    return c.json({ error: 'Failed to create subject' }, 500);
  }
});

// Update subject
app.put("/make-server-0603cad1/subjects/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Find the subject across all semesters
    const allSubjects = await kv.getByPrefix(`subject:${user.id}:`);
    const currentSubject = allSubjects.find(s => s.id === id);
    
    if (!currentSubject) {
      return c.json({ error: 'Subject not found' }, 404);
    }

    const updatedSubject = {
      ...currentSubject,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`subject:${user.id}:${currentSubject.semesterId}:${id}`, updatedSubject);
    
    // Recalculate semester GPA
    await recalculateSemesterGPA(user.id, currentSubject.semesterId);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'subject_updated',
      timestamp: new Date().toISOString(),
      details: `Updated subject ${updatedSubject.name}`
    });

    return c.json(updatedSubject);
  } catch (error) {
    console.error('Update subject error:', error);
    return c.json({ error: 'Failed to update subject' }, 500);
  }
});

// Delete subject
app.delete("/make-server-0603cad1/subjects/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    
    // Find the subject across all semesters
    const allSubjects = await kv.getByPrefix(`subject:${user.id}:`);
    const subject = allSubjects.find(s => s.id === id);
    
    if (!subject) {
      return c.json({ error: 'Subject not found' }, 404);
    }

    await kv.del(`subject:${user.id}:${subject.semesterId}:${id}`);
    
    // Recalculate semester GPA
    await recalculateSemesterGPA(user.id, subject.semesterId);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'subject_deleted',
      timestamp: new Date().toISOString(),
      details: `Deleted subject ${subject.name}`
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete subject error:', error);
    return c.json({ error: 'Failed to delete subject' }, 500);
  }
});

// Get projects
app.get("/make-server-0603cad1/projects", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const projects = await kv.getByPrefix(`project:${user.id}:`);
    return c.json(projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    console.error('Get projects error:', error);
    return c.json({ error: 'Failed to get projects' }, 500);
  }
});

// Create project
app.post("/make-server-0603cad1/projects", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { title, description, techTags, links, screenshots } = await c.req.json();
    const id = crypto.randomUUID();
    
    const project = {
      id,
      userId: user.id,
      title,
      description,
      techTags: techTags || [],
      links: links || [],
      screenshots: screenshots || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`project:${user.id}:${id}`, project);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'project_created',
      timestamp: new Date().toISOString(),
      details: `Created project ${title}`
    });

    return c.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// Update project
app.put("/make-server-0603cad1/projects/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const currentProject = await kv.get(`project:${user.id}:${id}`);
    
    if (!currentProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`project:${user.id}:${id}`, updatedProject);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'project_updated',
      timestamp: new Date().toISOString(),
      details: `Updated project ${updatedProject.title}`
    });

    return c.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// Delete project
app.delete("/make-server-0603cad1/projects/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const project = await kv.get(`project:${user.id}:${id}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    await kv.del(`project:${user.id}:${id}`);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'project_deleted',
      timestamp: new Date().toISOString(),
      details: `Deleted project ${project.title}`
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// Get certificates
app.get("/make-server-0603cad1/certificates", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const certificates = await kv.getByPrefix(`certificate:${user.id}:`);
    return c.json(certificates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    console.error('Get certificates error:', error);
    return c.json({ error: 'Failed to get certificates' }, 500);
  }
});

// Create certificate
app.post("/make-server-0603cad1/certificates", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { title, issuer, issueDate, expiryDate, description, attachments } = await c.req.json();
    const id = crypto.randomUUID();
    
    const certificate = {
      id,
      userId: user.id,
      title,
      issuer,
      issueDate,
      expiryDate,
      description,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`certificate:${user.id}:${id}`, certificate);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'certificate_created',
      timestamp: new Date().toISOString(),
      details: `Created certificate ${title}`
    });

    return c.json(certificate);
  } catch (error) {
    console.error('Create certificate error:', error);
    return c.json({ error: 'Failed to create certificate' }, 500);
  }
});

// Update certificate
app.put("/make-server-0603cad1/certificates/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const currentCertificate = await kv.get(`certificate:${user.id}:${id}`);
    
    if (!currentCertificate) {
      return c.json({ error: 'Certificate not found' }, 404);
    }

    const updatedCertificate = {
      ...currentCertificate,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`certificate:${user.id}:${id}`, updatedCertificate);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'certificate_updated',
      timestamp: new Date().toISOString(),
      details: `Updated certificate ${updatedCertificate.title}`
    });

    return c.json(updatedCertificate);
  } catch (error) {
    console.error('Update certificate error:', error);
    return c.json({ error: 'Failed to update certificate' }, 500);
  }
});

// Delete certificate
app.delete("/make-server-0603cad1/certificates/:id", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = c.req.param('id');
    const certificate = await kv.get(`certificate:${user.id}:${id}`);
    
    if (!certificate) {
      return c.json({ error: 'Certificate not found' }, 404);
    }

    await kv.del(`certificate:${user.id}:${id}`);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'certificate_deleted',
      timestamp: new Date().toISOString(),
      details: `Deleted certificate ${certificate.title}`
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete certificate error:', error);
    return c.json({ error: 'Failed to delete certificate' }, 500);
  }
});

// Clear education level data
app.delete("/make-server-0603cad1/education/:level/clear", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const level = c.req.param('level');
    
    // Get all semesters for this education level
    const allSemesters = await kv.getByPrefix(`semester:${user.id}:`);
    const levelSemesters = allSemesters.filter(s => s.educationLevel === level);
    
    // Delete all subjects for these semesters
    for (const semester of levelSemesters) {
      const subjects = await kv.getByPrefix(`subject:${user.id}:${semester.id}:`);
      for (const subject of subjects) {
        await kv.del(`subject:${user.id}:${semester.id}:${subject.id}`);
      }
      // Delete the semester
      await kv.del(`semester:${user.id}:${semester.id}`);
    }
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'education_data_cleared',
      timestamp: new Date().toISOString(),
      details: `Cleared all ${level} education data`
    });

    return c.json({ 
      success: true, 
      deletedSemesters: levelSemesters.length,
      message: `Successfully cleared all ${level} education data`
    });
  } catch (error) {
    console.error('Clear education data error:', error);
    return c.json({ error: 'Failed to clear education data' }, 500);
  }
});

// Admin endpoints (role-based access)
app.get("/make-server-0603cad1/admin/users", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`profile:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const allProfiles = await kv.getByPrefix('profile:');
    return c.json(allProfiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    console.error('Get admin users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

// Get audit logs (admin only)
app.get("/make-server-0603cad1/admin/audit-logs", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`profile:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const logs = await kv.getByPrefix('audit_log:');
    return c.json(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  } catch (error) {
    console.error('Get audit logs error:', error);
    return c.json({ error: 'Failed to get audit logs' }, 500);
  }
});

// Change user role (admin only)
app.put("/make-server-0603cad1/admin/users/:userId/role", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`profile:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const targetUserId = c.req.param('userId');
    const { role } = await c.req.json();
    
    if (!['user', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const targetProfile = await kv.get(`profile:${targetUserId}`);
    if (!targetProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedProfile = {
      ...targetProfile,
      role,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${targetUserId}`, updatedProfile);
    
    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'user_role_changed',
      timestamp: new Date().toISOString(),
      details: `Changed user ${targetProfile.email} role to ${role}`
    });

    return c.json(updatedProfile);
  } catch (error) {
    console.error('Change user role error:', error);
    return c.json({ error: 'Failed to change user role' }, 500);
  }
});

// Contact form endpoint - Send email to admin
app.post("/make-server-0603cad1/contact", async (c) => {
  console.log('POST /contact - Contact form submission received');
  
  try {
    let body;
    try {
      body = await c.req.json();
      console.log('POST /contact - Request body parsed:', { name: body.name, email: body.email, messageLength: body.message?.length });
    } catch (parseError) {
      console.error('POST /contact - JSON parse error:', parseError);
      return c.json({ error: 'Invalid JSON in request body' }, 400);
    }
    
    const { name, email, message } = body;
    
    // Validate input
    if (!name || !email || !message) {
      console.log('POST /contact - Missing required fields');
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('POST /contact - Invalid email format:', email);
      return c.json({ error: 'Invalid email format' }, 400);
    }
    
    // Store the contact message in the database for record keeping
    let contactId;
    try {
      contactId = globalThis.crypto.randomUUID();
      console.log('POST /contact - Generated contact ID:', contactId);
    } catch (uuidError) {
      console.error('POST /contact - UUID generation error:', uuidError);
      contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('POST /contact - Using fallback ID:', contactId);
    }
    
    const contactMessage = {
      id: contactId,
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    console.log('POST /contact - Storing contact message with ID:', contactId);
    try {
      await kv.set(`contact:${contactId}`, contactMessage);
      console.log('POST /contact - Contact message stored successfully');
    } catch (kvError) {
      console.error('POST /contact - Error storing contact message:', kvError);
      console.error('POST /contact - KV Error details:', kvError.message, kvError.stack);
      throw new Error(`Failed to store contact message: ${kvError.message}`);
    }
    
    // Log the contact attempt
    try {
      await kv.set(`audit_log:${Date.now()}:contact`, {
        action: 'contact_form_submitted',
        timestamp: new Date().toISOString(),
        details: `Contact form submitted by ${name} (${email})`
      });
      console.log('POST /contact - Audit log created successfully');
    } catch (auditError) {
      console.error('POST /contact - Error creating audit log:', auditError);
      // Don't throw here, audit log is not critical
    }
    
    // In a real-world scenario, you would send an actual email here
    // For now, we'll store the message and return success
    console.log(`POST /contact - Successfully processed contact form from ${name} (${email})`);
    
    return c.json({ 
      success: true, 
      message: 'Your message has been sent successfully! We\'ll get back to you soon.' 
    });
    
  } catch (error) {
    console.error('POST /contact - Error processing contact form:', error);
    console.error('POST /contact - Error stack:', error.stack);
    return c.json({ error: `Failed to send message: ${error.message || 'Unknown error'}` }, 500);
  }
});

// Admin endpoint to get contact messages
app.get("/make-server-0603cad1/admin/contacts", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`profile:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const contacts = await kv.getByPrefix('contact:');
    return c.json(contacts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  } catch (error) {
    console.error('Get contacts error:', error);
    return c.json({ error: 'Failed to get contacts' }, 500);
  }
});

// Payment processing endpoint (PRO subscription)
app.post("/make-server-0603cad1/payment/process", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { userId, plan, amount, cardNumber, expiryDate, cvv, cardholderName } = await c.req.json();

    // Validate user
    if (userId !== user.id) {
      return c.json({ error: 'Invalid user' }, 403);
    }

    // Validate payment details
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      return c.json({ error: 'Missing payment details' }, 400);
    }

    // Demo payment validation - accept test card 4242 4242 4242 4242
    const normalizedCardNumber = cardNumber.replace(/\s/g, '');
    if (normalizedCardNumber !== '4242424242424242') {
      return c.json({ error: 'Invalid card number. Use 4242 4242 4242 4242 for testing.' }, 400);
    }

    // Validate expiry date format
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      return c.json({ error: 'Invalid expiry date format' }, 400);
    }

    // Get user profile
    const profile = await kv.get(`profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Calculate subscription end date
    const subscriptionEndDate = new Date();
    if (plan === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }

    // Update profile with PRO subscription
    const updatedProfile = {
      ...profile,
      subscription: 'pro',
      subscriptionPlan: plan,
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: subscriptionEndDate.toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${user.id}`, updatedProfile);

    // Create payment record
    const paymentId = crypto.randomUUID();
    const paymentRecord = {
      id: paymentId,
      userId: user.id,
      amount,
      plan,
      status: 'completed',
      cardLastFour: normalizedCardNumber.slice(-4),
      cardholderName,
      timestamp: new Date().toISOString()
    };

    await kv.set(`payment:${user.id}:${paymentId}`, paymentRecord);

    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'subscription_upgraded',
      timestamp: new Date().toISOString(),
      details: `Upgraded to PRO (${plan}) - $${amount}`
    });

    console.log(`Payment processed successfully for user ${user.email}: ${plan} plan - $${amount}`);

    return c.json({
      success: true,
      message: 'Payment processed successfully',
      subscription: {
        plan: 'pro',
        subscriptionPlan: plan,
        endDate: subscriptionEndDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return c.json({ error: 'Payment processing failed' }, 500);
  }
});

// Get team members
app.get("/make-server-0603cad1/team/members", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    // Check if user has PRO subscription
    if (!profile || profile.subscription !== 'pro') {
      return c.json({ error: 'PRO subscription required' }, 403);
    }

    // Get team members where user is the owner or a member
    const ownedTeams = await kv.getByPrefix(`team_member:${user.id}:`);
    const memberTeams = await kv.getByPrefix(`team_invitation:`);
    
    // Filter invitations for this user
    const userInvitations = memberTeams.filter(inv => inv.ownerId === user.id);
    
    // Combine and format members
    const members = [];
    
    // Add owner (current user)
    members.push({
      id: user.id,
      email: user.email,
      fullName: profile.fullName || user.email?.split('@')[0] || 'Owner',
      role: 'owner',
      status: 'active',
      joinedAt: profile.createdAt,
      profilePicture: profile.profilePicture || ''
    });

    // Add team members
    for (const teamMember of ownedTeams) {
      const memberProfile = await kv.get(`profile:${teamMember.memberId}`);
      if (memberProfile) {
        members.push({
          id: teamMember.memberId,
          email: memberProfile.email,
          fullName: memberProfile.fullName || memberProfile.email?.split('@')[0] || 'Member',
          role: 'member',
          status: teamMember.status || 'active',
          joinedAt: teamMember.joinedAt,
          profilePicture: memberProfile.profilePicture || ''
        });
      }
    }

    // Add pending invitations
    for (const invitation of userInvitations) {
      if (invitation.status === 'pending') {
        members.push({
          id: invitation.id,
          email: invitation.email,
          fullName: invitation.email.split('@')[0],
          role: 'member',
          status: 'pending',
          joinedAt: invitation.sentAt,
          profilePicture: ''
        });
      }
    }

    return c.json({ members });
  } catch (error) {
    console.error('Get team members error:', error);
    return c.json({ error: 'Failed to get team members' }, 500);
  }
});

// Invite team member
app.post("/make-server-0603cad1/team/invite", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const profile = await kv.get(`profile:${user.id}`);
    
    // Check if user has PRO subscription
    if (!profile || profile.subscription !== 'pro') {
      return c.json({ error: 'PRO subscription required' }, 403);
    }

    // Check if already invited
    const existingInvitations = await kv.getByPrefix(`team_invitation:`);
    const alreadyInvited = existingInvitations.find(inv => 
      inv.ownerId === user.id && inv.email === email && inv.status === 'pending'
    );

    if (alreadyInvited) {
      return c.json({ error: 'User already invited' }, 400);
    }

    // Check team size limit
    const teamMembers = await kv.getByPrefix(`team_member:${user.id}:`);
    if (teamMembers.length >= 5) {
      return c.json({ error: 'Maximum 5 team members allowed' }, 400);
    }

    // Create invitation
    const invitationId = crypto.randomUUID();
    const invitation = {
      id: invitationId,
      ownerId: user.id,
      ownerEmail: user.email,
      ownerName: profile.fullName || user.email?.split('@')[0],
      email,
      status: 'pending',
      sentAt: new Date().toISOString()
    };

    await kv.set(`team_invitation:${invitationId}`, invitation);

    // Log activity
    await kv.set(`audit_log:${Date.now()}:${user.id}`, {
      userId: user.id,
      action: 'team_invitation_sent',
      timestamp: new Date().toISOString(),
      details: `Invited ${email} to team`
    });

    console.log(`Team invitation sent to ${email} by ${user.email}`);

    // In production, send an email here
    return c.json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Team invitation error:', error);
    return c.json({ error: 'Failed to send invitation' }, 500);
  }
});

// Remove team member
app.delete("/make-server-0603cad1/team/remove/:memberId", async (c) => {
  const user = await authenticateUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const memberId = c.req.param('memberId');

    const profile = await kv.get(`profile:${user.id}`);
    
    // Check if user has PRO subscription
    if (!profile || profile.subscription !== 'pro') {
      return c.json({ error: 'PRO subscription required' }, 403);
    }

    // Check if trying to remove self (owner)
    if (memberId === user.id) {
      return c.json({ error: 'Cannot remove yourself as owner' }, 400);
    }

    // Try to delete team member
    const teamMemberKey = `team_member:${user.id}:${memberId}`;
    const teamMember = await kv.get(teamMemberKey);

    if (teamMember) {
      await kv.del(teamMemberKey);
      
      // Log activity
      await kv.set(`audit_log:${Date.now()}:${user.id}`, {
        userId: user.id,
        action: 'team_member_removed',
        timestamp: new Date().toISOString(),
        details: `Removed team member ${memberId}`
      });

      return c.json({ success: true, message: 'Member removed successfully' });
    }

    // Try to delete pending invitation
    const invitations = await kv.getByPrefix(`team_invitation:`);
    const invitation = invitations.find(inv => inv.id === memberId && inv.ownerId === user.id);

    if (invitation) {
      await kv.del(`team_invitation:${invitation.id}`);
      
      // Log activity
      await kv.set(`audit_log:${Date.now()}:${user.id}`, {
        userId: user.id,
        action: 'team_invitation_cancelled',
        timestamp: new Date().toISOString(),
        details: `Cancelled invitation for ${invitation.email}`
      });

      return c.json({ success: true, message: 'Invitation cancelled successfully' });
    }

    return c.json({ error: 'Member or invitation not found' }, 404);
  } catch (error) {
    console.error('Remove team member error:', error);
    return c.json({ error: 'Failed to remove member' }, 500);
  }
});

// Start the server
console.log('Starting Data Hub server...');
Deno.serve(app.fetch);