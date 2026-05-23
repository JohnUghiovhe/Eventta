import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import passport from './config/passport';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { Logger } from './utils/logger';
import { seedEvents } from './scripts/seed';
import { fixPaymentIndex } from './scripts/fixPaymentIndex';
import { swaggerSpec } from './config/swagger';
import { AppError } from './middleware/errorHandler';
import { SYSTEM_MESSAGES } from './utils/systemMessages';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration - must be before other middleware
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      SYSTEM_MESSAGES.defaultFrontendDeploymentUrl,
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow for now, log for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Preflight requests handler
app.options('*', cors(corsOptions));

// Increase request body size limit to handle base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport middleware
app.use(passport.initialize());

// Root endpoint
app.get('/', (_req, res) => {
  res.send(SYSTEM_MESSAGES.apiRunning);
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: SYSTEM_MESSAGES.backendRunning,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: SYSTEM_MESSAGES.apiDocumentationTitle,
  customfavIcon: '/favicon.ico'
}));

// Routes
app.use('/api', routes);

// Fallback for unmatched routes
app.use((_req, _res, next) => {
  next(new AppError(404, SYSTEM_MESSAGES.responses.notFoundResource));
});

// Error handler (must be last)
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Validate email configuration
    const emailConfig = EmailService.validateConfig();
    if (!emailConfig.valid) {
      Logger.warn('⚠️  Email service is not properly configured:', emailConfig.errors);
      Logger.warn('⚠️  Password reset and email notifications will not work');
    } else {
      Logger.info('✓ Email service configuration validated');
    }

    const shouldRunMaintenanceTasks = process.env.NODE_ENV !== 'production';

    if (shouldRunMaintenanceTasks) {
      // Fix any payment index issues
      await fixPaymentIndex();

      // Seed sample events
      await seedEvents();
    }

    // Start notification scheduler
    NotificationService.startScheduler();

    app.listen(PORT, () => {
      Logger.info(`🚀 Server is running on port ${PORT}`);
      Logger.info(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
