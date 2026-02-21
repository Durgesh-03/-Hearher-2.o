/**
 * @file groq.ts
 * Groq AI client — ultra-fast LLaMA 3 70B for real-time streaming chat
 * Used for: RAG chatbot (conversational), fast analysis feedback
 */

import Groq from 'groq-sdk';

// ─── Client ─────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// ─── 1. Standard Chat (non-streaming) ────────────────────────────────────────

export async function chatWithGroq(
    messages: ChatMessage[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1024
): Promise<string> {
    try {
        const allMessages: ChatMessage[] = systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages;

        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: allMessages,
            temperature,
            max_tokens: maxTokens,
        });

        return completion.choices[0]?.message?.content || '';
    } catch (err) {
        throw err;
    }
}

// ─── 2. Streaming Chat ────────────────────────────────────────────────────────
// Returns a ReadableStream of text chunks for SSE (Server-Sent Events)

export async function streamChatWithGroq(
    messages: ChatMessage[],
    systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
    const allMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];

    const stream = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const token = chunk.choices[0]?.delta?.content || '';
                    if (token) {
                        // Server-Sent Events format
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (err) {
                controller.error(err);
            }
        },
    });
}

// ─── 3. POSH Chatbot System Prompt Builder ───────────────────────────────────

export function buildPOSHSystemPrompt(contextChunks: string[]): string {
    const context = contextChunks.length > 0
        ? contextChunks.join('\n\n---\n\n')
        : 'The POSH Act 2013 protects employees from sexual harassment at the workplace in India.';

    return `You are a compassionate, knowledgeable POSH Act 2013 (India) assistant named "Aasha" helping employees understand their rights, the complaints process, and workplace safety.

Relevant POSH Act context:
${context}

Guidelines:
- Be empathetic, warm, and non-judgmental. The person talking to you may be distressed.
- Answer ONLY based on the context provided. Don't make up laws or procedures.
- Keep answers concise (2-4 sentences unless more detail is clearly needed).
- If asked about filing a complaint, guide them to the complaint wizard in this app.
- If someone seems in distress or danger, remind them of the panic button.
- Never reveal case details or other users' information.
- If you don't know something, honestly say "I'm not sure — please contact your HR or ICC directly."
- Use simple, clear language. Avoid legal jargon.`;
}

// ─── 4. Quick Sentiment (fast, for real-time feedback) ───────────────────────

export async function quickSentimentCheck(text: string): Promise<'distressed' | 'negative' | 'neutral'> {
    if (text.length < 20) return 'neutral';

    try {
        const result = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant', // Use smallest model for speed
            messages: [
                {
                    role: 'user',
                    content: `Classify this text's emotional tone as exactly one word: "distressed", "negative", or "neutral".\nText: "${text.slice(0, 300)}"`,
                },
            ],
            temperature: 0,
            max_tokens: 10,
        });

        const response = result.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral';
        if (response.includes('distressed')) return 'distressed';
        if (response.includes('negative')) return 'negative';
        return 'neutral';
    } catch {
        return 'neutral';
    }
}
