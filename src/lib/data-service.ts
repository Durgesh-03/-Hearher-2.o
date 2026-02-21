// @ts-nocheck — Supabase generated types resolve table rows to `never`; fixing requires regenerating DB types
// ─── POSH Safety System — Centralized Data Service ──────────────────────────
// Tries Supabase first, gracefully falls back to mock data if DB errors occur.
// All pages should use these functions instead of importing MOCK_* directly.

import { supabase } from './supabase';
import {
    MOCK_COMPLAINTS,
    MOCK_TIMELINE,
    MOCK_PANIC_ALERTS,
    MOCK_GUARDIAN_SESSIONS,
    MOCK_NOTIFICATIONS,
    MOCK_ORG_RATING,
    MOCK_ICC_MEMBERS,
    MOCK_PULSE_SURVEY,
    MOCK_DASHBOARD_STATS,
} from './mock-data';
import type {
    Complaint,
    ComplaintTimeline,
    PanicAlert,
    GuardianSession,
    Notification,
    OrganizationRating,
    ICCMember,
    PulseSurvey,
    ComplaintType,
} from './database.types';

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function caseId(): string {
    return '#' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Check if Supabase is properly configured (not just placeholder keys) */
function isSupabaseReady(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !!url && !url.includes('your-project') && url.startsWith('https://');
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLAINTS
// ═══════════════════════════════════════════════════════════════════════════

/** Get all complaints, optionally filtered by org or complainant */
export async function getComplaints(opts?: {
    orgId?: string;
    complainantId?: string;
    status?: string;
}): Promise<Complaint[]> {
    if (isSupabaseReady()) {
        try {
            let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });
            if (opts?.orgId) query = query.eq('org_id', opts.orgId);
            if (opts?.complainantId) query = query.eq('complainant_id', opts.complainantId);
            if (opts?.status && opts.status !== 'all') query = query.eq('status', opts.status);

            const { data, error } = await query;
            if (error) throw error;
            if (data && data.length > 0) return data as Complaint[];
        } catch {
            // fallback to mock
        }
    }
    // Fallback to mock
    let result = [...MOCK_COMPLAINTS];
    if (opts?.status && opts.status !== 'all') result = result.filter((c) => c.status === opts.status);
    return result;
}

/** Get a single complaint by ID */
export async function getComplaintById(id: string): Promise<Complaint | null> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase.from('complaints').select('*').eq('id', id).single();
            if (error) throw error;
            if (data) return data as Complaint;
        } catch {
        }
    }
    return MOCK_COMPLAINTS.find((c) => c.id === id) || null;
}

/** Get timeline events for a complaint */
export async function getComplaintTimeline(complaintId: string): Promise<ComplaintTimeline[]> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('complaint_timeline')
                .select('*')
                .eq('complaint_id', complaintId)
                .order('occurred_at', { ascending: true });
            if (error) throw error;
            if (data && data.length > 0) return data as ComplaintTimeline[];
        } catch {
        }
    }
    return MOCK_TIMELINE.filter((t) => t.complaint_id === complaintId);
}

/** Create a new complaint */
export async function createComplaint(input: {
    orgId: string;
    complainantId: string | null;
    isAnonymous: boolean;
    type: ComplaintType;
    description: string;
    dateOfIncident: string;
    timeOfIncident: string;
    location: string;
    severity: number;
}): Promise<{ id: string; caseId: string } | null> {
    const newCaseId = caseId();

    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('complaints')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .insert({
                    case_id: newCaseId,
                    org_id: input.orgId,
                    complainant_id: input.isAnonymous ? null : input.complainantId,
                    is_anonymous: input.isAnonymous,
                    type: input.type,
                    description: input.description,
                    date_of_incident: input.dateOfIncident,
                    time_of_incident: input.timeOfIncident,
                    location: input.location,
                    severity: input.severity,
                    status: 'pending',
                } as any)
                .select('id')
                .single();

            if (error) throw error;
            if (data) {
                // Add timeline entry
                await supabase.from('complaint_timeline').insert({
                    complaint_id: data.id,
                    event: 'created',
                    details: input.isAnonymous ? 'Anonymous complaint filed' : 'Complaint filed by employee',
                    actor_id: input.isAnonymous ? null : input.complainantId,
                } as Record<string, unknown>);

                return { id: data.id, caseId: newCaseId };
            }
        } catch {
        }
    }

    // Mock fallback — just return a fake ID
    const mockId = 'c-' + Math.random().toString(36).substring(2, 6);
    return { id: mockId, caseId: newCaseId };
}

