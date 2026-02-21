// POST /api/ai/compare — Gemini both-sides statement comparison
import { NextRequest, NextResponse } from 'next/server';
import { compareStatements } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { complaintText, accusedResponse } = await req.json();
        if (!complaintText || !accusedResponse) {
            return NextResponse.json({ error: 'Both sides are required' }, { status: 400 });
        }
        const comparison = await compareStatements(complaintText, accusedResponse);
        return NextResponse.json(comparison);
    } catch {
        return NextResponse.json({ error: 'Comparison failed' }, { status: 500 });
    }
}
