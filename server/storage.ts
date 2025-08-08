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
  liveSessions,
  diplomaTemplates,
  certificateImages,
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
  type LiveSession,
  type InsertLiveSession,
  type DiplomaTemplate,
  type InsertDiplomaTemplate,
  type CertificateImage,
  type InsertCertificateImage,
  UserRole,
} from '@shared/schema';
import { db } from './db';
import { eq, desc, and, sql } from 'drizzle-orm';

export interface IStorage {
  // Auth operations
  registerUser(user: UpsertUser): Promise<User>;

  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Course operations
  getAllCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(
    id: string,
    updates: Partial<Course>
  ): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;
  updateCourseLessonCount(courseId: string): Promise<void>;

  // Live Sessions operations
  getAllLiveSessions(): Promise<any[]>;
  getLiveSession(id: number): Promise<any | undefined>;
  createLiveSession(session: any): Promise<any>;
  updateLiveSession(id: number, updates: any): Promise<any | undefined>;
  deleteLiveSession(id: number): Promise<void>;
  setSessionLive(id: number, isLive: boolean): Promise<void>;

  // Lesson operations
  getLessonsByCourse(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(
    id: number,
    updates: Partial<Lesson>
  ): Promise<Lesson | undefined>;
  deleteLesson(id: number): Promise<void>;

  // Enrollment operations
  enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(
    userId: string
  ): Promise<(Enrollment & { course: Course })[]>;
  getUserEnrollment(
    userId: string,
    courseId: string
  ): Promise<Enrollment | undefined>;
  updateEnrollmentProgress(
    userId: string,
    courseId: string,
    progress: number
  ): Promise<void>;

  // Lesson progress operations
  updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  getUserLessonProgress(
    userId: string,
    lessonId: number
  ): Promise<LessonProgress | undefined>;
  getUserCourseProgress(
    userId: string,
    courseId: number
  ): Promise<LessonProgress[]>;

  // Exam operations
  getExamByCourse(courseId: number): Promise<Exam | undefined>;
  getExams(): Promise<Exam[]>;
  getExamQuestions(examId: number): Promise<ExamQuestion[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, updates: Partial<Exam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<void>;
  updateExamQuestionCount(examId: number): Promise<void>;
  createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestion>;
  updateExamQuestion(
    id: number,
    updates: Partial<ExamQuestion>
  ): Promise<ExamQuestion | undefined>;
  deleteExamQuestion(id: number): Promise<void>;
  getExamQuestion(id: number): Promise<ExamQuestion | undefined>;
  createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt>;
  getUserExamAttempts(userId: string, examId: number): Promise<ExamAttempt[]>;
  getExamAttempt(id: number): Promise<ExamAttempt | undefined>;
  updateExamAttempt(
    id: number,
    updates: Partial<ExamAttempt>
  ): Promise<ExamAttempt>;

  // Certificate operations
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getUserCertificates(
    userId: string
  ): Promise<(Certificate & { course: Course })[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateById(id: number): Promise<Certificate | undefined>;

  // Certificate Image operations
  createCertificateImage(data: {
    certificateId: number;
    templateId: number;
    imageUrl: string;
    generatedAt: Date;
    generatedBy: string;
    metadata?: any;
  }): Promise<any>;
  getCertificateImage(id: number): Promise<any | undefined>;
  getCertificateImages(certificateId: number): Promise<any[]>;
  deleteCertificateImage(id: number): Promise<void>;

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
}

export class DatabaseStorage implements IStorage {
  // Auth operations
  async registerUser(userData: UpsertUser): Promise<User> {
    const newUser = await db
      .insert(users)
      .values(userData)
      .onConflictDoNothing() // Just skip insert if duplicate
      .returning();

    if (newUser.length === 0) {
      throw new Error('User insertion failed or already exists.');
    }

    return newUser[0];
  }


  // User operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user ?? undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Live Sessions operations
  async getAllLiveSessions(): Promise<any[]> {
    return []; // Mock for now until we implement database
  }

  async getLiveSession(id: number): Promise<any | undefined> {
    return undefined; // Mock for now
  }

  async createLiveSession(session: any): Promise<any> {
    return { id: Date.now(), ...session }; // Mock for now
  }

  async updateLiveSession(id: number, updates: any): Promise<any | undefined> {
    return undefined; // Mock for now
  }

  async deleteLiveSession(id: number): Promise<void> {
    // Mock for now
  }

  async setSessionLive(id: number, isLive: boolean): Promise<void> {
    // Mock for now
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    return db
      .select()
      .from(courses)
      .where(eq(courses.isActive, true))
      .orderBy(courses.createdAt);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(
    id: string,
    updates: Partial<Course>
  ): Promise<Course | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }



  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async updateCourseLessonCount(courseId: string): Promise<void> {
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
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return db
      .select()
      .from(lessons)
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

  async updateLesson(
    id: number,
    updates: Partial<Lesson>
  ): Promise<Lesson | undefined> {
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
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async getUserEnrollments(
    userId: string
  ): Promise<(Enrollment & { course: Course })[]> {
    return db
      .select({
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

  async getUserEnrollment(
    userId: string,
    courseId: string
  ): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
      );
    return enrollment;
  }

  async updateEnrollmentProgress(
    userId: string,
    courseId: string,
    progress: number
  ): Promise<void> {
    await db
      .update(enrollments)
      .set({
        progress: progress.toString(),
        completedAt: progress >= 100 ? new Date() : null,
      })
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
      );
  }

  // Lesson progress operations
  async updateLessonProgress(
    progress: InsertLessonProgress
  ): Promise<LessonProgress> {
    const [existingProgress] = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, progress.userId),
          eq(lessonProgress.lessonId, progress.lessonId)
        )
      );

    if (existingProgress) {
      const [updated] = await db
        .update(lessonProgress)
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
      const [newProgress] = await db
        .insert(lessonProgress)
        .values(progress)
        .returning();
      return newProgress;
    }
  }

  async getUserLessonProgress(
    userId: string,
    lessonId: number
  ): Promise<LessonProgress | undefined> {
    const [progress] = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId)
        )
      );
    return progress;
  }

  async getUserCourseProgress(
    userId: string,
    courseId: number
  ): Promise<LessonProgress[]> {
    return db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.courseId, courseId)
        )
      );
  }

  // Exam operations
  async getExamByCourse(courseId: number): Promise<Exam | undefined> {
    const [exam] = await db
      .select()
      .from(exams)
      .where(and(eq(exams.courseId, courseId), eq(exams.isActive, true)));
    return exam;
  }

  async getExams(): Promise<Exam[]> {
    return db.select().from(exams).orderBy(desc(exams.createdAt));
  }

  async getExamQuestions(examId: number): Promise<ExamQuestion[]> {
    return db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.examId, examId))
      .orderBy(examQuestions.order);
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }

  async updateExam(
    id: number,
    updates: Partial<Exam>
  ): Promise<Exam | undefined> {
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

  async createExamQuestion(
    question: InsertExamQuestion
  ): Promise<ExamQuestion> {
    const [newQuestion] = await db
      .insert(examQuestions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async updateExamQuestion(
    id: number,
    updates: Partial<ExamQuestion>
  ): Promise<ExamQuestion | undefined> {
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
    const [question] = await db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.id, id));
    return question;
  }

  async createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt> {
    const [newAttempt] = await db
      .insert(examAttempts)
      .values(attempt)
      .returning();
    return newAttempt;
  }

  async getUserExamAttempts(
    userId: string,
    examId: number
  ): Promise<ExamAttempt[]> {
    return db
      .select()
      .from(examAttempts)
      .where(
        and(eq(examAttempts.userId, userId), eq(examAttempts.examId, examId))
      )
      .orderBy(desc(examAttempts.startedAt));
  }

  async getExamAttempt(id: number): Promise<ExamAttempt | undefined> {
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, id));
    return attempt;
  }

  async updateExamAttempt(
    id: number,
    updates: Partial<ExamAttempt>
  ): Promise<ExamAttempt> {
    const [updated] = await db
      .update(examAttempts)
      .set(updates)
      .where(eq(examAttempts.id, id))
      .returning();
    return updated;
  }

  // Certificate operations
  async createCertificate(data: {
    userId: string;
    courseId: number;
    examAttemptId: number;
    certificateNumber: string;
    grade: string;
    studentName: string;
    diplomaTemplateId?: number;
    completionDate?: Date;
    specialization?: string;
    honors?: string;
  }): Promise<any> {
    const [certificate] = await db
      .insert(certificates)
      .values({
        userId: data.userId,
        courseId: data.courseId,
        examAttemptId: data.examAttemptId,
        certificateNumber: data.certificateNumber,
        grade: data.grade,
        studentName: data.studentName,
        diplomaTemplateId: data.diplomaTemplateId,
        completionDate: data.completionDate || new Date(),
        specialization: data.specialization,
        honors: data.honors,
      })
      .returning();

    return certificate;
  }

  async getUserCertificates(userId: string): Promise<any[]> {
    return db
      .select({
        id: certificates.id,
        userId: certificates.userId,
        courseId: certificates.courseId,
        examAttemptId: certificates.examAttemptId,
        certificateNumber: certificates.certificateNumber,
        studentName: certificates.studentName,
        specialization: certificates.specialization,
        honors: certificates.honors,
        completionDate: certificates.completionDate,
        diplomaTemplateId: certificates.diplomaTemplateId,
        issuedAt: certificates.issuedAt,
        grade: certificates.grade,
        isValid: certificates.isValid,
        course: courses,
      })
      .from(certificates)
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .where(
        and(eq(certificates.userId, userId), eq(certificates.isValid, true))
      )
      .orderBy(desc(certificates.issuedAt));
  }

  // Diploma Templates operations
  async createDiplomaTemplate(data: {
    title: string;
    level: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    logoUrl?: string;
    institutionName: string;
    templateStyle?: string;
    requirements: string;
  }): Promise<any> {
    const [template] = await db
      .insert(diplomaTemplates)
      .values(data)
      .returning();
    return template;
  }

  async getDiplomaTemplates(): Promise<any[]> {
    return await db
      .select()
      .from(diplomaTemplates)
      .orderBy(desc(diplomaTemplates.createdAt));
  }

  async getDiplomaTemplate(id: number): Promise<any | undefined> {
    const [template] = await db
      .select()
      .from(diplomaTemplates)
      .where(eq(diplomaTemplates.id, id));
    return template;
  }

  async updateDiplomaTemplate(
    id: number,
    updates: any
  ): Promise<any | undefined> {
    const [updated] = await db
      .update(diplomaTemplates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(diplomaTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteDiplomaTemplate(id: number): Promise<void> {
    await db.delete(diplomaTemplates).where(eq(diplomaTemplates.id, id));
  }

  async toggleDiplomaTemplateStatus(
    id: number,
    isActive: boolean
  ): Promise<void> {
    await db
      .update(diplomaTemplates)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(diplomaTemplates.id, id));
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id));
    return certificate;
  }

  async getCertificateById(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id.toString()));
    return certificate;
  }

  // Certificate Image operations
  async createCertificateImage(data: {
    certificateId: number;
    templateId: number;
    imageUrl: string;
    generatedAt: Date;
    generatedBy: string;
    metadata?: any;
  }): Promise<any> {
    const [certificateImage] = await db
      .insert(certificateImages)
      .values({
        certificateId: data.certificateId.toString(),
        templateId: data.templateId.toString(),
        imageUrl: data.imageUrl,
        generatedAt: data.generatedAt,
        generatedBy: data.generatedBy,
        metadata: data.metadata,
      })
      .returning();
    return certificateImage;
  }

  async getCertificateImage(id: number): Promise<any | undefined> {
    const [certificateImage] = await db
      .select()
      .from(certificateImages)
      .where(eq(certificateImages.id, id.toString()));
    return certificateImage;
  }

  async getCertificateImages(certificateId: number): Promise<any[]> {
    return await db
      .select()
      .from(certificateImages)
      .where(eq(certificateImages.certificateId, certificateId.toString()))
      .orderBy(desc(certificateImages.generatedAt));
  }

  async deleteCertificateImage(id: number): Promise<void> {
    await db.delete(certificateImages).where(eq(certificateImages.id, id.toString()));
  }

  // Admin statistics
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalExams: number;
    totalEnrollments: number;
  }> {
    const [usersCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(users);

    const [coursesCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(courses)
      .where(eq(courses.isActive, true));

    const [examsCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(exams)
      .where(eq(exams.isActive, true));

    const [enrollmentsCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(enrollments);

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
    const [completedResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          sql`${enrollments.completedAt} IS NOT NULL`
        )
      );

    // Certificates count
    const [certificatesResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(certificates)
      .where(
        and(eq(certificates.userId, userId), eq(certificates.isValid, true))
      );

    // Total hours from completed lessons
    const [hoursResult] = await db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(${lessons.duration}), 0)::int`,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.isCompleted, true)
        )
      );

    // Average grade from passed exams
    const [gradeResult] = await db
      .select({
        avgGrade: sql<number>`COALESCE(AVG(${examAttempts.score}), 0)::decimal`,
      })
      .from(examAttempts)
      .where(
        and(eq(examAttempts.userId, userId), eq(examAttempts.passed, true))
      );

    return {
      completedCourses: completedResult?.count || 0,
      certificates: certificatesResult?.count || 0,
      totalHours: Math.round((hoursResult?.totalSeconds || 0) / 3600), // Convert seconds to hours
      averageGrade: Math.round(Number(gradeResult?.avgGrade) || 0),
    };
  }
}

export const storage = new DatabaseStorage();
