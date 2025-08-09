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
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Session storage table (mandatory for Replit Auth)
// export const sessions = pgTable(
//   'sessions',
//   {
//     sid: varchar('sid').primaryKey(),
//     sess: jsonb('sess').notNull(),
//     expire: timestamp('expire').notNull(),
//   },
//   (table) => [index('IDX_session_expire').on(table.expire)]
// ); // since we are using jwt

export const userRoleEnum = pgEnum('role', ['student', 'admin', 'teacher']);
export type UserRole = (typeof userRoleEnum.enumValues)[number];

// User storage table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull(), // since we are using jwt
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  city: varchar('city'),
  specialization: varchar('specialization'),
  level: varchar('level').default('مبتدئ'),
  // role: varchar("role").default("student"),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  instructor: text('instructor').notNull(),
  level: varchar('level').notNull(), // مبتدئ، متوسط، متقدم
  duration: integer('duration'), // in minutes
  totalLessons: integer('total_lessons').default(0),
  thumbnailUrl: text('thumbnail_url'),
  imageUrl: text('image_url'), // صورة الكورس الإضافية
  syllabusUrl: text('syllabus_url'), // رابط ملف مقرر المادة
  syllabusFileName: text('syllabus_file_name'), // اسم ملف مقرر المادة الأصلي
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Course videos/lessons table
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url'), // This will be a placeholder for now
  duration: integer('duration'), // in seconds
  order: integer('order').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// User course enrollments
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'),
});

// User lesson progress
export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  lessonId: uuid('lesson_id')
    .references(() => lessons.id)
    .notNull(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  watchedDuration: integer('watched_duration').default(0), // in seconds
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  lastWatchedAt: timestamp('last_watched_at').defaultNow(),
});

// Exams table
export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in minutes
  passingGrade: decimal('passing_grade', { precision: 5, scale: 2 }).default(
    '70'
  ),
  totalQuestions: integer('total_questions').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Exam questions table
export const examQuestions = pgTable('exam_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  examId: uuid('exam_id')
    .references(() => exams.id)
    .notNull(),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // Array of options
  correctAnswer: varchar('correct_answer').notNull(),
  order: integer('order').notNull(),
  points: decimal('points', { precision: 5, scale: 2 }).default('1'),
});

// User exam attempts
export const examAttempts = pgTable('exam_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  examId: uuid('exam_id')
    .references(() => exams.id)
    .notNull(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  answers: jsonb('answers').notNull(), // User's answers
  score: decimal('score', { precision: 5, scale: 2 }),
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').default(0),
  passed: boolean('passed').default(false),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // actual time taken in seconds
});

// Certificates table
export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  examAttemptId: uuid('exam_attempt_id')
    .references(() => examAttempts.id)
    .notNull(),
  diplomaTemplateId: uuid('diploma_template_id').references(
    () => diplomaTemplates.id
  ), // ربط بقالب الشهادة
  certificateNumber: varchar('certificate_number').unique().notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(), // اسم الطالب على الشهادة
  issuedAt: timestamp('issued_at').defaultNow(),
  grade: decimal('grade', { precision: 5, scale: 2 }).notNull(),
  completionDate: timestamp('completion_date'), // تاريخ الإنجاز
  specialization: varchar('specialization', { length: 255 }), // التخصص
  honors: varchar('honors', { length: 100 }), // مرتبة الشرف (امتياز، جيد جداً، إلخ)
  isValid: boolean('is_valid').default(true),
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
export const updateProfileSchema = insertUserSchema
  .pick({
    firstName: true,
    lastName: true,
    city: true,
    specialization: true,
    level: true,
  })
  .extend({
    firstName: z
      .string()
      .min(1, 'الاسم الأول مطلوب')
      .max(50, 'الاسم الأول يجب أن يكون أقل من 50 حرف'),
    lastName: z
      .string()
      .min(1, 'اسم العائلة مطلوب')
      .max(50, 'اسم العائلة يجب أن يكون أقل من 50 حرف'),
    city: z
      .string()
      .min(1, 'المدينة مطلوبة')
      .max(100, 'اسم المدينة يجب أن يكون أقل من 100 حرف'),
    specialization: z
      .string()
      .min(1, 'التخصص مطلوب')
      .max(100, 'التخصص يجب أن يكون أقل من 100 حرف'),
    level: z.enum(['مبتدئ', 'متوسط', 'متقدم'], {
      errorMap: () => ({ message: 'يجب اختيار مستوى صحيح' }),
    }),
  });

// Admin course creation schema
export const createCourseSchema = insertCourseSchema.pick({
  title: true,
  description: true,
  instructor: true,
  level: true,
  duration: true,
  thumbnailUrl: true,
  imageUrl: true,
  syllabusUrl: true,
  syllabusFileName: true,
}).refine((data) => {
  // Validate level field
  const validLevels = ['تمهيدي', 'متوسط', 'متقدم', 'بكالوريوس', 'ماجستير', 'دكتوراه'];
  return validLevels.includes(data.level);
}, {
  message: 'Invalid level. Must be one of: تمهيدي, متوسط, متقدم, بكالوريوس, ماجستير, دكتوراه',
  path: ['level']
}).refine((data) => {
  // Validate title length
  return data.title && data.title.length >= 1 && data.title.length <= 200;
}, {
  message: 'Title must be between 1 and 200 characters',
  path: ['title']
}).refine((data) => {
  // Validate description length
  return data.description && data.description.length >= 1 && data.description.length <= 2000;
}, {
  message: 'Description must be between 1 and 2000 characters',
  path: ['description']
}).refine((data) => {
  // Validate instructor length
  return data.instructor && data.instructor.length >= 1 && data.instructor.length <= 100;
}, {
  message: 'Instructor name must be between 1 and 100 characters',
  path: ['instructor']
}).refine((data) => {
  // Validate duration
  return data.duration && data.duration >= 1 && data.duration <= 10080;
}, {
  message: 'Duration must be between 1 and 10080 minutes',
  path: ['duration']
});

