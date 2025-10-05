# Data Hub - Academic Management System

Data Hub is a comprehensive full-stack web application for managing academic progress, built with Next.js (TypeScript), Tailwind CSS, and Supabase. It provides students with tools to track semesters, subjects, projects, certificates, and overall academic performance.

## ✨ Features

### 🔐 Authentication & Security
- **Email/Password Authentication** with Supabase Auth
- **Email Verification** for new account registration
- **Password Reset** with secure reset links
- **Role-based Access Control** (User/Admin)
- **Rate Limiting** and brute-force protection
- **Input Validation** and server-side sanitization

### 👤 Profile Management
- **Editable Profile** with full name, email, phone, location, bio
- **Profile Picture Upload** to Supabase Storage
- **Public/Private Profile** toggle
- **Contact Information** display

### 📚 Academic Management
- **Semester Tracking** with CRUD operations
- **Subject Management** with grades and GPA calculation
- **Automatic GPA Calculation** (semester and overall)
- **Credit Hours Tracking**
- **Grade Assignment** (A, B+, B, C+, C, D, F)

### 📊 Dashboard & Analytics
- **Summary Cards** showing total semesters, overall GPA, projects, certificates
- **Quick Actions** for adding new content
- **Recent Activity Log** (audit trail)
- **GPA Breakdown** with color-coded performance indicators

### 🎨 UI/UX Features
- **Responsive Design** (mobile, tablet, desktop)
- **Dark/Light Mode** with system preference detection
- **Smooth Animations** using Motion (Framer Motion)
- **Accessible Components** with proper ARIA labels
- **Toast Notifications** for user feedback

### 🔧 Technical Features
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Component-based Architecture** with reusable UI components
- **File Upload System** with validation and storage
- **Real-time Data** with Supabase subscriptions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Modern web browser

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Email Configuration (for production)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Configure Authentication:**
   - Go to Authentication → Settings
   - Enable "Confirm email" for new signups
   - Set up email templates (optional)
   - Configure site URL for password reset redirects

3. **Storage Setup:**
   The application automatically creates required storage buckets:
   - `make-0603cad1-user-files` (private files)
   - `make-0603cad1-public-assets` (public assets)

4. **Database Schema:**
   The application uses Supabase's key-value store for data management. No additional database setup is required.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd data-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create an Admin Account:**
   - Register a new account
   - The first user is automatically assigned admin role
   - Admin users can access the admin panel

2. **Configure Profile:**
   - Complete your profile information
   - Upload a profile picture
   - Set privacy preferences

3. **Add Academic Data:**
   - Create your first semester
   - Add subjects with grades
   - Monitor your GPA calculations

## 🏗️ Project Structure

```
data-hub/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── profile/          # Profile management
│   ├── semesters/        # Semester CRUD
│   ├── subjects/         # Subject management
│   └── ui/               # Reusable UI components (shadcn/ui)
├── utils/
│   └── supabase/         # Supabase client and utilities
├── styles/
│   └── globals.css       # Global styles and Tailwind config
├── supabase/
│   └── functions/
│       └── server/       # Backend API endpoints
└── App.tsx               # Main application component
```

## 🔒 Security Features

### Authentication Security
- **Email Verification:** Users must verify their email before accessing the application
- **Password Requirements:** Minimum 6 characters (can be customized)
- **Secure Password Reset:** Time-limited, single-use reset tokens
- **Session Management:** Automatic session renewal and secure logout

### Data Security
- **Row Level Security (RLS):** Users can only access their own data
- **Input Validation:** All user inputs are validated on both client and server
- **File Upload Security:** File type and size validation
- **API Security:** All API endpoints require valid authentication tokens

### Best Practices
- **Environment Variables:** All secrets stored securely
- **HTTPS Enforcement:** Secure communication
- **SQL Injection Prevention:** Parameterized queries
- **XSS Protection:** Input sanitization and CSP headers

