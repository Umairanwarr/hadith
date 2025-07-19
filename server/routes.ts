import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Admin middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Failed to verify admin status" });
  }
};
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
  createExamQuestionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get('/api/courses/:id/lessons', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Enrollment routes
  app.post('/api/courses/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = parseInt(req.params.id);
      
      // Check if already enrolled
      const existing = await storage.getUserEnrollment(userId, courseId);
      if (existing) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await storage.enrollUserInCourse({
        userId,
        courseId,
      });
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/my-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Lesson progress routes
  app.post('/api/lessons/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
        const userProgress = await storage.getUserCourseProgress(userId, courseId);
        const completedCount = userProgress.filter(p => p.isCompleted).length;
        const progressPercentage = (completedCount / allLessons.length) * 100;
        
        await storage.updateEnrollmentProgress(userId, courseId, progressPercentage);
      }

      res.json(progress);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      res.status(500).json({ message: "Failed to update lesson progress" });
    }
  });

  app.get('/api/courses/:courseId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = parseInt(req.params.courseId);
      const progress = await storage.getUserCourseProgress(userId, courseId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ message: "Failed to fetch course progress" });
    }
  });

  // Exam routes
  app.get('/api/courses/:id/exam', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user has completed all lessons
      const allLessons = await storage.getLessonsByCourse(courseId);
      const userProgress = await storage.getUserCourseProgress(userId, courseId);
      const completedLessons = userProgress.filter(p => p.isCompleted).length;
      
      if (completedLessons < allLessons.length) {
        return res.status(403).json({ 
          message: "You must complete all lessons before taking the exam",
          required: allLessons.length,
          completed: completedLessons
        });
      }

      const exam = await storage.getExamByCourse(courseId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found for this course" });
      }

      const questions = await storage.getExamQuestions(exam.id);
      
      // Remove correct answers from response
      const questionsWithoutAnswers = questions.map(q => ({
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
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.post('/api/exams/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const examId = parseInt(req.params.id);
      
      const exam = await storage.getExamByCourse(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
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
      console.error("Error starting exam:", error);
      res.status(500).json({ message: "Failed to start exam" });
    }
  });

  app.post('/api/exam-attempts/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptId = parseInt(req.params.id);
      const { answers } = req.body;

      const attempt = await storage.getExamAttempt(attemptId);
      if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({ message: "Exam attempt not found" });
      }

      const exam = await storage.getExamByCourse(attempt.courseId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      const questions = await storage.getExamQuestions(exam.id);
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      questions.forEach(question => {
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
        duration: attempt.startedAt ? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000) : 0,
      });

      // Create certificate if passed
      if (passed) {
        const certificateNumber = `CERT-${Date.now()}-${userId.slice(-4)}`;
        await storage.createCertificate({
          userId,
          courseId: attempt.courseId,
          examAttemptId: attemptId,
          certificateNumber,
          grade: score.toString(),
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
      console.error("Error submitting exam:", error);
      res.status(500).json({ message: "Failed to submit exam" });
    }
  });

  // Certificate routes
  app.get('/api/my-certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // User profile update
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const { firstName, lastName, city, specialization, level } = validationResult.data;
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
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
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin routes
  // Create course
  app.post('/api/admin/courses', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validationResult = createCourseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const course = await storage.createCourse(validationResult.data);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update course
  app.patch('/api/admin/courses/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const validationResult = createCourseSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const updatedCourse = await storage.updateCourse(courseId, validationResult.data);
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete course
  app.delete('/api/admin/courses/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      await storage.deleteCourse(courseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Create lesson
  app.post('/api/admin/courses/:id/lessons', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const validationResult = createLessonSchema.safeParse({
        ...req.body,
        courseId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const lesson = await storage.createLesson(validationResult.data);
      
      // Update course lesson count
      await storage.updateCourseLessonCount(courseId);
      
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  // Update lesson
  app.patch('/api/admin/lessons/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const validationResult = createLessonSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const updatedLesson = await storage.updateLesson(lessonId, validationResult.data);
      if (!updatedLesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(updatedLesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      res.status(500).json({ message: "Failed to update lesson" });
    }
  });

  // Delete lesson
  app.delete('/api/admin/lessons/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      await storage.deleteLesson(lessonId);
      
      // Update course lesson count
      await storage.updateCourseLessonCount(lesson.courseId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Create exam
  app.post('/api/admin/courses/:id/exams', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const validationResult = createExamSchema.safeParse({
        ...req.body,
        courseId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const exam = await storage.createExam(validationResult.data);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  // Update exam
  app.patch('/api/admin/exams/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = parseInt(req.params.id);
      const validationResult = createExamSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const updatedExam = await storage.updateExam(examId, validationResult.data);
      if (!updatedExam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(updatedExam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  // Delete exam
  app.delete('/api/admin/exams/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = parseInt(req.params.id);
      await storage.deleteExam(examId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Get course lessons for admin
  app.get('/api/courses/:id/lessons', async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Create lesson
  app.post('/api/admin/lessons', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validationResult = createLessonSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const lesson = await storage.createLesson(validationResult.data);
      
      // Update course lesson count
      await storage.updateCourseLessonCount(validationResult.data.courseId);
      
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  // Delete lesson
  app.delete('/api/admin/lessons/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      await storage.deleteLesson(lessonId);
      
      // Update course lesson count
      await storage.updateCourseLessonCount(lesson.courseId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Promote user to admin (temporary for testing)
  app.post('/api/promote-to-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        role: 'admin',
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Admin dashboard stats
  app.get('/api/admin/dashboard', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all exams
  app.get('/api/exams', async (req: any, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  // Create exam question
  app.post('/api/admin/exams/:id/questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const examId = parseInt(req.params.id);
      const validationResult = createExamQuestionSchema.safeParse({
        ...req.body,
        examId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const question = await storage.createExamQuestion(validationResult.data);
      
      // Update exam question count
      await storage.updateExamQuestionCount(examId);
      
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating exam question:", error);
      res.status(500).json({ message: "Failed to create exam question" });
    }
  });

  // Update exam question
  app.patch('/api/admin/questions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const validationResult = createExamQuestionSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "بيانات غير صحيحة", 
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const updatedQuestion = await storage.updateExamQuestion(questionId, validationResult.data);
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating exam question:", error);
      res.status(500).json({ message: "Failed to update exam question" });
    }
  });

  // Delete exam question
  app.delete('/api/admin/questions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const question = await storage.getExamQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      await storage.deleteExamQuestion(questionId);
      
      // Update exam question count
      await storage.updateExamQuestionCount(question.examId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting exam question:", error);
      res.status(500).json({ message: "Failed to delete exam question" });
    }
  });

  // Get admin dashboard data
  app.get('/api/admin/dashboard', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard stats" });
    }
  });

  // Temporary route to promote user to admin (for development only)
  app.post('/api/promote-to-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.updateUserRole(userId, 'admin');
      res.json({ message: "User promoted to admin successfully" });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ message: "Failed to promote user to admin" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
