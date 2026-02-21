// POST /api/ai/embed — Gemini text embedding for RAG vector storage
import { NextRequest, NextResponse } from 'next/server';
import { embedText } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 });

        const embedding = await embedText(text);
        return NextResponse.json({ embedding, dimensions: embedding.length });
    } catch {
        return NextResponse.json({ error: 'Embedding failed' }, { status: 500 });
    }
}
