-- Midan Database Schema
-- Run this migration to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk via webhook)
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- Clerk user ID
  email TEXT NOT NULL,
  name TEXT,
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),  -- Midan API key for extension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  raw_notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action items table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  assignees TEXT[] NOT NULL,
  task TEXT NOT NULL,
  due_type TEXT,
  due_raw TEXT,
  due_resolved DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'review', 'completed', 'cancelled')),
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  source JSONB,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rough notes table
CREATE TABLE rough_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX idx_rough_notes_meeting_id ON rough_notes(meeting_id);
CREATE INDEX idx_users_api_key ON users(api_key);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rough_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users see own profile" ON users
  FOR ALL USING (id = auth.uid()::text);

CREATE POLICY "Users see own meetings" ON meetings
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users see own action items" ON action_items
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users see own rough notes" ON rough_notes
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()::text
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