// Admin course update schema
export const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
  instructor: z.string().min(1, 'Instructor name is required').max(100, 'Instructor name must be less than 100 characters').optional(),
  level: z.enum(['تمهيدي', 'متوسط', 'متقدم', 'بكالوريوس', 'ماجستير', 'دكتوراه']).optional(),
  duration: z.number().min(1, 'Duration is required').max(10080, 'Duration must be less than 10080 minutes').optional(),
  thumbnailUrl: z.string().url('Thumbnail URL must be valid').optional(),
  imageUrl: z.string().url('Image URL must be valid').optional(),
  syllabusUrl: z.string().url('Syllabus URL must be valid').optional(),
  syllabusFileName: z.string().max(255, 'File name must be less than 255 characters').optional(),
  isActive: z.boolean().optional(),
});

// Admin lesson creation schema
export const createLessonSchema = insertLessonSchema.pick({
  title: true,
  description: true,
  videoUrl: true,
  duration: true,
  order: true,
  courseId: true,
  isActive: true,
});

// Admin exam creation schema
export const createExamSchema = z.object({
  courseId: z.string().uuid('معرف المادة يجب أن يكون صحيحاً'),
  title: z
    .string()
    .min(1, 'عنوان الاختبار مطلوب')
    .max(200, 'العنوان يجب أن يكون أقل من 200 حرف'),
  description: z
    .string()
    .min(1, 'وصف الاختبار مطلوب')
    .max(1000, 'الوصف يجب أن يكون أقل من 1000 حرف'),
  duration: z
    .number()
    .min(1, 'مدة الاختبار مطلوبة')
    .max(300, 'المدة يجب أن تكون أقل من 300 دقيقة'),
  passingGrade: z
    .number()
    .min(1, 'الدرجة المطلوبة للنجاح مطلوبة')
    .max(100, 'الدرجة يجب أن تكون بين 1 و 100')
    .transform(String),
  totalQuestions: z.number().default(0),
  isActive: z.boolean().default(true),
});

// Admin exam question creation schema
export const createExamQuestionSchema = z.object({
  examId: z.string().uuid('معرف الاختبار يجب أن يكون صحيحاً'),
  question: z
    .string()
    .min(1, 'نص السؤال مطلوب')
    .max(500, 'السؤال يجب أن يكون أقل من 500 حرف'),
  options: z
    .array(z.string().min(1, 'الخيار لا يمكن أن يكون فارغ'))
    .min(2, 'يجب أن يكون هناك خياران على الأقل')
    .max(6, 'لا يمكن أن يكون هناك أكثر من 6 خيارات'),
  correctAnswer: z.string().min(1, 'الإجابة الصحيحة مطلوبة'),
  order: z.number().min(1, 'ترتيب السؤال مطلوب'),
  points: z
    .number()
    .min(0.1, 'النقاط يجب أن تكون أكبر من 0')
    .max(10, 'النقاط يجب أن تكون أقل من أو تساوي 10')
    .default(1)
    .transform(String),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Live Sessions table for managing live streaming sessions
export const liveSessions = pgTable('live_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  instructor: varchar('instructor', { length: 255 }).notNull(),
  courseTitle: varchar('course_title', { length: 255 }),
  description: text('description'),
  scheduledTime: timestamp('scheduled_time').notNull(),
  duration: integer('duration').notNull().default(60), // duration in minutes
  isLive: boolean('is_live').default(false),
  meetingLink: varchar('meeting_link', { length: 500 }),
  level: varchar('level', { length: 100 }),
  createdBy: varchar('created_by').notNull(), // user ID who created the session
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = typeof liveSessions.$inferInsert;

// Diploma Templates table for customizable certificate templates
export const diplomaTemplates = pgTable('diploma_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(), // اسم الديبلوم
  level: varchar('level', { length: 100 }).notNull(), // المستوى (تحضيري، متوسط، إلخ)
  backgroundColor: varchar('background_color', { length: 50 }).default(
    '#ffffff'
  ),
  textColor: varchar('text_color', { length: 50 }).default('#000000'),
  borderColor: varchar('border_color', { length: 50 }).default('#d4af37'),
  logoUrl: varchar('logo_url', { length: 500 }),
  sealUrl: varchar('seal_url', { length: 500 }), // رابط ختم الجامعة
  institutionName: varchar('institution_name', { length: 255 })
    .notNull()
    .default('جامعة الإمام الزُّهري'),
  templateStyle: varchar('template_style', { length: 50 }).default('classic'), // classic, modern, elegant
  requirements: text('requirements'), // متطلبات الحصول على الشهادة
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type DiplomaTemplate = typeof diplomaTemplates.$inferSelect;
export type InsertDiplomaTemplate = typeof diplomaTemplates.$inferInsert;

// Certificate Images table for storing generated certificate images
export const certificateImages = pgTable('certificate_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificateId: uuid('certificate_id').notNull().references(() => certificates.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').notNull().references(() => diplomaTemplates.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
  generatedBy: varchar('generated_by').notNull(), // user ID who generated the image
  metadata: jsonb('metadata'), // Additional data about the generation
  createdAt: timestamp('created_at').defaultNow(),
});

export type CertificateImage = typeof certificateImages.$inferSelect;
export type InsertCertificateImage = typeof certificateImages.$inferInsert;

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
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