// ═══════════════════════════════════════════════════════════════════════════
// PANIC ALERTS
// ═══════════════════════════════════════════════════════════════════════════

/** Create a panic alert */
export async function createPanicAlert(input: {
    userId: string;
    orgId: string;
    latitude: number;
    longitude: number;
    source: 'panic' | 'guardian' | 'shake';
    message?: string;
}): Promise<string | null> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('panic_alerts')
                .insert({
                    user_id: input.userId,
                    org_id: input.orgId,
                    latitude: input.latitude,
                    longitude: input.longitude,
                    source: input.source,
                    message: input.message || null,
                    status: 'active',
                } as Record<string, unknown>)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        } catch {
        }
    }
    return 'pa-mock-' + Date.now();
}

/** Resolve a panic alert */
export async function resolvePanicAlert(alertId: string): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase
                .from('panic_alerts')
                .update({ status: 'resolved', resolved_at: new Date().toISOString() } as Record<string, unknown>)
                .eq('id', alertId);
            if (error) throw error;
            return true;
        } catch {
        }
    }
    return true;
}

/** Get active panic alerts for an org */
export async function getPanicAlerts(orgId?: string): Promise<PanicAlert[]> {
    if (isSupabaseReady()) {
        try {
            let query = supabase.from('panic_alerts').select('*').order('created_at', { ascending: false });
            if (orgId) query = query.eq('org_id', orgId);
            const { data, error } = await query;
            if (error) throw error;
            if (data && data.length > 0) return data as PanicAlert[];
        } catch {
        }
    }
    return MOCK_PANIC_ALERTS;
}

// ═══════════════════════════════════════════════════════════════════════════
// GUARDIAN SESSIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Create a guardian session */
export async function createGuardianSession(input: {
    userId: string;
    orgId: string;
    durationMinutes: number;
    trustedContacts: { name: string; phone: string; email?: string }[];
}): Promise<string | null> {
    const nextCheckin = new Date(Date.now() + input.durationMinutes * 60 * 1000).toISOString();

    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('guardian_sessions')
                .insert({
                    user_id: input.userId,
                    org_id: input.orgId,
                    duration_minutes: input.durationMinutes,
                    trusted_contacts: input.trustedContacts,
                    status: 'active',
                    next_checkin: nextCheckin,
                } as Record<string, unknown>)
                .select('id')
                .single();
            if (error) throw error;
            return data?.id || null;
        } catch {
        }
    }
    return 'gs-mock-' + Date.now();
}

/** Update guardian session status */
export async function updateGuardianSession(
    sessionId: string,
    update: { status?: string; next_checkin?: string; ended_at?: string }
): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase
                .from('guardian_sessions')
                .update(update as Record<string, unknown>)
                .eq('id', sessionId);
            if (error) throw error;
            return true;
        } catch {
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Get notifications for a user */
export async function getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            if (data && data.length > 0) return data as Notification[];
        } catch {
        }
    }
    return MOCK_NOTIFICATIONS.filter((n) => n.user_id === userId);
}

