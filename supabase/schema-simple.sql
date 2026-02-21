-- ═══════════════════════════════════════════════════════════════════════════
-- HearHer POSH Safety System — Simplified Schema for Demo
-- Paste this ENTIRE file into Supabase SQL Editor and run it.
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ──────────────────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('employee', 'hr', 'icc', 'security'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE complaint_type AS ENUM ('verbal', 'physical', 'cyber', 'quid_pro_quo'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE complaint_status AS ENUM ('pending', 'investigating', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE alert_source AS ENUM ('panic', 'guardian', 'shake'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE guardian_status AS ENUM ('active', 'checkedin', 'expired', 'escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE icc_role AS ENUM ('presiding', 'member', 'external'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Organizations ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name          TEXT NOT NULL,
    logo_url      TEXT,
    policy_text   TEXT,
    settings      JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    org_id        TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    role          user_role DEFAULT 'employee',
    avatar_url    TEXT,
    department    TEXT,
    mfa_enabled   BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Complaints ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
    id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    case_id         TEXT UNIQUE NOT NULL,
    org_id          TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    complainant_id  TEXT,
    is_anonymous    BOOLEAN DEFAULT FALSE,
    type            complaint_type NOT NULL,
    description     TEXT NOT NULL,
    date_of_incident DATE,
    time_of_incident TIME,
    location        TEXT,
    status          complaint_status DEFAULT 'pending',
    severity        INTEGER CHECK (severity BETWEEN 1 AND 10),
    assigned_icc_id TEXT,
    ai_analysis     JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Complaint Timeline ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaint_timeline (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    complaint_id  TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    event         TEXT NOT NULL,
    details       TEXT,
    actor_id      TEXT,
    occurred_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Complaint Evidence ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaint_evidence (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    complaint_id  TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    file_url      TEXT NOT NULL,
    file_type     TEXT NOT NULL,
    file_name     TEXT NOT NULL,
    uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Complaint Messages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaint_messages (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    complaint_id  TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    sender_type   TEXT CHECK (sender_type IN ('complainant', 'icc')) NOT NULL,
    sender_id     TEXT,
    message       TEXT NOT NULL,
    sent_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Accused Responses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accused_responses (
    id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    complaint_id    TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    accused_id      TEXT,
    statement       TEXT NOT NULL,
    counter_evidence JSONB DEFAULT '[]',
    witnesses       TEXT,
    deadline        TIMESTAMPTZ NOT NULL,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ICC Members ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS icc_members (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    org_id        TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
    role          icc_role DEFAULT 'member',
    appointed_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- ─── Panic Alerts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panic_alerts (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
    org_id        TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    status        alert_status DEFAULT 'active',
    source        alert_source NOT NULL,
    message       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ
);

-- ─── Panic Responses ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panic_responses (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    alert_id      TEXT REFERENCES panic_alerts(id) ON DELETE CASCADE,
    responder_id  TEXT,
    action        TEXT CHECK (action IN ('acknowledged', 'dispatched', 'resolved', 'escalated')) NOT NULL,
    notes         TEXT,
    responded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Guardian Sessions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guardian_sessions (
    id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id         TEXT REFERENCES users(id) ON DELETE CASCADE,
    org_id          TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    trusted_contacts JSONB DEFAULT '[]',
    status          guardian_status DEFAULT 'active',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    next_checkin    TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ
);

-- ─── Evidence Vault ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_vault (
    id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id         TEXT REFERENCES users(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    file_type       TEXT NOT NULL,
    description     TEXT,
    linked_complaint TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chatbot Conversations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id       TEXT,
    session_id    TEXT NOT NULL,
    role          TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    message       TEXT NOT NULL,
    sent_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Organization Ratings ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_ratings (
    id                TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    org_id            TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    overall_score     DOUBLE PRECISION DEFAULT 0,
    response_time_avg DOUBLE PRECISION DEFAULT 0,
    resolution_rate   DOUBLE PRECISION DEFAULT 0,
    posh_compliant    BOOLEAN DEFAULT FALSE,
    badges            JSONB DEFAULT '[]',
    calculated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pulse Surveys ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pulse_surveys (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    org_id        TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    questions     JSONB NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pulse_responses (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    survey_id     TEXT REFERENCES pulse_surveys(id) ON DELETE CASCADE,
    user_id       TEXT,
    answers       JSONB NOT NULL,
    submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id       TEXT,
    title         TEXT NOT NULL,
    message       TEXT NOT NULL,
    type          TEXT CHECK (type IN ('info', 'warning', 'success', 'alert')) DEFAULT 'info',
    link          TEXT,
    read          BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    org_id        TEXT,
    user_id       TEXT,
    action        TEXT NOT NULL,
    details       JSONB DEFAULT '{}',
    ip_address    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Disable RLS on ALL tables (demo only!)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl);
    END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! Now visit http://localhost:3000/api/setup to seed demo data.
-- ═══════════════════════════════════════════════════════════════════════════
