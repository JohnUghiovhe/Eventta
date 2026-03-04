# Eventful - Event Ticketing Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.1-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-4.6-red.svg)](https://redis.io/)

Eventful is a comprehensive event ticketing and management platform that connects event creators with attendees. From concerts to sports events, Eventful provides a seamless experience for creating, discovering, and attending events.

## Features

### Core Features
- ✅ **Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Creators & Eventees)
- ✅ **Event Management**: Create, update, delete, and publish events with rich details, state/country selection, and smart scheduling
- ✅ **QR Code Tickets**: Automatic QR code generation for tickets with creator verification system
- ✅ **Payment Integration**: Paystack payment gateway with demo mode fallback and transaction validation
- ✅ **Flexible Reminders**: Customizable event reminders (1 hour to 2 weeks before event)
- ✅ **Ticket Verification**: Creators can verify and scan tickets at events in real-time
- ✅ **Dark Mode Theme**: Toggle between light and dark themes with localStorage persistence
- ✅ **Analytics Dashboard**: Comprehensive analytics for event creators with sales metrics
- ✅ **Social Media Sharing**: Easy event sharing on Facebook, Twitter, LinkedIn, WhatsApp
- ✅ **Real-time Notifications**: Toast notifications for payments, tickets, and events
- ✅ **Email Notifications**: Automated emails for tickets, reminders, and payment confirmations

### Technical Features
- ✅ **TypeScript**: Fully typed codebase for better development experience
- ✅ **Redis Caching**: Cache layer for improved performance
- ✅ **Rate Limiting**: Protect API endpoints from abuse
- ✅ **Unit & Integration Tests**: Comprehensive test coverage
- ✅ **Swagger UI**: Interactive API documentation with try-it-out functionality

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **MongoDB** - Database
- **Mongoose** - ODM
- **Redis** - Caching layer
- **Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS with dark mode support
- **React Query** - Server state management
- **React Hook Form** - Form state management
- **date-fns** - Date formatting and manipulation
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications
### Testing & Quality
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Prerequisites

- Node.js 18+ 
- MongoDB 5+
- Redis 6+
- Paystack account (for payments)
- Email service (Gmail, SendGrid, etc.)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd eventful
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eventful

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

5. **Start Redis**
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or use local Redis installation
redis-server
```

## Running the Application

### Backend Development Mode
```bash
npm run dev
```
Backend runs on `http://localhost:5000`

### Frontend Development Mode
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### Production Build
```bash
# Build backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm run preview
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Linting & Formatting
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## API Documentation

### 🚀 Interactive API Documentation (Swagger UI)

Explore and test all API endpoints through our interactive Swagger UI interface:

- **Local Development**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Production**: [https://eventful-api.onrender.com/api-docs](https://eventful-api-eeky.onrender.com)

**Features:**
- 📚 Complete endpoint documentation with request/response schemas
- 🔐 Built-in authentication testing
- 🎯 Try out API calls directly from the browser
- 📊 View all available parameters and response codes
- 💡 See example requests and responses

**Getting Started with Swagger:**
1. Visit the Swagger UI URL
2. Register/Login to get a JWT token
3. Click "Authorize" button at the top
4. Enter your token as: `Bearer <your_token>`
5. Test any endpoint directly in the browser

For a detailed guide on using Swagger UI, see [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

### 📖 Static Documentation

Full API documentation is also available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Start

1. **Register a User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "creator"
  }'
```

2. **Create an Event**
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Concert",
    "description": "A night of great music",
    "category": "concert",
    "venue": "National Stadium",
    "location": {
      "address": "123 Main St",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria"
    },
    "startDate": "2024-12-31T20:00:00Z",
    "endDate": "2024-12-31T23:59:00Z",
    "ticketPrice": 5000,
    "totalTickets": 1000,
    "status": "published"
  }'
```

3. **Purchase a Ticket**
```bash
# Initialize payment
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "EVENT_ID",
    "reminder": "1_day"
  }'

# After payment, verify
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "PAYMENT_REFERENCE"
  }'
```

## Project Structure

```
eventful/
├── src/
│   ├── config/           # Configuration files (DB, Redis, Passport)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── tests/           # Test files
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript
├── coverage/            # Test coverage reports
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── jest.config.js      # Jest configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Key Features Explained

### 1. Authentication & Authorization
- JWT-based authentication with secure token management
- Two user roles: **Creator** (event organizers) and **Eventee** (attendees)
- Protected routes with role-based access control (RBAC)
- Email verification and password reset

