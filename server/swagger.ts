import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hadith Learning Platform API',
      version: '1.0.0',
      description: 'API documentation for the Hadith Learning Platform',
      contact: {
        name: 'API Support',
        email: 'support@hadithlearning.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        Exam: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique exam ID'
            },
            courseId: {
              type: 'string',
              format: 'uuid',
              description: 'Course ID'
            },
            title: {
              type: 'string',
              description: 'Exam title'
            },
            description: {
              type: 'string',
              description: 'Exam description'
            },
            duration: {
              type: 'number',
              description: 'Exam duration in minutes'
            },
            passingGrade: {
              type: 'string',
              description: 'Minimum grade required to pass (stored as string)'
            },
            totalQuestions: {
              type: 'number',
              description: 'Total number of questions'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the exam is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Exam creation date'
            }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique enrollment ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            courseId: {
              type: 'string',
              description: 'Course ID'
            },
            enrolledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Enrollment date'
            },
            progress: {
              type: 'number',
              description: 'Course progress percentage (0-100)'
            },
            isCompleted: {
              type: 'boolean',
              description: 'Whether the course is completed'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    security: [
      {
        sessionAuth: []
      }
    ]
  },
  apis: ['./server/routes.ts']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
