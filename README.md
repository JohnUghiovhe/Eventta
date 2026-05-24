# Eventta — Event Ticketing Platform

Eventta (formerly Eventful) is a full-stack event ticketing and management platform. This README summarizes recent refactors and how to run, build, and test the project locally.

**Quick links:**
- Backend entry: [src/index.ts](src/index.ts#L1)
- Backend system messages: [src/utils/systemMessages.ts](src/utils/systemMessages.ts#L1)
- Frontend system messages: [frontend/src/utils/systemMessages.ts](frontend/src/utils/systemMessages.ts#L1)

**Highlights of recent changes**
- Rebranded project source to "Eventta" (all active source files).
- Restored a clean, virus-free `frontend/tailwind.config.js` and removed injected payloads.
- Centralized all user-facing text into shared system message files:
  - Backend: [src/utils/systemMessages.ts](src/utils/systemMessages.ts#L1)
  - Frontend: [frontend/src/utils/systemMessages.ts](frontend/src/utils/systemMessages.ts#L1)
- Implemented email verification-on-signup flow (backend verification token + frontend `/verify` landing page).
- Replaced hardcoded response strings in controllers and pages with `SYSTEM_MESSAGES` constants.
- Added robust global error handling and normalization using `AppError` and middleware:
  - Error helper: [src/utils/errors.ts](src/utils/errors.ts#L1)
  - Global middleware: [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts#L1)
- Fixed TypeScript config issues across backend and frontend to eliminate deprecation/warning messages.
- Added unit and integration tests for core utilities, responses, and the verification flow.
- Set Git behavior to avoid repeated merge commits from pulls: `git config pull.rebase true` (recommended).

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

# Build (TypeScript compile) and copy templates
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

Test coverage includes unit tests for utilities and services, model validation tests, and integration tests for API endpoints. New tests were added around system messages, error handling, and the verification flow.

**Verification / Email flow (how it works)**
- When a user registers the backend creates a verification token and sends a verification email using `src/services/email.service.ts`.
- Email content and subject lines are driven by `SYSTEM_MESSAGES.email.*` constants.
- The verification landing page is implemented in the frontend and expects a `token` query parameter; it calls the backend verify endpoint and redirects on success to `/dashboard?verified=true`.
- Frontend pages and toasts use `frontend/src/utils/systemMessages.ts` for copy.

**Global error handling**
- Validation and operational errors are wrapped in `AppError` and normalized by `src/middleware/errorHandler.ts` before being sent to clients.

**Security & configuration notes**
- Keep secrets out of source — use `.env` and `./.env.example` templates.
- Recommended Git setting to avoid merge commits when pulling remote changes:
```bash
git config pull.rebase true
```

**Where to look in code**
- Verification and auth controllers: [src/controllers/auth.controller.ts](src/controllers/auth.controller.ts#L1)
- Email service: [src/services/email.service.ts](src/services/email.service.ts#L1)
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
If you'd like, I can:
- split and stage the README changes into a commit for you, or
- regenerate the frontend `dist` and clear stale artifacts.

If you want me to commit the README update now, tell me and I'll prepare the commit commands.

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Redis (local or managed Redis)
- Git

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
