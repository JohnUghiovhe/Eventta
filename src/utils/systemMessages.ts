export const SYSTEM_MESSAGES = {
  appName: 'Eventta',
  apiName: 'Eventta API',
  apiRunning: 'Eventta API is running',
  backendRunning: 'Backend is running',
  apiDocumentationTitle: 'Eventta API Documentation',
  apiDocumentationDescription: 'Comprehensive API documentation for Eventta - an event management and ticketing platform',
  supportName: 'Eventta Support',
  supportEmail: 'support@eventta.com',
  defaultMongoUri: 'mongodb://localhost:27017/eventta',
  defaultFrontendUrl: 'http://localhost:3000',
  defaultApiBaseUrl: 'https://eventta-api.onrender.com',
  defaultFrontendDeploymentUrl: 'https://eventta-frontend.onrender.com',
  defaultEmailFrom: 'noreply@eventta.com',
  email: {
    welcomeSubject: 'Welcome to Eventta!',
    resetPasswordSubject: 'Reset your Eventta password',
    confirmationFooter: 'Eventta - Your Gateway to Amazing Events',
    qrCodeCid: 'qrcode@eventta'
  },
  responses: {
    success: 'Success',
    error: 'Error',
    created: 'Created',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    internalServerError: 'Internal Server Error',
    validationFailed: 'Validation failed',
    invalidToken: 'Invalid token',
    expiredToken: 'Token has expired',
    invalidOrExpiredToken: 'Invalid or expired token',
    duplicateResource: 'Resource already exists',
    notFoundResource: 'Resource not found',
    invalidRequest: 'Invalid request',
    paymentFailed: 'Payment processing failed',
    paymentVerificationFailed: 'Payment verification failed',
    notificationFailed: 'Notification delivery failed'
  }
};

export type SystemMessages = typeof SYSTEM_MESSAGES;