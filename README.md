# CodeBattle

A full-stack coding competition platform built with Next.js, Supabase, and TypeScript. Features multiple competition rounds including quiz battles, coding challenges, debugging tasks, and a final championship round.

## Features

### Participant Portal
- User registration and authentication with Supabase Auth
- Four-round competition system:
  - **Quiz Battle**: Multiple-choice questions with automatic grading
  - **Coding Battle**: Programming problems with code editor
  - **Debugging Battle**: Find and fix bugs in starter code
  - **Final Battle**: Advanced programming challenges for finalists
- Real-time countdown timers
- Answer saving and submission
- Personal scores and qualification status
- Live leaderboard

### Admin Portal
- Admin-only access (server-side verified)
- Round management (open, pause, close rounds)
- **Question Manager**: Create, edit, and delete quiz questions
- **AI Question Generation**: Generate questions from documents or YouTube videos (requires OpenAI API key)
- View participants and their submissions
- Calculate results and determine qualifiers
- Configurable qualification percentage
- Audit logging for administrative actions

### Security
- Row Level Security (RLS) on all Supabase tables
- Server-side role verification for all protected operations
- Hidden test cases and correct answers inaccessible to participants
- Zod validation for all API inputs
- Idempotent submission handling

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js Route Handlers
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Code Editor**: Monaco Editor
- **Code Execution**: Judge0 API (optional, demo mode available)
- **Validation**: Zod

## Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier works)
- Judge0 API key (optional, for real code execution)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd codebattle
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Go to Project Settings > Database
5. Navigate to the SQL Editor
6. Run the migration files in order:

```sql
-- Run supabase/migrations/001_initial_schema.sql
-- Run supabase/migrations/002_seed_data.sql
-- Run supabase/migrations/003_fix_role_trigger.sql
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional - for real code execution
JUDGE0_API_URL=https://emkc.org/api/v2/piston
JUDGE0_API_KEY=your_judge0_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Get the service role key from Supabase Project Settings > API (scroll down to "service_role" - this has admin privileges).

### 4. Bootstrap the First Admin User

**Recommended Method (API-based):**

1. Register a user account through the app at `/auth/register`
2. Login with that account
3. Run this command in your terminal (replace with your email):

```bash
curl -X POST http://localhost:3000/api/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

**Alternative Method (SQL):**

1. Register a user account through the app at `/auth/register`
2. Run the SQL in `supabase/bootstrap_admin.sql` in the Supabase SQL Editor
3. Replace `'admin@example.com'` with your email

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Instructions

### As a Participant

1. **Register**: Go to `/auth/register` and create an account
2. **Login**: Sign in at `/auth/login`
3. **View Dashboard**: See available rounds and your progress
4. **Start Quiz Battle**: Click "Start Round" on the Quiz Battle card
5. **Answer Questions**: Select answers for multiple-choice questions
6. **Submit**: Click "Submit" when done or wait for the timer
7. **View Results**: See your score on the dashboard
8. **Check Leaderboard**: View top performers

### As an Admin

1. **Login** with your admin account
2. **Access Admin Portal**: Click "Admin Portal" button on the dashboard
3. **Manage Rounds**:
   - Click "Open" to make a round available to participants
   - Click "Pause" to temporarily stop a round
   - Click "Close" to end a round
4. **View Participants**: See all registered participants
5. **Monitor Attempts**: View recent submission attempts
6. **Calculate Results**: Click "Calculate Results" to:
   - Compute scores for all submitted attempts
   - Determine qualifiers based on configured percentage
   - Update the leaderboard
7. **View Leaderboard**: See ranked results with qualification status

## Database Schema

The application uses the following tables:

- `profiles`: User profiles with roles (ADMIN/PARTICIPANT)
- `events`: Competition events
- `registrations`: Event registrations
- `rounds`: Competition rounds with status and configuration
- `questions`: Quiz and coding questions
- `question_options`: Multiple-choice options for quiz questions
- `test_cases`: Test cases for coding questions (hidden from participants)
- `round_attempts`: User attempts at rounds
- `saved_answers`: Saved quiz answers
- `submissions`: Code submissions for coding questions
- `evaluations`: Test case evaluation results
- `round_results`: Calculated results and rankings
- `qualification_decisions`: Qualification decisions with reasons
- `audit_logs`: Administrative action logs

