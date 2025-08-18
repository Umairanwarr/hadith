import type { Express } from 'express';
import { createServer, type Server } from 'http';
import express from 'express';
import { storage } from './storage.js';
import { isAdmin, isAuthenticated } from './middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, generateVerificationToken } from './lib/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  insertCourseSchema,
  insertLessonSchema,
  insertEnrollmentSchema,
  insertLessonProgressSchema,
  insertExamAttemptSchema,
  insertCertificateSchema,
  updateProfileSchema,
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  createExamSchema,
  createExamQuestionSchema,
  userRoleEnum,
  insertUserSchema,
  Exam,
  ExamQuestion,
} from '../shared/schema.js';
import { z } from 'zod';

// UUID validation utility function
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Meeting link generation utility function
const generateMeetingLink = (platform: string): string => {
  switch (platform) {
    case 'google-meet':
      // Generate Google Meet link with random meeting ID
      const meetId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return `https://meet.google.com/${meetId}`;
    case 'zoom':
      // Generate Zoom link with random meeting ID
      const meetingId = Math.floor(Math.random() * 900000000) + 100000000;
      return `https://zoom.us/j/${meetingId}`;
    case 'teams':
      // Generate Teams link (placeholder - would need Microsoft Graph API for real integration)
      const teamsId = Math.random().toString(36).substring(2, 15);
      return `https://teams.microsoft.com/l/meetup-join/teams.microsoft.com/19:meeting_${teamsId}@thread.v2/0?context={"Tid":"${teamsId}","Oid":"${teamsId}"}`;
    default:
      // Default to Google Meet
      const defaultMeetId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return `https://meet.google.com/${defaultMeetId}`;
  }
};

// Date conversion utility function
const convertDateFields = (data: any): any => {
  const converted = { ...data };

  // Convert scheduledTime if it's a string
  if (converted.scheduledTime && typeof converted.scheduledTime === 'string') {
    converted.scheduledTime = new Date(converted.scheduledTime);
  }

  // Convert createdAt if it's a string
  if (converted.createdAt && typeof converted.createdAt === 'string') {
    converted.createdAt = new Date(converted.createdAt);
  }

  // Convert updatedAt if it's a string
  if (converted.updatedAt && typeof converted.updatedAt === 'string') {
    converted.updatedAt = new Date(converted.updatedAt);
  }

  return converted;
};

