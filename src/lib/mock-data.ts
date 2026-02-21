// ─── POSH Safety System — Mock Data for Demo ────────────────────────────────
// Used to run the full UI without a Supabase connection

import type {
    Complaint,
    PanicAlert,
    GuardianSession,
    Notification,
    OrganizationRating,
    ComplaintTimeline,
    PulseSurvey,
    ICCMember,
} from './database.types';

// ─── Helper: Random ID ──────────────────────────────────────────────────────
function rid(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Mock Complaints ────────────────────────────────────────────────────────
export const MOCK_COMPLAINTS: Complaint[] = [
    {
        id: 'c-001',
        case_id: `#${rid()}`,
        org_id: 'demo-org-001',
        complainant_id: 'demo-emp-001',
        is_anonymous: false,
        type: 'verbal',
        description:
            'Repeated inappropriate comments about my appearance during team meetings. The accused has made comments like "you look too good for an engineer" multiple times in front of the entire team.',
        date_of_incident: '2026-02-10',
        time_of_incident: '10:30',
        location: 'Conference Room B, 3rd Floor',
        status: 'investigating',
        severity: 7,
        assigned_icc_id: 'demo-icc-001',
        ai_analysis: {
            sentiment: 'negative',
            severity_score: 7,
            category: 'verbal_harassment',
            keywords: ['inappropriate comments', 'appearance', 'public humiliation'],
            risk_level: 'high',
        },
        created_at: '2026-02-10T11:00:00Z',
        updated_at: '2026-02-12T09:00:00Z',
    },
    {
        id: 'c-002',
        case_id: `#${rid()}`,
        org_id: 'demo-org-001',
        complainant_id: null,
        is_anonymous: true,
        type: 'cyber',
        description:
            'Receiving unwanted messages on internal chat platform late at night. The messages are suggestive in nature and continue despite being asked to stop.',
        date_of_incident: '2026-02-14',
        time_of_incident: '22:15',
        location: 'Online — Internal Chat',
        status: 'pending',
        severity: 6,
        assigned_icc_id: null,
        ai_analysis: {
            sentiment: 'distressed',
            severity_score: 6,
            category: 'cyber_harassment',
            keywords: ['unwanted messages', 'late night', 'suggestive'],
            risk_level: 'medium',
        },
        created_at: '2026-02-15T08:00:00Z',
        updated_at: '2026-02-15T08:00:00Z',
    },
    {
        id: 'c-003',
        case_id: `#${rid()}`,
        org_id: 'demo-org-001',
        complainant_id: 'demo-emp-001',
        is_anonymous: false,
        type: 'quid_pro_quo',
        description:
            'Manager implied that upcoming promotion is contingent on attending a private dinner. When I declined, my project assignments were changed and I was removed from the client-facing team.',
        date_of_incident: '2026-01-28',
        time_of_incident: '16:00',
        location: "Manager's Office, 5th Floor",
        status: 'resolved',
        severity: 9,
        assigned_icc_id: 'demo-icc-001',
        ai_analysis: {
            sentiment: 'fearful',
            severity_score: 9,
            category: 'quid_pro_quo',
            keywords: ['promotion', 'contingent', 'retaliation', 'project removal'],
            risk_level: 'critical',
        },
        created_at: '2026-01-29T09:00:00Z',
        updated_at: '2026-02-18T15:00:00Z',
    },
    {
        id: 'c-004',
        case_id: `#${rid()}`,
        org_id: 'demo-org-001',
        complainant_id: 'demo-emp-001',
        is_anonymous: false,
        type: 'physical',
        description:
            'Colleague repeatedly invades my personal space, places hand on my shoulder despite being asked not to. This has happened at least 5 times in the past month.',
        date_of_incident: '2026-02-17',
        time_of_incident: '14:30',
        location: 'Open Office Area, 2nd Floor',
        status: 'pending',
        severity: 5,
        assigned_icc_id: null,
        ai_analysis: {
            sentiment: 'uncomfortable',
            severity_score: 5,
            category: 'physical_harassment',
            keywords: ['personal space', 'unwanted touching', 'repeated'],
            risk_level: 'medium',
        },
        created_at: '2026-02-17T15:00:00Z',
        updated_at: '2026-02-17T15:00:00Z',
    },
];

// ─── Mock Timeline for Case c-001 ───────────────────────────────────────────
export const MOCK_TIMELINE: ComplaintTimeline[] = [
    { id: 't-1', complaint_id: 'c-001', event: 'created', details: 'Complaint filed by employee', actor_id: 'demo-emp-001', occurred_at: '2026-02-10T11:00:00Z' },
    { id: 't-2', complaint_id: 'c-001', event: 'ai_analyzed', details: 'AI flagged as High Severity (7/10), Verbal Harassment', actor_id: null, occurred_at: '2026-02-10T11:00:05Z' },
    { id: 't-3', complaint_id: 'c-001', event: 'hr_notified', details: 'HR notified via real-time alert', actor_id: null, occurred_at: '2026-02-10T11:00:10Z' },
    { id: 't-4', complaint_id: 'c-001', event: 'assigned', details: 'Case assigned to ICC Member Justice Raman', actor_id: 'demo-hr-001', occurred_at: '2026-02-11T09:30:00Z' },
    { id: 't-5', complaint_id: 'c-001', event: 'accused_notified', details: 'Accused notified — 10 day response window', actor_id: null, occurred_at: '2026-02-11T10:00:00Z' },
    { id: 't-6', complaint_id: 'c-001', event: 'investigating', details: 'ICC investigation started', actor_id: 'demo-icc-001', occurred_at: '2026-02-12T09:00:00Z' },
];

// ─── Mock Panic Alerts ──────────────────────────────────────────────────────
export const MOCK_PANIC_ALERTS: PanicAlert[] = [
    {
        id: 'pa-001',
        user_id: 'demo-emp-001',
        org_id: 'demo-org-001',
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'active',
        source: 'panic',
        message: null,
        created_at: '2026-02-19T14:30:00Z',
        resolved_at: null,
    },
    {
        id: 'pa-002',
        user_id: 'demo-emp-001',
        org_id: 'demo-org-001',
        latitude: 12.9352,
        longitude: 77.6245,
        status: 'resolved',
        source: 'guardian',
        message: 'Guardian mode check-in missed',
        created_at: '2026-02-18T20:15:00Z',
        resolved_at: '2026-02-18T20:45:00Z',
    },
];

// ─── Mock Guardian Sessions ─────────────────────────────────────────────────
export const MOCK_GUARDIAN_SESSIONS: GuardianSession[] = [
    {
        id: 'gs-001',
        user_id: 'demo-emp-001',
        org_id: 'demo-org-001',
        duration_minutes: 30,
        trusted_contacts: [
            { name: 'Amma', phone: '+91 98765 43210', email: 'amma@email.com' },
            { name: 'Best Friend', phone: '+91 98765 43211', email: 'friend@email.com' },
        ],
        status: 'active',
        started_at: '2026-02-19T21:00:00Z',
        next_checkin: '2026-02-19T21:30:00Z',
        ended_at: null,
    },
];

// ─── Mock Notifications ─────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n-1', user_id: 'demo-hr-001', title: 'New Complaint Filed', message: 'A new verbal harassment complaint has been filed. Case #XK29M.', type: 'alert', link: '/hr/cases/c-001', read: false, created_at: '2026-02-19T11:00:00Z' },
    { id: 'n-2', user_id: 'demo-hr-001', title: 'ICC Response Pending', message: 'Case #AB12C awaiting ICC member assignment.', type: 'warning', link: '/hr/cases/c-002', read: false, created_at: '2026-02-18T15:00:00Z' },
    { id: 'n-3', user_id: 'demo-emp-001', title: 'Case Update', message: 'Your case #XK29M has been assigned to an ICC member.', type: 'info', link: '/employee/complaints/c-001', read: true, created_at: '2026-02-17T10:00:00Z' },
    { id: 'n-4', user_id: 'demo-sec-001', title: '🚨 Panic Alert!', message: 'Active panic alert from Building A, 3rd Floor. Respond immediately.', type: 'alert', link: '/security', read: false, created_at: '2026-02-19T14:30:00Z' },
    { id: 'n-5', user_id: 'demo-emp-001', title: 'Case Resolved', message: 'Your case #GH78K has been resolved. Action taken against the accused.', type: 'success', link: '/employee/complaints/c-003', read: true, created_at: '2026-02-16T09:00:00Z' },
];

