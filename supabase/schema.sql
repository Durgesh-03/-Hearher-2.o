-- ═══════════════════════════════════════════════════════════════════════════
-- POSH Safety System — Full Database Schema
-- Supabase PostgreSQL + pgvector
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ─── Organizations ──────────────────────────────────────────────────────────
CREATE TABLE organizations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    logo_url      TEXT,
    policy_text   TEXT,
    settings      JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('employee', 'hr', 'icc', 'security');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    role          user_role DEFAULT 'employee',
    avatar_url    TEXT,
    department    TEXT,
    mfa_enabled   BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ─── Complaints ─────────────────────────────────────────────────────────────
CREATE TYPE complaint_type AS ENUM ('verbal', 'physical', 'cyber', 'quid_pro_quo');
CREATE TYPE complaint_status AS ENUM ('pending', 'investigating', 'resolved', 'closed');

CREATE TABLE complaints (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id         TEXT UNIQUE NOT NULL,
    org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
    complainant_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous    BOOLEAN DEFAULT FALSE,
    type            complaint_type NOT NULL,
    description     TEXT NOT NULL,
    date_of_incident DATE,
    time_of_incident TIME,
    location        TEXT,
    status          complaint_status DEFAULT 'pending',
    severity        INTEGER CHECK (severity BETWEEN 1 AND 10),
    assigned_icc_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ai_analysis     JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_complaints_org ON complaints(org_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_severity ON complaints(severity);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);

-- ─── Accused Responses ──────────────────────────────────────────────────────
CREATE TABLE accused_responses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id    UUID REFERENCES complaints(id) ON DELETE CASCADE,
    accused_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    statement       TEXT NOT NULL,
    counter_evidence JSONB DEFAULT '[]',
    witnesses       TEXT,
    deadline        TIMESTAMPTZ NOT NULL,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Complaint Evidence ─────────────────────────────────────────────────────
CREATE TABLE complaint_evidence (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id  UUID REFERENCES complaints(id) ON DELETE CASCADE,
    file_url      TEXT NOT NULL,
    file_type     TEXT NOT NULL,
    file_name     TEXT NOT NULL,
    uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Complaint Messages (Anonymous Chat) ────────────────────────────────────
CREATE TABLE complaint_messages (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id  UUID REFERENCES complaints(id) ON DELETE CASCADE,
    sender_type   TEXT CHECK (sender_type IN ('complainant', 'icc')) NOT NULL,
    sender_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    message       TEXT NOT NULL,
    sent_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_complaint ON complaint_messages(complaint_id, sent_at);

-- ─── Complaint Timeline ─────────────────────────────────────────────────────
CREATE TABLE complaint_timeline (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id  UUID REFERENCES complaints(id) ON DELETE CASCADE,
    event         TEXT NOT NULL,
    details       TEXT,
    actor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    occurred_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_complaint ON complaint_timeline(complaint_id, occurred_at);

-- ─── ICC Members ────────────────────────────────────────────────────────────
CREATE TYPE icc_role AS ENUM ('presiding', 'member', 'external');

CREATE TABLE icc_members (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    role          icc_role DEFAULT 'member',
    appointed_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- ─── Panic Alerts ───────────────────────────────────────────────────────────
CREATE TYPE alert_source AS ENUM ('panic', 'guardian', 'shake');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');

CREATE TABLE panic_alerts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    status        alert_status DEFAULT 'active',
    source        alert_source NOT NULL,
    message       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ
);

CREATE INDEX idx_panic_org_status ON panic_alerts(org_id, status);

-- ─── Panic Responses ────────────────────────────────────────────────────────
CREATE TABLE panic_responses (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id      UUID REFERENCES panic_alerts(id) ON DELETE CASCADE,
    responder_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    action        TEXT CHECK (action IN ('acknowledged', 'dispatched', 'resolved', 'escalated')) NOT NULL,
    notes         TEXT,
    responded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Guardian Sessions ──────────────────────────────────────────────────────
CREATE TYPE guardian_status AS ENUM ('active', 'checkedin', 'expired', 'escalated');

CREATE TABLE guardian_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    trusted_contacts JSONB DEFAULT '[]',
    status          guardian_status DEFAULT 'active',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    next_checkin    TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ
);

-- ─── Evidence Vault (Time-Capsule) ──────────────────────────────────────────
CREATE TABLE evidence_vault (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    file_type       TEXT NOT NULL,
    description     TEXT,
    linked_complaint UUID REFERENCES complaints(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Policy Embeddings (pgvector for RAG) ───────────────────────────────────
CREATE TABLE policy_embeddings (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    embedding     VECTOR(768) NOT NULL
);

CREATE INDEX idx_policy_embedding ON policy_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ─── Chatbot Conversations ──────────────────────────────────────────────────
CREATE TABLE chatbot_conversations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id    TEXT NOT NULL,
    role          TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    message       TEXT NOT NULL,
    sent_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chatbot_session ON chatbot_conversations(session_id, sent_at);

-- ─── Organization Ratings ───────────────────────────────────────────────────
CREATE TABLE organization_ratings (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id            UUID REFERENCES organizations(id) ON DELETE CASCADE,
    overall_score     DOUBLE PRECISION DEFAULT 0,
    response_time_avg DOUBLE PRECISION DEFAULT 0,
    resolution_rate   DOUBLE PRECISION DEFAULT 0,
    posh_compliant    BOOLEAN DEFAULT FALSE,
    badges            JSONB DEFAULT '[]',
    calculated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pulse Surveys ──────────────────────────────────────────────────────────
CREATE TABLE pulse_surveys (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    questions     JSONB NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pulse_responses (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id     UUID REFERENCES pulse_surveys(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    answers       JSONB NOT NULL,
    submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    message       TEXT NOT NULL,
    type          TEXT CHECK (type IN ('info', 'warning', 'success', 'alert')) DEFAULT 'info',
    link          TEXT,
    read          BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ─── Audit Logs ─────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        TEXT NOT NULL,
    details       JSONB DEFAULT '{}',
    ip_address    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(org_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC: Vector similarity search for RAG
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION match_policy_embeddings(
    query_embedding VECTOR(768),
    match_count INT DEFAULT 5,
    filter_org_id UUID DEFAULT NULL
)
RETURNS TABLE (content TEXT, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.content,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM policy_embeddings pe
    WHERE (filter_org_id IS NULL OR pe.org_id = filter_org_id)
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_self_read ON users FOR SELECT USING (auth.uid() = id);

-- Employees can read their own complaints
CREATE POLICY complaints_own_read ON complaints FOR SELECT
    USING (complainant_id = auth.uid() OR is_anonymous = FALSE);

-- HR/ICC can read all complaints in their org
CREATE POLICY complaints_hr_read ON complaints FOR SELECT
    USING (
        org_id IN (SELECT org_id FROM users WHERE id = auth.uid() AND role IN ('hr', 'icc'))
    );

-- Evidence: only complaint parties + ICC
CREATE POLICY evidence_read ON complaint_evidence FOR SELECT
    USING (
        complaint_id IN (
            SELECT id FROM complaints
            WHERE complainant_id = auth.uid()
            OR assigned_icc_id = auth.uid()
            OR org_id IN (SELECT org_id FROM users WHERE id = auth.uid() AND role = 'hr')
        )
    );

-- Notifications: own only
CREATE POLICY notifications_self ON notifications FOR ALL
    USING (user_id = auth.uid());

-- Evidence vault: own only
CREATE POLICY vault_self ON evidence_vault FOR ALL
    USING (user_id = auth.uid());
