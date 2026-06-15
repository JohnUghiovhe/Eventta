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
  auth: {
    userExists: 'User with this email already exists',
    registrationSuccess: 'Registration successful',
    registrationFailed: 'Registration failed',
    invalidCredentials: 'Invalid credentials',
    loginFailed: 'Login failed',
    loginSuccessful: 'Login successful',
    profileNotAuthenticated: 'User not authenticated',
    profileNotFound: 'User not found',
    profileFetchFailed: 'Failed to fetch profile',
    profileUpdateFailed: 'Failed to update profile',
    profileUpdateSuccess: 'Profile updated successfully'
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