// ─── Mock Organization Rating ───────────────────────────────────────────────
export const MOCK_ORG_RATING: OrganizationRating = {
    id: 'or-001',
    org_id: 'demo-org-001',
    overall_score: 4.2,
    response_time_avg: 2.5,
    resolution_rate: 0.85,
    posh_compliant: true,
    badges: ['POSH Certified', 'Fast Responder'],
    calculated_at: '2026-02-19T00:00:00Z',
};

// ─── Mock ICC Members ───────────────────────────────────────────────────────
export const MOCK_ICC_MEMBERS: ICCMember[] = [
    { id: 'icc-m-1', org_id: 'demo-org-001', user_id: 'demo-icc-001', role: 'presiding', appointed_at: '2025-06-01T00:00:00Z' },
    { id: 'icc-m-2', org_id: 'demo-org-001', user_id: 'icc-member-002', role: 'member', appointed_at: '2025-06-01T00:00:00Z' },
    { id: 'icc-m-3', org_id: 'demo-org-001', user_id: 'icc-member-003', role: 'member', appointed_at: '2025-06-01T00:00:00Z' },
    { id: 'icc-m-4', org_id: 'demo-org-001', user_id: 'icc-external-001', role: 'external', appointed_at: '2025-06-01T00:00:00Z' },
];

