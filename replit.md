# Replit.md

## Overview

This is a full-stack Islamic educational platform built for "جامعة الإمام الزُّهري" (Imam Al-Zuhri University), specializing in Hadith (Islamic tradition) education. The application provides a comprehensive learning management system with course enrollment, video lessons, exams, progress tracking, and certificate generation.

### Recent Changes (January 19, 2025)
- **Mobile Navigation Redesign**: Implemented new header with centered logo and slide-out menu
- **University Information Menu**: Added dedicated menu with university info and PDF viewer for program details
- **Compact Card Layout**: Reduced course card sizes to display 4 per row instead of 3
- **Enhanced Exam Section**: Added dedicated exam cards section for better visibility
- **Bottom Navigation**: Added fixed bottom navigation bar for main app functions
- **Admin Access**: Added temporary admin promotion button for testing admin functionality
- **PDF Integration**: University program document accessible via slide-out menu

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Islamic/university theme
- **Build Tool**: Vite with custom configuration
- **Language Support**: Arabic (RTL) with custom fonts (Amiri, Cairo)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend application  
- `shared/` - Shared TypeScript schemas and types
- Database migrations in `/migrations`

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL-backed sessions
- **User Management**: Automatic user creation/updates on login
- **Authorization**: Route-level protection with middleware

### Database Schema
- **Users**: Profile information, specialization, learning level
- **Courses**: Arabic course content with instructor details
- **Lessons**: Video content with duration and ordering
- **Enrollments**: User-course relationships with progress tracking
- **Exams**: Multiple-choice assessments with scoring
- **Certificates**: Generated achievements with custom designs
- **Progress Tracking**: Lesson completion and watch time

### Learning Management Features
- **Course Catalog**: Browse available Hadith courses
- **Video Player**: Custom player with progress tracking
- **Exam System**: Timed multiple-choice assessments
- **Certificate Generation**: Canvas-based Arabic certificates
- **Progress Dashboard**: Personal learning analytics

### UI/UX Design
- **RTL Support**: Full right-to-left Arabic interface
- **Modern Green Theme**: Clean green and white color scheme
- **Mobile-First Navigation**: Centered logo with slide-out menu system
- **Bottom Navigation Bar**: Fixed bottom navigation for main actions
- **Compact Card Design**: Smaller course cards (4 per row) for better space usage
- **University Menu**: Dedicated slide-out menu with university information and PDF viewer
- **Responsive Design**: Mobile-first approach with larger logos throughout
- **Arabic Typography**: Custom fonts optimized for Arabic text
- **Accessibility**: ARIA compliant with keyboard navigation

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Replit Auth middleware checks session
3. OIDC provider validates user credentials
4. User profile created/updated in PostgreSQL
5. Session established with secure cookies

### Learning Flow
1. User browses course catalog
2. Enrollment creates database relationship
3. Video lessons track watch progress
4. Completion triggers exam availability
5. Passing grade generates certificate
6. Progress updates reflected in dashboard

### API Architecture
- RESTful endpoints under `/api`
- JSON request/response format
- Error handling with status codes
- Request logging middleware
- Authentication required for all user data

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Replit OIDC provider
- **Frontend**: React ecosystem (React Query, Wouter)
- **Backend**: Express.js with TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS framework

### Development Tools
- **Build**: Vite for frontend, esbuild for backend
- **Database**: Drizzle Kit for migrations
- **TypeScript**: Strict mode configuration
- **Development**: Hot reload and error overlays

### External Services
- **Fonts**: Google Fonts (Arabic typography)
- **Icons**: Font Awesome and Lucide React
- **Development**: Replit-specific tooling and banners

## Deployment Strategy

### Build Process
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles to `dist/index.js`
- Database: Drizzle migrations via `db:push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Authentication domain configuration
- `ISSUER_URL`: OIDC provider endpoint

### Production Setup
- Node.js server serves built frontend
- Express middleware handles API routes
- PostgreSQL handles persistent data
- Sessions stored in database for scalability

### Development Workflow
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build process
- `npm run start`: Production server
- `npm run check`: TypeScript validation