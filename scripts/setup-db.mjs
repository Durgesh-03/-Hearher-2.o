/**
 * Setup script — Creates tables in Supabase and seeds demo data.
 * Run: node scripts/setup-db.mjs
 */

const SUPABASE_URL = 'https://jndelqjdcsuoixfcjucv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9s-fjJFyTY7x0OuWgKZBCQ_2_K00CKm';

// Read the SQL file
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = resolve(__dirname, '..', 'supabase', 'schema-simple.sql');

async function runSQL(sql) {
    // Try the Supabase REST SQL endpoint (requires service_role key or superuser, anon can't do DDL)
    // But we'll try the /rest/v1/rpc approach or direct pg connection

    // Supabase exposes a sql endpoint at /pg/query for project admins
    // Since anon key may not work for DDL, we'll try the query endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
        body: JSON.stringify({ sql }),
    });

    if (!res.ok) {
        const text = await res.text();
        return { error: text, status: res.status };
    }
    return { data: await res.json() };
}

async function seedData() {
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal,resolution=merge-duplicates',
    };

    const post = async (table, data) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal,resolution=merge-duplicates' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const text = await res.text();
            console.log(`  ❌ ${table}: ${res.status} — ${text}`);
            return false;
        }
        console.log(`  ✅ ${table}: ${Array.isArray(data) ? data.length : 1} row(s)`);
        return true;
    };

    // 1. Organization
    await post('organizations', {
        id: 'demo-org-001', name: 'Acme Corp India',
        policy_text: 'Acme Corp is committed to providing a safe and respectful workplace under the POSH Act 2013.',
        settings: { theme: 'dark', notifications: true },
    });

    // 2. Users
    await post('users', [
        { id: 'demo-emp-001', org_id: 'demo-org-001', email: 'priya@acmecorp.in', name: 'Priya Sharma', role: 'employee', department: 'Engineering' },
        { id: 'demo-hr-001', org_id: 'demo-org-001', email: 'hr@acmecorp.in', name: 'Anjali Mehta', role: 'hr', department: 'Human Resources', mfa_enabled: true },
        { id: 'demo-icc-001', org_id: 'demo-org-001', email: 'icc@acmecorp.in', name: 'Justice Raman', role: 'icc', department: 'Legal', mfa_enabled: true },
        { id: 'demo-sec-001', org_id: 'demo-org-001', email: 'security@acmecorp.in', name: 'Rajesh Kumar', role: 'security', department: 'Security' },
        { id: 'icc-member-002', org_id: 'demo-org-001', email: 'meera@acmecorp.in', name: 'Meera Nair', role: 'icc', department: 'Legal' },
        { id: 'icc-member-003', org_id: 'demo-org-001', email: 'sunita@acmecorp.in', name: 'Sunita Iyer', role: 'icc', department: 'Administration' },
        { id: 'icc-external-001', org_id: 'demo-org-001', email: 'external@ngo.org', name: 'Dr. Kavitha Rao', role: 'icc', department: 'External (NGO)' },
    ]);

    // 3. Complaints
    await post('complaints', [
        {
            id: 'c-001', case_id: '#XK29M1', org_id: 'demo-org-001', complainant_id: 'demo-emp-001',
            is_anonymous: false, type: 'verbal',
            description: 'Repeated inappropriate comments about my appearance during team meetings.',
            date_of_incident: '2026-02-10', time_of_incident: '10:30:00', location: 'Conference Room B, 3rd Floor',
            status: 'investigating', severity: 7, assigned_icc_id: 'demo-icc-001',
            ai_analysis: { sentiment: 'negative', severity_score: 7, category: 'verbal_harassment', keywords: ['inappropriate comments', 'appearance'], risk_level: 'high' },
        },
        {
            id: 'c-002', case_id: '#AB12C2', org_id: 'demo-org-001', complainant_id: null,
            is_anonymous: true, type: 'cyber',
            description: 'Receiving unwanted suggestive messages on internal chat platform late at night.',
            date_of_incident: '2026-02-14', time_of_incident: '22:15:00', location: 'Online — Internal Chat',
            status: 'pending', severity: 6,
            ai_analysis: { sentiment: 'distressed', severity_score: 6, category: 'cyber_harassment', keywords: ['unwanted messages', 'late night'], risk_level: 'medium' },
        },
        {
            id: 'c-003', case_id: '#GH78K3', org_id: 'demo-org-001', complainant_id: 'demo-emp-001',
            is_anonymous: false, type: 'quid_pro_quo',
            description: 'Manager implied promotion contingent on attending a private dinner. Assignments changed after declining.',
            date_of_incident: '2026-01-28', time_of_incident: '16:00:00', location: "Manager's Office, 5th Floor",
            status: 'resolved', severity: 9, assigned_icc_id: 'demo-icc-001',
            ai_analysis: { sentiment: 'fearful', severity_score: 9, category: 'quid_pro_quo', keywords: ['promotion', 'retaliation'], risk_level: 'critical' },
        },
        {
            id: 'c-004', case_id: '#PQ45R4', org_id: 'demo-org-001', complainant_id: 'demo-emp-001',
            is_anonymous: false, type: 'physical',
            description: 'Colleague repeatedly invades my personal space, places hand on my shoulder despite being asked not to.',
            date_of_incident: '2026-02-17', time_of_incident: '14:30:00', location: 'Open Office Area, 2nd Floor',
            status: 'pending', severity: 5,
            ai_analysis: { sentiment: 'uncomfortable', severity_score: 5, category: 'physical_harassment', keywords: ['personal space', 'unwanted touching'], risk_level: 'medium' },
        },
    ]);

    // 4. Timeline
    await post('complaint_timeline', [
        { id: 't-1', complaint_id: 'c-001', event: 'created', details: 'Complaint filed by employee', actor_id: 'demo-emp-001', occurred_at: '2026-02-10T11:00:00Z' },
        { id: 't-2', complaint_id: 'c-001', event: 'ai_analyzed', details: 'AI flagged as High Severity (7/10)', actor_id: null, occurred_at: '2026-02-10T11:00:05Z' },
        { id: 't-3', complaint_id: 'c-001', event: 'hr_notified', details: 'HR notified via real-time alert', actor_id: null, occurred_at: '2026-02-10T11:00:10Z' },
        { id: 't-4', complaint_id: 'c-001', event: 'assigned', details: 'Case assigned to ICC Member Justice Raman', actor_id: 'demo-hr-001', occurred_at: '2026-02-11T09:30:00Z' },
        { id: 't-5', complaint_id: 'c-001', event: 'investigating', details: 'ICC investigation started', actor_id: 'demo-icc-001', occurred_at: '2026-02-12T09:00:00Z' },
    ]);

    // 5. Panic Alerts
    await post('panic_alerts', [
        { id: 'pa-001', user_id: 'demo-emp-001', org_id: 'demo-org-001', latitude: 12.9716, longitude: 77.5946, status: 'active', source: 'panic', created_at: '2026-02-19T14:30:00Z' },
        { id: 'pa-002', user_id: 'demo-emp-001', org_id: 'demo-org-001', latitude: 12.9352, longitude: 77.6245, status: 'resolved', source: 'guardian', message: 'Guardian check-in missed', created_at: '2026-02-18T20:15:00Z', resolved_at: '2026-02-18T20:45:00Z' },
    ]);

    // 6. Guardian Sessions
    await post('guardian_sessions', [{
        id: 'gs-001', user_id: 'demo-emp-001', org_id: 'demo-org-001', duration_minutes: 30,
        trusted_contacts: [{ name: 'Amma', phone: '+91 98765 43210', email: 'amma@email.com' }],
        status: 'active', started_at: '2026-02-19T21:00:00Z', next_checkin: '2026-02-19T21:30:00Z',
    }]);

    // 7. ICC Members (need users created first)
    await post('icc_members', [
        { id: 'icc-m-1', org_id: 'demo-org-001', user_id: 'demo-icc-001', role: 'presiding' },
        { id: 'icc-m-2', org_id: 'demo-org-001', user_id: 'icc-member-002', role: 'member' },
        { id: 'icc-m-3', org_id: 'demo-org-001', user_id: 'icc-member-003', role: 'member' },
        { id: 'icc-m-4', org_id: 'demo-org-001', user_id: 'icc-external-001', role: 'external' },
    ]);

    // 8. Org Rating
    await post('organization_ratings', {
        id: 'or-001', org_id: 'demo-org-001',
        overall_score: 4.2, response_time_avg: 2.5, resolution_rate: 0.85,
        posh_compliant: true, badges: ['POSH Certified', 'Fast Responder'],
    });

    // 9. Pulse Survey
    await post('pulse_surveys', {
        id: 'ps-001', org_id: 'demo-org-001', title: 'Q1 2026 — Workplace Safety Pulse', is_active: true,
        questions: [
            { id: 'q1', text: 'How safe do you feel at work?', type: 'rating' },
            { id: 'q2', text: 'Are you aware of the POSH complaint process?', type: 'choice', options: ['Yes', 'No', 'Partially'] },
            { id: 'q3', text: 'Have you witnessed any inappropriate behavior?', type: 'choice', options: ['Yes', 'No'] },
            { id: 'q4', text: 'Suggestions to improve workplace safety?', type: 'text' },
        ],
    });

    // 10. Notifications
    await post('notifications', [
        { id: 'n-1', user_id: 'demo-hr-001', title: 'New Complaint Filed', message: 'A verbal harassment complaint has been filed. Case #XK29M1.', type: 'alert', link: '/hr/cases/c-001' },
        { id: 'n-2', user_id: 'demo-hr-001', title: 'ICC Response Pending', message: 'Case #AB12C2 awaiting ICC assignment.', type: 'warning', link: '/hr/cases/c-002' },
        { id: 'n-3', user_id: 'demo-emp-001', title: 'Case Update', message: 'Your case #XK29M1 has been assigned to an ICC member.', type: 'info', link: '/employee/complaints/c-001', read: true },
        { id: 'n-4', user_id: 'demo-sec-001', title: '🚨 Panic Alert!', message: 'Active panic alert from Building A. Respond immediately.', type: 'alert', link: '/security' },
        { id: 'n-5', user_id: 'demo-emp-001', title: 'Case Resolved', message: 'Your case #GH78K3 has been resolved.', type: 'success', link: '/employee/complaints/c-003', read: true },
    ]);

    // 11. Evidence Vault
    await post('evidence_vault', [
        { id: 'v-1', user_id: 'demo-emp-001', file_url: '/uploads/chat_screenshot_01.png', file_type: 'image/png', description: 'Chat screenshot', linked_complaint: 'c-001' },
        { id: 'v-2', user_id: 'demo-emp-001', file_url: '/uploads/voice_recording.mp3', file_type: 'audio/mp3', description: 'Voice recording from meeting' },
        { id: 'v-3', user_id: 'demo-emp-001', file_url: '/uploads/email_evidence.pdf', file_type: 'application/pdf', description: 'Email chain evidence', linked_complaint: 'c-003' },
    ]);
}

async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('  HearHer — Database Setup & Seed');
    console.log('═══════════════════════════════════════════════');
    console.log();

    // Step 1: Try to create tables via SQL
    console.log('📋 Step 1: Creating tables...');
    const sql = readFileSync(sqlPath, 'utf-8');
    const result = await runSQL(sql);
    if (result.error) {
        console.log(`  ⚠️  Could not run SQL via RPC (expected for anon key): ${result.status}`);
        console.log('  💡 You need to paste the SQL from supabase/schema-simple.sql into Supabase SQL Editor.');
        console.log('     URL: https://supabase.com/dashboard/project/jndelqjdcsuoixfcjucv/sql/new');
        console.log();
        console.log('  ⏳ Attempting to seed data anyway (will fail if tables don\'t exist)...');
    } else {
        console.log('  ✅ Tables created successfully!');
    }

    console.log();

    // Step 2: Seed data
    console.log('🌱 Step 2: Seeding demo data...');
    await seedData();

    console.log();
    console.log('═══════════════════════════════════════════════');
    console.log('  ✅ Setup complete!');
    console.log('  🌐 Open http://localhost:3000 to use the app');
    console.log('═══════════════════════════════════════════════');
}

main().catch(console.error);
