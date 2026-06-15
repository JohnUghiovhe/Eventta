import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const renderExternalUrl = process.env.RENDER_EXTERNAL_URL;
const apiBaseUrl = config.API_BASE_URL || renderExternalUrl;
const localBaseUrl = `http://localhost:${config.PORT || 5000}`;
const effectiveBaseUrl = (apiBaseUrl?.replace(/\/api\/?$/, '')) || (config.NODE_ENV === 
     'production'
  ? SYSTEM_MESSAGES.defaultApiBaseUrl
  : localBaseUrl);

const servers = [
  {
    url: effectiveBaseUrl,
    description: config.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
  }
];

if (config.NODE_ENV !== 'production') {
  servers.push(
    {
      url: SYSTEM_MESSAGES.defaultApiBaseUrl,
      description: 'Production Server'
    },
    {
      url: localBaseUrl,
      description: 'Local Development Server'
    }
  );
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: SYSTEM_MESSAGES.apiDocumentationTitle,
      version: '1.0.0',
      description: SYSTEM_MESSAGES.apiDocumentationDescription,
      contact: {
        name: SYSTEM_MESSAGES.supportName,
        email: SYSTEM_MESSAGES.supportEmail
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['Creator', 'Eventee'],
              example: 'Eventee'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Tech Conference 2026'
            },
            description: {
              type: 'string',
              example: 'Annual technology conference'
            },
            category: {
              type: 'string',
              enum: ['Music', 'Sports', 'Arts', 'Technology', 'Business', 'Food', 'Other'],
              example: 'Technology'
            },
            date: {
              type: 'string',
              format: 'date-time'
            },
            location: {
              type: 'string',
              example: 'Convention Center, Lagos'
            },
            price: {
              type: 'number',
              example: 5000
            },
            totalTickets: {
              type: 'number',
              example: 500
            },
            availableTickets: {
              type: 'number',
              example: 450
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              }
            },
            creator: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
              example: 'Published'
            }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            ticketNumber: {
              type: 'string',
              example: 'TKT-1234567890'
            },
            event: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            user: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Used', 'Cancelled', 'Expired'],
              example: 'Active'
            },
            qrCode: {
              type: 'string',
              example: 'data:image/png;base64,iVBORw0KG...'
            },
            purchaseDate: {
              type: 'string',
              format: 'date-time'
            },
            price: {
              type: 'number',
              example: 5000
            }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            reference: {
              type: 'string',
              example: 'ref_1234567890'
            },
            amount: {
              type: 'number',
              example: 5000
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Success', 'Failed'],
              example: 'Success'
            },
            user: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            event: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            paymentMethod: {
              type: 'string',
              example: 'card'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Events',
        description: 'Event management endpoints'
      },
      {
        name: 'Tickets',
        description: 'Ticket purchase and management endpoints'
      },
      {
        name: 'Payments',
        description: 'Payment processing and verification endpoints'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints'
      },
      {
        name: 'Notifications',
        description: 'Notification management endpoints'
      },
      {
        name: 'Health',
        description: 'API health check endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './dist/routes/*.js'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
