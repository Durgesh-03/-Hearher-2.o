/**
 * POST /api/ai/classify — Standalone keyword-based severity classification
 *
 * Fast, deterministic, no external API calls.
 * Returns severity level, matched keywords, and reasoning.
 */
import { NextRequest, NextResponse } from 'next/server';
import { classifySeverity } from '@/lib/severity-classifier';

export async function POST(req: NextRequest) {
    try {
        const { description } = await req.json();
        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const result = classifySeverity(description);

        return NextResponse.json({
            severity: result.severity,
            severity_score: result.severity_score,
            matched_keywords: result.matched_keywords,
            reasoning: result.reasoning,
        });
    } catch {
        return NextResponse.json({ error: 'Classification failed' }, { status: 500 });
    }
}
