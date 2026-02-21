// POST /api/ai/credibility — Gemini ICC credibility assessment
import { NextRequest, NextResponse } from 'next/server';
import { assessCredibility } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { complaintText, accusedResponse, evidence } = await req.json();
        if (!complaintText) return NextResponse.json({ error: 'Complaint text is required' }, { status: 400 });

        const assessment = await assessCredibility(complaintText, accusedResponse || '', evidence || []);
        return NextResponse.json(assessment);
    } catch {
        return NextResponse.json({ error: 'Credibility assessment failed' }, { status: 500 });
    }
}
