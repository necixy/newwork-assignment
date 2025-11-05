# HR Employee Profile Management System

A full-stack employee management application built with Next.js 16, Prisma, and TypeScript. Features role-based access control, absence request management, peer feedback with optional AI polishing, and a modern, professional UI.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation & Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
# Copy the example environment file
cp .env.example .env
```

3. **Set up the database:**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create database schema
npx prisma migrate dev

# Seed the database with demo data
npx prisma db seed
```

4. **Start the development server:**

```bash
npm run dev
```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Login Credentials

All demo users use the password: `password123`

**Manager Account:**

- Email: `alice.manager@example.com`
- Role: Can view all employees, approve/reject absence requests, access detailed employee profiles

**Employee Account:**

- Email: `bob.employee@example.com`
- Role: Can view own profile, submit absence requests, receive feedback

**Co-worker Account:**

- Email: `charlie.coworker@example.com`
- Role: Can view all employees, submit feedback to peers

## 🏗️ Architecture Decisions

### Tech Stack

- **Next.js 16 (App Router)**: Leveraging React Server Components and Server Actions for optimal performance and simplified data flow
- **Prisma ORM**: Type-safe database access with SQLite for development (easily portable to PostgreSQL for production)
- **TypeScript**: Full type safety across the application
- **Tailwind CSS v4**: Modern utility-first styling with gradient-rich professional UI
- **bcryptjs**: Secure password hashing for authentication

### Key Architectural Choices

#### 1. **Server Actions Over API Routes**

- Implemented direct server actions (`loginAction`, `requestAbsenceAction`, `submitFeedbackAction`, etc.) instead of traditional API routes
- **Benefits**: Reduced boilerplate, better TypeScript inference, automatic form handling, progressive enhancement support
- **Trade-off**: Less flexibility for external API consumers (acceptable for this use case)

#### 2. **Cookie-Based Authentication**

- Simple httpOnly cookies with 7-day expiration
- **Benefits**: Works without client-side JavaScript, automatic CSRF protection, simpler than JWT for server-rendered apps
- **Trade-off**: Not suitable for cross-domain or mobile apps (would need JWT/OAuth for those scenarios)

#### 3. **Role-Based Access Control (RBAC)**

- Three distinct roles: `MANAGER`, `EMPLOYEE`, `COWORKER`
- Role validation happens server-side in each action
- **Benefits**: Clear separation of concerns, easy to audit permissions
- **Implementation**: Each dashboard view conditionally renders based on role, server actions verify permissions before mutations

#### 4. **Co-located Server Actions**

- Actions are placed in the same directory as the pages that use them (`/app/dashboard/absenceAction.ts`, `/app/dashboard/feedbackAction.ts`)
- **Benefits**: Easier to navigate codebase, clear feature ownership
- **Alternative considered**: Global `/actions` directory (rejected for this smaller app)

#### 5. **SQLite for Development**

- Using SQLite with easy migration path to PostgreSQL
- **Benefits**: Zero-config setup, no external database required, fast for demos
- **Production ready**: Just change the datasource URL to PostgreSQL in production

#### 6. **Optional AI Feedback Polishing**

