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
        Certificate: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique certificate ID'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who owns the certificate'
            },
            courseId: {
              type: 'string',
              format: 'uuid',
              description: 'Course ID associated with the certificate'
            },
            certificateNumber: {
              type: 'string',
              description: 'Unique certificate number'
            },
            issuedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Certificate issue date'
            },
            diplomaTemplateId: {
              type: 'string',
              format: 'uuid',
              description: 'Template ID used for the certificate'
            }
          }
        },
        CertificateImage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique certificate image ID'
            },
            certificateId: {
              type: 'string',
              format: 'uuid',
              description: 'Certificate ID this image belongs to'
            },
            templateId: {
              type: 'string',
              format: 'uuid',
              description: 'Template ID used for this image'
            },
            imageUrl: {
              type: 'string',
              description: 'URL path to the generated image'
            },
            generatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the image was generated'
            },
            generatedBy: {
              type: 'string',
              format: 'uuid',
              description: 'User ID who generated the image'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata for the certificate'
            }
          }
        },
        DiplomaTemplate: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique template ID'
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Title of the diploma template'
            },
            level: {
              type: 'string',
              maxLength: 100,
              description: 'Academic level of the diploma'
            },
            backgroundColor: {
              type: 'string',
              maxLength: 50,
              description: 'Background color hex code'
            },
            textColor: {
              type: 'string',
              maxLength: 50,
              description: 'Text color hex code'
            },
            borderColor: {
              type: 'string',
              maxLength: 50,
              description: 'Border color hex code'
            },
            logoUrl: {
              type: 'string',
              maxLength: 500,
              description: 'URL to the institution logo'
            },
            sealUrl: {
              type: 'string',
              maxLength: 500,
              description: 'URL to the university seal'
            },
            institutionName: {
              type: 'string',
              maxLength: 255,
              description: 'Name of the institution'
            },
            templateStyle: {
              type: 'string',
              maxLength: 50,
              description: 'Template style (classic, modern, elegant)'
            },
            requirements: {
              type: 'string',
              description: 'Requirements to obtain the certificate'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the template is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Template creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Template last update date'
            }
          }
        },
        CertificateGenerationRequest: {
          type: 'object',
          required: ['certificateId', 'templateId', 'canvasData'],
          properties: {
            certificateId: {
              type: 'string',
              format: 'uuid',
              description: 'Certificate ID to generate image for'
            },
            templateId: {
              type: 'string',
              format: 'uuid',
              description: 'Template ID to use for generation'
            },
            canvasData: {
              type: 'string',
              description: 'Base64 encoded canvas data for the certificate image'
            },
            certificateData: {
              type: 'object',
              description: 'Optional additional certificate data'
            }
          }
        },
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
        ExamQuestion: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique question ID'
            },
            examId: {
              type: 'string',
              format: 'uuid',
              description: 'Exam ID'
            },
            question: {
              type: 'string',
              description: 'Question text'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of answer choices'
            },
            correctAnswer: {
              type: 'string',
              description: 'The correct answer'
            },
            order: {
              type: 'number',
              description: 'Question order/sequence number'
            },
            points: {
              type: 'string',
              description: 'Points awarded for this question (stored as string)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Question creation date'
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