/** Mark notification as read */
export async function markNotificationRead(id: string): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase.from('notifications').update({ read: true } as Record<string, unknown>).eq('id', id);
            if (error) throw error;
            return true;
        } catch {
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE VAULT
// ═══════════════════════════════════════════════════════════════════════════

export interface VaultItem {
    id: string;
    name: string;
    type: 'image' | 'audio' | 'document' | 'video';
    size: string;
    linked: boolean;
    date: string;
}

const MOCK_VAULT: VaultItem[] = [
    { id: 'v-1', name: 'chat_screenshot_01.png', type: 'image', size: '2.4 MB', linked: true, date: '2026-02-14' },
    { id: 'v-2', name: 'voice_recording.mp3', type: 'audio', size: '1.1 MB', linked: false, date: '2026-02-12' },
    { id: 'v-3', name: 'email_evidence.pdf', type: 'document', size: '340 KB', linked: true, date: '2026-02-10' },
    { id: 'v-4', name: 'cctv_clip.mp4', type: 'video', size: '8.2 MB', linked: false, date: '2026-02-08' },
];

/** Get evidence vault items for a user */
export async function getEvidenceVault(userId: string): Promise<VaultItem[]> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('evidence_vault')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data && data.length > 0) {
                return data.map((d) => ({
                    id: d.id as string,
                    name: (d.file_url as string).split('/').pop() || 'file',
                    type: mapFileType(d.file_type as string),
                    size: '—',
                    linked: !!(d.linked_complaint),
                    date: new Date(d.created_at as string).toISOString().split('T')[0],
                }));
            }
        } catch {
        }
    }
    return MOCK_VAULT;
}

function mapFileType(ft: string): VaultItem['type'] {
    if (ft.startsWith('image')) return 'image';
    if (ft.startsWith('audio')) return 'audio';
    if (ft.startsWith('video')) return 'video';
    return 'document';
}

/** Delete evidence vault item */
export async function deleteEvidenceItem(id: string): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase.from('evidence_vault').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch {
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORG RATINGS
// ═══════════════════════════════════════════════════════════════════════════

export async function getOrgRating(orgId: string): Promise<OrganizationRating> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('organization_ratings')
                .select('*')
                .eq('org_id', orgId)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .single();
            if (error) throw error;
            if (data) return data as OrganizationRating;
        } catch {
        }
    }
    return MOCK_ORG_RATING;
}

// ═══════════════════════════════════════════════════════════════════════════
// ICC MEMBERS
// ═══════════════════════════════════════════════════════════════════════════

export async function getICCMembers(orgId: string): Promise<ICCMember[]> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('icc_members')
                .select('*')
                .eq('org_id', orgId);
            if (error) throw error;
            if (data && data.length > 0) return data as ICCMember[];
        } catch {
        }
    }
    return MOCK_ICC_MEMBERS;
}

// ═══════════════════════════════════════════════════════════════════════════
// PULSE SURVEYS
// ═══════════════════════════════════════════════════════════════════════════

export async function getActivePulseSurvey(orgId: string): Promise<PulseSurvey | null> {
    if (isSupabaseReady()) {
        try {
            const { data, error } = await supabase
                .from('pulse_surveys')
                .select('*')
                .eq('org_id', orgId)
                .eq('is_active', true)
                .limit(1)
                .single();
            if (error) throw error;
            if (data) return data as PulseSurvey;
        } catch {
        }
    }
    return MOCK_PULSE_SURVEY;
}

