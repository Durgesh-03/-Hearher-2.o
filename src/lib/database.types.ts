// ─── POSH Safety System — Database TypeScript Types ─────────────────────────
// Mirrors the Supabase schema for type-safe queries

export type UserRole = 'employee' | 'hr' | 'icc' | 'security';
export type ComplaintType = 'verbal' | 'physical' | 'cyber' | 'quid_pro_quo';
export type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'closed';
export type AlertSource = 'panic' | 'guardian' | 'shake';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type GuardianStatus = 'active' | 'checkedin' | 'expired' | 'escalated';
export type ICCRole = 'presiding' | 'member' | 'external';

// ─── Core Tables ────────────────────────────────────────────────────────────

export interface Organization {
    id: string;
    name: string;
    logo_url: string | null;
    policy_text: string | null;
    settings: Record<string, unknown>;
    created_at: string;
}

export interface User {
    id: string;
    org_id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar_url: string | null;
    department: string | null;
    mfa_enabled: boolean;
    created_at: string;
}

export interface Complaint {
    id: string;
    case_id: string;
    org_id: string;
    complainant_id: string | null;
    is_anonymous: boolean;
    type: ComplaintType;
    description: string;
    date_of_incident: string | null;
    time_of_incident: string | null;
    location: string | null;
    status: ComplaintStatus;
    severity: number;
    assigned_icc_id: string | null;
    ai_analysis: {
        sentiment: string;
        severity_score: number;
        category: string;
        keywords: string[];
        risk_level: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface AccusedResponse {
    id: string;
    complaint_id: string;
    accused_id: string;
    statement: string;
    counter_evidence: Record<string, unknown>[];
    witnesses: string | null;
    deadline: string;
    responded_at: string | null;
    created_at: string;
}

export interface ComplaintEvidence {
    id: string;
    complaint_id: string;
    file_url: string;
    file_type: string;
    file_name: string;
    uploaded_at: string;
}

export interface ComplaintMessage {
    id: string;
    complaint_id: string;
    sender_type: 'complainant' | 'icc';
    sender_id: string | null;
    message: string;
    sent_at: string;
}

export interface ComplaintTimeline {
    id: string;
    complaint_id: string;
    event: string;
    details: string | null;
    actor_id: string | null;
    occurred_at: string;
}

export interface ICCMember {
    id: string;
    org_id: string;
    user_id: string;
    role: ICCRole;
    appointed_at: string;
}

// ─── Emergency Tables ───────────────────────────────────────────────────────

export interface PanicAlert {
    id: string;
    user_id: string;
    org_id: string;
    latitude: number;
    longitude: number;
    status: AlertStatus;
    source: AlertSource;
    message: string | null;
    created_at: string;
    resolved_at: string | null;
}

export interface PanicResponse {
    id: string;
    alert_id: string;
    responder_id: string;
    action: 'acknowledged' | 'dispatched' | 'resolved' | 'escalated';
    notes: string | null;
    responded_at: string;
}

export interface GuardianSession {
    id: string;
    user_id: string;
    org_id: string;
    duration_minutes: number;
    trusted_contacts: { name: string; phone: string; email: string }[];
    status: GuardianStatus;
    started_at: string;
    next_checkin: string;
    ended_at: string | null;
}

export interface EvidenceVault {
    id: string;
    user_id: string;
    file_url: string;
    file_type: string;
    description: string | null;
    linked_complaint: string | null;
    created_at: string;
}

// ─── AI & Chatbot ───────────────────────────────────────────────────────────

export interface PolicyEmbedding {
    id: string;
    org_id: string;
    content: string;
    embedding: number[];
}

export interface ChatbotConversation {
    id: string;
    user_id: string | null;
    session_id: string;
    role: 'user' | 'assistant';
    message: string;
    sent_at: string;
}

// ─── Org Ratings & Surveys ──────────────────────────────────────────────────

export interface OrganizationRating {
    id: string;
    org_id: string;
    overall_score: number;
    response_time_avg: number;
    resolution_rate: number;
    posh_compliant: boolean;
    badges: string[];
    calculated_at: string;
}

export interface PulseSurvey {
    id: string;
    org_id: string;
    title: string;
    questions: { id: string; text: string; type: 'rating' | 'text' | 'choice'; options?: string[] }[];
    is_active: boolean;
    created_at: string;
}

export interface PulseResponse {
    id: string;
    survey_id: string;
    user_id: string | null;
    answers: Record<string, string | number>;
    submitted_at: string;
}

// ─── System ─────────────────────────────────────────────────────────────────

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    link: string | null;
    read: boolean;
    created_at: string;
}

export interface AuditLog {
    id: string;
    org_id: string;
    user_id: string;
    action: string;
    details: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
}

// ─── Supabase Database Type (for typed client) ──────────────────────────────
export interface Database {
    public: {
        Tables: {
            organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
            users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
            complaints: { Row: Complaint; Insert: Partial<Complaint>; Update: Partial<Complaint> };
            accused_responses: { Row: AccusedResponse; Insert: Partial<AccusedResponse>; Update: Partial<AccusedResponse> };
            complaint_evidence: { Row: ComplaintEvidence; Insert: Partial<ComplaintEvidence>; Update: Partial<ComplaintEvidence> };
            complaint_messages: { Row: ComplaintMessage; Insert: Partial<ComplaintMessage>; Update: Partial<ComplaintMessage> };
            complaint_timeline: { Row: ComplaintTimeline; Insert: Partial<ComplaintTimeline>; Update: Partial<ComplaintTimeline> };
            icc_members: { Row: ICCMember; Insert: Partial<ICCMember>; Update: Partial<ICCMember> };
            panic_alerts: { Row: PanicAlert; Insert: Partial<PanicAlert>; Update: Partial<PanicAlert> };
            panic_responses: { Row: PanicResponse; Insert: Partial<PanicResponse>; Update: Partial<PanicResponse> };
            guardian_sessions: { Row: GuardianSession; Insert: Partial<GuardianSession>; Update: Partial<GuardianSession> };
            evidence_vault: { Row: EvidenceVault; Insert: Partial<EvidenceVault>; Update: Partial<EvidenceVault> };
            policy_embeddings: { Row: PolicyEmbedding; Insert: Partial<PolicyEmbedding>; Update: Partial<PolicyEmbedding> };
            chatbot_conversations: { Row: ChatbotConversation; Insert: Partial<ChatbotConversation>; Update: Partial<ChatbotConversation> };
            organization_ratings: { Row: OrganizationRating; Insert: Partial<OrganizationRating>; Update: Partial<OrganizationRating> };
            pulse_surveys: { Row: PulseSurvey; Insert: Partial<PulseSurvey>; Update: Partial<PulseSurvey> };
            pulse_responses: { Row: PulseResponse; Insert: Partial<PulseResponse>; Update: Partial<PulseResponse> };
            notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
            audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
        };
        Functions: {
            match_policy_embeddings: {
                Args: { query_embedding: number[]; match_count: number; filter_org_id: string };
                Returns: { content: string; similarity: number }[];
            };
        };
    };
}
