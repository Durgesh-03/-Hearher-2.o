// POST /api/ai/analyze — Hybrid severity classification
// Layer 1: Instant keyword-based classifier (local, deterministic)
// Layer 2: Gemini NLP analysis (remote, richer context)
import { NextRequest, NextResponse } from 'next/server';
import { analyzeComplaint } from '@/lib/gemini';
import { classifySeverity } from '@/lib/severity-classifier';

export async function POST(req: NextRequest) {
    try {
        const { description, type } = await req.json();
        if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

        // Layer 1: Instant local keyword classification (always runs)
        const localResult = classifySeverity(description);

        // Layer 2: Gemini deep analysis (may fail gracefully)
        let geminiResult = null;
        try {
            geminiResult = await analyzeComplaint(description, type || 'verbal');
        } catch {
            // Gemini unavailable, using local classifier only
        }

        // Merge: use local classifier's severity as the authoritative severity,
        // and enrich with Gemini's sentiment/keywords/recommendations when available
        const merged = {
            severity: localResult.severity,
            severity_score: geminiResult
                ? Math.max(localResult.severity_score, geminiResult.severity_score)
                : localResult.severity_score,
            risk_level: localResult.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
            matched_keywords: localResult.matched_keywords,
            reasoning: localResult.reasoning,
            // From Gemini (enrichment)
            sentiment: geminiResult?.sentiment || 'negative',
            category: geminiResult?.category || type || 'verbal',
            keywords: geminiResult?.keywords || localResult.matched_keywords,
            emotional_state: geminiResult?.emotional_state || 'unknown',
            recommended_action: geminiResult?.recommended_action || getDefaultAction(localResult.severity),
        };

        return NextResponse.json(merged);
    } catch {
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}

function getDefaultAction(severity: string): string {
    switch (severity) {
        case 'Critical': return 'Immediately escalate to ICC Presiding Officer and notify Security. Ensure complainant safety.';
        case 'High': return 'Assign senior ICC member within 24 hours. Document all evidence. Consider interim safety measures.';
        case 'Medium': return 'Assign ICC member for initial review within 48 hours. Schedule preliminary hearing.';
        case 'Low': return 'Log the complaint and schedule an informal resolution meeting with HR.';
        default: return 'Assign ICC member for initial review.';
    }
}
