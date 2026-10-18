-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'PARTICIPANT' CHECK (role IN ('ADMIN', 'PARTICIPANT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('QUIZ', 'CODING', 'DEBUGGING', 'FINAL')),
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'OPEN', 'PAUSED', 'CLOSED')),
  points_per_question INTEGER DEFAULT 10,
  negative_marking BOOLEAN DEFAULT false,
  negative_percentage INTEGER DEFAULT 25,
  qualification_percent INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('QUIZ', 'CODING', 'DEBUGGING')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starter_code TEXT,
  reference_solution TEXT,
  language TEXT,
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  points INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Question options table (for quiz questions)
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  UNIQUE(question_id, order_index)
);

-- Test cases table (for coding questions)
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  UNIQUE(question_id, order_index)
);

-- Round attempts table
CREATE TABLE round_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED')),
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  UNIQUE(round_id, user_id)
);

-- Saved answers table (for quiz questions)
CREATE TABLE saved_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES round_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- Submissions table (for coding questions)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES round_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'ERROR')),
  execution_time_ms INTEGER,
  memory_used_kb INTEGER,
  UNIQUE(attempt_id, question_id)
);

-- Evaluations table (test case results)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL DEFAULT false,
  actual_output TEXT,
  error_message TEXT,
  execution_time_ms INTEGER,
  UNIQUE(submission_id, test_case_id)
);

-- Round results table
CREATE TABLE round_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  qualified BOOLEAN NOT NULL DEFAULT false,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_id, user_id)
);

-- Qualification decisions table
CREATE TABLE qualification_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qualified BOOLEAN NOT NULL,
  reason TEXT,
  decided_by UUID REFERENCES profiles(id),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_id, user_id)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_rounds_event_id ON rounds(event_id);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_questions_round_id ON questions(round_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_test_cases_question_id ON test_cases(question_id);
CREATE INDEX idx_round_attempts_round_id ON round_attempts(round_id);
CREATE INDEX idx_round_attempts_user_id ON round_attempts(user_id);
CREATE INDEX idx_saved_answers_attempt_id ON saved_answers(attempt_id);
CREATE INDEX idx_submissions_attempt_id ON submissions(attempt_id);
CREATE INDEX idx_evaluations_submission_id ON evaluations(submission_id);
CREATE INDEX idx_round_results_round_id ON round_results(round_id);
CREATE INDEX idx_round_results_user_id ON round_results(user_id);
CREATE INDEX idx_qualification_decisions_round_id ON qualification_decisions(round_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for events
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

-- RLS Policies for registrations
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create registrations" ON registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for rounds
CREATE POLICY "Anyone can view basic round info" ON rounds
  FOR SELECT USING (true);

-- RLS Policies for questions
CREATE POLICY "Anyone can view non-sensitive question info" ON questions
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = questions.round_id
      AND r.status = 'LOCKED'
    )
  );

-- RLS Policies for question options
CREATE POLICY "Anyone can view question options" ON question_options
  FOR SELECT USING (true);

-- RLS Policies for test cases
CREATE POLICY "Only admins can view all test cases" ON test_cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Participants can only view non-hidden test cases" ON test_cases
  FOR SELECT USING (
    NOT is_hidden AND
    EXISTS (
      SELECT 1 FROM questions q
      JOIN rounds r ON q.id = test_cases.question_id
      WHERE q.id = test_cases.question_id
      AND r.status = 'OPEN'
    )
  );

-- RLS Policies for round attempts
CREATE POLICY "Users can view own attempts" ON round_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all attempts" ON round_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can create own attempts" ON round_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts" ON round_attempts
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for saved answers
CREATE POLICY "Users can view own saved answers" ON saved_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = saved_answers.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own saved answers" ON saved_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = saved_answers.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own saved answers" ON saved_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = saved_answers.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

-- RLS Policies for submissions
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = submissions.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can create own submissions" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = submissions.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

-- RLS Policies for evaluations
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN round_attempts ra ON s.id = evaluations.submission_id
      WHERE s.id = evaluations.submission_id
      AND ra.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all evaluations" ON evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies for round results
CREATE POLICY "Anyone can view published results" ON round_results
  FOR SELECT USING (true);

-- RLS Policies for qualification decisions
CREATE POLICY "Anyone can view qualification decisions" ON qualification_decisions
  FOR SELECT USING (true);

-- RLS Policies for audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', '')),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PARTICIPANT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
