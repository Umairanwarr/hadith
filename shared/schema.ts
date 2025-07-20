import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  city: varchar("city"),
  specialization: varchar("specialization"),
  level: varchar("level").default("مبتدئ"),
  role: varchar("role").default("student"), // student, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  instructor: text("instructor").notNull(),
  level: varchar("level").notNull(), // مبتدئ، متوسط، متقدم
  duration: integer("duration"), // in minutes
  totalLessons: integer("total_lessons").default(0),
  thumbnailUrl: text("thumbnail_url"),
  imageUrl: text("image_url"), // صورة الكورس الإضافية
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course videos/lessons table
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"), // This will be a placeholder for now
  duration: integer("duration"), // in seconds
  order: integer("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User course enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
});

// User lesson progress
export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  watchedDuration: integer("watched_duration").default(0), // in seconds
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  lastWatchedAt: timestamp("last_watched_at").defaultNow(),
});

// Exams table
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  passingGrade: decimal("passing_grade", { precision: 5, scale: 2 }).default("70"),
  totalQuestions: integer("total_questions").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exam questions table
export const examQuestions = pgTable("exam_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id).notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of options
  correctAnswer: varchar("correct_answer").notNull(),
  order: integer("order").notNull(),
  points: decimal("points", { precision: 5, scale: 2 }).default("1"),
});

// User exam attempts
export const examAttempts = pgTable("exam_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  examId: integer("exam_id").references(() => exams.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  answers: jsonb("answers").notNull(), // User's answers
  score: decimal("score", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  passed: boolean("passed").default(false),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // actual time taken in seconds
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  examAttemptId: integer("exam_attempt_id").references(() => examAttempts.id).notNull(),
  diplomaTemplateId: integer("diploma_template_id").references(() => diplomaTemplates.id), // ربط بقالب الشهادة
  certificateNumber: varchar("certificate_number").unique().notNull(),
  studentName: varchar("student_name", { length: 255 }).notNull(), // اسم الطالب على الشهادة
  issuedAt: timestamp("issued_at").defaultNow(),
  grade: decimal("grade", { precision: 5, scale: 2 }).notNull(),
  completionDate: timestamp("completion_date"), // تاريخ الإنجاز
  specialization: varchar("specialization", { length: 255 }), // التخصص
  honors: varchar("honors", { length: 100 }), // مرتبة الشرف (امتياز، جيد جداً، إلخ)
  isValid: boolean("is_valid").default(true),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  lessonProgress: many(lessonProgress),
  examAttempts: many(examAttempts),
  certificates: many(certificates),
}));

export const courseRelations = relations(courses, ({ many, one }) => ({
  lessons: many(lessons),
  enrollments: many(enrollments),
  exams: many(exams),
  certificates: many(certificates),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const examRelations = relations(exams, ({ one, many }) => ({
  course: one(courses, {
    fields: [exams.courseId],
    references: [courses.id],
  }),
  questions: many(examQuestions),
  attempts: many(examAttempts),
}));

export const examQuestionRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, {
    fields: [examQuestions.examId],
    references: [exams.id],
  }),
}));

export const examAttemptRelations = relations(examAttempts, ({ one }) => ({
  user: one(users, {
    fields: [examAttempts.userId],
    references: [users.id],
  }),
  exam: one(exams, {
    fields: [examAttempts.examId],
    references: [exams.id],
  }),
  course: one(courses, {
    fields: [examAttempts.courseId],
    references: [courses.id],
  }),
  certificate: one(certificates, {
    fields: [examAttempts.id],
    references: [certificates.examAttemptId],
  }),
}));

export const certificateRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
  examAttempt: one(examAttempts, {
    fields: [certificates.examAttemptId],
    references: [examAttempts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertLessonSchema = createInsertSchema(lessons);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertLessonProgressSchema = createInsertSchema(lessonProgress);
export const insertExamSchema = createInsertSchema(exams);
export const insertExamQuestionSchema = createInsertSchema(examQuestions);
export const insertExamAttemptSchema = createInsertSchema(examAttempts);
export const insertCertificateSchema = createInsertSchema(certificates);

// Profile update schema (subset of user fields that can be updated)
export const updateProfileSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  city: true,
  specialization: true,
  level: true,
}).extend({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50, "الاسم الأول يجب أن يكون أقل من 50 حرف"),
  lastName: z.string().min(1, "اسم العائلة مطلوب").max(50, "اسم العائلة يجب أن يكون أقل من 50 حرف"),
  city: z.string().min(1, "المدينة مطلوبة").max(100, "اسم المدينة يجب أن يكون أقل من 100 حرف"),
  specialization: z.string().min(1, "التخصص مطلوب").max(100, "التخصص يجب أن يكون أقل من 100 حرف"),
  level: z.enum(["مبتدئ", "متوسط", "متقدم"], { 
    errorMap: () => ({ message: "يجب اختيار مستوى صحيح" })
  }),
});

