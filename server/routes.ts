import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCourseSchema,
  insertLessonSchema,
  insertEnrollmentSchema,
  insertLessonProgressSchema,
  insertExamAttemptSchema,
  insertCertificateSchema,
  updateProfileSchema
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
        duration: Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000),
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

  const httpServer = createServer(app);
  return httpServer;
}
