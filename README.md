# Eventta — Event Ticketing Platform

Eventta is a full-stack event ticketing and management platform with email/password and Google OAuth authentication. This README summarizes how to run, build, and test the project locally.

**Quick links:**
- Backend entry: [src/index.ts](src/index.ts#L1)
- Backend system messages: [src/utils/systemMessages.ts](src/utils/systemMessages.ts#L1)
- Frontend system messages: [frontend/src/utils/systemMessages.ts](frontend/src/utils/systemMessages.ts#L1)

**Project structure (short)**
```
Eventta/
├── src/                   # Backend TypeScript source
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/             # systemMessages.ts, errors.ts, helpers
│   └── index.ts
├── frontend/              # Vite + React frontend
│   ├── src/
│   └── tailwind.config.js
├── dist/                  # Compiled backend (artifacts)
├── coverage/              # Test coverage reports
├── package.json           # Backend scripts (see below)
└── frontend/package.json  # Frontend scripts (see below)
```

**Run & build commands**

Backend (root):
```bash
# Install deps (first time)
npm install

# Development (hot reload via nodemon + ts-node)
npm run dev

# Build (TypeScript compile)
npm run build

# Start production app (after build)
npm start
```

Frontend (inside `frontend`):
```bash
cd frontend
npm install

# Development (Vite)
npm run dev

# Production build
npm run build

# Preview production build (Vite)
npm run preview
```

Scripts from the repo:
- Backend scripts (see [package.json](package.json#L1)) include `dev`, `build`, `start`, `test`, `lint`, `format`.
- Frontend scripts (see [frontend/package.json](frontend/package.json#L1)) include `dev`, `build`, and `preview`.

**Testing**
```bash
# Run backend tests (root)
npm test

# Watch tests
npm run test:watch

# Run coverage
npm test -- --coverage
```

Test coverage includes unit tests for utilities and services, model validation tests, and integration tests for API endpoints.

**Authentication flow (how it works)**
- Users can register with email/password via `POST /api/auth/register`. On success, a JWT token is returned immediately — no email verification required.
- Returning users log in via `POST /api/auth/login` with email/password and receive a JWT token.
- Google OAuth is available via `GET /api/auth/google`. After successful authentication, the backend redirects to the frontend callback page with a JWT token.
- Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

**Global error handling**
- Validation and operational errors are wrapped in `AppError` and normalized by `src/middleware/errorHandler.ts` before being sent to clients.

**Security & configuration notes**
- Keep secrets out of source — use `.env` and `./.env.example` templates.
- Recommended Git setting to avoid merge commits when pulling remote changes:
```bash
git config pull.rebase true
```

**Where to look in code**
- Auth controllers (register, login, Google OAuth): [src/controllers/auth.controller.ts](src/controllers/auth.controller.ts#L1)
- Passport strategies (local, JWT, Google OAuth): [src/config/passport.ts](src/config/passport.ts#L1)
- Auth routes (including Google OAuth routes): [src/routes/auth.routes.ts](src/routes/auth.routes.ts#L1)
- User model (with Google OAuth fields): [src/models/User.ts](src/models/User.ts#L1)
- System messages (backend): [src/utils/systemMessages.ts](src/utils/systemMessages.ts#L1)
- System messages (frontend): [frontend/src/utils/systemMessages.ts](frontend/src/utils/systemMessages.ts#L1)
- Error helpers: [src/utils/errors.ts](src/utils/errors.ts#L1)
- Global error middleware: [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts#L1)

**Cleanup note**
Build artifacts under `dist/` and `coverage/` may contain older branding or generated text from pre-refactor builds. If you want everything regenerated and cleaned, remove those folders and rebuild:
```bash
rm -rf dist coverage
npm run build
cd frontend && npm run build
```

---

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Redis (local or managed Redis)
- Git
- Google Cloud Console account (for Google OAuth)

### Quick Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd eventta
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

The backend runs on http://localhost:5000 and frontend on http://localhost:5173

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars in production) | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack API secret key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No (OAuth disabled if missing) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No (OAuth disabled if missing) |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URI (see setup below) | No (but recommended) |
| `FRONTEND_URL` | Frontend URL for OAuth callbacks and CORS | Yes |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID (Web application type)
3. Add authorized redirect URIs:
   - **Development**: `http://localhost:5000/api/auth/google/callback`
   - **Production**: `https://your-backend-domain.com/api/auth/google/callback`
4. Copy the Client ID and Client Secret to your `.env`:
```dotenv
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Production callback URL

Replace `GOOGLE_CALLBACK_URL` with your deployed backend URL:
```dotenv
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
```

This must match **exactly** what you entered in Google Cloud Console as an authorized redirect URI. For Render deployments, the URL will be `https://<your-service-name>.onrender.com/api/auth/google/callback`. The backend redirects to `FRONTEND_URL/auth/callback?token=<jwt>` after successful authentication, so ensure `FRONTEND_URL` points to your deployed frontend.

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
- [x] Social authentication (Google)
- [ ] Ticket transfers
- [ ] Refund management
- [ ] Event reviews and ratings

## Acknowledgments

- Paystack for payment processing
- Redis for caching capabilities
- MongoDB for flexible data storage
- Google for extra authentication
- The Node.js and TypeScript communities

---
