/**
 * GET /api/setup — One-click database setup for HearHer demo
 *
 * Creates all tables, disables RLS for anon-key access, and seeds demo data.
 * Hit this endpoint once to make the entire app functional.
 *
 * ⚠️ DEMO ONLY — never use disabled RLS in production!
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, {
        db: { schema: 'public' },
        auth: { persistSession: false },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SQL Statements
// ═══════════════════════════════════════════════════════════════════════════

const CREATE_TABLES_SQL = `
-- Enable uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('employee', 'hr', 'icc', 'security');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
DO $$ BEGIN
    CREATE TYPE complaint_type AS ENUM ('verbal', 'physical', 'cyber', 'quid_pro_quo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM ('pending', 'investigating', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
DO $$ BEGIN
    CREATE TYPE icc_role AS ENUM ('presiding', 'member', 'external');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS icc_members (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    org_id        TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
    role          icc_role DEFAULT 'member',
    appointed_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- ─── Panic Alerts ───────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE alert_source AS ENUM ('panic', 'guardian', 'shake');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
DO $$ BEGIN
    CREATE TYPE guardian_status AS ENUM ('active', 'checkedin', 'expired', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
`;

const DISABLE_RLS_SQL = `
-- Disable RLS on all tables for demo
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
`;

// ═══════════════════════════════════════════════════════════════════════════
// Seed data
// ═══════════════════════════════════════════════════════════════════════════

/* eslint-disable @typescript-eslint/no-explicit-any */
async function seedData(supabase: any) {
    const results: string[] = [];

    const upsertTable = async (table: string, data: any, label: string) => {
        const { error } = await supabase.from(table).upsert(data as any, { onConflict: 'id' } as any);
        results.push(error ? `❌ ${label}: ${error.message}` : `✅ ${label}`);
    };

    // 1. Organization
    await upsertTable('organizations', {
        id: 'demo-org-001', name: 'Acme Corp India', logo_url: null,
        policy_text: 'Acme Corp is committed to providing a safe and respectful workplace for all employees under the POSH Act 2013.',
        settings: { theme: 'dark', notifications: true },
    }, 'Organization seeded');

    // 2. Users
    await upsertTable('users', [
        { id: 'demo-emp-001', org_id: 'demo-org-001', email: 'priya@acmecorp.in', name: 'Priya Sharma', role: 'employee', department: 'Engineering', mfa_enabled: false },
        { id: 'demo-hr-001', org_id: 'demo-org-001', email: 'hr@acmecorp.in', name: 'Anjali Mehta', role: 'hr', department: 'Human Resources', mfa_enabled: true },
        { id: 'demo-icc-001', org_id: 'demo-org-001', email: 'icc@acmecorp.in', name: 'Justice Raman', role: 'icc', department: 'Legal', mfa_enabled: true },
        { id: 'demo-sec-001', org_id: 'demo-org-001', email: 'security@acmecorp.in', name: 'Rajesh Kumar', role: 'security', department: 'Security', mfa_enabled: false },
        { id: 'icc-member-002', org_id: 'demo-org-001', email: 'meera@acmecorp.in', name: 'Meera Nair', role: 'icc', department: 'Legal', mfa_enabled: false },
        { id: 'icc-member-003', org_id: 'demo-org-001', email: 'sunita@acmecorp.in', name: 'Sunita Iyer', role: 'icc', department: 'Administration', mfa_enabled: false },
        { id: 'icc-external-001', org_id: 'demo-org-001', email: 'external@ngo.org', name: 'Dr. Kavitha Rao', role: 'icc', department: 'External (NGO)', mfa_enabled: false },
    ], '7 users seeded');

    // 3. Complaints
    await upsertTable('complaints', [
        {
            id: 'c-001', case_id: '#XK29M1', org_id: 'demo-org-001', complainant_id: 'demo-emp-001',
            is_anonymous: false, type: 'verbal',
            description: 'Repeated inappropriate comments about my appearance during team meetings. The accused has made comments like "you look too good for an engineer" multiple times in front of the entire team.',
            date_of_incident: '2026-02-10', time_of_incident: '10:30:00', location: 'Conference Room B, 3rd Floor',
            status: 'investigating', severity: 7, assigned_icc_id: 'demo-icc-001',
            ai_analysis: { sentiment: 'negative', severity_score: 7, category: 'verbal_harassment', keywords: ['inappropriate comments', 'appearance', 'public humiliation'], risk_level: 'high' },
        },
        {
            id: 'c-002', case_id: '#AB12C2', org_id: 'demo-org-001', complainant_id: null,
            is_anonymous: true, type: 'cyber',
            description: 'Receiving unwanted messages on internal chat platform late at night. The messages are suggestive in nature and continue despite being asked to stop.',
            date_of_incident: '2026-02-14', time_of_incident: '22:15:00', location: 'Online — Internal Chat',
            status: 'pending', severity: 6, assigned_icc_id: null,
            ai_analysis: { sentiment: 'distressed', severity_score: 6, category: 'cyber_harassment', keywords: ['unwanted messages', 'late night', 'suggestive'], risk_level: 'medium' },
        },
        {
            id: 'c-003', case_id: '#GH78K3', org_id: 'demo-org-001', complainant_id: 'demo-emp-001',
            is_anonymous: false, type: 'quid_pro_quo',
            description: 'Manager implied that upcoming promotion is contingent on attending a private dinner. When I declined, my project assignments were changed.',
            date_of_incident: '2026-01-28', time_of_incident: '16:00:00', location: "Manager's Office, 5th Floor",
            status: 'resolved', severity: 9, assigned_icc_id: 'demo-icc-001',
            ai_analysis: { sentiment: 'fearful', severity_score: 9, category: 'quid_pro_quo', keywords: ['promotion', 'contingent', 'retaliation'], risk_level: 'critical' },
        },
        {
            id: 'c-004', case_id: '#PQ45R4', org_id: 'demo-org-001', complainant_id: 'demo-emp-001',
            is_anonymous: false, type: 'physical',
            description: 'Colleague repeatedly invades my personal space, places hand on my shoulder despite being asked not to.',
            date_of_incident: '2026-02-17', time_of_incident: '14:30:00', location: 'Open Office Area, 2nd Floor',
            status: 'pending', severity: 5, assigned_icc_id: null,
            ai_analysis: { sentiment: 'uncomfortable', severity_score: 5, category: 'physical_harassment', keywords: ['personal space', 'unwanted touching'], risk_level: 'medium' },
        },
    ], '4 complaints seeded');

    // 4. Complaint Timeline
    await upsertTable('complaint_timeline', [
        { id: 't-1', complaint_id: 'c-001', event: 'created', details: 'Complaint filed by employee', actor_id: 'demo-emp-001', occurred_at: '2026-02-10T11:00:00Z' },
        { id: 't-2', complaint_id: 'c-001', event: 'ai_analyzed', details: 'AI flagged as High Severity (7/10), Verbal Harassment', actor_id: null, occurred_at: '2026-02-10T11:00:05Z' },
        { id: 't-3', complaint_id: 'c-001', event: 'hr_notified', details: 'HR notified via real-time alert', actor_id: null, occurred_at: '2026-02-10T11:00:10Z' },
        { id: 't-4', complaint_id: 'c-001', event: 'assigned', details: 'Case assigned to ICC Member Justice Raman', actor_id: 'demo-hr-001', occurred_at: '2026-02-11T09:30:00Z' },
        { id: 't-5', complaint_id: 'c-001', event: 'accused_notified', details: 'Accused notified — 10 day response window', actor_id: null, occurred_at: '2026-02-11T10:00:00Z' },
        { id: 't-6', complaint_id: 'c-001', event: 'investigating', details: 'ICC investigation started', actor_id: 'demo-icc-001', occurred_at: '2026-02-12T09:00:00Z' },
    ], '6 timeline events seeded');

    // 5. Panic Alerts
    await upsertTable('panic_alerts', [
        { id: 'pa-001', user_id: 'demo-emp-001', org_id: 'demo-org-001', latitude: 12.9716, longitude: 77.5946, status: 'active', source: 'panic', message: null, created_at: '2026-02-19T14:30:00Z' },
        { id: 'pa-002', user_id: 'demo-emp-001', org_id: 'demo-org-001', latitude: 12.9352, longitude: 77.6245, status: 'resolved', source: 'guardian', message: 'Guardian mode check-in missed', created_at: '2026-02-18T20:15:00Z', resolved_at: '2026-02-18T20:45:00Z' },
    ], '2 panic alerts seeded');

    // 6. Guardian Sessions
    await upsertTable('guardian_sessions', [{
        id: 'gs-001', user_id: 'demo-emp-001', org_id: 'demo-org-001', duration_minutes: 30,
        trusted_contacts: [{ name: 'Amma', phone: '+91 98765 43210', email: 'amma@email.com' }],
        status: 'active', started_at: '2026-02-19T21:00:00Z', next_checkin: '2026-02-19T21:30:00Z',
    }], '1 guardian session seeded');

    // 7. ICC Members
    await upsertTable('icc_members', [
        { id: 'icc-m-1', org_id: 'demo-org-001', user_id: 'demo-icc-001', role: 'presiding', appointed_at: '2025-06-01T00:00:00Z' },
        { id: 'icc-m-2', org_id: 'demo-org-001', user_id: 'icc-member-002', role: 'member', appointed_at: '2025-06-01T00:00:00Z' },
        { id: 'icc-m-3', org_id: 'demo-org-001', user_id: 'icc-member-003', role: 'member', appointed_at: '2025-06-01T00:00:00Z' },
        { id: 'icc-m-4', org_id: 'demo-org-001', user_id: 'icc-external-001', role: 'external', appointed_at: '2025-06-01T00:00:00Z' },
    ], '4 ICC members seeded');

    // 8. Org Rating
    await upsertTable('organization_ratings', {
        id: 'or-001', org_id: 'demo-org-001',
        overall_score: 4.2, response_time_avg: 2.5, resolution_rate: 0.85,
        posh_compliant: true, badges: ['POSH Certified', 'Fast Responder'],
    }, 'Org rating seeded');

    // 9. Pulse Survey
    await upsertTable('pulse_surveys', {
        id: 'ps-001', org_id: 'demo-org-001', title: 'Q1 2026 — Workplace Safety Pulse', is_active: true,
        questions: [
            { id: 'q1', text: 'How safe do you feel at work?', type: 'rating' },
            { id: 'q2', text: 'Are you aware of the POSH complaint process?', type: 'choice', options: ['Yes', 'No', 'Partially'] },
            { id: 'q3', text: 'Have you witnessed any inappropriate behavior?', type: 'choice', options: ['Yes', 'No'] },
            { id: 'q4', text: 'Suggestions to improve workplace safety?', type: 'text' },
        ],
    }, 'Pulse survey seeded');

    // 10. Notifications
    await upsertTable('notifications', [
        { id: 'n-1', user_id: 'demo-hr-001', title: 'New Complaint Filed', message: 'A verbal harassment complaint has been filed. Case #XK29M1.', type: 'alert', link: '/hr/cases/c-001', read: false },
        { id: 'n-2', user_id: 'demo-hr-001', title: 'ICC Response Pending', message: 'Case #AB12C2 awaiting ICC member assignment.', type: 'warning', link: '/hr/cases/c-002', read: false },
        { id: 'n-3', user_id: 'demo-emp-001', title: 'Case Update', message: 'Your case #XK29M1 has been assigned to an ICC member.', type: 'info', link: '/employee/complaints/c-001', read: true },
        { id: 'n-4', user_id: 'demo-sec-001', title: '🚨 Panic Alert!', message: 'Active panic alert from Building A, 3rd Floor. Respond immediately.', type: 'alert', link: '/security', read: false },
        { id: 'n-5', user_id: 'demo-emp-001', title: 'Case Resolved', message: 'Your case #GH78K3 has been resolved.', type: 'success', link: '/employee/complaints/c-003', read: true },
    ], '5 notifications seeded');

    // 11. Evidence Vault
    await upsertTable('evidence_vault', [
        { id: 'v-1', user_id: 'demo-emp-001', file_url: '/uploads/chat_screenshot_01.png', file_type: 'image/png', description: 'Screenshot of inappropriate chat messages', linked_complaint: 'c-001' },
        { id: 'v-2', user_id: 'demo-emp-001', file_url: '/uploads/voice_recording.mp3', file_type: 'audio/mp3', description: 'Voice recording from meeting', linked_complaint: null },
        { id: 'v-3', user_id: 'demo-emp-001', file_url: '/uploads/email_evidence.pdf', file_type: 'application/pdf', description: 'Email chain evidence', linked_complaint: 'c-003' },
    ], '3 evidence items seeded');

    return results;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ═══════════════════════════════════════════════════════════════════════════
// Handler
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
    const supabase = getSupabase();
    const log: string[] = [];

    try {
        // Step 1: Create tables via raw SQL
        const { error: createErr } = await supabase.rpc('exec_sql', { sql: CREATE_TABLES_SQL });
        if (createErr) {
            // rpc 'exec_sql' may not exist — try a different approach
            // Instead of raw SQL, we'll check if tables exist by querying them
            log.push(`⚠️ exec_sql RPC not available (${createErr.message}). Attempting direct table creation...`);

            // Try creating via REST — Supabase doesn't support DDL over REST,
            // so we'll try seeding and hope tables already exist or were created via SQL editor
            log.push('💡 Tables must be created via Supabase SQL Editor. Attempting to seed data...');
        } else {
            log.push('✅ All tables created successfully');
        }

        // Step 2: Disable RLS
        const { error: rlsErr } = await supabase.rpc('exec_sql', { sql: DISABLE_RLS_SQL });
        if (rlsErr) {
            log.push(`⚠️ Could not disable RLS via RPC (${rlsErr.message}). You may need to disable RLS manually in Supabase dashboard.`);
        } else {
            log.push('✅ RLS disabled on all tables');
        }

        // Step 3: Seed demo data
        const seedResults = await seedData(supabase);
        log.push(...seedResults);

    } catch (err) {
        log.push(`❌ Unexpected error: ${(err as Error).message}`);
    }

    return NextResponse.json({
        success: !log.some(l => l.startsWith('❌')),
        message: 'HearHer Database Setup',
        log,
        next_steps: [
            'If tables were not created automatically, paste the SQL from supabase/schema-simple.sql into the Supabase SQL Editor.',
            'Visit http://localhost:3000 to use the app.',
            'Sign in as Employee (priya@acmecorp.in), HR (hr@acmecorp.in), ICC (icc@acmecorp.in), or Security (security@acmecorp.in).',
        ],
    });
}