### 2. Event Management with Smart Features
- Creators can create, update, and delete events
- **State & Country Selection**: Pre-populated dropdowns for Nigerian states and international countries
- **Date/Time Validation**: Warning system if event times are set to midnight
- Rich event details including location, images, tags, and pricing
- Event status management (draft, published, cancelled, completed)
- Sample events auto-seeded on first startup

### 3. Dark Mode Theme System
- Toggle between light and dark modes
- **localStorage persistence** - theme preference saved across sessions
- System preference detection
- Comprehensive dark mode styling across all pages
- Smooth transitions between themes

### 4. Event Ticketing & QR Codes
- Automatic QR code generation upon ticket purchase
- QR codes contain encrypted ticket information with metadata
- Unique ticket numbering system (TKT-XXX-YYYY format)
- Flexible reminder settings per ticket

### 5. Payment Integration with Fallback
- **Paystack payment gateway** for secure transactions
- **Demo mode** when Paystack credentials not configured
- Enhanced error handling and user feedback
- Payment verification with automatic ticket issuance
- Transaction validation and duplicate payment prevention
- Real-time payment status updates

### 6. Ticket Verification System (Creator Dashboard)
- **Verify Tickets Page** for creators to scan/enter ticket numbers
- QR code scanning support
- Real-time ticket validation
- Mark tickets as used during event
- View verified ticket details (attendee info, status)
- Event selector and tickets summary sidebar

### 7. Streamlined Purchase Flow
- **Payment Success Notifications** on dashboard
- Auto-redirect to dashboard after successful payment
- Automatic cache invalidation for ticket visibility
- Green success banner confirmation message
- Invoice and receipt emails

### 8. Notification System
- Toast notifications for all user actions
- Flexible reminder periods (1 hour to 2 weeks)
- Automated email notifications for:
  - Welcome emails on registration
  - Ticket purchase confirmation
  - Event reminders
  - Payment confirmations
- Scheduled background job processing

### 9. Analytics & Insights
- Overall platform analytics for creators
- Event-specific performance metrics
- Ticket sales tracking and revenue reports
- Attendance rate calculations

### 10. Security & Performance
- **Rate Limiting**: Endpoint-specific limits for auth, payments, and general APIs
- **Redis Caching**: Reduced database queries for better performance
- **Input Validation**: Comprehensive server-side validation
- **Error Handling**: Graceful error messages and logging
- **MongoDB Index Optimization**: Sparse indexes to prevent duplicate key errors
- **TTL Indexes**: Auto-expire pending payments after 24 hours

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- helpers.test.ts

# Run tests with coverage
npm test -- --coverage
```

Test coverage includes:
- Unit tests for utilities and services
- Model validation tests
- Integration tests for API endpoints

## Documentation

Essential documentation for the project:

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints and examples
- **[DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)** - Step-by-step production deployment guide on Render
- **[SECURITY.md](./SECURITY.md)** - Security best practices and guidelines
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and recent changes
- **[.env.example](./.env.example)** - Backend environment configuration template
- **[frontend/.env.example](./frontend/.env.example)** - Frontend environment configuration template

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Redis (local or managed Redis)
- Git

### Quick Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd eventful
```

2. **Backend setup**
```bash
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

3. **Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

The backend runs on http://localhost:5000 and frontend on http://localhost:3000

For detailed deployment instructions, see [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md).

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with clear messages
4. Push to the branch
5. Open a Pull Request

For details on code style and development guidelines, refer to the relevant sections in this README and the source code.

## Security

For production deployments, ensure you:
- Use strong, unique `JWT_SECRET` (32+ characters)
- Never commit `.env` files to version control
- Use HTTPS in production
- Keep dependencies updated
- Follow guidelines in [SECURITY.md](./SECURITY.md)

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API help
- Review [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) for deployment issues
- See [SECURITY.md](./SECURITY.md) for security concerns
- Open a GitHub issue for bugs or feature requests

## Deployment

This project is production-ready and can be deployed on:
- **Render** (recommended) - See [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)
- Heroku, Railway, or other Node.js platforms

Estimated deployment time: **15-20 minutes**

---

- [ ] Payment webhook handling
- [ ] Multi-currency support
- [ ] Event categories management
- [ ] Advanced search and filtering
- [ ] Mobile applications (iOS & Android)
- [ ] Social authentication (Google, Facebook)
- [ ] Ticket transfers
- [ ] Refund management
- [ ] Event reviews and ratings

## Acknowledgments

- Paystack for payment processing
- Redis for caching capabilities
- MongoDB for flexible data storage
- The Node.js and TypeScript communities

---

Built with ❤️ for Altschool Assessment
