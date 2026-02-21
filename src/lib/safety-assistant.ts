/**
 * @file safety-assistant.ts
 * Utility functions for the HearHer AI Safety Assistant.
 *
 * Provides:
 * - Emergency alert message generation with GPS
 * - Voice keyword detection for automatic SOS
 * - Emergency contact fetching
 * - Severity-aware response helpers
 */

import { classifySeverity, type SeverityLevel } from './severity-classifier';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmergencyContact {
    name: string;
    phone: string;
    email?: string;
}

export interface EmergencyAlert {
    userName: string;
    latitude: number;
    longitude: number;
    mapsLink: string;
    message: string;
    contacts: EmergencyContact[];
    triggeredAt: string;
}

export interface SafetyAssessment {
    severity: SeverityLevel;
    shouldPromptAlert: boolean;     // true for High/Critical
    autoTriggerSOS: boolean;        // true if voice keywords detected
    matchedVoiceKeywords: string[];
    alertMessage: string | null;
}

// ─── Voice Emergency Keywords ───────────────────────────────────────────────
// These keywords, when spoken via microphone, trigger an automatic SOS
// without requiring user confirmation.

const VOICE_EMERGENCY_KEYWORDS = [
    'help me',
    'i am in danger',
    'save me',
    'emergency',
    'somebody help',
    'please help',
    'call the police',
    'i need help',
    'bachao',           // Hindi for "save me"
    'madad karo',       // Hindi for "help me"
];

// ─── Default Emergency Contacts (fallback) ──────────────────────────────────

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
    { name: 'Amma', phone: '+91 98765 43210' },
    { name: 'Best Friend', phone: '+91 98765 43211' },
];

// ─── Core Functions ─────────────────────────────────────────────────────────

/**
 * Build a Google Maps link from coordinates.
 */
export function buildMapsLink(latitude: number, longitude: number): string {
    return `https://maps.google.com/?q=${latitude},${longitude}`;
}

/**
 * Generate the emergency alert message per the HearHer protocol.
 */
export function generateAlertMessage(
    userName: string,
    latitude: number,
    longitude: number
): string {
    const mapsLink = buildMapsLink(latitude, longitude);
    return `🚨 EMERGENCY ALERT from HearHer:\n${userName} may be in danger.\nLast known location:\nGoogle Maps Link: ${mapsLink}\nPlease contact immediately.`;
}

/**
 * Build a full EmergencyAlert object ready to be dispatched.
 */
export function buildEmergencyAlert(
    userName: string,
    latitude: number,
    longitude: number,
    contacts: EmergencyContact[]
): EmergencyAlert {
    return {
        userName,
        latitude,
        longitude,
        mapsLink: buildMapsLink(latitude, longitude),
        message: generateAlertMessage(userName, latitude, longitude),
        contacts: contacts.length > 0 ? contacts : DEFAULT_EMERGENCY_CONTACTS,
        triggeredAt: new Date().toISOString(),
    };
}

/**
 * Detect voice emergency keywords in a transcript.
 * Returns the list of matched keywords.
 */
export function detectVoiceEmergencyKeywords(transcript: string): string[] {
    const lower = transcript.toLowerCase();
    return VOICE_EMERGENCY_KEYWORDS.filter((kw) => lower.includes(kw));
}

/**
 * Run a full safety assessment on user input text.
 * This combines severity classification + voice keyword detection.
 *
 * @param text - The user's message or voice transcript
 * @param userName - The user's display name (for alert message)
 * @param latitude - GPS latitude (0 if unknown)
 * @param longitude - GPS longitude (0 if unknown)
 * @param isVoiceInput - Whether this came from the microphone
 */
export function assessSafety(
    text: string,
    userName: string = 'User',
    latitude: number = 0,
    longitude: number = 0,
    isVoiceInput: boolean = false
): SafetyAssessment {
    const classification = classifySeverity(text);
    const voiceMatches = isVoiceInput ? detectVoiceEmergencyKeywords(text) : [];

    const isHighOrCritical = classification.severity === 'High' || classification.severity === 'Critical';
    const shouldAutoTrigger = isVoiceInput && voiceMatches.length > 0;

    return {
        severity: classification.severity,
        shouldPromptAlert: isHighOrCritical,
        autoTriggerSOS: shouldAutoTrigger,
        matchedVoiceKeywords: voiceMatches,
        alertMessage: isHighOrCritical || shouldAutoTrigger
            ? generateAlertMessage(userName, latitude, longitude)
            : null,
    };
}

/**
 * Get the calm, supportive response prefix for a given severity.
 * Used to ensure the assistant's tone remains protective and calming.
 */
export function getSafetyResponse(severity: SeverityLevel): string {
    switch (severity) {
        case 'Critical':
            return "I hear you, and I want you to know — your safety is the most important thing right now. You are NOT alone. I'm going to help you get support immediately.";
        case 'High':
            return "What you're describing sounds very concerning. I want to make sure you feel safe. Would you like me to alert your emergency contacts right now?";
        case 'Medium':
            return "Thank you for sharing this with me. What you're experiencing is not okay, and I'm here to help you through it.";
        case 'Low':
        default:
            return "I appreciate you reaching out. I'm here to listen and support you. Let's talk about what happened.";
    }
}

/**
 * Get the emergency confirmation prompt.
 */
export function getEmergencyPrompt(): string {
    return '🚨 Do you want me to alert your emergency contacts with your current location? Reply **yes** or **alert** to confirm.';
}

/**
 * Check if a user message confirms an emergency alert.
 */
export function isAlertConfirmation(message: string): boolean {
    const confirmWords = ['yes', 'help', 'alert', 'send', 'haan', 'ha', 'please', 'do it', 'confirm'];
    const lower = message.toLowerCase().trim();
    return confirmWords.some((w) => lower === w || lower.includes(w));
}

/**
 * Get the default emergency contacts (when no saved contacts are available).
 */
export function getDefaultContacts(): EmergencyContact[] {
    return [...DEFAULT_EMERGENCY_CONTACTS];
}