All tables have Row Level Security enabled with appropriate policies.

## API Routes

- `GET/POST /api/rounds` - Get and update round status
- `POST /api/attempts` - Start or submit round attempts
- `GET /api/questions` - Get questions for a round
- `POST /api/answers` - Save quiz answers
- `POST /api/submissions` - Submit code solutions
- `GET /api/leaderboard` - Get leaderboard
- `POST /api/admin/calculate-results` - Calculate results (admin only)

## Code Execution

The application supports two modes:

### Demo Mode (Default)
- Code is saved but not executed
- Suitable for testing without Judge0 credentials
- Clearly labeled in the UI

### Judge0 Mode
- Real code execution via Judge0 API
- Requires `JUDGE0_API_URL` and `JUDGE0_API_KEY` in `.env.local`
- Executes code and returns actual results

## Build for Production

```bash
npm run build
npm start
```

## Test Results

- ✅ TypeScript compilation: Passed
- ✅ Build: Successful
- ✅ Linting: Passed (with disabled rules for rapid development)
- ⚠️ Judge0 integration: Not tested (requires API credentials)
- ⚠️ End-to-end testing: Manual testing required

## Implemented Features

### Completed
- ✅ User authentication and registration
- ✅ Role-based access control (ADMIN/PARTICIPANT)
- ✅ Four-round competition system
- ✅ Quiz battle with multiple-choice questions
- ✅ Coding battle with Monaco editor
- ✅ Debugging battle with starter code
- ✅ Final battle for advanced challenges
- ✅ Real-time countdown timers
- ✅ Answer saving and submission
- ✅ Automatic quiz grading with negative marking
- ✅ Admin round controls (open/pause/close)
- ✅ Result calculation and qualification
- ✅ Leaderboard with rankings
- ✅ Row Level Security on all tables
- ✅ Server-side validation with Zod
- ✅ Audit logging for admin actions
- ✅ Judge0 integration (demo mode available)
- ✅ Responsive UI with Tailwind CSS

### Not Implemented
- ❌ Email verification for registration
- ❌ Password reset functionality
- ❌ Real-time notifications
- ❌ Code execution time limits (enforced on server)
- ❌ Memory limits for code execution
- ❌ Advanced question editor UI (admin creates questions via SQL)
- ❌ File upload for test cases
- ❌ Multi-language support
- ❌ Dark mode toggle

## Missing Credentials

The following credentials are required for full functionality but not provided:

- **Supabase credentials**: Must be set up by the user
- **Judge0 API key**: Optional, for real code execution

## Troubleshooting

### Build Fails with "dynamic is not compatible with cacheComponents"
- Remove `cacheComponents: true` from `next.config.ts` (already done in this version)

### Middleware Warning
- The middleware warning is a deprecation notice in Next.js 16
- The current middleware implementation still works correctly
- Can be migrated to the new proxy system when ready

### Supabase Connection Issues
- Verify your `.env.local` has correct Supabase URL and keys
- Ensure you've run the SQL migrations in Supabase
- Check that RLS policies are correctly set up

### Admin Bootstrap Fails
- Ensure the user exists in Supabase Auth
- Verify the email matches exactly
- Check that SUPABASE_SERVICE_ROLE_KEY is set correctly

### Admin Portal Button Not Showing
- Check that your user's role is set to 'ADMIN' in the profiles table
- Run the bootstrap admin API endpoint: `POST /api/bootstrap-admin`
- Verify with SQL: `SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';`

### "Failed to start attempt" Error
- Ensure you have a profile in the profiles table
- Run migration 003_fix_role_trigger.sql to fix the profile creation trigger
- Verify the round status is 'OPEN': `SELECT * FROM rounds WHERE name = 'Quiz Battle';`
- Check browser console for detailed error messages

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.

**Quick Fix Guide**: If you're experiencing issues with the admin portal button or "Failed to start attempt" error, see `SETUP_GUIDE.md` for step-by-step solutions.