- Integrated HuggingFace Inference API for text summarization/polishing
- **Current State**: Fully implemented with environment variable configuration
- **Implementation**: Checkbox in feedback forms triggers API call when `HUGGINGFACE_API_TOKEN` is set
- **To Enable**: Get free token from [HuggingFace](https://huggingface.co/settings/tokens) and add to `.env` file
- **Graceful Fallback**: If token not configured or API fails, original text is preserved

#### 7. **Modern UI with Gradients**

- Professional interview-ready design with glass morphism effects, gradient backgrounds, and card-based layouts
- **Benefits**: Visually appealing, modern aesthetic, responsive design
- **Tailwind v4**: Using alpha version with `@import` syntax for latest features

## 📁 Project Structure

```
app/
├── dashboard/
│   ├── page.tsx              # Main dashboard with role-based views
│   ├── absenceAction.ts      # Server actions for absence requests
│   ├── feedbackAction.ts     # Server action for feedback submission
│   └── [id]/
│       ├── page.tsx          # Individual employee detail page (Manager only)
│       └── employeeActions.ts # Server actions for employee updates
├── login/
│   ├── page.tsx              # Login form
│   └── loginAction.ts        # Authentication server action
├── profile/
│   └── page.tsx              # Profile page with logout functionality
├── layout.tsx                # Root layout with metadata
└── globals.css               # Tailwind v4 imports and custom styles

prisma/
├── schema.prisma             # Database schema (Employee, Feedback, AbsenceRequest)
├── seed.ts                   # Demo data seeding script
└── migrations/               # Database migration history
```

## 🎯 Features

### Manager View

- Dashboard with key metrics (total employees, pending requests, recent feedback)
- Employee directory table with links to detailed profiles
- Absence request management with approve/reject functionality
- Individual employee detail pages with full profile editing
- View all feedback received by employees

### Employee View

- Personal profile card with contact information
- Absence request submission form with date picker
- View history of submitted absence requests with status
- View received feedback from peers
- Access to profile/logout

### Co-worker View

- Employee directory with all company employees
- Submit feedback to any employee
- Optional AI-powered feedback polishing (enable by adding HuggingFace API token to `.env`)
- View own submitted feedback

### Cross-Cutting Features

- Secure authentication with bcrypt password hashing
- Cookie-based session management
- Role-based access control enforced server-side
- Responsive design works on mobile/tablet/desktop
- Modern UI with gradient backgrounds and glass effects

## 🔐 Security Considerations

- Passwords hashed with bcrypt (10 salt rounds)
- HttpOnly cookies prevent XSS attacks on session tokens
- Server-side role validation on all mutations
- SQL injection prevented by Prisma parameterized queries
- Input validation on all form submissions

## 🛠️ What I'd Improve With More Time

### High Priority

1. **Enhanced Authentication**

   - Implement JWT-based authentication for better scalability
   - Add OAuth providers (Google, Microsoft SSO)
   - Session refresh tokens with automatic renewal
   - Password reset flow via email

2. **Testing Suite**

   - Unit tests for server actions with Jest
   - Integration tests for authentication flow
   - E2E tests with Playwright for critical user journeys
   - Component testing with React Testing Library

3. **Error Handling & Validation**
   - Comprehensive input validation with Zod schemas
   - User-friendly error messages with toast notifications
   - Form validation with real-time feedback
   - Error boundary components for graceful failures

### Medium Priority

4. **Database & Performance**

   - Migrate to PostgreSQL for production
   - Add database indexes for frequently queried fields
   - Implement connection pooling
   - Add caching layer (Redis) for frequently accessed data
   - Optimize Prisma queries with proper `select` and `include`

5. **UI/UX Enhancements**

   - Loading states and skeleton screens
   - Optimistic UI updates for better perceived performance
   - Toast notifications for success/error feedback
   - Date range picker for absence requests
   - Search and filter functionality in employee tables
   - Pagination for large datasets

6. **Feedback System Improvements**
   - Email notifications when feedback is received
   - Feedback categories/tags (e.g., teamwork, technical skills)
   - Anonymous feedback option
   - Feedback request workflow (request feedback from specific people)
   - Better AI integration with fine-tuned prompts or GPT-4 instead of summarization model

### Lower Priority

7. **Manager Features**

   - Bulk approval/rejection of absence requests
   - Generate reports (absence patterns, feedback summaries)
   - Calendar view for team absences
   - Employee performance analytics dashboard

8. **Employee Self-Service**

   - Upload profile picture
   - Update own contact information
   - View team calendar
   - Export personal data (GDPR compliance)

9. **Developer Experience**

   - Environment variable validation with type safety
   - Comprehensive API documentation
   - Storybook for component library
   - CI/CD pipeline with GitHub Actions
   - Docker containerization for easy deployment
   - Database seeding with Faker.js for more realistic data

10. **Accessibility & Internationalization**

    - WCAG 2.1 AA compliance
    - Keyboard navigation improvements
    - Screen reader optimization
    - Multi-language support (i18n)
    - RTL language support

11. **Monitoring & Observability**
    - Application monitoring with Sentry
    - Performance monitoring with Vercel Analytics
    - Structured logging
    - Audit trails for sensitive operations

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

npx prisma studio    # Open Prisma Studio (visual database editor)
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Create and apply migrations
npx prisma db seed   # Seed database with demo data
```

## 🔧 Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Optional: HuggingFace API Token for AI-powered feedback polishing
# Get your free token from: https://huggingface.co/settings/tokens
# HUGGINGFACE_API_TOKEN="hf_your_token_here"
```

**To Enable AI Feedback Polishing:**

1. Sign up for a free account at [HuggingFace](https://huggingface.co)
2. Generate an API token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Add the token to your `.env` file by uncommenting and replacing `hf_your_token_here`
4. Restart the development server

For production, replace with PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

## 📦 Database Schema

### Employee

- Personal info: name, email, position, phone, address
- Authentication: hashed password
- Role: MANAGER | EMPLOYEE | COWORKER
- Relations: authored feedback, received feedback, absence requests

### Feedback

- Text content (original and AI-polished)
- Author and receiver relationships
- Timestamp

### AbsenceRequest

- Start and end dates
- Status: PENDING | APPROVED | REJECTED
- Employee relationship
- Timestamp

## 🤝 Contributing

This is a demo project for NEWWORK assignment. For production use, please refer to the improvement section above.

## 📄 License

This project is for demonstration purposes only.