// ─── Mock Pulse Survey ──────────────────────────────────────────────────────
export const MOCK_PULSE_SURVEY: PulseSurvey = {
    id: 'ps-001',
    org_id: 'demo-org-001',
    title: 'Q1 2026 — Workplace Safety Pulse',
    questions: [
        { id: 'q1', text: 'How safe do you feel at work?', type: 'rating' },
        { id: 'q2', text: 'Are you aware of the POSH complaint process?', type: 'choice', options: ['Yes', 'No', 'Partially'] },
        { id: 'q3', text: 'Have you witnessed any inappropriate behavior recently?', type: 'choice', options: ['Yes', 'No'] },
        { id: 'q4', text: 'Any suggestions to improve workplace safety?', type: 'text' },
    ],
    is_active: true,
    created_at: '2026-01-15T00:00:00Z',
};

// ─── Dashboard Stats ────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
    totalCases: 47,
    activeCases: 12,
    resolvedCases: 31,
    pendingCases: 4,
    avgResolutionDays: 18,
    employeeSatisfaction: 4.1,
    panicAlertsThisMonth: 3,
    guardianSessionsThisMonth: 15,
    complianceScore: 92,
    monthlyTrend: [
        { month: 'Sep', cases: 3 },
        { month: 'Oct', cases: 5 },
        { month: 'Nov', cases: 4 },
        { month: 'Dec', cases: 7 },
        { month: 'Jan', cases: 6 },
        { month: 'Feb', cases: 4 },
    ],
    casesByType: [
        { type: 'Verbal', count: 18 },
        { type: 'Physical', count: 8 },
        { type: 'Cyber', count: 12 },
        { type: 'Quid Pro Quo', count: 9 },
    ],
    severityDistribution: [
        { level: 'Low (1-3)', count: 10 },
        { level: 'Medium (4-6)', count: 22 },
        { level: 'High (7-8)', count: 12 },
        { level: 'Critical (9-10)', count: 3 },
    ],
};