export async function registerRoutes(app: Express): Promise<Server> {

  app.get('/health', (req, res) => res.send('ok'));

  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

  // Document upload configuration
  const documentUpload = multer({
    storage: storage_config,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for documents
    },
    fileFilter: function (req, file, cb) {
      // Accept PDFs and Word documents
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and Word documents are allowed'));
      }
    },
  });

  // Serve uploaded files statically
  app.use(
    '/uploads',
    express.static(path.join(__dirname, '../public/uploads/'))
  );

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        console.warn('⚠️ Missing sub in JWT payload');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        console.warn('⚠️ No user found for ID:', userId);
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     description: Creates a new user account and sends verification email
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully, verification email sent
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterResponse'
   *       400:
   *         description: Bad request - validation error or missing fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: User already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Handle both formats: { user: {...} } and direct user data
      const userData = req.body.user || req.body;

      let data;
      try {
        data = insertUserSchema.parse(userData); //Zod validation
      } catch (validationError) {
        console.error('❌ Zod validation failed:', validationError);
        throw validationError;
      }

      const { email, password, role } = data;

      if (!email || !password || !role) {
        console.warn('❌ Missing required fields.');
        return res.status(400).json({ message: 'Email, password, and role are required.' });
      }

      // Validate password length
      if (password.length < 8) {
        console.warn('❌ Password too short.');
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.warn(`⚠️ User already exists with email: ${email}`);
        return res.status(409).json({ message: 'User already exists.' });
      }

      // Check if there's already a pending registration for this email
      const existingPending = await storage.getPendingRegistrationByEmail(email);
      if (existingPending) {
        // Delete the old pending registration and create a new one
        await storage.deletePendingRegistration(existingPending.token);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Store pending registration instead of creating user
      const pendingRegistration = await storage.createPendingRegistration({
        ...data,
        password: hashedPassword,
        token: verificationToken,
        expiresAt
      });

      console.log('✅ Pending registration created successfully for:', email);

      try {
        // Send verification email
        await sendVerificationEmail(email, verificationToken, data.firstName || undefined);

        console.log('✅ Verification email sent successfully to:', email);

        // Return success message
        return res.status(201).json({ 
          message: 'Registration initiated. Please check your email to verify your account and complete registration.',
          requiresEmailVerification: true
        });
      } catch (emailError) {
        console.error('❌ Error sending verification email:', emailError);
        
        // If email fails, delete the pending registration
        await storage.deletePendingRegistration(verificationToken);
        
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again.',
          emailError: true
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('❌ Zod validation error:', err.errors);
        return res.status(400).json({ errors: err.errors });
      }

      console.error('🔥 Unexpected error in registration route:', err);
      return res.status(500).json({ message: 'Server error during registration.' });
    }
  });

  /**
   * @swagger
   * /api/auth/verify-email:
   *   post:
   *     summary: Verify user email address
   *     description: Verifies user email using verification token and activates account
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailVerificationRequest'
   *     responses:
   *       200:
   *         description: Email verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmailVerificationResponse'
   *       400:
   *         description: Bad request - invalid or expired token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Email verification
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Verification token is required.' });
      }

      // Get pending registration from database
      const pendingRegistration = await storage.getPendingRegistration(token);
      
      if (!pendingRegistration) {
        return res.status(400).json({ message: 'Invalid verification token.' });
      }

      // Check if token has expired
      if (new Date() > pendingRegistration.expiresAt) {
        // Delete expired pending registration
        await storage.deletePendingRegistration(token);
        return res.status(400).json({ message: 'Verification token has expired. Please register again.' });
      }

      // Check if user already exists (in case they registered after the pending registration)
      const existingUser = await storage.getUserByEmail(pendingRegistration.email);
      if (existingUser) {
        // Delete the pending registration and return error
        await storage.deletePendingRegistration(token);
        return res.status(409).json({ message: 'User already exists. Please login instead.' });
      }

      // Create the actual user account
      const user = await storage.registerUser({
        email: pendingRegistration.email,
        password: pendingRegistration.password, // Already hashed
        firstName: pendingRegistration.firstName,
        lastName: pendingRegistration.lastName,
        city: pendingRegistration.city,
        specialization: pendingRegistration.specialization,
        level: pendingRegistration.level,
        role: pendingRegistration.role,
        isEmailVerified: true, // Email is verified since they clicked the link
      });

      // Delete the pending registration
      await storage.deletePendingRegistration(token);

      if (!user || !user.id) {
        console.error('🚨 Failed to create user account after verification.');
        return res.status(500).json({ message: 'Failed to create user account.' });
      }

      // Generate JWT token for the new user
      const jwtToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('✅ Email verified and user created successfully:', user.email);

      return res.status(200).json({ 
        message: 'Email verified successfully! Your account has been created.',
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: true
        }
      });
    } catch (error) {
      console.error('❌ Error verifying email:', error);
      return res.status(500).json({ message: 'Server error during email verification.' });
    }
  });

  /**
   * @swagger
   * /api/auth/resend-verification:
   *   post:
   *     summary: Resend verification email
   *     description: Resends email verification link to user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResendVerificationRequest'
   *     responses:
   *       200:
   *         description: Verification email sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ResendVerificationResponse'
   *       400:
   *         description: Bad request - email already verified or missing email
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Resend verification email
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }

      // First check if user already exists and is verified
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        if (existingUser.isEmailVerified) {
          return res.status(400).json({ message: 'Email is already verified. Please login.' });
        } else {
          return res.status(400).json({ message: 'User already exists but email not verified. This should not happen.' });
        }
      }

      // Check if there's a pending registration
      const pendingRegistration = await storage.getPendingRegistrationByEmail(email);
      if (!pendingRegistration) {
        return res.status(404).json({ message: 'No pending registration found for this email. Please register first.' });
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Delete old pending registration and create new one with new token
      await storage.deletePendingRegistration(pendingRegistration.token);
      await storage.createPendingRegistration({
        ...pendingRegistration,
        token: verificationToken,
        expiresAt
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken, pendingRegistration.firstName || undefined);

      console.log('✅ Verification email resent successfully to:', email);

      return res.status(200).json({ 
        message: 'Verification email sent successfully. Please check your email.'
      });
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      return res.status(500).json({ message: 'Server error while resending verification email.' });
    }
  });

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     description: Authenticates user and returns JWT token (email must be verified)
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       201:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Email not verified
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: 'Invalid email' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid password' });

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email before logging in.',
          requiresEmailVerification: true,
          email: user.email
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string
      );
      return res.status(201).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Logout
  app.post('/api/auth/logout', isAuthenticated, async (req: any, res) => {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. However, we can implement server-side
      // token blacklisting if needed for additional security.

      // For now, we'll just return a success response
      // The client should remove the token from storage
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error during logout:', error);
      return res.status(500).json({ message: 'Server error during logout' });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const { level } = req.query;

      if (level) {
        // Filter courses by level
        const courses = await storage.getAllCourses();
        const filteredCourses = courses.filter(course => course.level === level);
        res.json(filteredCourses);
      } else {
        // Get all courses
        const courses = await storage.getAllCourses();
        res.json(courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const courseId = req.params.id;
      // Since the storage layer expects number but we have UUID, 
      // we need to handle this differently
      const allCourses = await storage.getAllCourses();
      const course = allCourses.find(c => c.id === courseId);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  });

  app.get('/api/courses/:id/lessons', isAuthenticated, async (req, res) => {
    try {
      const courseId = req.params.id as string;
      // Fetch lessons directly using UUID string
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ message: 'Failed to fetch lessons' });
    }
  });

  // File upload endpoint for course syllabi
  app.post('/api/upload/syllabus', isAuthenticated, isAdmin,
    documentUpload.single('syllabus'),
    (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const fileName = req.file.originalname;

        res.json({
          url: fileUrl,
          fileName: fileName,
          size: req.file.size,
          message: 'File uploaded successfully',
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file' });
      }
    }
  );

  // Course management (admin only)
  app.post('/api/courses', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log('🔍 Request body received:', req.body);

      // Validate the request body using the schema
      const validationResult = createCourseSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error('❌ Validation failed:', validationResult.error);
        return res.status(400).json({
          message: 'Invalid data',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const courseData = validationResult.data;
      console.log('✅ Validated course data:', courseData);

      const course = await storage.createCourse({
        ...courseData,
        totalLessons: 0,
        isActive: true,
      });

      res.json(course);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Failed to create course' });
    }
  });

  app.patch('/api/courses/:id', isAuthenticated, isAdmin,
    async (req: any, res) => {
      try {
        const courseId = req.params.id; // Pass UUID string directly

        // Validate the request body using the schema
        const validationResult = updateCourseSchema.safeParse(req.body);
        if (!validationResult.success) {
          console.error('❌ Course update validation failed:', validationResult.error);
          return res.status(400).json({
            message: 'Invalid data',
            errors: validationResult.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }

        const courseData = validationResult.data;
        console.log('✅ Validated course update data:', courseData);

        const updatedCourse = await storage.updateCourse(courseId, courseData);

        if (!updatedCourse) {
          return res.status(404).json({ message: 'Course not found' });
        }

        res.json(updatedCourse);
      } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Failed to update course' });
      }
    }
  );

  app.delete('/api/courses/:id', isAuthenticated, isAdmin,
    async (req: any, res) => {
      try {
        const courseId = req.params.id; // Pass UUID string directly

        // Soft delete by setting isActive to false
        const course = await storage.updateCourse(courseId, {
          isActive: false,
        });

        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
      } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Failed to delete course' });
      }
    }
  );

  // Enrollment routes
  /**
   * @swagger
   * /api/courses/{id}/enroll:
   *   post:
   *     summary: Enroll user in a course
   *     description: Enrolls the authenticated user in a specific course
   *     tags: [Enrollments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Course ID (UUID)
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Successfully enrolled in course
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Enrollment'
   *       400:
   *         description: Already enrolled in this course
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/courses/:id/enroll',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any)?.id;
        const courseId = req.params.id as string;

        // Check if already enrolled
        const existing = await storage.getUserEnrollment(userId, courseId);
        if (existing) {
          return res
            .status(400)
            .json({ message: 'Already enrolled in this course' });
        }

        const enrollment = await storage.enrollUserInCourse({
          userId,
          courseId,
        });
        res.json(enrollment);
      } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ message: 'Failed to enroll in course' });
      }
    }
  );

  /**
   * @swagger
   * /api/my-enrollments:
   *   get:
   *     summary: Get user enrollments
   *     description: Retrieves all enrollments for the authenticated user
   *     tags: [Enrollments]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved user enrollments
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Enrollment'
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get('/api/my-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
  });

  // Create lesson
  /**
   * @swagger
   * /api/admin/courses/{id}/lessons:
   *   post:
   *     summary: Create a new lesson for a course
   *     description: Creates a new lesson in a specific course (Admin only)
   *     tags: [Admin Lessons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Course ID (UUID)
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - order
   *             properties:
   *               title:
   *                 type: string
   *                 description: Lesson title
   *                 example: "مقدمة في علوم الحديث"
   *               description:
   *                 type: string
   *                 description: Lesson description
   *                 example: "درس تمهيدي في أساسيات علوم الحديث الشريف"
   *               order:
   *                 type: integer
   *                 description: Lesson sequence number
   *                 example: 1
   *               duration:
   *                 type: integer
   *                 description: Lesson duration in seconds
   *                 example: 2700
   *               videoUrl:
   *                 type: string
   *                 format: uri
   *                 description: URL to the lesson video
   *                 example: "https://example.com/videos/lesson1.mp4"
   *               isActive:
   *                 type: boolean
   *                 description: Whether the lesson is active
   *                 example: true
   *     responses:
   *       201:
   *         description: Lesson created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Lesson ID
   *                 title:
   *                   type: string
   *                   description: Lesson title
   *                 order:
   *                   type: integer
   *                   description: Lesson order
   *                 courseId:
   *                   type: string
   *                   description: Course ID
   *       400:
   *         description: Invalid request data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User not admin
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Course not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/admin/courses/:id/lessons', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = req.params.id; // Pass UUID string directly
      const validationResult = createLessonSchema.safeParse({
        ...req.body,
        courseId,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const lesson = await storage.createLesson(validationResult.data);

      // Update course lesson count
      await storage.updateCourseLessonCount(courseId);

      res.status(201).json(lesson);
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({ message: 'Failed to create lesson' });
    }
  }
  );

  // Update lesson
  /**
   * @swagger
   * /api/admin/lessons/{id}:
   *   patch:
   *     summary: Update a lesson
   *     description: Updates an existing lesson (Admin only)
   *     tags: [Admin Lessons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Lesson ID (UUID)
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: Lesson title
   *                 example: "مقدمة في علوم الحديث"
   *               description:
   *                 type: string
   *                 description: Lesson description
   *                 example: "درس تمهيدي في أساسيات علوم الحديث الشريف"
   *               order:
   *                 type: integer
   *                 description: Lesson sequence number
   *                 example: 1
   *               duration:
   *                 type: integer
   *                 description: Lesson duration in seconds
   *                 example: 2700
   *               videoUrl:
   *                 type: string
   *                 format: uri
   *                 description: URL to the lesson video
   *                 example: "https://example.com/videos/lesson1.mp4"
   *               isActive:
   *                 type: boolean
   *                 description: Whether the lesson is active
   *                 example: true
   *     responses:
   *       200:
   *         description: Lesson updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Lesson ID
   *                 title:
   *                   type: string
   *                   description: Lesson title
   *                 order:
   *                   type: integer
   *                   description: Lesson order
   *                 courseId:
   *                   type: string
   *                   description: Course ID
   *       400:
   *         description: Invalid request data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User not admin
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Lesson not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.patch('/api/admin/lessons/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const lessonId = req.params.id; // Pass UUID string directly
      const validationResult = createLessonSchema
        .partial()
        .safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const updatedLesson = await storage.updateLesson(
        lessonId,
        validationResult.data
      );
      if (!updatedLesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      res.json(updatedLesson);
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({ message: 'Failed to update lesson' });
    }
  }
  );

  // Delete lesson
  /**
   * @swagger
   * /api/admin/lessons/{id}:
   *   delete:
   *     summary: Delete a lesson
   *     description: Deletes a lesson and all associated progress records (Admin only)
   *     tags: [Admin Lessons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Lesson ID (UUID)
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Lesson deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Success message
   *                   example: "Lesson and all associated progress records deleted successfully"
   *                 lessonId:
   *                   type: string
   *                   description: ID of the deleted lesson
   *                 lessonTitle:
   *                   type: string
   *                   description: Title of the deleted lesson
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User not admin
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Lesson not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.delete('/api/admin/lessons/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const lessonId = req.params.id; // Pass UUID string directly
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      await storage.deleteLesson(lessonId);

      // Update course lesson count
      await storage.updateCourseLessonCount(lesson.courseId);

      res.status(200).json({
        message: 'Lesson and all associated progress records deleted successfully',
        lessonId: lessonId,
        lessonTitle: lesson.title
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({ message: 'Failed to delete lesson' });
    }
  }
  );

  // Lesson progress routes
  /**
   * @swagger
   * /api/lessons/{id}/progress:
   *   post:
   *     summary: Update lesson progress
   *     description: Updates the progress for a specific lesson for the authenticated user
   *     tags: [Lesson Progress]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Lesson ID (UUID)
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - courseId
   *             properties:
   *               watchedDuration:
   *                 type: integer
   *                 description: Duration watched in seconds
   *                 example: 1800
   *               isCompleted:
   *                 type: boolean
   *                 description: Whether the lesson is completed
   *                 example: true
   *               courseId:
   *                 type: string
   *                 description: Course ID (UUID)
   *                 example: "4700a861-2611-4965-8a92-554ea8257c05"
   *     responses:
   *       200:
   *         description: Progress updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Progress record ID
   *                 userId:
   *                   type: string
   *                   description: User ID
   *                 lessonId:
   *                   type: string
   *                   description: Lesson ID
   *                 courseId:
   *                   type: string
   *                   description: Course ID
   *                 watchedDuration:
   *                   type: integer
   *                   description: Duration watched in seconds
   *                 isCompleted:
   *                   type: boolean
   *                   description: Whether the lesson is completed
   *                 completedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Completion date
   *                 lastWatchedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Last watched date
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/lessons/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      const lessonId = req.params.id;
      const { watchedDuration, isCompleted, courseId } = req.body;

      const progress = await storage.updateLessonProgress({
        userId,
        lessonId,
        courseId,
        watchedDuration,
        isCompleted,
      });

      // Update overall course progress
      if (isCompleted) {
        const allLessons = await storage.getLessonsByCourse(courseId);
        const userProgress = await storage.getUserCourseProgress(
          userId,
          courseId
        );
        const completedCount = userProgress.filter(
          (p) => p.isCompleted
        ).length;
        const progressPercentage = allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;

        await storage.updateEnrollmentProgress(
          userId,
          courseId,
          progressPercentage
        );
      }

      res.json(progress);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      res.status(500).json({ message: 'Failed to update lesson progress' });
    }
  }
  );

  /**
   * @swagger
   * /api/courses/{courseId}/progress:
   *   get:
   *     summary: Get course progress
   *     description: Retrieves detailed progress information for a specific course for the authenticated user
   *     tags: [Course Progress]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema:
   *           type: string
   *         description: Course ID (UUID)
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Course progress retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 courseId:
   *                   type: string
   *                   description: Course ID
   *                 totalLessons:
   *                   type: integer
   *                   description: Total number of lessons in the course
   *                   example: 2
   *                 completedLessons:
   *                   type: integer
   *                   description: Number of completed lessons
   *                   example: 1
   *                 progressPercentage:
   *                   type: number
   *                   description: Overall progress percentage
   *                   example: 50.0
   *                 isCourseCompleted:
   *                   type: boolean
   *                   description: Whether the course is fully completed
   *                   example: false
   *                 lessonProgress:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       lessonId:
   *                         type: string
   *                         description: Lesson ID
   *                       lessonTitle:
   *                         type: string
   *                         description: Lesson title
   *                       lessonOrder:
   *                         type: integer
   *                         description: Lesson order
   *                       isCompleted:
   *                         type: boolean
   *                         description: Whether the lesson is completed
   *                       watchedDuration:
   *                         type: integer
   *                         description: Duration watched in seconds
   *                       completedAt:
   *                         type: string
   *                         format: date-time
   *                         description: Completion date
   *                       lastWatchedAt:
   *                         type: string
   *                         format: date-time
   *                         description: Last watched date
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get('/api/courses/:courseId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      const courseId = req.params.courseId; // Pass UUID string directly

      // Get all lessons in the course
      const allLessons = await storage.getLessonsByCourse(courseId);

      // Get user's progress for this course
      const userProgress = await storage.getUserCourseProgress(userId, courseId);

      // Calculate completion statistics
      const completedLessons = userProgress.filter((p) => p.isCompleted).length;
      const totalLessons = allLessons.length;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const isCourseCompleted = completedLessons === totalLessons && totalLessons > 0;

      // Create detailed progress response
      const lessonProgressDetails = allLessons.map(lesson => {
        const userLessonProgress = userProgress.find(p => p.lessonId === lesson.id);
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonOrder: lesson.order,
          isCompleted: userLessonProgress?.isCompleted || false,
          watchedDuration: userLessonProgress?.watchedDuration || 0,
          completedAt: userLessonProgress?.completedAt || null,
          lastWatchedAt: userLessonProgress?.lastWatchedAt || null
        };
      });

      res.json({
        courseId: courseId,
        totalLessons: totalLessons,
        completedLessons: completedLessons,
        progressPercentage: Math.round(progressPercentage * 100) / 100, // Round to 2 decimal places
        isCourseCompleted: isCourseCompleted,
        lessonProgress: lessonProgressDetails
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      res.status(500).json({ message: 'Failed to fetch course progress' });
    }
  }
  );

  // Exam routes for users
  app.get('/api/courses/:id/exam', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = req.params.id as string;
      const userId = (req.user as any)?.id;

      const exam = await storage.getExamByCourse(courseId);
      if (!exam) {
        return res
          .status(404)
          .json({ message: 'Exam not found for this course' });
      }

      // Check if user has already attempted this exam
      const existingAttempts = await storage.getUserExamAttempts(userId, exam.id);
      const completedAttempt = existingAttempts.find(attempt => attempt.completedAt);

      console.log(`🔍 Exam access check for user ${userId}, exam ${exam.id}:`, {
        existingAttempts: existingAttempts.length,
        completedAttempt: !!completedAttempt,
        examTitle: exam.title
      });

      if (completedAttempt) {
        return res.status(403).json({
          message: 'You have already completed this exam',
          attempt: {
            id: completedAttempt.id,
            score: completedAttempt.score,
            passed: completedAttempt.passed,
            completedAt: completedAttempt.completedAt,
          }
        });
      }

      const questions = await storage.getExamQuestions(exam.id);

      // Remove correct answers from response
      const questionsWithoutAnswers = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        order: q.order,
        points: q.points,
      }));

      res.json({
        exam,
        questions: questionsWithoutAnswers,
      });
    } catch (error) {
      console.error('Error fetching exam:', error);
      res.status(500).json({ message: 'Failed to fetch exam' });
    }
  });

  app.post('/api/exams/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      const examId = req.params.id;

      // Find exam by ID directly instead of by course
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const questions = await storage.getExamQuestions(exam.id);

      const attempt = await storage.createExamAttempt({
        userId,
        examId: exam.id,
        courseId: exam.courseId,
        answers: {},
        totalQuestions: questions.length,
      });

      res.json(attempt);
    } catch (error) {
      console.error('Error starting exam:', error);
      res.status(500).json({ message: 'Failed to start exam' });
    }
  });

  app.post('/api/exam-attempts/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      const attemptId = req.params.id;
      const { answers } = req.body;

      const attempt = await storage.getExamAttempt(attemptId);
      if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({ message: 'Exam attempt not found' });
      }

      const exam = await storage.getExamByCourse(attempt.courseId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const questions = await storage.getExamQuestions(exam.id);

      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;

      questions.forEach((question) => {
        totalPoints += Number(question.points);
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / questions.length) * 100;
      const passed = score >= Number(exam.passingGrade);

      // Update exam attempt
      const updatedAttempt = await storage.updateExamAttempt(attemptId, {
        answers,
        score: score.toString(),
        correctAnswers,
        passed,
        completedAt: new Date(),
        duration: attempt.startedAt
          ? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
          : 0,
      });

      // Create certificate if passed
      if (passed) {
        try {
          console.log('Student passed exam, creating certificate...');
          console.log('Score:', score, 'Passing grade:', exam.passingGrade);

          // Get user info for certificate
          const user = await storage.getUserById(userId);
          const course = await storage.getCourse(attempt.courseId);

          console.log('User:', user?.email, 'Course:', course?.title);

          const certificateNumber = `CERT-${Date.now()}-${userId.slice(-4)}`;
          const studentName =
            user && user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email?.split('@')[0] || 'الطالب';

          // Determine honors based on score
          let honors = '';
          if (score >= 95) honors = 'امتياز مع مرتبة الشرف';
          else if (score >= 85) honors = 'امتياز';
          else if (score >= 75) honors = 'جيد جداً';
          else if (score >= 70) honors = 'جيد';

          console.log('Creating certificate with data:', {
            userId,
            courseId: attempt.courseId,
            examAttemptId: attemptId,
            certificateNumber,
            studentName,
            honors
          });

          const certificate = await storage.createCertificate({
            userId,
            courseId: attempt.courseId,
            examAttemptId: attemptId,
            certificateNumber,
            grade: score.toString(),
            studentName,
            specialization: course?.title || 'علوم الحديث',
            honors,
            completionDate: new Date(),
          });

          console.log('Certificate created successfully:', certificate.id);
        } catch (certError) {
          console.error('Error creating certificate:', certError);
          // Don't fail the whole exam submission if certificate creation fails
        }
      }

      // Include correct answers in response for review
      const questionsWithCorrectAnswers = questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        order: q.order,
        points: q.points,
      }));

      res.json({
        ...updatedAttempt,
        passed,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        questionsWithAnswers: questionsWithCorrectAnswers,
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      res.status(500).json({ message: 'Failed to submit exam' });
    }
  }
  );

  // Certificate routes
  app.get('/api/my-certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      console.log('Fetching certificates for user:', userId);

      const certificates = await storage.getUserCertificates(userId);
      console.log('Found certificates:', certificates.length);

      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
    }
  });

  // Get user's exam attempts
  app.get('/api/user/exam-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.id;
      const attempts = await storage.getAllUserExamAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching user exam attempts:', error);
      res.status(500).json({ message: 'Failed to fetch exam attempts' });
    }
  });

  // Get specific exam details with questions
  app.get('/api/exams/:id/details', isAuthenticated, async (req: any, res) => {
    try {
      const examId = req.params.id as string;
      const userId = (req.user as any)?.id;

      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      // Check if user has already attempted this exam
      const existingAttempts = await storage.getUserExamAttempts(userId, exam.id);
      const completedAttempt = existingAttempts.find(attempt => attempt.completedAt);

      console.log(`🔍 Exam access check for user ${userId}, exam ${exam.id}:`, {
        existingAttempts: existingAttempts.length,
        completedAttempt: !!completedAttempt,
        examTitle: exam.title
      });

      if (completedAttempt) {
        return res.status(403).json({
          message: 'You have already completed this exam',
          attempt: {
            id: completedAttempt.id,
            score: completedAttempt.score,
            passed: completedAttempt.passed,
            completedAt: completedAttempt.completedAt,
          }
        });
      }

      const questions = await storage.getExamQuestions(exam.id);

      // Remove correct answers from response
      const questionsWithoutAnswers = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        order: q.order,
        points: q.points,
      }));

      res.json({
        exam,
        questions: questionsWithoutAnswers,
      });
    } catch (error) {
      console.error('Error fetching exam details:', error);
      res.status(500).json({ message: 'Failed to fetch exam details' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // User profile update
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;

      // Validate request body
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { firstName, lastName, city, specialization, level } =
        validationResult.data;

      const currentUser = await storage.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        city,
        specialization,
        level,
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Admin routes
  // dupliacte Create course
  app.post(
    '/api/admin/courses',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const validationResult = createCourseSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: 'بيانات غير صحيحة',
            errors: validationResult.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }

        const course = await storage.createCourse(validationResult.data);
        res.status(201).json(course);
      } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Failed to create course' });
      }
    }
  );

  // Update course
  app.patch(
    '/api/admin/courses/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const courseId = req.params.id;
        const validationResult = createCourseSchema
          .partial()
          .safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: 'بيانات غير صحيحة',
            errors: validationResult.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }

        const updatedCourse = await storage.updateCourse(
          courseId,
          validationResult.data
        );
        if (!updatedCourse) {
          return res.status(404).json({ message: 'Course not found' });
        }
        res.json(updatedCourse);
      } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Failed to update course' });
      }
    }
  );

  // Delete course
  app.delete(
    '/api/admin/courses/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const courseId = req.params.id;
        await storage.deleteCourse(courseId);
        res.status(204).send();
      } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Failed to delete course' });
      }
    }
  );



  /**
   * @swagger
   * /api/admin/courses/{id}/exams:
   *   post:
   *     summary: Create a new exam for a course
   *     tags: [Exams]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Course ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - description
   *               - duration
   *               - passingGrade
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *                 description: Exam title
   *               description:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *                 description: Exam description
   *               duration:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 300
   *                 description: Exam duration in minutes
   *               passingGrade:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 100
   *                 description: Minimum grade required to pass
   *               totalQuestions:
   *                 type: number
   *                 default: 0
   *                 description: Total number of questions
   *               isActive:
   *                 type: boolean
   *                 default: true
   *                 description: Whether the exam is active
   *     responses:
   *       201:
   *         description: Exam created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Exam'
   *       400:
   *         description: Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Create exam
  app.post('/api/admin/courses/:id/exams', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const validationResult = createExamSchema.safeParse({
        ...req.body,
        courseId,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      // Convert passingGrade from number to string for Drizzle schema compatibility
      const examData = {
        ...validationResult.data,
        passingGrade: validationResult.data.passingGrade?.toString() || '70'
      };
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      console.error('Error creating exam:', error);
      res.status(500).json({ message: 'Failed to create exam' });
    }
  }
  );

  /**
   * @swagger
   * /api/admin/exams/{id}:
   *   patch:
   *     summary: Update an existing exam
   *     tags: [Exams]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *                 description: Exam title
   *               description:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *                 description: Exam description
   *               duration:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 300
   *                 description: Exam duration in minutes
   *               passingGrade:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 100
   *                 description: Minimum grade required to pass
   *               totalQuestions:
   *                 type: number
   *                 description: Total number of questions
   *               isActive:
   *                 type: boolean
   *                 description: Whether the exam is active
   *     responses:
   *       200:
   *         description: Exam updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Exam'
   *       400:
   *         description: Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       404:
   *         description: Exam not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Update exam
  app.patch('/api/admin/exams/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = req.params.id;
      const validationResult = createExamSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      // Convert passingGrade from number to string for Drizzle schema compatibility
      const updateData: Partial<Exam> = {
        ...validationResult.data,
        passingGrade: validationResult.data.passingGrade?.toString() || undefined
      };
      const updatedExam = await storage.updateExam(
        examId,
        updateData
      );
      if (!updatedExam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      res.json(updatedExam);
    } catch (error) {
      console.error('Error updating exam:', error);
      res.status(500).json({ message: 'Failed to update exam' });
    }
  }
  );

  /**
   * @swagger
   * /api/admin/exams/{id}:
   *   delete:
   *     summary: Delete an exam
   *     tags: [Exams]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     responses:
   *       200:
   *         description: Exam deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "تم حذف الاختبار بنجاح"
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Delete exam
  app.delete('/api/admin/exams/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = req.params.id;
      await storage.deleteExam(examId);
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
      console.error('Error deleting exam:', error);
      res.status(500).json({ message: 'Failed to delete exam' });
    }
  }
  );

  // Get course lessons for admin
  app.get('/api/courses/:id/lessons', async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ message: 'Failed to fetch lessons' });
    }
  });

  /**
   * @swagger
   * /api/admin/exams/{id}/questions:
   *   post:
   *     summary: Create a new question for an exam
   *     tags: [Exam Questions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - question
   *               - options
   *               - correctAnswer
   *               - order
   *             properties:
   *               question: { type: string, minLength: 1, maxLength: 500, description: 'Question text' }
   *               options: { type: array, minItems: 2, maxItems: 6, items: { type: string, minLength: 1 }, description: 'Array of answer choices' }
   *               correctAnswer: { type: string, minLength: 1, description: 'The correct answer from the options array' }
   *               order: { type: number, minimum: 1, description: 'Question order/sequence number' }
   *               points: { type: number, minimum: 0.1, maximum: 10, default: 1, description: 'Points awarded for this question' }
   *     responses:
   *       201: { description: 'Question created successfully', content: { application/json: { schema: { $ref: '#/components/schemas/ExamQuestion' } } } }
   *       400: { description: 'Invalid input data', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       401: { description: 'Unauthorized' }
   *       403: { description: 'Forbidden - Admin access required' }
   *       500: { description: 'Internal server error', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   */
  // Create exam question
  app.post('/api/admin/exams/:id/questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = req.params.id;
      const validationResult = createExamQuestionSchema.safeParse({
        ...req.body,
        examId,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      // Convert points from number to string for Drizzle schema compatibility
      const questionData = {
        ...validationResult.data,
        examId,
        points: validationResult.data.points?.toString() || '1'
      };

      const question = await storage.createExamQuestion(questionData);

      // Update exam question count
      await storage.updateExamQuestionCount(examId);

      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating exam question:', error);
      res.status(500).json({ message: 'Failed to create exam question' });
    }
  }
  );

  // Get exam questions (admin)
  app.get('/api/admin/exams/:id/questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = req.params.id;
      const questions = await storage.getExamQuestions(examId);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      res.status(500).json({ message: 'Failed to fetch exam questions' });
    }
  });
  /**
   * @swagger
   * /api/admin/questions/{id}:
   *   patch:
   *     summary: Update an existing exam question
   *     tags: [Exam Questions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Question ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               question: { type: string, minLength: 1, maxLength: 500, description: 'Question text' }
   *               options: { type: array, minItems: 2, maxItems: 6, items: { type: string, minLength: 1 }, description: 'Array of answer choices' }
   *               correctAnswer: { type: string, minLength: 1, description: 'The correct answer from the options array' }
   *               order: { type: number, minimum: 1, description: 'Question order/sequence number' }
   *               points: { type: number, minimum: 0.1, maximum: 10, description: 'Points awarded for this question' }
   *     responses:
   *       200: { description: 'Question updated successfully', content: { application/json: { schema: { $ref: '#/components/schemas/ExamQuestion' } } } }
   *       400: { description: 'Invalid input data', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       401: { description: 'Unauthorized' }
   *       403: { description: 'Forbidden - Admin access required' }
   *       404: { description: 'Question not found', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       500: { description: 'Internal server error', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   */
  // Update exam question
  app.patch('/api/admin/questions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = req.params.id;
      const validationResult = createExamQuestionSchema
        .partial()
        .safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'بيانات غير صحيحة',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      // Convert points from number to string for Drizzle schema compatibility
      const updateData = {
        ...validationResult.data,
        points: validationResult.data.points?.toString() || undefined
      };

      const updatedQuestion = await storage.updateExamQuestion(
        questionId,
        updateData
      );
      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }
      res.json(updatedQuestion);
    } catch (error) {
      console.error('Error updating exam question:', error);
      res.status(500).json({ message: 'Failed to update exam question' });
    }
  }
  );

  /**
   * @swagger
   * /api/admin/questions/{id}:
   *   delete:
   *     summary: Delete an exam question
   *     tags: [Exam Questions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Question ID
   *     responses:
   *       200: { description: 'Question deleted successfully', content: { application/json: { schema: { type: object, properties: { message: { type: string, example: 'تم حذف السؤال بنجاح' } } } } } }
   *       401: { description: 'Unauthorized' }
   *       403: { description: 'Forbidden - Admin access required' }
   *       404: { description: 'Question not found', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   *       500: { description: 'Internal server error', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
   */
  // Delete exam question
  app.delete('/api/admin/questions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = req.params.id;
      const question = await storage.getExamQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      await storage.deleteExamQuestion(questionId);

      // Update exam question count
      await storage.updateExamQuestionCount(question.examId);

      res.status(200).json({ message: 'Exam question deleted successfully' });
    } catch (error) {
      console.error('Error deleting exam question:', error);
      res.status(500).json({ message: 'Failed to delete exam question' });
    }
  }
  );


  // Create lesson
  app.post(
    '/api/admin/lessons',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const validationResult = createLessonSchema.safeParse(req.body);

        if (!validationResult.success) {
          return res.status(400).json({
            message: 'بيانات غير صحيحة',
            errors: validationResult.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }

        const lesson = await storage.createLesson(validationResult.data);

        // Update course lesson count
        await storage.updateCourseLessonCount(validationResult.data.courseId);

        res.status(201).json(lesson);
      } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Failed to create lesson' });
      }
    }
  );

  // Delete lesson
  app.delete(
    '/api/admin/lessons/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const lessonId = req.params.id;
        const lesson = await storage.getLesson(lessonId);
        if (!lesson) {
          return res.status(404).json({ message: 'Lesson not found' });
        }

        await storage.deleteLesson(lessonId);

        // Update course lesson count
        await storage.updateCourseLessonCount(lesson.courseId);

        res.status(204).send();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ message: 'Failed to delete lesson' });
      }
    }
  );

  // Promote user to admin (temporary for testing)
  // app.post('/api/promote-to-admin', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = (req.user as any)?.claims?.sub;

  //     if (!userId) {
  //       return res.status(404).json({ message: 'User not found' });
  //     }

  //     const updatedUser = await storage.updateUserRole({
  //       id:userId,
  //       role:
  //     });

  //     res.json(updatedUser);
  //   } catch (error) {
  //     console.error('Error promoting user:', error);
  //     res.status(500).json({ message: 'Failed to promote user' });
  //   }
  // });

  // Initialize authentic university courses
  app.post(
    '/api/admin/initialize-courses',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any)?.id;
        const user = await storage.getUserById(userId);

        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        // Check if courses already exist
        const existingCourses = await storage.getAllCourses();
        if (existingCourses.length > 0) {
          return res.status(400).json({ message: 'Courses already exist' });
        }

        // Create authentic university program courses
        const coursesData = [
          {
            title: 'المستوى الأول: الديبلوم التمهيدي في علوم الحديث',
            description:
              'مرحلة التأسيس حيث تُبنى القواعد ويأخذ الطالب مفاتيح العلم. يشمل حفظ جزء عمّ وجزء تبارك، والأربعين النووية مع زيادات ابن رجب، والبيقونية في مصطلح الحديث، وتحفة الأطفال في التجويد. مع دراسة السيرة النبوية وأصول النحو والعقيدة الطحاوية.',
            instructor: 'الشيخ محمد الزهري',
            duration: 120,
            level: 'تمهيدي',
          },
          {
            title: 'المستوى الثاني: الدبلوم المتوسط في علوم الحديث',
            description:
              'حفظ 15 حزباً من القرآن الكريم مع عمدة الأحكام لعبد الغني المقدسي (50 حديثاً)، والسلسلة الذهبية في الإسناد. دراسة نخبة الفكر لابن حجر والورقات للجويني، مع التدريب العملي على البحث في صحة الحديث والمصادر الإلكترونية والشبهات المعاصرة حول السنة.',
            instructor: 'الشيخ أحمد المحدث',
            duration: 180,
            level: 'متوسط',
          },
          {
            title: 'المستوى الثالث: الإجازة في علوم الحديث',
            description:
              'حفظ 20 حزباً من القرآن الكريم و200 حديث، مع دراسة التاريخ الإسلامي ومناهج المفسرين. التعمق في علم العلل وعلم التخريج، وأصول التفسير وقواعده، والقواعد الفقهية. مع التعرف على تطبيقات الذكاء الاصطناعي في العلوم الشرعية وعلم طبقات المحدثين.',
            instructor: 'الدكتور عبد الرحمن الفقيه',
            duration: 240,
            level: 'متقدم',
          },
          {
            title: 'المستوى الرابع: بكالوريوس في علم الحديث',
            description:
              'حفظ 30 حزباً من القرآن الكريم و200 حديث إضافي. التخصص في علم الرجال والتراجم، وعلم التحقيق، ومناهج المحدّثين. دراسة التفسير المقارن والتحليلي، مع التدريب المتقدم على تحقيق النصوص التراثية ومقارنة التفاسير المختلفة والمخطوطات.',
            instructor: 'الأستاذ الدكتور يوسف الحافظ',
            duration: 300,
            level: 'بكالوريوس',
          },
          {
            title: 'المستوى الخامس: ماجستير عالم بالحديث',
            description:
              'حفظ 40 حزباً من القرآن الكريم مع التخصص المتقدم في مناهج التصنيف ومُختلَف الحديث. دراسة علم الأنساب والقبائل، وتاريخ المحدثين المعاصرين وطرقهم إلى الأئمة، وفقه الأئمة الأربعة. التدريب على علم الجدل ومناهج البحث العلمي مع إعداد رسالة الماجستير.',
            instructor: 'العلامة الدكتور محمد الإمام',
            duration: 360,
            level: 'ماجستير',
          },
          {
            title: 'المستوى السادس: دكتور في الدراسات الحديثية',
            description:
              'الوصول لحفظ 60 حزباً من القرآن الكريم و1000 حديث شريف. الحصول على إجازات قراءة أو سماع في الكتب التسعة، وإعداد رسالة دكتوراه أصيلة في تخصص دقيق من علوم الحديث. هذا المستوى يؤهل للوصول إلى مرتبة المحدث المُسنِد والإمام الحافظ.',
            instructor: 'الإمام الحافظ الدكتور علي المسند',
            duration: 480,
            level: 'دكتوراه',
          },
        ];

        const createdCourses = [];
        for (const courseData of coursesData) {
          const course = await storage.createCourse(courseData);
          createdCourses.push(course);
        }

        res.json({
          message: 'University program courses initialized successfully',
          courses: createdCourses,
        });
      } catch (error) {
        console.error('Error initializing courses:', error);
        res.status(500).json({ message: 'Failed to initialize courses' });
      }
    }
  );

  // Admin dashboard stats
  app.get(
    '/api/admin/dashboard',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const stats = await storage.getAdminStats();
        res.json(stats);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
      }
    }
  );

  // Get all exams
  app.get('/api/exams', async (req: any, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ message: 'Failed to fetch exams' });
    }
  });




  // Temporary route to promote user to admin (for development only)
  app.post('/api/promote-to-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.updateUserRole(userId, 'admin');
      res.json({ message: 'User promoted to admin successfully' });
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      res.status(500).json({ message: 'Failed to promote user to admin' });
    }
  });


  // Live Sessions routes
  /**
   * @swagger
   * /api/live-sessions:
   *   get:
   *     summary: Get all live sessions
   *     description: Retrieve all live sessions from the database
   *     tags: [Live Sessions]
   *     responses:
   *       200:
   *         description: List of live sessions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/LiveSession'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get('/api/live-sessions', async (req, res) => {
    try {
      console.log('🔍 GET /api/live-sessions - Fetching live sessions from database...');
      // Get live sessions from database instead of mock data
      const sessions = await storage.getAllLiveSessions();
      console.log('✅ GET /api/live-sessions - Found sessions:', sessions.length);
      console.log('📊 Session data:', JSON.stringify(sessions, null, 2));
      res.json(sessions);
    } catch (error) {
      console.error('❌ Error fetching live sessions:', error);
      res.status(500).json({ message: 'Failed to fetch live sessions' });
    }
  });

  /**
   * @swagger
   * /api/live-sessions/{id}:
   *   get:
   *     summary: Get a specific live session
   *     description: Retrieve a specific live session by its ID
   *     tags: [Live Sessions]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     responses:
   *       200:
   *         description: Live session retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LiveSession'
   *       400:
   *         description: Invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Live session not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get('/api/live-sessions/:id', async (req, res) => {
    try {
      const sessionId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      const session = await storage.getLiveSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Live session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error fetching live session:', error);
      res.status(500).json({ message: 'Failed to fetch live session' });
    }
  });

  /**
   * @swagger
   * /api/live-sessions:
   *   post:
   *     summary: Create a new live session
   *     description: Create a new live session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - instructor
   *               - scheduledTime
   *               - duration
   *               - meetingLink
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 255
   *                 description: Title of the live session
   *                 example: "مقدمة في علم الحديث - المحاضرة الأولى"
   *               instructor:
   *                 type: string
   *                 maxLength: 255
   *                 description: Name of the instructor
   *                 example: "الشيخ أحمد محمد الزهري"
   *               courseTitle:
   *                 type: string
   *                 maxLength: 255
   *                 description: Title of the course (optional)
   *                 example: "أصول علم الحديث"
   *               description:
   *                 type: string
   *                 description: Description of the session
   *                 example: "مقدمة شاملة في علم الحديث وتاريخه"
   *               scheduledTime:
   *                 type: string
   *                 format: date-time
   *                 description: When the session is scheduled to start
   *                 example: "2024-01-15T14:00:00.000Z"
   *               duration:
   *                 type: integer
   *                 minimum: 1
   *                 description: Duration of the session in minutes
   *                 example: 90
   *               level:
   *                 type: string
   *                 maxLength: 100
   *                 description: Difficulty level of the session
   *                 example: "مبتدئ"
   *               meetingLink:
   *                 type: string
   *                 maxLength: 500
   *                 description: URL to join the meeting
   *                 example: "https://meet.google.com/abc-1234-def"
   *               platform:
   *                 type: string
   *                 enum: [google-meet, zoom, teams]
   *                 default: google-meet
   *                 description: Meeting platform being used
   *                 example: "google-meet"
   *     responses:
   *       201:
   *         description: Live session created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LiveSession'
   *       400:
   *         description: Missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/live-sessions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        console.log('❌ Access denied - User role:', user?.role);
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      // Validate required fields
      const { title, instructor, scheduledTime, duration, meetingLink, platform = 'google-meet' } = req.body;
      if (!title || !instructor || !scheduledTime || !duration || !meetingLink) {
        console.log('❌ Missing required fields:', { title, instructor, scheduledTime, duration, meetingLink });
        return res.status(400).json({
          message: 'Title, instructor, scheduled time, duration, and meeting link are required'
        });
      }

      // Meeting link is provided by teacher/admin
      const sessionData = {
        ...req.body,
        platform: platform || 'google-meet',
        isLive: false, // Always start as not live
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Convert any date fields to Date objects
      const convertedSessionData = convertDateFields(sessionData);

      console.log('🔍 POST /api/live-sessions - Creating session with data:', JSON.stringify(convertedSessionData, null, 2));
      const newSession = await storage.createLiveSession(convertedSessionData);
      console.log('✅ POST /api/live-sessions - Session created successfully:', JSON.stringify(newSession, null, 2));

      res.status(201).json(newSession);
    } catch (error) {
      console.error('❌ Error creating live session:', error);
      res.status(500).json({ message: 'Failed to create live session' });
    }
  });

  /**
   * @swagger
   * /api/live-sessions/{id}:
   *   put:
   *     summary: Update a live session
   *     description: Update an existing live session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 255
   *                 description: Title of the live session
   *               instructor:
   *                 type: string
   *                 maxLength: 255
   *                 description: Name of the instructor
   *               courseTitle:
   *                 type: string
   *                 maxLength: 255
   *                 description: Title of the course
   *               description:
   *                 type: string
   *                 description: Description of the session
   *               scheduledTime:
   *                 type: string
   *                 format: date-time
   *                 description: When the session is scheduled to start
   *               duration:
   *                 type: integer
   *                 minimum: 1
   *                 description: Duration of the session in minutes
   *               level:
   *                 type: string
   *                 maxLength: 100
   *                 description: Difficulty level of the session
   *               meetingLink:
   *                 type: string
   *                 maxLength: 500
   *                 description: URL to join the meeting
   *               platform:
   *                 type: string
   *                 enum: [google-meet, zoom, teams]
   *                 description: Meeting platform being used
   *     responses:
   *       200:
   *         description: Live session updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LiveSession'
   *       400:
   *         description: Invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       404:
   *         description: Live session not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.put('/api/live-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      const sessionId = req.params.id; // Use UUID string directly instead of parseInt

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      const updates = {
        ...req.body,
        updatedAt: new Date(),
      };

      // Convert any date fields to Date objects
      const convertedUpdates = convertDateFields(updates);

      const updatedSession = await storage.updateLiveSession(
        sessionId,
        convertedUpdates
      );
      if (!updatedSession) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating live session:', error);
      res.status(500).json({ message: 'Failed to update live session' });
    }
  });

  /**
   * @swagger
   * /api/live-sessions/{id}:
   *   delete:
   *     summary: Delete a live session
   *     description: Delete an existing live session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     responses:
   *       200:
   *         description: Live session deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Session deleted successfully"
   *       400:
   *         description: Invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.delete('/api/live-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      const sessionId = req.params.id; // Use UUID string directly instead of parseInt

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      await storage.deleteLiveSession(sessionId);

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Error deleting live session:', error);
      res.status(500).json({ message: 'Failed to delete live session' });
    }
  });

  /**
   * @swagger
   * /api/live-sessions/{id}/live-status:
   *   patch:
   *     summary: Toggle live status
   *     description: Toggle the live status of a session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - isLive
   *             properties:
   *               isLive:
   *                 type: boolean
   *                 description: Whether the session should be live or not
   *                 example: true
   *     responses:
   *       200:
   *         description: Live status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Session is now live!"
   *                 isLive:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Invalid UUID format or invalid isLive value
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.patch('/api/live-sessions/:id/live-status', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      const sessionId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      const { isLive } = req.body;

      if (typeof isLive !== 'boolean') {
        return res.status(400).json({
          message: 'isLive must be a boolean value'
        });
      }

      // Update live status
      const updates = { isLive, updatedAt: new Date() };

      await storage.updateLiveSession(sessionId, updates);

      res.json({
        message: isLive ? 'Session is now live!' : 'Session is no longer live',
        isLive
      });
    } catch (error) {
      console.error('Error updating live status:', error);
      res.status(500).json({ message: 'Failed to update live status' });
    }
  }
  );

  // Update meeting link for a live session
  /**
   * @swagger
   * /api/live-sessions/{id}/meeting-link:
   *   patch:
   *     summary: Update meeting link
   *     description: Update the meeting link for a live session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - meetingLink
   *             properties:
   *               meetingLink:
   *                 type: string
   *                 maxLength: 500
   *                 description: New meeting link URL
   *                 example: "https://meet.google.com/new-link-here"
   *               platform:
   *                 type: string
   *                 enum: [google-meet, zoom, teams]
   *                 description: Meeting platform (optional)
   *                 example: "zoom"
   *     responses:
   *       200:
   *         description: Meeting link updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Meeting link updated successfully"
   *                 session:
   *                   $ref: '#/components/schemas/LiveSession'
   *                 meetingLink:
   *                   type: string
   *                   example: "https://meet.google.com/new-link-here"
   *       400:
   *         description: Invalid UUID format or missing meeting link
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       404:
   *         description: Live session not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.patch('/api/live-sessions/:id/meeting-link', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      const sessionId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      const { meetingLink, platform } = req.body;

      if (!meetingLink) {
        return res.status(400).json({
          message: 'Meeting link is required'
        });
      }

      // Update the session with new meeting link
      const updatedSession = await storage.updateLiveSession(sessionId, {
        meetingLink,
        ...(platform && { platform }),
        updatedAt: new Date(),
      });

      if (!updatedSession) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.json({
        message: 'Meeting link updated successfully',
        session: updatedSession,
        meetingLink: updatedSession.meetingLink
      });
    } catch (error) {
      console.error('Error updating meeting link:', error);
      res.status(500).json({ message: 'Failed to update meeting link' });
    }
  }
  );


  // Start streaming - dedicated route for going live
  /**
   * @swagger
   * /api/live-sessions/{id}/start-streaming:
   *   post:
   *     summary: Start streaming
   *     description: Start streaming for a live session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               platform:
   *                 type: string
   *                 enum: [google-meet, zoom, teams]
   *                 description: Meeting platform (optional, defaults to existing)
   *     responses:
   *       200:
   *         description: Streaming started successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Streaming started successfully!"
   *                 session:
   *                   $ref: '#/components/schemas/LiveSession'
   *                 meetingLink:
   *                   type: string
   *                   example: "https://meet.google.com/abc-1234-def"
   *                 isLive:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Invalid UUID format, session already live, or missing meeting link
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       404:
   *         description: Live session not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/live-sessions/:id/start-streaming', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      const sessionId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      const { platform = 'google-meet' } = req.body;

      // Get current session
      const currentSession = await storage.getLiveSession(sessionId);
      if (!currentSession) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Check if session is already live
      if (currentSession.isLive) {
        return res.status(400).json({ message: 'Session is already live' });
      }

      // Check if meeting link exists
      if (!currentSession.meetingLink) {
        return res.status(400).json({ message: 'Meeting link is required to start streaming' });
      }

      // Start streaming
      const updatedSession = await storage.updateLiveSession(sessionId, {
        isLive: true,
        updatedAt: new Date(),
      });

      if (!updatedSession) {
        return res.status(500).json({ message: 'Failed to update session' });
      }

      res.json({
        message: 'Streaming started successfully!',
        session: updatedSession,
        meetingLink: updatedSession.meetingLink,
        isLive: true
      });
    } catch (error) {
      console.error('Error starting streaming:', error);
      res.status(500).json({ message: 'Failed to start streaming' });
    }
  }
  );

  // Stop streaming
  /**
   * @swagger
   * /api/live-sessions/{id}/stop-streaming:
   *   post:
   *     summary: Stop streaming
   *     description: Stop streaming for a live session (Admin or Teacher only)
   *     tags: [Live Sessions]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Live session ID
   *     responses:
   *       200:
   *         description: Streaming stopped successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Streaming stopped successfully"
   *                 session:
   *                   $ref: '#/components/schemas/LiveSession'
   *                 isLive:
   *                   type: boolean
   *                   example: false
   *       400:
   *         description: Invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - not authenticated
   *       403:
   *         description: Forbidden - admin or teacher access required
   *       404:
   *         description: Live session not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/live-sessions/:id/stop-streaming', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      const user = await storage.getUserById(userId);

      if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
        return res.status(403).json({ message: 'Admin or teacher access required' });
      }

      const sessionId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(sessionId)) {
        return res.status(400).json({
          message: 'Invalid session ID format. Must be a valid UUID.'
        });
      }

      // Stop streaming
      const updatedSession = await storage.updateLiveSession(sessionId, {
        isLive: false,
        updatedAt: new Date(),
      });

      if (!updatedSession) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.json({
        message: 'Streaming stopped successfully',
        session: updatedSession,
        isLive: false
      });
    } catch (error) {
      console.error('Error stopping streaming:', error);
      res.status(500).json({ message: 'Failed to stop streaming' });
    }
  }
  );

  // Image upload route
  app.post('/api/upload-image', isAuthenticated, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Return the URL to access the uploaded image
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
  );

  // Diploma Templates routes
  /**
   * @swagger
   * /api/diploma-templates:
   *   get:
   *     summary: Get all diploma templates
   *     description: Retrieve all available diploma templates for certificates
   *     tags: [Diploma Templates]
   *     responses:
   *       200:
   *         description: List of diploma templates retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/DiplomaTemplate'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get('/api/diploma-templates', async (req, res) => {
    try {
      const templates = await storage.getDiplomaTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching diploma templates:', error);
      res.status(500).json({ message: 'Failed to fetch diploma templates' });
    }
  });

  /**
   * @swagger
   * /api/diploma-templates:
   *   post:
   *     summary: Create a new diploma template
   *     description: Create a new customizable diploma template for certificates (Admin only)
   *     tags: [Diploma Templates]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - level
   *               - institutionName
   *               - requirements
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 255
   *                 description: Title of the diploma template
   *                 example: "شهادة إتمام المستوى المتوسط"
   *               level:
   *                 type: string
   *                 maxLength: 100
   *                 description: Academic level of the diploma
   *                 example: "متوسط"
   *               backgroundColor:
   *                 type: string
   *                 maxLength: 50
   *                 description: Background color hex code
   *                 example: "#f8f9fa"
   *               textColor:
   *                 type: string
   *                 maxLength: 50
   *                 description: Text color hex code
   *                 example: "#2c3e50"
   *               borderColor:
   *                 type: string
   *                 maxLength: 50
   *                 description: Border color hex code
   *                 example: "#d4af37"
   *               logoUrl:
   *                 type: string
   *                 maxLength: 500
   *                 description: URL to the institution logo
   *                 example: "/uploads/logo.png"
   *               sealUrl:
   *                 type: string
   *                 maxLength: 500
   *                 description: URL to the university seal
   *                 example: "/uploads/seal.png"
   *               institutionName:
   *                 type: string
   *                 maxLength: 255
   *                 description: Name of the institution
   *                 example: "جامعة الإمام الزُّهري"
   *               templateStyle:
   *                 type: string
   *                 maxLength: 50
   *                 description: Template style (classic, modern, elegant)
   *                 example: "classic"
   *               requirements:
   *                 type: string
   *                 description: Requirements to obtain the certificate
   *                 example: "إكمال جميع الدروس المطلوبة بنسبة نجاح لا تقل عن 70%"
   *     responses:
   *       200:
   *         description: Diploma template created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DiplomaTemplate'
   *       400:
   *         description: Bad request - missing required fields
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - admin access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post('/api/diploma-templates', isAuthenticated, async (req, res) => {
    try {
      // const userId = req.user?.id;
      const userId = (req as any).user?.id || (req as any).user?.sub;
      if (!userId) {
        console.warn('⚠️ Missing sub in JWT payload');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const template = await storage.createDiplomaTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error('Error creating diploma template:', error);
      res.status(500).json({ message: 'Failed to create diploma template' });
    }
  });

  /**
   * @swagger
   * /api/diploma-templates/{id}:
   *   put:
   *     summary: Update a diploma template
   *     description: Update an existing diploma template (Admin only)
   *     tags: [Diploma Templates]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Diploma template ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 255
   *                 description: Title of the diploma template
   *               level:
   *                 type: string
   *                 maxLength: 100
   *                 description: Academic level of the diploma
   *               backgroundColor:
   *                 type: string
   *                 maxLength: 50
   *                 description: Background color hex code
   *               textColor:
   *                 type: string
   *                 maxLength: 50
   *                 description: Text color hex code
   *               borderColor:
   *                 type: string
   *                 maxLength: 50
   *                 description: Border color hex code
   *               logoUrl:
   *                 type: string
   *                 maxLength: 500
   *                 description: URL to the institution logo
   *               sealUrl:
   *                 type: string
   *                 maxLength: 500
   *                 description: URL to the university seal
   *               institutionName:
   *                 type: string
   *                 maxLength: 255
   *                 description: Name of the institution
   *               templateStyle:
   *                 type: string
   *                 maxLength: 50
   *                 description: Template style (classic, modern, elegant)
   *               requirements:
   *                 type: string
   *                 description: Requirements to obtain the certificate
   *     responses:
   *       200:
   *         description: Diploma template updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DiplomaTemplate'
   *       400:
   *         description: Bad request - invalid UUID format
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - admin access required
   *       404:
   *         description: Template not found
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.put('/api/diploma-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id || (req as any).user?.sub;
      if (!userId) {
        console.warn('⚠️ Missing sub in JWT payload');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const templateId = req.params.id;
      if (!isValidUUID(templateId)) {
        console.log('❌ Invalid UUID format:', templateId);
        return res.status(400).json({ message: 'Invalid template ID format. Must be a valid UUID.' });
      }
      const updatedTemplate = await storage.updateDiplomaTemplate(
        templateId,
        req.body
      );

      if (!updatedTemplate) {
        return res.status(404).json({ message: 'Template not found' });
      }

      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating diploma template:', error);
      res.status(500).json({ message: 'Failed to update diploma template' });
    }
  });

  /**
   * @swagger
   * /api/diploma-templates/{id}:
   *   delete:
   *     summary: Delete a diploma template
   *     description: Delete an existing diploma template (Admin only)
   *     tags: [Diploma Templates]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Diploma template ID
   *     responses:
   *       200:
   *         description: Diploma template deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Template deleted successfully"
   *       400:
   *         description: Bad request - invalid UUID format
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - admin access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.delete('/api/diploma-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id || (req as any).user?.sub;
      if (!userId) {
        console.warn('⚠️ Missing sub in JWT payload');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const templateId = req.params.id;
      if (!isValidUUID(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID format. Must be a valid UUID.' });
      }
      await storage.deleteDiplomaTemplate(templateId);

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting diploma template:', error);
      res.status(500).json({ message: 'Failed to delete diploma template' });
    }
  }
  );

  /**
   * @swagger
   * /api/diploma-templates/{id}/status:
   *   patch:
   *     summary: Toggle diploma template status
   *     description: Activate or deactivate a diploma template (Admin only)
   *     tags: [Diploma Templates]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Diploma template ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - isActive
   *             properties:
   *               isActive:
   *                 type: boolean
   *                 description: Whether the template should be active or not
   *                 example: true
   *     responses:
   *       200:
   *         description: Template status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Template status updated successfully"
   *       400:
   *         description: Bad request - invalid UUID format or missing isActive field
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - admin access required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.patch('/api/diploma-templates/:id/status', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id || (req as any).user?.sub;
      if (!userId) {
        console.warn('⚠️ Missing sub in JWT payload');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const templateId = req.params.id;
      if (!isValidUUID(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID format. Must be a valid UUID.' });
      }
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean' });
      }

      await storage.toggleDiplomaTemplateStatus(templateId, isActive);

      res.json({ message: 'Template status updated successfully' });
    } catch (error) {
      console.error('Error updating template status:', error);
      res.status(500).json({ message: 'Failed to update template status' });
    }
  }
  );

  /**
   * @swagger
   * /api/certificates/generate:
   *   post:
   *     summary: Generate a certificate image
   *     description: Generate a certificate image using canvas data and save it to the server
   *     tags: [Certificates]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CertificateGenerationRequest'
   *     responses:
   *       200:
   *         description: Certificate generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Certificate generated successfully"
   *                 certificateImage:
   *                   $ref: '#/components/schemas/CertificateImage'
   *                 downloadUrl:
   *                   type: string
   *                   description: URL to download the generated certificate
   *       400:
   *         description: Bad request - missing required fields or invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - user doesn't own the certificate
   *       404:
   *         description: Certificate or template not found
   *       500:
   *         description: Internal server error
   */
  app.post('/api/certificates/generate', isAuthenticated, async (req: any, res) => {
    try {
      // const userId = req.user?.id;
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        console.warn('⚠️ Missing sub in JWT payload');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }

      const {
        certificateId,
        templateId,
        canvasData,
        certificateData
      } = req.body;

      // Validate required fields
      if (!certificateId || !templateId || !canvasData) {
        return res.status(400).json({
          message: 'Certificate ID, template ID, and canvas data are required'
        });
      }

      // Validate UUID format for certificateId and templateId
      if (!isValidUUID(certificateId)) {
        return res.status(400).json({
          message: 'Invalid certificate ID format. Must be a valid UUID.'
        });
      }
      if (!isValidUUID(templateId)) {
        return res.status(400).json({
          message: 'Invalid template ID format. Must be a valid UUID.'
        });
      }

      // Get certificate and template data
      const certificate = await storage.getCertificateById(certificateId);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      const template = await storage.getDiplomaTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      // Verify user owns the certificate
      if (certificate.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to this certificate' });
      }

      // Generate unique filename for the certificate image
      const timestamp = Date.now();
      const filename = `certificate_${certificate.certificateNumber}_${timestamp}.png`;
      const filePath = path.join(__dirname, '../public/uploads/certificates/', filename);

      // Ensure certificates directory exists
      const certificatesDir = path.dirname(filePath);
      if (!require('fs').existsSync(certificatesDir)) {
        require('fs').mkdirSync(certificatesDir, { recursive: true });
      }

      // Save canvas data as image file
      // Remove data:image/png;base64, prefix if present
      const base64Data = canvasData.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      require('fs').writeFileSync(filePath, imageBuffer);

      // Save certificate generation record
      const certificateImage = await storage.createCertificateImage({
        certificateId,
        templateId,
        imageUrl: `/uploads/certificates/${filename}`,
        generatedAt: new Date(),
        generatedBy: userId,
        metadata: certificateData || {}
      });

      res.json({
        message: 'Certificate generated successfully',
        certificateImage,
        downloadUrl: `/uploads/certificates/${filename}`
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      res.status(500).json({ message: 'Failed to generate certificate' });
    }
  });

  /**
   * @swagger
   * /api/certificates/{id}/images:
   *   get:
   *     summary: Get all images for a certificate
   *     description: Retrieve all generated images for a specific certificate
   *     tags: [Certificates]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Certificate ID
   *     responses:
   *       200:
   *         description: List of certificate images
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CertificateImage'
   *       400:
   *         description: Bad request - invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - user doesn't own the certificate
   *       404:
   *         description: Certificate not found
   *       500:
   *         description: Internal server error
   */
  app.get('/api/certificates/:id/images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const certificateId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(certificateId)) {
        return res.status(400).json({
          message: 'Invalid certificate ID format. Must be a valid UUID.'
        });
      }

      // Get certificate
      const certificate = await storage.getCertificateById(certificateId);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      // Verify user owns the certificate
      if (certificate.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to this certificate' });
      }

      // Get all generated images for this certificate
      const certificateImages = await storage.getCertificateImages(certificateId);

      res.json(certificateImages);

    } catch (error) {
      console.error('Error fetching certificate images:', error);
      res.status(500).json({ message: 'Failed to fetch certificate images' });
    }
  });

  /**
   * @swagger
   * /api/certificate-images/{id}:
   *   delete:
   *     summary: Delete a certificate image
   *     description: Delete a specific certificate image and its associated file
   *     tags: [Certificates]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Certificate image ID to delete
   *     responses:
   *       200:
   *         description: Certificate image deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Certificate image deleted successfully"
   *       400:
   *         description: Bad request - invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - user doesn't own the certificate
   *       404:
   *         description: Certificate image not found
   *       500:
   *         description: Internal server error
   */
  app.delete('/api/certificate-images/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const imageId = req.params.id;

      // Validate UUID format
      if (!isValidUUID(imageId)) {
        return res.status(400).json({
          message: 'Invalid image ID format. Must be a valid UUID.'
        });
      }

      // Get certificate image
      const certificateImage = await storage.getCertificateImage(imageId);
      if (!certificateImage) {
        return res.status(404).json({ message: 'Certificate image not found' });
      }

      // Get certificate to verify ownership
      const certificate = await storage.getCertificateById(certificateImage.certificateId);
      if (!certificate || certificate.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to this certificate image' });
      }

      // Delete the image file
      if (certificateImage.imageUrl) {
        const filePath = path.join(__dirname, '../public', certificateImage.imageUrl);
        if (require('fs').existsSync(filePath)) {
          require('fs').unlinkSync(filePath);
        }
      }

      // Delete from database
      await storage.deleteCertificateImage(imageId);

      res.json({ message: 'Certificate image deleted successfully' });

    } catch (error) {
      console.error('Error deleting certificate image:', error);
      res.status(500).json({ message: 'Failed to delete certificate image' });
    }
  });

  /**
   * @swagger
   * /api/certificates/{id}/download/{imageId}:
   *   get:
   *     summary: Download a certificate image
   *     description: Download a specific certificate image file
   *     tags: [Certificates]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Certificate ID
   *       - in: path
   *         name: imageId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Certificate image ID to download
   *     responses:
   *       200:
   *         description: Certificate image file
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Bad request - invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - invalid or missing authentication
   *       403:
   *         description: Forbidden - user doesn't own the certificate
   *       404:
   *         description: Certificate or image not found
   *       500:
   *         description: Internal server error
   */
  app.get('/api/certificates/:id/download/:imageId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const certificateId = req.params.id;
      const imageId = req.params.imageId;

      // Validate UUID format for both IDs
      if (!isValidUUID(certificateId)) {
        return res.status(400).json({
          message: 'Invalid certificate ID format. Must be a valid UUID.'
        });
      }
      if (!isValidUUID(imageId)) {
        return res.status(400).json({
          message: 'Invalid image ID format. Must be a valid UUID.'
        });
      }

      // Get certificate image
      const certificateImage = await storage.getCertificateImage(imageId);
      if (!certificateImage || certificateImage.certificateId !== certificateId) {
        return res.status(404).json({ message: 'Certificate image not found' });
      }

      // Get certificate to verify ownership
      const certificate = await storage.getCertificateById(certificateId);
      if (!certificate || certificate.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to this certificate' });
      }

      // Serve the file
      const filePath = path.join(__dirname, '../public', certificateImage.imageUrl);
      if (!require('fs').existsSync(filePath)) {
        return res.status(404).json({ message: 'Certificate image file not found' });
      }

      res.download(filePath, `certificate_${certificate.certificateNumber}.png`);

    } catch (error) {
      console.error('Error downloading certificate:', error);
      res.status(500).json({ message: 'Failed to download certificate' });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
