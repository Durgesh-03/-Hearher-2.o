/**
 * POST /api/ai/severity — AI Severity Classification Engine
 *
 * Keyword-based + contextual analysis for POSH complaint severity.
 * Uses Groq LLaMA 3 for ultra-fast classification.
 *
 * Returns: { severity, matched_keywords, reasoning, severity_score }
 */
import { NextRequest, NextResponse } from 'next/server';
import { chatWithGroq } from '@/lib/groq';

// ═══════════════════════════════════════════════════════════════════════════
// Keyword dictionaries for local pre-screening
// ═══════════════════════════════════════════════════════════════════════════

const SEVERITY_KEYWORDS: Record<string, string[]> = {
    Low: ['joke', 'comment', 'uncomfortable', 'awkward', 'stared', 'ignored'],
    Medium: ['repeated', 'shouted', 'insulted', 'pressured', 'scared', 'humiliated'],
    High: ['touch', 'follow', 'threaten', 'force', 'sexual', 'blackmail', 'manager'],
    Critical: ['rape', 'assault', 'locked', 'violence', 'suicide', 'kill', 'stalked daily', 'abuse'],
};

const SEVERITY_SCORES: Record<string, number> = {
    Low: 3,
    Medium: 5,
    High: 7,
    Critical: 10,
};

// ═══════════════════════════════════════════════════════════════════════════
// Local keyword scan (fast, no API call needed)
// ═══════════════════════════════════════════════════════════════════════════

function localKeywordScan(text: string): {
    severity: string;
    matched_keywords: string[];
    severity_score: number;
} {
    const lower = text.toLowerCase();
    const matched: string[] = [];
    let highestLevel = 'Low';
    const levels = ['Low', 'Medium', 'High', 'Critical'];

    for (const level of levels) {
        for (const kw of SEVERITY_KEYWORDS[level]) {
            if (lower.includes(kw)) {
                matched.push(kw);
                if (levels.indexOf(level) > levels.indexOf(highestLevel)) {
                    highestLevel = level;
                }
            }
        }
    }

    return {
        severity: highestLevel,
        matched_keywords: matched,
        severity_score: SEVERITY_SCORES[highestLevel],
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// System prompt for Groq LLM classification
// ═══════════════════════════════════════════════════════════════════════════

const CLASSIFICATION_SYSTEM_PROMPT = `You are an AI severity classification engine for a workplace safety and POSH compliance system.

Your task is to analyze a complaint description and determine the severity level using keyword-based signals combined with contextual understanding.

You must classify the complaint into EXACTLY ONE of the following severity levels:
- Low
- Medium
- High
- Critical

You are trained using the following keyword guidance:

LOW severity indicators:
- joke, comment, uncomfortable, awkward, stared, ignored

MEDIUM severity indicators:
- repeated, shouted, insulted, pressured, scared, humiliated

HIGH severity indicators:
- touch, follow, threaten, force, sexual, blackmail, manager

CRITICAL severity indicators:
- rape, assault, locked, violence, suicide, kill, stalked daily, abuse

Rules for classification:
1. Use the HIGHEST severity keyword detected as the base severity.
2. If multiple severity keywords appear, always choose the most severe category.
3. Increase severity if the complaint involves:
   - Power imbalance (manager, senior, lead)
   - Repetition or ongoing behavior
   - Threats related to job, appraisal, or safety
4. Emotional distress indicators (fear, panic, trauma) should increase severity.
5. Physical harm or credible threats automatically result in CRITICAL severity.
6. If the complaint is ambiguous, prioritize user safety and choose the higher severity.

You must return the result ONLY in valid JSON format:

{
  "severity": "Low | Medium | High | Critical",
  "matched_keywords": [],
  "reasoning": ""
}`;

// ═══════════════════════════════════════════════════════════════════════════
// Handler
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const { description } = await req.json();

        if (!description || typeof description !== 'string') {
            return NextResponse.json(
                { error: 'description is required' },
                { status: 400 }
            );
        }

        // ── Step 1: Fast local keyword scan ──────────────────────────────
        const local = localKeywordScan(description);

        // ── Step 2: LLM contextual analysis via Groq ─────────────────────
        let llmResult = null;
        try {
            const raw = await chatWithGroq(
                [{ role: 'user', content: `Complaint description:\n${description}` }],
                CLASSIFICATION_SYSTEM_PROMPT,
                0, // temperature 0 for deterministic
                256
            );

            // Parse JSON from LLM response
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                llmResult = JSON.parse(jsonMatch[0]);
            }
        } catch {
            // Groq LLM error, using local scan
        }

        // ── Step 3: Merge local + LLM results (higher severity wins) ─────
        const levels = ['Low', 'Medium', 'High', 'Critical'];

        const localIdx = levels.indexOf(local.severity);
        const llmIdx = llmResult ? levels.indexOf(llmResult.severity) : -1;

        const finalSeverity = llmIdx > localIdx ? llmResult!.severity : local.severity;
        const finalScore = SEVERITY_SCORES[finalSeverity] || local.severity_score;

        const mergedKeywords = Array.from(new Set([
            ...local.matched_keywords,
            ...(llmResult?.matched_keywords || []),
        ]));

        const result = {
            severity: finalSeverity,
            severity_score: finalScore,
            matched_keywords: mergedKeywords,
            reasoning: llmResult?.reasoning || `Local keyword scan detected: ${local.matched_keywords.join(', ') || 'no specific keywords'}. Classified as ${local.severity}.`,
            risk_level: finalSeverity.toLowerCase(),
        };

        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { error: 'Severity analysis failed' },
            { status: 500 }
        );
    }
}
