// POST /api/ai/patterns — Gemini org-level pattern detection
import { NextRequest, NextResponse } from 'next/server';
import { detectPatterns } from '@/lib/gemini';
import { getComplaints } from '@/lib/data-service';

export async function POST(req: NextRequest) {
    try {
        const { orgId } = await req.json();
        if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });

        // Fetch complaints for this org from data service
        const complaints = await getComplaints({ orgId });
        const cases = complaints.map((c) => ({
            type: c.type,
            description: c.description,
            severity: c.severity,
            date: c.date_of_incident || '',
        }));

        const patterns = await detectPatterns(cases);
        return NextResponse.json(patterns);
    } catch {
        return NextResponse.json({ error: 'Pattern detection failed' }, { status: 500 });
    }
}