## 🎯 Usage Guide

### Managing Semesters
1. Navigate to "Semesters" in the sidebar
2. Click "Add Semester" to create a new academic semester
3. Enter semester number and year
4. Edit or delete semesters as needed

### Adding Subjects
1. Go to "Subjects" section
2. Click "Add Subject" (requires at least one semester)
3. Select semester, enter subject details
4. Input GPA (grade is auto-calculated)
5. View subjects filtered by semester

### Profile Management
1. Click on your avatar → "Profile"
2. Upload profile picture
3. Update personal information
4. Toggle public profile visibility

### Dashboard Overview
- View academic statistics
- Monitor overall GPA
- Quick access to add new content
- Recent activity tracking

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Academic Data Endpoints
- `GET /semesters` - List user semesters
- `POST /semesters` - Create new semester
- `PUT /semesters/:id` - Update semester
- `DELETE /semesters/:id` - Delete semester
- `GET /subjects/:semesterId` - Get subjects for semester
- `POST /subjects` - Create new subject

### File Management
- `POST /upload` - Upload files to Supabase Storage
- `GET /file/:fileId/url` - Get signed URL for file access

### Admin Endpoints
- `GET /admin/users` - List all users (admin only)
- `GET /admin/audit-logs` - View audit logs (admin only)
- `PUT /admin/users/:id/role` - Change user role (admin only)

## 🔍 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y
```

### Test Coverage
- **Authentication flows** (signup, login, password reset)
- **CRUD operations** (semesters, subjects)
- **File upload functionality**
- **GPA calculations**
- **Role-based access control**

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository:**
   - Import project to Vercel
   - Connect your Git repository

2. **Configure Environment Variables:**
   - Add all environment variables from `.env.local`
   - Ensure Supabase URLs are correctly set

3. **Deploy:**
   - Vercel will automatically build and deploy
   - Configure custom domain if needed

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting provider:**
   - Upload the `dist` folder
   - Configure environment variables
   - Set up redirects for SPA routing

### Production Checklist

- [ ] Environment variables configured
- [ ] Supabase project in production mode
- [ ] Email SMTP configured
- [ ] Domain and SSL certificate set up
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled

## 🔧 Configuration

### Customization Options

**Theme Customization:**
- Modify `styles/globals.css` for custom colors
- Update Tailwind configuration for design system
- Customize component styles in `components/ui/`

**Feature Toggles:**
```typescript
// In your config file
export const features = {
  emailVerification: true,
  fileUploads: true,
  adminPanel: true,
  publicProfiles: true
};
```

**GPA Calculation:**
Customize GPA scales in `utils/gpa.ts`:
```typescript
export const gradeScale = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  // ... customize as needed
};
```

## 🐛 Troubleshooting

### Common Issues

**Authentication Problems:**
- Check Supabase URL and keys
- Verify email confirmation settings
- Ensure site URL is configured correctly

**File Upload Issues:**
- Check storage bucket permissions
- Verify file size and type restrictions
- Ensure storage quotas are not exceeded

**Performance Issues:**
- Enable caching headers
- Optimize images and assets
- Consider CDN for static files

### Debug Mode
Enable debug logging:
```typescript
// In your environment
DEBUG=true
```

### Getting Help
- Check the [Issues](link-to-issues) page
- Review [Documentation](link-to-docs)
- Contact support: support@example.com

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier for code formatting
- Conventional commits for git history
- Component documentation with JSDoc

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tawqeer Ahmad**
- Email: [contact@example.com]
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [Your GitHub Profile]

## 🙏 Acknowledgments

- **Supabase** for the excellent backend infrastructure
- **Tailwind CSS** for the utility-first styling approach
- **shadcn/ui** for beautiful, accessible components
- **Motion (Framer Motion)** for smooth animations
- **Lucide React** for the icon library

---

© 2025 Tawqeer Ahmad. All rights reserved.