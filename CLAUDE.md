# CreatorHub - Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Decisions](#architecture-decisions)
4. [Database Schema](#database-schema)
5. [Authentication Setup](#authentication-setup)
6. [User Flows](#user-flows)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)
9. [Current Status](#current-status)
10. [Important Notes](#important-notes)

---

## Project Overview

**CreatorHub** is a two-sided marketplace platform connecting content creators with local businesses (restaurants, cafes, etc.) for in-person freelance work.

### Core Concept

- **Content Creators**: Sign up, create profiles (public), apply for jobs
- **Business Owners**: Sign up, post job opportunities with specific dates/times
- **Job Flow**: Business owners post jobs → Creators apply → Business owners review profiles → Contact happens off-platform via creator's social media

### Key Features

- Public creator profiles (for discovery and SEO)
- Private job listings (only visible to signed-in creators)
- One-click job applications
- No in-platform messaging or payment systems
- Focus on local, in-person work with specific dates/times

---

## Tech Stack

### Frontend

- **Next.js 14+** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React** - UI library

### Backend

- **Next.js API Routes** - RESTful endpoints
- **Supabase** - PostgreSQL database
- **Clerk** - Authentication

### Key Libraries

- `@clerk/nextjs` - Authentication
- `@supabase/supabase-js` - Database client
- `svix` - Webhook verification
- `lucide-react` - Icons

---

## Architecture Decisions

### 1. API-First Approach ✅

**Decision**: Use API routes for all data operations, minimal RLS policies.

**Rationale**:

- Better maintenance and debugging
- Centralized business logic
- Easier to add complex validations
- Better for background jobs/webhooks
- Simpler than managing complex RLS policies

**Implementation**:

- All CRUD operations go through `/app/api/*` routes
- Use `supabaseAdmin` (service role) in API routes to bypass RLS
- Only ONE RLS policy: Public read access for `creator_profiles`

### 2. Clerk + Supabase Integration

**Decision**: Webhook-based sync, NOT full JWT integration.

**Why**:

- No need for client-side Supabase queries
- Simpler to implement and maintain
- Better control over data access
- Aligns with API-first approach

**How it works**:

```
User signs up in Clerk
    ↓
Clerk webhook triggers
    ↓
API creates user record in Supabase
    ↓
User completes onboarding
    ↓
Profile created in Supabase
    ↓
Clerk metadata updated
```

### 3. User Type Selection

**Decision**: One-time, permanent choice at signup.

**Options**:

- `creator` - Content creator profile
- `business` - Business owner profile

**Why permanent**: Prevents confusion, cleaner data model, clear identity.

### 4. Public vs Private Content

**Public**:

- Creator profiles (SEO, discovery, shareable links)
- Landing page, marketing content

**Private** (requires authentication):

- Job listings (only creators can view)
- Applications
- Dashboards

---

## Database Schema

### Tables Overview

1. `users` - Base user records (synced from Clerk)
2. `creator_profiles` - Creator-specific data
3. `business_profiles` - Business owner-specific data
4. `jobs` - Job postings
5. `applications` - Job applications

### Detailed Schema

#### users

```sql
- id: TEXT (Clerk user ID) PRIMARY KEY
- email: TEXT UNIQUE NOT NULL
- first_name: TEXT
- last_name: TEXT
- user_type: TEXT ('creator' | 'business' | NULL)
- onboarding_complete: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### creator_profiles

```sql
- id: UUID PRIMARY KEY
- user_id: TEXT UNIQUE (FK → users.id)
- username: TEXT UNIQUE NOT NULL (public display name)
- bio: TEXT (max 500 chars, optional)
- city: TEXT NOT NULL
- country: TEXT NOT NULL
- instagram_url: TEXT (optional)
- youtube_url: TEXT (optional)
- tiktok_url: TEXT (optional)
- other_url: TEXT (optional)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### business_profiles

```sql
- id: UUID PRIMARY KEY
- user_id: TEXT UNIQUE (FK → users.id)
- username: TEXT UNIQUE NOT NULL
- city: TEXT NOT NULL
- country: TEXT NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### jobs

```sql
- id: UUID PRIMARY KEY
- business_owner_id: TEXT (FK → users.id)
- title: TEXT NOT NULL
- description: TEXT NOT NULL
- business_name: TEXT NOT NULL (flexible - per job)
- city: TEXT NOT NULL
- country: TEXT NOT NULL
- job_date: DATE (nullable - can be set later)
- job_time: TIME (nullable - can be set later)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### applications

```sql
- id: UUID PRIMARY KEY
- job_id: UUID (FK → jobs.id)
- creator_id: TEXT (FK → users.id)
- applied_at: TIMESTAMP
- UNIQUE(job_id, creator_id) - one application per creator per job
```

### Relationships

- `users` → `creator_profiles` (1:1)
- `users` → `business_profiles` (1:1)
- `users` (business) → `jobs` (1:many)
- `users` (creator) → `applications` (1:many)
- `jobs` → `applications` (1:many)

### Indexes

All foreign keys, usernames, location fields, and date fields are indexed for performance.

---

## Authentication Setup

### Clerk Configuration

**Sign-In/Sign-Up**: Combined on single page `/sign-in`

**Environment Variables**:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

### Middleware (`middleware.ts`)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/api/webhooks(.*)',
  '/api/creators(.*)',
  '/',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

### JWT Template (Clerk Dashboard)

Name: `supabase`

Custom Claims:

```json
{
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "user_type": "{{user.public_metadata.user_type}}",
  "onboarding_complete": "{{user.public_metadata.onboarding_complete}}"
}
```

### Webhook Events

Subscribe to:

- `user.created` - Create user in Supabase
- `user.updated` - Update user in Supabase
- `user.deleted` - Delete user from Supabase

Endpoint: `/api/webhooks/clerk`

### Important: auth() is Async!

**Always use**:

```typescript
// Server Components
const { userId } = await auth();

// API Routes
const { userId, sessionClaims } = await auth();
```

---

## User Flows

### 1. Creator Sign-Up Flow

```
1. Visit site → Click "Get Started"
2. Clerk auth screen (sign up)
3. Webhook creates user record in Supabase
4. Redirect to /onboarding
5. Select user type: "Content Creator"
6. Fill form:
   - Username (unique, required)
   - Bio (optional, max 500 chars)
   - City, Country (required)
   - Social URLs: Instagram, YouTube, TikTok, Other (all optional)
7. Submit → Create creator_profile
8. Update users table (user_type='creator', onboarding_complete=true)
9. Update Clerk metadata
10. Redirect to creator dashboard
```

### 2. Business Owner Sign-Up Flow

```
1. Visit site → Click "Get Started"
2. Clerk auth screen (sign up)
3. Webhook creates user record in Supabase
4. Redirect to /onboarding
5. Select user type: "Business Owner"
6. Fill form:
   - Username (unique, required)
   - City, Country (required)
7. Submit → Create business_profile
8. Update users table (user_type='business', onboarding_complete=true)
9. Update Clerk metadata
10. Redirect to business dashboard
```

### 3. Job Posting Flow (Business Owner)

```
1. Business owner → Dashboard → "Post a Job"
2. Fill form:
   - Job title
   - Description
   - Business name (can be different per job)
   - Location (city, country)
   - Date & time (optional - can set later)
3. Submit → Create job record
4. Job appears in creators' job listings
```

### 4. Job Application Flow (Creator)

```
1. Creator → Browse jobs → Click "Apply"
2. One-click application (no form needed)
3. Application record created
4. Business owner sees creator in applications list
5. Business owner clicks through to creator profile
6. Business owner contacts creator via social media
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx (ClerkProvider wrapper)
│   ├── page.tsx (landing page)
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx (combined sign-in/sign-up)
│   ├── onboarding/
│   │   └── page.tsx (user type selection + forms)
│   ├── dashboard/
│   │   └── page.tsx (role-based dashboard)
│   ├── creators/
│   │   ├── page.tsx (public directory)
│   │   └── [username]/
│   │       └── page.tsx (individual creator profile)
│   ├── jobs/
│   │   ├── page.tsx (job listings - creators only)
│   │   └── [id]/
│   │       └── page.tsx (job detail)
│   └── api/
│       ├── webhooks/
│       │   └── clerk/
│       │       └── route.ts (Clerk webhook handler)
│       ├── user/
│       │   └── status/
│       │       └── route.ts (check onboarding status)
│       ├── onboarding/
│       │   └── complete/
│       │       └── route.ts (complete onboarding)
│       ├── creators/
│       │   └── route.ts (GET all creators - public)
│       ├── jobs/
│       │   ├── route.ts (GET jobs, POST job)
│       │   └── [id]/
│       │       ├── route.ts (GET, UPDATE, DELETE job)
│       │       └── applications/
│       │           └── route.ts (GET applications for job)
│       └── applications/
│           └── route.ts (POST apply, GET my applications)
├── components/
│   ├── navbar.tsx
│   └── ui/ (shadcn components)
├── lib/
│   ├── supabase.ts (supabaseClient, supabaseAdmin)
│   └── utils.ts (cn helper)
├── middleware.ts (Clerk auth)
├── tailwind.config.ts
├── components.json (shadcn config)
└── .env.local
```

---

## Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## Current Status

### ✅ Completed

- [x] Project architecture defined
- [x] Tech stack selected
- [x] Database schema designed and created
- [x] Supabase clients setup (`/lib/supabase.ts`)
- [x] Clerk authentication configured
- [x] Clerk webhook endpoint created
- [x] Middleware for route protection
- [x] JWT template with custom claims
- [x] Navbar component with authentication
- [x] Basic page structure (home, dashboard, creators)

### 🚧 In Progress

- [ ] Onboarding flow implementation
- [ ] API endpoints (all CRUD operations)
- [ ] Dashboard pages (creator & business)
- [ ] Creator directory with search/filter
- [ ] Job posting and application features

### 📋 To Do

- [ ] Creator profile page (public)
- [ ] Job listings page (creators only)
- [ ] Job detail page
- [ ] Applications management
- [ ] Profile edit functionality
- [ ] Email notifications
- [ ] Error handling and validation
- [ ] Loading states and optimistic UI
- [ ] Testing
- [ ] Deployment

---

## Important Notes

### 1. Database Design Decisions

**Why `job_date` and `job_time` are NULLABLE**:

- Business owners might post jobs before confirming exact date/time
- More flexibility for different job types
- Can be updated later

**Why `business_name` is in `jobs` table, not `business_profiles`**:

- One business owner might post for multiple businesses/clients
- More flexible
- Simpler onboarding
- Can add business profile fields later if needed

**Why `bio` is optional for creators**:

- Lower friction to get started
- Creators can add it later
- 500 character limit for conciseness

### 2. Authentication Patterns

**Server Components** (pages):

```typescript
export default async function MyPage() {
  const { userId } = await auth();
  // ...
}
```

**API Routes**:

```typescript
export async function GET() {
  const { userId, sessionClaims } = await auth();
  // Access userType: sessionClaims?.user_type
}
```

**Client Components**:

```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { isSignedIn, user } = useUser();
}
```

### 3. Supabase Client Usage

**Use `supabaseAdmin`** in:

- API routes (bypasses RLS)
- Webhooks
- Server actions needing full access

**Use `supabaseClient`** for:

- Public reads (respects RLS)
- Client-side operations (if needed)

### 4. Privacy & Data Access

**Public Data**:

- Creator profiles (username, bio, city, country, social URLs)
- Landing page content

**Private Data**:

- Email addresses
- First/Last names
- Job listings (creators only)
- Applications
- User IDs

### 5. Username vs Display Name

- **Creators**: Use `username` publicly (e.g., @johndoe)
- **First/Last name**: Stored but not displayed publicly
- **Business owners**: Use `username` for account, `business_name` for job posts

### 6. Application Status

**Simple approach**: Only "applied" status

- No pending/rejected/accepted workflow
- Business owners contact creators directly
- Less complexity, faster MVP

### 7. Contact Flow

All contact happens **off-platform**:

- Creators provide social media links
- Business owners reach out via Instagram/TikTok/YouTube DMs
- Platform focuses on discovery and matching only

### 8. Location Handling

- City and country are required for all users
- Jobs also have city/country
- Future: Can add filtering by location
- Consider: Address fields for specific job locations

---

## API Endpoint Patterns

### Authentication Check

```typescript
const { userId, sessionClaims } = await auth();

if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Role-Based Access

```typescript
const userType = sessionClaims?.user_type;

if (userType !== 'business') {
  return NextResponse.json(
    { error: 'Only business owners can perform this action' },
    { status: 403 }
  );
}
```

### Supabase Queries

```typescript
// Create
const { data, error } = await supabaseAdmin
  .from('table_name')
  .insert({ ... })
  .select()
  .single();

// Read
const { data, error } = await supabaseAdmin
  .from('table_name')
  .select('*')
  .eq('field', value);

// Update
const { data, error } = await supabaseAdmin
  .from('table_name')
  .update({ ... })
  .eq('id', id);

// Delete
const { data, error } = await supabaseAdmin
  .from('table_name')
  .delete()
  .eq('id', id);
```

---

## Common Issues & Solutions

### Issue: Tailwind not working after shadcn install

**Solution**: Check that:

- `@tailwind` directives are at top of `globals.css`
- CSS variables are defined in `globals.css`
- `tailwind.config.ts` has correct content paths
- `tailwindcss-animate` is installed
- Dev server restarted after changes

### Issue: `auth()` TypeScript errors

**Solution**:

- Make function `async`
- Use `await auth()` not `auth()`
- Clerk v5+ requires async/await

### Issue: Webhook not triggering

**Solution**:

- Check webhook URL is correct in Clerk dashboard
- Verify `CLERK_WEBHOOK_SECRET` in `.env.local`
- Use ngrok for local testing
- Check webhook logs in Clerk dashboard

### Issue: Supabase queries failing

**Solution**:

- Verify you're using `supabaseAdmin` for API routes
- Check foreign key relationships
- Ensure user exists before creating profile
- Check Supabase logs for detailed errors

---

## Testing Checklist

### Authentication Flow

- [ ] Sign up new user
- [ ] Verify user created in Supabase
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Protected routes redirect to sign-in
- [ ] Public routes accessible without auth

### Onboarding Flow

- [ ] User type selection works
- [ ] Creator form validation
- [ ] Business form validation
- [ ] Username uniqueness check
- [ ] Profile created successfully
- [ ] Redirect to correct dashboard
- [ ] Can't access onboarding if already completed

### Creator Features

- [ ] Profile appears in directory
- [ ] Profile is publicly viewable
- [ ] Can view job listings
- [ ] Can apply to jobs
- [ ] Can't apply twice to same job
- [ ] Can view own applications

### Business Owner Features

- [ ] Can create job post
- [ ] Job appears in listings
- [ ] Can view applications for own jobs
- [ ] Can't view other business owners' applications
- [ ] Can view creator profiles from applications

---

## Future Enhancements (Post-MVP)

### Phase 2

- Search and filter creators by category, location
- Filter jobs by location, date, category
- Profile edit functionality
- Email notifications (job posted, application received)
- Application history with dates
- Job expiry (auto-close after date passes)

### Phase 3

- Creator categories/tags
- Featured profiles/jobs
- Save/bookmark jobs
- "Mark as hired" status
- Analytics for business owners
- Review/rating system

### Phase 4

- Mobile app (React Native)
- Advanced matching algorithm
- In-platform messaging (optional)
- Payment integration (optional)
- Portfolio gallery for creators
- Team accounts for businesses

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Add shadcn component
npx shadcn@latest add [component-name]

# Initialize shadcn
npx shadcn@latest init

# Run Supabase migrations (if using)
npx supabase db push
```

---

## Deployment Notes

### Environment Setup

- Add all env variables to hosting platform
- Set up Clerk production project
- Set up Supabase production project
- Update webhook URLs to production domain

### Database Migration

- Run SQL schema in production Supabase
- Test with sample data
- Set up database backups

### Clerk Configuration

- Update allowed domains
- Update redirect URLs to production
- Configure webhook with production URL
- Test authentication flow

---

## Questions to Ask When Extending

Before adding new features, consider:

1. **Does this need to be in the database?**

   - Will it be queried/filtered?
   - Does it need to persist?

2. **Should this be an API route or client-side?**

   - Does it need server-side logic?
   - Does it modify data?
   - Does it need authentication?

3. **Is this data public or private?**

   - Who should see it?
   - Do we need RLS or API protection?

4. **Does this need real-time updates?**

   - Or is periodic fetch enough?
   - Consider performance implications

5. **What's the error handling?**
   - What if user doesn't exist?
   - What if uniqueness constraint fails?
   - What's the user-friendly error message?

---

## Contact & Support

If you need help understanding this project or building features:

1. Read this document thoroughly
2. Check the current status section
3. Review the API endpoint patterns
4. Look at existing similar features
5. Follow the established patterns and conventions

Remember: This project prioritizes **simplicity, maintainability, and clear user flows** over complex features. When in doubt, choose the simpler approach.

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: In Development
