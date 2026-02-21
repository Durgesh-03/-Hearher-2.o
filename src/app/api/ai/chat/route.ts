/**
 * POST /api/ai/chat — Full RAG pipeline
 * 1. Embed the user question (Gemini text-embedding-004)
 * 2. Semantic search Supabase pgvector for top POSH Act chunks
 * 3. Build system prompt with retrieved context
 * 4. Stream response from Groq LLaMA 3 70B
 *
 * Falls back to Gemini direct answer if pgvector has no data yet.
 */
import { NextRequest } from 'next/server';
import { embedText, buildRAGAnswer } from '@/lib/gemini';
import { streamChatWithGroq, buildPOSHSystemPrompt, type ChatMessage } from '@/lib/groq';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase (server-side only, service role not needed — anon key is fine for reads) ──
function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url === 'your-supabase-url') return null;
    return createClient(url, key);
}

// ─── Vector search for POSH Act chunks ───────────────────────────────────────
async function searchPOSHContext(question: string): Promise<string[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        const embedding = await embedText(question);
        if (embedding.length === 0) return [];

        // pgvector similarity search — table: posh_act_chunks, column: embedding
        const { data, error } = await supabase.rpc('match_posh_chunks', {
            query_embedding: embedding,
            match_threshold: 0.75,
            match_count: 4,
        });

        if (error || !data) return [];
        return (data as { content: string }[]).map((d) => d.content);
    } catch {
        return [];
    }
}

// ─── POSH Act fallback context (used if pgvector has no data yet) ────────────
const POSH_FALLBACK_CONTEXT = [
    `Under Section 2(n) of the POSH Act 2013, sexual harassment includes: unwelcome physically, verbally or non-verbally conduct of a sexual nature. This includes physical contact and advances, a demand or request for sexual favours, making sexually coloured remarks, showing pornography, and any other unwelcome physical, verbal or non-verbal conduct of sexual nature.`,
    `Under Section 4 of POSH Act 2013, every employer shall constitute an Internal Complaints Committee (ICC). The ICC shall consist of: a Presiding Officer (woman employed at senior level), not less than two Members from amongst employees (preferably committed to women's welfare), and one external member from an NGO or association committed to causes of women.`,
    `Under Section 9 of POSH Act 2013, an aggrieved woman has to make a written complaint to the ICC within 3 months of the incident, or 3 months from the last incident in case of a series of incidents. The ICC may extend this time limit up to an additional 3 months if satisfied with the circumstances.`,
    `Section 11 of POSH Act 2013: The ICC shall complete the inquiry within 90 days. Section 13: On completion of inquiry, the ICC shall provide a report to the employer within 10 days. The employer must act on the recommendations within 60 days.`,
    `Section 16 of the POSH Act 2013 mandates strict confidentiality. The ICC, employer, and district officer shall not publish the contents of any complaint made under the Act. Breach of confidentiality is punishable under Section 17.`,
    `Anonymous complaints: While the POSH Act doesn't explicitly provide for anonymous complaints, an aggrieved woman may choose not to disclose her identity under Section 6 (Local Complaints Committee). Organizations may create policies to accept anonymous complaints as an additional safeguard.`,
    `Under Section 19 of POSH Act 2013, employers are required to: Provide a safe working environment, display penal consequences of sexual harassment, organize workshops and awareness programs, provide necessary facilities to the ICC, and include in the annual report the number of cases filed and resolved.`,
];

// ─── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const { message, history = [] } = await req.json();
        if (!message) {
            return new Response('Message is required', { status: 400 });
        }

        // 1. Try RAG — search for relevant POSH Act chunks
        let contextChunks = await searchPOSHContext(message);

        // 2. Use fallback context if pgvector has no data
        if (contextChunks.length === 0) {
            // Pick the most relevant fallback chunks using simple keyword matching
            const q = message.toLowerCase();
            contextChunks = POSH_FALLBACK_CONTEXT.filter((chunk) =>
                q.split(' ').some((word: string) => word.length > 4 && chunk.toLowerCase().includes(word))
            );
            // Always include at least 2 chunks
            if (contextChunks.length < 2) {
                contextChunks = POSH_FALLBACK_CONTEXT.slice(0, 3);
            }
        }

        // 3. Build conversation history for Groq
        const messages: ChatMessage[] = (history as { role: string; content: string }[])
            .slice(-10) // Keep last 10 messages for context
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        messages.push({ role: 'user', content: message });

        // 4. Build system prompt with POSH context
        const systemPrompt = buildPOSHSystemPrompt(contextChunks);

        // 5. Stream response from Groq
        const stream = await streamChatWithGroq(messages, systemPrompt);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch {

        // Final fallback — use Gemini directly (non-streaming)
        try {
            const { message } = await req.json();
            const answer = await buildRAGAnswer(message, POSH_FALLBACK_CONTEXT.slice(0, 2));
            const encoder = new TextEncoder();
            return new Response(
                new ReadableStream({
                    start(controller) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: answer })}\n\n`));
                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    },
                }),
                { headers: { 'Content-Type': 'text/event-stream' } }
            );
        } catch {
            return new Response('Chat failed', { status: 500 });
        }
    }
}
