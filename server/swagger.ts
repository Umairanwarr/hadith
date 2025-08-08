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