// Admin course creation schema
export const createCourseSchema = insertCourseSchema.omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1, "عنوان المادة مطلوب").max(200, "العنوان يجب أن يكون أقل من 200 حرف"),
  description: z.string().min(1, "وصف المادة مطلوب").max(1000, "الوصف يجب أن يكون أقل من 1000 حرف"),
  instructor: z.string().min(1, "اسم المدرس مطلوب").max(100, "اسم المدرس يجب أن يكون أقل من 100 حرف"),
  level: z.enum(["مبتدئ", "متوسط", "متقدم"], { 
    errorMap: () => ({ message: "يجب اختيار مستوى صحيح" })
  }),
  duration: z.number().min(1, "مدة المادة مطلوبة").max(10000, "المدة يجب أن تكون أقل من 10000 دقيقة"),
});

// Admin lesson creation schema
export const createLessonSchema = insertLessonSchema.omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1, "عنوان الدرس مطلوب").max(200, "العنوان يجب أن يكون أقل من 200 حرف"),
  description: z.string().min(1, "وصف الدرس مطلوب").max(1000, "الوصف يجب أن يكون أقل من 1000 حرف"),
  videoUrl: z.string().url("رابط الفيديو يجب أن يكون صحيح").optional(),
  duration: z.number().min(1, "مدة الدرس مطلوبة").max(7200, "المدة يجب أن تكون أقل من 7200 ثانية"),
  order: z.number().min(1, "ترتيب الدرس مطلوب"),
});

// Admin exam creation schema
export const createExamSchema = insertExamSchema.omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1, "عنوان الاختبار مطلوب").max(200, "العنوان يجب أن يكون أقل من 200 حرف"),
  description: z.string().min(1, "وصف الاختبار مطلوب").max(1000, "الوصف يجب أن يكون أقل من 1000 حرف"),
  duration: z.number().min(1, "مدة الاختبار مطلوبة").max(300, "المدة يجب أن تكون أقل من 300 دقيقة"),
  passingGrade: z.number().min(1, "الدرجة المطلوبة للنجاح مطلوبة").max(100, "الدرجة يجب أن تكون بين 1 و 100").transform(String),
});

// Admin exam question creation schema
export const createExamQuestionSchema = insertExamQuestionSchema.omit({ id: true }).extend({
  question: z.string().min(1, "نص السؤال مطلوب").max(500, "السؤال يجب أن يكون أقل من 500 حرف"),
  options: z.array(z.string().min(1, "الخيار لا يمكن أن يكون فارغ")).min(2, "يجب أن يكون هناك خياران على الأقل").max(6, "لا يمكن أن يكون هناك أكثر من 6 خيارات"),
  correctAnswer: z.string().min(1, "الإجابة الصحيحة مطلوبة"),
  order: z.number().min(1, "ترتيب السؤال مطلوب"),
  points: z.number().min(0.1, "النقاط يجب أن تكون أكبر من 0").max(10, "النقاط يجب أن تكون أقل من أو تساوي 10").default(1).transform(String),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Live Sessions table for managing live streaming sessions
export const liveSessions = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  instructor: varchar("instructor", { length: 255 }).notNull(),
  courseTitle: varchar("course_title", { length: 255 }),
  description: text("description"),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").notNull().default(60), // duration in minutes
  isLive: boolean("is_live").default(false),
  meetingLink: varchar("meeting_link", { length: 500 }),
  level: varchar("level", { length: 100 }),
  createdBy: varchar("created_by").notNull(), // user ID who created the session
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = typeof liveSessions.$inferInsert;

// Diploma Templates table for customizable certificate templates
export const diplomaTemplates = pgTable("diploma_templates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // اسم الديبلوم
  level: varchar("level", { length: 100 }).notNull(), // المستوى (تحضيري، متوسط، إلخ)
  backgroundColor: varchar("background_color", { length: 50 }).default("#ffffff"),
  textColor: varchar("text_color", { length: 50 }).default("#000000"),
  borderColor: varchar("border_color", { length: 50 }).default("#d4af37"),
  logoUrl: varchar("logo_url", { length: 500 }),
  sealUrl: varchar("seal_url", { length: 500 }), // رابط ختم الجامعة
  institutionName: varchar("institution_name", { length: 255 }).notNull().default("جامعة الإمام الزُّهري"),
  templateStyle: varchar("template_style", { length: 50 }).default("classic"), // classic, modern, elegant
  requirements: text("requirements"), // متطلبات الحصول على الشهادة
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DiplomaTemplate = typeof diplomaTemplates.$inferSelect;
export type InsertDiplomaTemplate = typeof diplomaTemplates.$inferInsert;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type CreateLesson = z.infer<typeof createLessonSchema>;
export type CreateExam = z.infer<typeof createExamSchema>;
export type CreateExamQuestion = z.infer<typeof createExamQuestionSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type InsertExamAttempt = z.infer<typeof insertExamAttemptSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