export async function submitPulseResponse(
    surveyId: string,
    userId: string,
    answers: Record<string, string | number>
): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase.from('pulse_responses').insert({
                survey_id: surveyId,
                user_id: userId,
                answers,
            } as Record<string, unknown>);
            if (error) throw error;
            return true;
        } catch {
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS (HR)
// ═══════════════════════════════════════════════════════════════════════════

export interface DashboardStats {
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    pendingCases: number;
    avgResolutionDays: number;
    employeeSatisfaction: number;
    panicAlertsThisMonth: number;
    guardianSessionsThisMonth: number;
    complianceScore: number;
    monthlyTrend: { month: string; cases: number }[];
    casesByType: { type: string; count: number }[];
    severityDistribution: { level: string; count: number }[];
}

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
    if (isSupabaseReady()) {
        try {
            // Try to compute stats from real data
            const { data: complaints, error } = await supabase
                .from('complaints')
                .select('status, type, severity, created_at')
                .eq('org_id', orgId);

            if (!error && complaints && complaints.length > 0) {
                const total = complaints.length;
                const pending = complaints.filter((c) => c.status === 'pending').length;
                const investigating = complaints.filter((c) => c.status === 'investigating').length;
                const resolved = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

                const typeMap: Record<string, number> = {};
                const typeLabels: Record<string, string> = {
                    verbal: 'Verbal', physical: 'Physical', cyber: 'Cyber', quid_pro_quo: 'Quid Pro Quo',
                };
                complaints.forEach((c) => {
                    const label = typeLabels[c.type as string] || (c.type as string);
                    typeMap[label] = (typeMap[label] || 0) + 1;
                });

                const sevMap: Record<string, number> = { 'Low (1-3)': 0, 'Medium (4-6)': 0, 'High (7-8)': 0, 'Critical (9-10)': 0 };
                complaints.forEach((c) => {
                    const s = c.severity as number;
                    if (s <= 3) sevMap['Low (1-3)']++;
                    else if (s <= 6) sevMap['Medium (4-6)']++;
                    else if (s <= 8) sevMap['High (7-8)']++;
                    else sevMap['Critical (9-10)']++;
                });

                return {
                    totalCases: total,
                    activeCases: investigating,
                    resolvedCases: resolved,
                    pendingCases: pending,
                    avgResolutionDays: 18,
                    employeeSatisfaction: 4.1,
                    panicAlertsThisMonth: MOCK_DASHBOARD_STATS.panicAlertsThisMonth,
                    guardianSessionsThisMonth: MOCK_DASHBOARD_STATS.guardianSessionsThisMonth,
                    complianceScore: 92,
                    monthlyTrend: MOCK_DASHBOARD_STATS.monthlyTrend,
                    casesByType: Object.entries(typeMap).map(([type, count]) => ({ type, count })),
                    severityDistribution: Object.entries(sevMap).map(([level, count]) => ({ level, count })),
                };
            }
        } catch {
        }
    }
    return MOCK_DASHBOARD_STATS;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLAINT STATUS UPDATE (HR / ICC)
// ═══════════════════════════════════════════════════════════════════════════

export async function updateComplaintStatus(
    complaintId: string,
    status: string,
    actorId?: string
): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({ status, updated_at: new Date().toISOString() } as Record<string, unknown>)
                .eq('id', complaintId);
            if (error) throw error;

            // Add timeline entry
            await supabase.from('complaint_timeline').insert({
                complaint_id: complaintId,
                event: status,
                details: `Status changed to ${status}`,
                actor_id: actorId || null,
            } as Record<string, unknown>);

            return true;
        } catch {
        }
    }
    return true;
}

/** Assign an ICC member to a complaint */
export async function assignICCToComplaint(
    complaintId: string,
    iccUserId: string,
    actorId?: string
): Promise<boolean> {
    if (isSupabaseReady()) {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({
                    assigned_icc_id: iccUserId,
                    status: 'investigating',
                    updated_at: new Date().toISOString(),
                } as Record<string, unknown>)
                .eq('id', complaintId);
            if (error) throw error;

            await supabase.from('complaint_timeline').insert({
                complaint_id: complaintId,
                event: 'assigned',
                details: 'ICC member assigned to case',
                actor_id: actorId || null,
            } as Record<string, unknown>);

            return true;
        } catch {
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// BYSTANDER REPORT (creates an anonymous complaint)
// ═══════════════════════════════════════════════════════════════════════════

export async function createBystanderReport(input: {
    orgId: string;
    description: string;
    dateOfIncident: string;
    timeOfIncident: string;
    location: string;
    relationship: string;
}): Promise<{ id: string; caseId: string } | null> {
    return createComplaint({
        orgId: input.orgId,
        complainantId: null,
        isAnonymous: true,
        type: 'verbal', // default for bystander
        description: `[Bystander Report — ${input.relationship}]\n\n${input.description}`,
        dateOfIncident: input.dateOfIncident,
        timeOfIncident: input.timeOfIncident || '00:00',
        location: input.location,
        severity: 5,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════

export async function logAudit(input: {
    orgId: string;
    userId: string;
    action: string;
    details?: Record<string, unknown>;
}): Promise<void> {
    if (isSupabaseReady()) {
        try {
            await supabase.from('audit_logs').insert({
                org_id: input.orgId,
                user_id: input.userId,
                action: input.action,
                details: input.details || {},
            } as Record<string, unknown>);
        } catch {
        }
    }
}
