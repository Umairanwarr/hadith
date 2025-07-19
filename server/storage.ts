import {
  users,
  courses,
  lessons,
  enrollments,
  lessonProgress,
  exams,
  examQuestions,
  examAttempts,
  certificates,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type LessonProgress,
  type InsertLessonProgress,
  type Exam,
  type InsertExam,
  type ExamQuestion,
  type InsertExamQuestion,
  type ExamAttempt,
  type InsertExamAttempt,
  type Certificate,
  type InsertCertificate,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<void>;
  
  // Course operations
  getAllCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;
  updateCourseLessonCount(courseId: number): Promise<void>;
  
  // Lesson operations
  getLessonsByCourse(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, updates: Partial<Lesson>): Promise<Lesson | undefined>;
  deleteLesson(id: number): Promise<void>;
  
  // Enrollment operations
  enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
  getUserEnrollment(userId: string, courseId: number): Promise<Enrollment | undefined>;
  updateEnrollmentProgress(userId: string, courseId: number, progress: number): Promise<void>;
  
  // Lesson progress operations
  updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  getUserLessonProgress(userId: string, lessonId: number): Promise<LessonProgress | undefined>;
  getUserCourseProgress(userId: string, courseId: number): Promise<LessonProgress[]>;
  
  // Exam operations
  getExamByCourse(courseId: number): Promise<Exam | undefined>;
  getExamQuestions(examId: number): Promise<ExamQuestion[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, updates: Partial<Exam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<void>;
  updateExamQuestionCount(examId: number): Promise<void>;
  createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestion>;
  updateExamQuestion(id: number, updates: Partial<ExamQuestion>): Promise<ExamQuestion | undefined>;
  deleteExamQuestion(id: number): Promise<void>;
  getExamQuestion(id: number): Promise<ExamQuestion | undefined>;
  createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt>;
  getUserExamAttempts(userId: string, examId: number): Promise<ExamAttempt[]>;
  getExamAttempt(id: number): Promise<ExamAttempt | undefined>;
  updateExamAttempt(id: number, updates: Partial<ExamAttempt>): Promise<ExamAttempt>;
  
  // Certificate operations
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getUserCertificates(userId: string): Promise<(Certificate & { course: Course })[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  
  // Dashboard statistics
  getUserStats(userId: string): Promise<{
    completedCourses: number;
    certificates: number;
    totalHours: number;
    averageGrade: number;
  }>;
  
  // Admin statistics
  getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalExams: number;
    totalEnrollments: number;
  }>;
  
  // User role management
  updateUserRole(userId: string, role: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.isActive, true)).orderBy(courses.createdAt);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async updateCourseLessonCount(courseId: number): Promise<void> {
    const lessonsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));
      
    await db
      .update(courses)
      .set({ totalLessons: lessonsCount[0].count })
      .where(eq(courses.id, courseId));
  }

  // Lesson operations
  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return db.select().from(lessons)
      .where(and(eq(lessons.courseId, courseId), eq(lessons.isActive, true)))
      .orderBy(lessons.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: number, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    const [updatedLesson] = await db
      .update(lessons)
      .set(updates)
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: number): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Enrollment operations
  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    return db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      progress: enrollments.progress,
      course: courses,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.enrolledAt));
  }

  async getUserEnrollment(userId: string, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async updateEnrollmentProgress(userId: string, courseId: number, progress: number): Promise<void> {
    await db.update(enrollments)
      .set({ 
        progress: progress.toString(),
        completedAt: progress >= 100 ? new Date() : null 
      })
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
  }

  // Lesson progress operations
  async updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    const [existingProgress] = await db.select().from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, progress.userId),
        eq(lessonProgress.lessonId, progress.lessonId)
      ));

    if (existingProgress) {
      const [updated] = await db.update(lessonProgress)
        .set({
          watchedDuration: progress.watchedDuration,
          isCompleted: progress.isCompleted,
          completedAt: progress.isCompleted ? new Date() : null,
          lastWatchedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(lessonProgress).values(progress).returning();
      return newProgress;
    }
  }

  async getUserLessonProgress(userId: string, lessonId: number): Promise<LessonProgress | undefined> {
    const [progress] = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return progress;
  }

  async getUserCourseProgress(userId: string, courseId: number): Promise<LessonProgress[]> {
    return db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)));
  }

  // Exam operations
  async getExamByCourse(courseId: number): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams)
      .where(and(eq(exams.courseId, courseId), eq(exams.isActive, true)));
    return exam;
  }

  async getExamQuestions(examId: number): Promise<ExamQuestion[]> {
    return db.select().from(examQuestions)
      .where(eq(examQuestions.examId, examId))
      .orderBy(examQuestions.order);
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }

  async updateExam(id: number, updates: Partial<Exam>): Promise<Exam | undefined> {
    const [updatedExam] = await db
      .update(exams)
      .set(updates)
      .where(eq(exams.id, id))
      .returning();
    return updatedExam;
  }

  async deleteExam(id: number): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  async updateExamQuestionCount(examId: number): Promise<void> {
    const questionsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(examQuestions)
      .where(eq(examQuestions.examId, examId));
      
    await db
      .update(exams)
      .set({ totalQuestions: questionsCount[0].count })
      .where(eq(exams.id, examId));
  }

  async createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestion> {
    const [newQuestion] = await db.insert(examQuestions).values(question).returning();
    return newQuestion;
  }

  async updateExamQuestion(id: number, updates: Partial<ExamQuestion>): Promise<ExamQuestion | undefined> {
    const [updatedQuestion] = await db
      .update(examQuestions)
      .set(updates)
      .where(eq(examQuestions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteExamQuestion(id: number): Promise<void> {
    await db.delete(examQuestions).where(eq(examQuestions.id, id));
  }

  async getExamQuestion(id: number): Promise<ExamQuestion | undefined> {
    const [question] = await db.select().from(examQuestions).where(eq(examQuestions.id, id));
    return question;
  }

  async createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt> {
    const [newAttempt] = await db.insert(examAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserExamAttempts(userId: string, examId: number): Promise<ExamAttempt[]> {
    return db.select().from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.examId, examId)))
      .orderBy(desc(examAttempts.startedAt));
  }

  async getExamAttempt(id: number): Promise<ExamAttempt | undefined> {
    const [attempt] = await db.select().from(examAttempts).where(eq(examAttempts.id, id));
    return attempt;
  }

  async updateExamAttempt(id: number, updates: Partial<ExamAttempt>): Promise<ExamAttempt> {
    const [updated] = await db.update(examAttempts)
      .set(updates)
      .where(eq(examAttempts.id, id))
      .returning();
    return updated;
  }

  // Certificate operations
  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [newCertificate] = await db.insert(certificates).values(certificate).returning();
    return newCertificate;
  }

  async getUserCertificates(userId: string): Promise<(Certificate & { course: Course })[]> {
    return db.select({
      id: certificates.id,
      userId: certificates.userId,
      courseId: certificates.courseId,
      examAttemptId: certificates.examAttemptId,
      certificateNumber: certificates.certificateNumber,
      issuedAt: certificates.issuedAt,
      grade: certificates.grade,
      isValid: certificates.isValid,
      course: courses,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(and(eq(certificates.userId, userId), eq(certificates.isValid, true)))
    .orderBy(desc(certificates.issuedAt));
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate;
  }

  // Admin statistics
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalExams: number;
    totalEnrollments: number;
  }> {
    const [usersCount] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(users);

    const [coursesCount] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(courses).where(eq(courses.isActive, true));

    const [examsCount] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(exams).where(eq(exams.isActive, true));

    const [enrollmentsCount] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(enrollments);

    return {
      totalUsers: usersCount?.count || 0,
      totalCourses: coursesCount?.count || 0,
      totalExams: examsCount?.count || 0,
      totalEnrollments: enrollmentsCount?.count || 0,
    };
  }

  // Dashboard statistics
  async getUserStats(userId: string): Promise<{
    completedCourses: number;
    certificates: number;
    totalHours: number;
    averageGrade: number;
  }> {
    // Completed courses count
    const [completedResult] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(enrollments)
    .where(and(eq(enrollments.userId, userId), sql`${enrollments.completedAt} IS NOT NULL`));

    // Certificates count
    const [certificatesResult] = await db.select({
      count: sql<number>`count(*)::int`
    }).from(certificates)
    .where(and(eq(certificates.userId, userId), eq(certificates.isValid, true)));

    // Total hours from completed lessons
    const [hoursResult] = await db.select({
      totalSeconds: sql<number>`COALESCE(SUM(${lessons.duration}), 0)::int`
    }).from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.isCompleted, true)));

    // Average grade from passed exams
    const [gradeResult] = await db.select({
      avgGrade: sql<number>`COALESCE(AVG(${examAttempts.score}), 0)::decimal`
    }).from(examAttempts)
    .where(and(eq(examAttempts.userId, userId), eq(examAttempts.passed, true)));

    return {
      completedCourses: completedResult?.count || 0,
      certificates: certificatesResult?.count || 0,
      totalHours: Math.round((hoursResult?.totalSeconds || 0) / 3600), // Convert seconds to hours
      averageGrade: Math.round(Number(gradeResult?.avgGrade) || 0),
    };
  }

  // User role management
  async updateUserRole(userId: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
