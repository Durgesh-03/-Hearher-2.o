/**
 * POST /api/ai/voice — Voice-based POSH Incident Classifier
 *
 * Accepts transcribed voice input and returns a structured JSON response
 * with incident_summary, severity, matched_keywords, and analysis_reason.
 *
 * Uses Gemini for nuanced understanding with keyword-based severity as fallback.
 */
import { NextRequest, NextResponse } from 'next/server';
import { classifySeverity } from '@/lib/severity-classifier';
import { detectVoiceEmergencyKeywords } from '@/lib/safety-assistant';

const SYSTEM_PROMPT = `You are a POSH Act Assistant.

The user is describing a workplace incident using a microphone.
The input you receive is a speech-to-text transcription of their voice.

Your task:
- Understand the incident exactly as described
- Analyze the content for POSH-related issues
- Identify severity based on keywords and context
- Be calm, respectful, and supportive

Severity levels (choose ONE):
Low, Medium, High, Critical

Keyword guidance for severity analysis:

Low severity:
joke, comment, uncomfortable, awkward, stared, ignored

Medium severity:
repeated, shouted, insulted, pressured, scared, humiliated

High severity:
touch, follow, threaten, force, sexual, blackmail, manager

Critical severity:
rape, assault, locked, violence, suicide, kill, stalked daily, abuse

Rules:
- Use the highest severity keyword detected
- Consider repetition, fear, and power imbalance
- Prioritize user safety
- Do not judge or blame the user
- Do not ask questions
- Do not give advice

Return ONLY valid JSON in this format:

{
  "incident_summary": "",
  "severity": "Low | Medium | High | Critical",
  "matched_keywords": [],
  "analysis_reason": ""
}`;

interface VoiceMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(req: NextRequest) {
    try {
        const { transcript, history = [] } = await req.json();
        if (!transcript) {
            return NextResponse.json({ error: 'Voice transcript is required' }, { status: 400 });
        }

        // ── Step 1: Detect voice emergency keywords for auto-SOS ─────────
        const voiceKeywordMatches = detectVoiceEmergencyKeywords(transcript);
        const autoTriggerSOS = voiceKeywordMatches.length > 0;

        // ── Step 2: Run local keyword classifier for severity baseline ───
        const allText = [...(history as VoiceMessage[]).map((m) => m.content), transcript].join(' ');
        const localSeverity = classifySeverity(allText);

        // If auto-SOS is triggered, override severity to Critical
        const effectiveSeverity = autoTriggerSOS ? 'Critical' : localSeverity.severity;

        // ── Step 3: Try Gemini for structured incident analysis ──────────
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const fullPrompt = `${SYSTEM_PROMPT}

Voice transcript:
${transcript}

Respond with ONLY valid JSON, no markdown fencing.`;

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: fullPrompt }] }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
                        }),
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

                    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                    const parsed = JSON.parse(jsonStr);

                    // Use the higher severity between local and Gemini
                    const severityRank: Record<string, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };
                    const geminiRank = severityRank[parsed.severity] || 1;
                    const localRank = severityRank[localSeverity.severity] || 1;

                    if (localRank > geminiRank) {
                        parsed.severity = localSeverity.severity;
                    }

                    // Override to Critical if emergency keywords detected
                    if (autoTriggerSOS) {
                        parsed.severity = 'Critical';
                        parsed.matched_keywords = [
                            ...new Set([...parsed.matched_keywords, ...voiceKeywordMatches]),
                        ];
                    }

                    // Merge local matched keywords
                    parsed.matched_keywords = [
                        ...new Set([...parsed.matched_keywords, ...localSeverity.matched_keywords]),
                    ];

                    parsed.auto_trigger_sos = autoTriggerSOS;

                    return NextResponse.json(parsed);
                }
            } catch {
                // Gemini error, falling back to local
            }
        }

        // ── Step 4: Fallback — local classifier response ────────────────
        const fallbackResponse = {
            incident_summary: `User reported a workplace incident via voice input.`,
            severity: effectiveSeverity,
            matched_keywords: [
                ...new Set([...localSeverity.matched_keywords, ...voiceKeywordMatches]),
            ],
            analysis_reason: localSeverity.reasoning || `Severity determined by local keyword analysis.`,
            auto_trigger_sos: autoTriggerSOS,
        };

        return NextResponse.json(fallbackResponse);
    } catch {
        return NextResponse.json({ error: 'Voice assistant error' }, { status: 500 });
    }
}

