import type { Express } from 'express';
import { createServer, type Server } from 'http';
import express from 'express';
import { storage } from './storage';
import { isAdmin, isAuthenticated } from './middleware/auth';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
  createLessonSchema,
  createExamSchema,
  createExamQuestionSchema,
  userRoleEnum,
  insertUserSchema,
} from '@shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app);

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
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUserById(userId);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body.user); // zod validation

      // check required fields manually if your drizzle schema has nullable columns
      const { email, password, role } = data;
      if (!email || !password || !role) {
        return res
          .status(400)
          .json({ message: 'email, password & role are required' });
      }

      const exists = await storage.getUserByEmail(email);
      if (exists)
        return res.status(409).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.registerUser({
        ...data,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!
      );
      return res.status(201).json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: 'Invalid email' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid password' });

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

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
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
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ message: 'Failed to fetch lessons' });
    }
  });

  // File upload endpoint for course syllabi
  app.post(
    '/api/upload/syllabus',
    isAuthenticated,
    isAdmin,
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
      const {
        title,
        description,
        instructor,
        level,
        duration,
        thumbnailUrl,
        imageUrl,
        syllabusUrl,
        syllabusFileName,
      } = req.body;

      const course = await storage.createCourse({
        title,
        description,
        instructor,
        level,
        duration,
        thumbnailUrl,
        imageUrl,
        syllabusUrl,
        syllabusFileName,
        totalLessons: 0,
        isActive: true,
      });

      res.json(course);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Failed to create course' });
    }
  });

  app.patch(
    '/api/courses/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);
        const {
          title,
          description,
          instructor,
          level,
          duration,
          thumbnailUrl,
          imageUrl,
          syllabusUrl,
          syllabusFileName,
        } = req.body;

        const course = await storage.updateCourse(courseId, {
          title,
          description,
          instructor,
          level,
          duration,
          thumbnailUrl,
          imageUrl,
          syllabusUrl,
          syllabusFileName,
        });

        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
      } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Failed to update course' });
      }
    }
  );

  app.delete(
    '/api/courses/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);

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
  app.post(
    '/api/courses/:id/enroll',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any)?.claims?.sub;
        const courseId = parseInt(req.params.id);

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

  app.get('/api/my-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
  });

  // Lesson progress routes
  app.post(
    '/api/lessons/:id/progress',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any)?.claims?.sub;
        const lessonId = parseInt(req.params.id);
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
          const progressPercentage = (completedCount / allLessons.length) * 100;

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

  app.get(
    '/api/courses/:courseId/progress',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any)?.claims?.sub;
        const courseId = parseInt(req.params.courseId);
        const progress = await storage.getUserCourseProgress(userId, courseId);
        res.json(progress);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({ message: 'Failed to fetch course progress' });
      }
    }
  );

  // Exam routes
  app.get('/api/courses/:id/exam', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;

      // Check if user has completed all lessons
      const allLessons = await storage.getLessonsByCourse(courseId);
      const userProgress = await storage.getUserCourseProgress(
        userId,
        courseId
      );
      const completedLessons = userProgress.filter((p) => p.isCompleted).length;

      if (completedLessons < allLessons.length) {
        return res.status(403).json({
          message: 'You must complete all lessons before taking the exam',
          required: allLessons.length,
          completed: completedLessons,
        });
      }

      const exam = await storage.getExamByCourse(courseId);
      if (!exam) {
        return res
          .status(404)
          .json({ message: 'Exam not found for this course' });
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
      const userId = (req.user as any)?.claims?.sub;
      const examId = parseInt(req.params.id);

      const exam = await storage.getExamByCourse(examId);
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

  app.post(
    '/api/exam-attempts/:id/submit',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any)?.claims?.sub;
        const attemptId = parseInt(req.params.id);
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
          // Get user info for certificate
          const user = await storage.getUserById(userId);
          const course = await storage.getCourse(attempt.courseId);

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

          await storage.createCertificate({
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
        }

        res.json({
          ...updatedAttempt,
          passed,
          score,
          correctAnswers,
          totalQuestions: questions.length,
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
      const userId = (req.user as any)?.claims?.sub;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
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

      const updatedUser = await storage.upsertUser({
        ...currentUser,
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
  // Create course
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
        const courseId = parseInt(req.params.id);
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
        const courseId = parseInt(req.params.id);
        await storage.deleteCourse(courseId);
        res.status(204).send();
      } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Failed to delete course' });
      }
    }
  );

  // Create lesson
  app.post(
    '/api/admin/courses/:id/lessons',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);
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
  app.patch(
    '/api/admin/lessons/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const lessonId = parseInt(req.params.id);
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
  app.delete(
    '/api/admin/lessons/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const lessonId = parseInt(req.params.id);
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

  // Create exam
  app.post(
    '/api/admin/courses/:id/exams',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const courseId = parseInt(req.params.id);
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

        const exam = await storage.createExam(validationResult.data);
        res.status(201).json(exam);
      } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Failed to create exam' });
      }
    }
  );

  // Update exam
  app.patch(
    '/api/admin/exams/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const examId = parseInt(req.params.id);
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

        const updatedExam = await storage.updateExam(
          examId,
          validationResult.data
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

  // Delete exam
  app.delete(
    '/api/admin/exams/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const examId = parseInt(req.params.id);
        await storage.deleteExam(examId);
        res.status(204).send();
      } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ message: 'Failed to delete exam' });
      }
    }
  );

  // Get course lessons for admin
  app.get('/api/courses/:id/lessons', async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ message: 'Failed to fetch lessons' });
    }
  });

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
        const lessonId = parseInt(req.params.id);
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
        const userId = (req.user as any)?.claims?.sub;
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

  // Create exam question
  app.post(
    '/api/admin/exams/:id/questions',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const examId = parseInt(req.params.id);
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

        const question = await storage.createExamQuestion(
          validationResult.data
        );

        // Update exam question count
        await storage.updateExamQuestionCount(examId);

        res.status(201).json(question);
      } catch (error) {
        console.error('Error creating exam question:', error);
        res.status(500).json({ message: 'Failed to create exam question' });
      }
    }
  );

  // Update exam question
  app.patch(
    '/api/admin/questions/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const questionId = parseInt(req.params.id);
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

        const updatedQuestion = await storage.updateExamQuestion(
          questionId,
          validationResult.data
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

  // Delete exam question
  app.delete(
    '/api/admin/questions/:id',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const questionId = parseInt(req.params.id);
        const question = await storage.getExamQuestion(questionId);
        if (!question) {
          return res.status(404).json({ message: 'Question not found' });
        }

        await storage.deleteExamQuestion(questionId);

        // Update exam question count
        await storage.updateExamQuestionCount(question.examId);

        res.status(204).send();
      } catch (error) {
        console.error('Error deleting exam question:', error);
        res.status(500).json({ message: 'Failed to delete exam question' });
      }
    }
  );

  // Get admin dashboard data
  app.get(
    '/api/admin/dashboard',
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const stats = await storage.getAdminStats();
        res.json(stats);
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res
          .status(500)
          .json({ message: 'Failed to fetch admin dashboard stats' });
      }
    }
  );

  // Temporary route to promote user to admin (for development only)
  app.post('/api/promote-to-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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
  app.get('/api/live-sessions', async (req, res) => {
    try {
      // For now return mock data - in real app this would come from database
      const mockSessions = [
        {
          id: 1,
          title: 'مقدمة في علم الحديث - المحاضرة الأولى',
          instructor: 'الشيخ أحمد محمد الزهري',
          courseTitle: 'أصول علم الحديث',
          scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          duration: 90,
          isLive: true,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          description:
            'مقدمة شاملة في علم الحديث وتاريخه وأهميته في العلوم الشرعية',
          level: 'مبتدئ',
          createdBy: req.user?.claims?.sub || 'admin',
        },
        {
          id: 2,
          title: 'شرح الأربعين النووية - الحديث الأول',
          instructor: 'الدكتور محمد عبد الرحمن',
          courseTitle: 'شرح الأربعين النووية',
          scheduledTime: new Date(
            Date.now() + 2 * 60 * 60 * 1000
          ).toISOString(),
          duration: 60,
          isLive: false,
          description: 'شرح تفصيلي للحديث الأول من الأربعين النووية',
          level: 'متوسط',
          createdBy: req.user?.claims?.sub || 'admin',
        },
      ];

      res.json(mockSessions);
    } catch (error) {
      console.error('Error fetching live sessions:', error);
      res.status(500).json({ message: 'Failed to fetch live sessions' });
    }
  });

  app.post('/api/live-sessions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const sessionData = {
        ...req.body,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSession = await storage.createLiveSession(sessionData);
      res.json(newSession);
    } catch (error) {
      console.error('Error creating live session:', error);
      res.status(500).json({ message: 'Failed to create live session' });
    }
  });

  app.put('/api/live-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const sessionId = parseInt(req.params.id);
      const updates = {
        ...req.body,
        updatedAt: new Date(),
      };

      const updatedSession = await storage.updateLiveSession(
        sessionId,
        updates
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

  app.delete('/api/live-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const sessionId = parseInt(req.params.id);
      await storage.deleteLiveSession(sessionId);

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Error deleting live session:', error);
      res.status(500).json({ message: 'Failed to delete live session' });
    }
  });

  app.patch(
    '/api/live-sessions/:id/live-status',
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUserById(userId);

        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        const sessionId = parseInt(req.params.id);
        const { isLive } = req.body;

        await storage.setSessionLive(sessionId, isLive);

        res.json({ message: 'Live status updated successfully' });
      } catch (error) {
        console.error('Error updating live status:', error);
        res.status(500).json({ message: 'Failed to update live status' });
      }
    }
  );

  // Image upload route
  app.post(
    '/api/upload-image',
    isAuthenticated,
    upload.single('image'),
    (req, res) => {
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
  app.get('/api/diploma-templates', async (req, res) => {
    try {
      const templates = await storage.getDiplomaTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching diploma templates:', error);
      res.status(500).json({ message: 'Failed to fetch diploma templates' });
    }
  });

  app.post('/api/diploma-templates', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
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

  app.put('/api/diploma-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const templateId = parseInt(req.params.id);
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

  app.delete(
    '/api/diploma-templates/:id',
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUserById(userId);

        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        const templateId = parseInt(req.params.id);
        await storage.deleteDiplomaTemplate(templateId);

        res.json({ message: 'Template deleted successfully' });
      } catch (error) {
        console.error('Error deleting diploma template:', error);
        res.status(500).json({ message: 'Failed to delete diploma template' });
      }
    }
  );

  app.patch(
    '/api/diploma-templates/:id/status',
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user?.claims?.sub;
        const user = await storage.getUserById(userId);

        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        const templateId = parseInt(req.params.id);
        const { isActive } = req.body;

        await storage.toggleDiplomaTemplateStatus(templateId, isActive);

        res.json({ message: 'Template status updated successfully' });
      } catch (error) {
        console.error('Error updating template status:', error);
        res.status(500).json({ message: 'Failed to update template status' });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
