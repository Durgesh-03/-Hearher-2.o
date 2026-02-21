/**
 * @file severity-classifier.ts
 * Keyword-based AI Severity Classification Engine for POSH complaints.
 *
 * Runs instantly on the client — no API calls needed.
 * Designed to complement the Gemini-based analysis with a fast, deterministic classifier.
 *
 * Classification rules:
 *  1. Use the HIGHEST severity keyword detected as the base severity.
 *  2. Escalate for power imbalance, repetition, threats, or emotional distress.
 *  3. Physical harm or credible threats → automatic CRITICAL.
 *  4. Ambiguous cases → prioritize safety (choose higher severity).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SeverityResult {
    severity: SeverityLevel;
    severity_score: number;         // 1-10 numeric
    matched_keywords: string[];
    reasoning: string;
}

// ─── Keyword Dictionaries ───────────────────────────────────────────────────

const KEYWORD_MAP: Record<SeverityLevel, string[]> = {
    Low: [
        'joke', 'comment', 'uncomfortable', 'awkward', 'stared', 'ignored',
        'remark', 'glance', 'teased', 'annoyed',
    ],
    Medium: [
        'repeated', 'shouted', 'insulted', 'pressured', 'scared', 'humiliated',
        'yelled', 'mocked', 'targeted', 'bullied', 'harassed', 'belittled',
        'embarrassed', 'cornered',
    ],
    High: [
        'touch', 'touched', 'touching', 'follow', 'followed', 'following',
        'threaten', 'threatened', 'threat', 'force', 'forced', 'forcing',
        'sexual', 'sexually', 'blackmail', 'blackmailed', 'manager',
        'supervisor', 'senior', 'boss', 'groped', 'grabbed', 'coerced',
        'quid pro quo', 'promotion', 'appraisal',
    ],
    Critical: [
        'rape', 'raped', 'assault', 'assaulted', 'locked', 'violence',
        'violent', 'suicide', 'suicidal', 'kill', 'killed', 'murder',
        'stalked daily', 'stalking', 'stalked', 'abuse', 'abused',
        'molested', 'molestation', 'drugged', 'kidnapped', 'trapped',
        'life threat', 'death threat',
    ],
};

const SEVERITY_ORDER: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITY_RANK: Record<SeverityLevel, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
const SEVERITY_SCORE_BASE: Record<SeverityLevel, number> = { Low: 2, Medium: 5, High: 7, Critical: 9 };

// ─── Escalation Signals ─────────────────────────────────────────────────────

const POWER_IMBALANCE = [
    'manager', 'senior', 'supervisor', 'boss', 'lead', 'director',
    'head', 'ceo', 'cto', 'vp', 'team lead', 'reporting',
];

const REPETITION_SIGNALS = [
    'repeated', 'repeatedly', 'again', 'multiple times', 'every day',
    'daily', 'ongoing', 'continuous', 'always', 'keeps', 'won\'t stop',
    'doesn\'t stop', 'pattern', 'regular', 'frequent',
];

const THREAT_SIGNALS = [
    'threaten', 'threatened', 'threat', 'fire me', 'terminate',
    'appraisal', 'promotion', 'transfer', 'consequences', 'warned',
    'retaliation', 'punish', 'blacklist',
];

const EMOTIONAL_DISTRESS = [
    'fear', 'afraid', 'panic', 'trauma', 'traumatized', 'crying',
    'depressed', 'anxious', 'terrified', 'nightmare', 'can\'t sleep',
    'helpless', 'hopeless', 'ashamed', 'breakdown', 'mental health',
    'suicidal', 'self-harm',
];

const PHYSICAL_HARM = [
    'hit', 'slap', 'slapped', 'punch', 'punched', 'kick', 'kicked',
    'pushed', 'shoved', 'choked', 'bruise', 'injury', 'injured',
    'bleeding', 'hospital', 'assault', 'violence', 'physical',
];

// ─── Classifier ─────────────────────────────────────────────────────────────

function findMatches(text: string, keywords: string[]): string[] {
    const lower = text.toLowerCase();
    return keywords.filter(kw => {
        // For multi-word keywords, check as substring
        if (kw.includes(' ')) return lower.includes(kw);
        // For single-word keywords, use word boundary matching
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lower);
    });
}

export function classifySeverity(complaintText: string): SeverityResult {
    const text = complaintText.trim();
    if (!text) {
        return {
            severity: 'Low',
            severity_score: 1,
            matched_keywords: [],
            reasoning: 'Empty complaint text — defaulting to Low.',
        };
    }

    // Step 1: Find keywords for each severity level
    const matchesByLevel: Record<SeverityLevel, string[]> = {
        Low: findMatches(text, KEYWORD_MAP.Low),
        Medium: findMatches(text, KEYWORD_MAP.Medium),
        High: findMatches(text, KEYWORD_MAP.High),
        Critical: findMatches(text, KEYWORD_MAP.Critical),
    };

    // Collect all matched keywords
    const allMatched = [
        ...matchesByLevel.Critical,
        ...matchesByLevel.High,
        ...matchesByLevel.Medium,
        ...matchesByLevel.Low,
    ];

    // Step 2: Determine base severity (highest keyword level found)
    let baseSeverity: SeverityLevel = 'Low';
    for (const level of [...SEVERITY_ORDER].reverse()) {
        if (matchesByLevel[level].length > 0) {
            baseSeverity = level;
            break;
        }
    }

    // Step 3: Check escalation signals
    const escalations: string[] = [];
    let finalSeverity = baseSeverity;

    const powerMatches = findMatches(text, POWER_IMBALANCE);
    if (powerMatches.length > 0) {
        escalations.push(`Power imbalance detected (${powerMatches.join(', ')})`);
    }

    const repetitionMatches = findMatches(text, REPETITION_SIGNALS);
    if (repetitionMatches.length > 0) {
        escalations.push(`Repetition/ongoing behavior (${repetitionMatches.join(', ')})`);
    }

    const threatMatches = findMatches(text, THREAT_SIGNALS);
    if (threatMatches.length > 0) {
        escalations.push(`Threats detected (${threatMatches.join(', ')})`);
    }

    const emotionalMatches = findMatches(text, EMOTIONAL_DISTRESS);
    if (emotionalMatches.length > 0) {
        escalations.push(`Emotional distress signals (${emotionalMatches.join(', ')})`);
    }

    const physicalMatches = findMatches(text, PHYSICAL_HARM);
    if (physicalMatches.length > 0) {
        escalations.push(`Physical harm indicators (${physicalMatches.join(', ')})`);
        // Physical harm → automatic Critical
        finalSeverity = 'Critical';
    }

    // Apply escalation: each signal can bump severity by 1 level (up to Critical)
    if (finalSeverity !== 'Critical') {
        let rank = SEVERITY_RANK[baseSeverity];
        // Power imbalance, repetition, threats each escalate by 1
        if (powerMatches.length > 0) rank = Math.min(rank + 1, 3);
        if (repetitionMatches.length > 0) rank = Math.min(rank + 1, 3);
        if (threatMatches.length > 0) rank = Math.min(rank + 1, 3);
        // Severe emotional distress can also escalate
        if (emotionalMatches.length >= 2) rank = Math.min(rank + 1, 3);

        finalSeverity = SEVERITY_ORDER[rank];
    }

    // Step 4: Calculate numeric score
    let score = SEVERITY_SCORE_BASE[finalSeverity];
    // Fine-tune within bracket based on number of matches and escalations
    const totalSignals = allMatched.length + escalations.length;
    if (totalSignals >= 5) score = Math.min(score + 1, 10);
    if (totalSignals >= 8) score = Math.min(score + 1, 10);

    // Step 5: Build reasoning
    const reasons: string[] = [];
    reasons.push(`Base severity: ${baseSeverity} (keywords: ${matchesByLevel[baseSeverity].join(', ') || 'none'})`);
    if (escalations.length > 0) {
        reasons.push(`Escalated to ${finalSeverity} due to: ${escalations.join('; ')}`);
    }
    if (finalSeverity === 'Critical' && physicalMatches.length > 0) {
        reasons.push('Physical harm indicators automatically classify as Critical.');
    }

    // Add all escalation keywords to allMatched for transparency
    const uniqueMatched = [...new Set([
        ...allMatched,
        ...powerMatches,
        ...repetitionMatches,
        ...threatMatches,
        ...emotionalMatches,
        ...physicalMatches,
    ])];

    return {
        severity: finalSeverity,
        severity_score: score,
        matched_keywords: uniqueMatched,
        reasoning: reasons.join(' | '),
    };
}

// ─── Severity to numeric score for DB ───────────────────────────────────────

export function severityToScore(severity: SeverityLevel): number {
    return SEVERITY_SCORE_BASE[severity];
}

export function scoreToSeverity(score: number): SeverityLevel {
    if (score >= 9) return 'Critical';
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
}
