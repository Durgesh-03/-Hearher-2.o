import { embedText as generateEmbedding } from './gemini';
import { supabase } from './supabase';

// ─── RAG Engine — Retrieval Augmented Generation ────────────────────────────

/**
 * Search for relevant policy chunks using vector similarity.
 * Uses Gemini text-embedding-004 → pgvector cosine similarity.
 */
export async function searchPolicyChunks(
    query: string,
    orgId: string,
    limit: number = 5
): Promise<{ content: string; similarity: number }[]> {
    // Generate embedding for the user's query
    const queryEmbedding = await generateEmbedding(query);

    // Search using pgvector similarity (match_policy_embeddings is an RPC function)
    const { data, error } = await supabase.rpc('match_policy_embeddings', {
        query_embedding: queryEmbedding,
        match_count: limit,
        filter_org_id: orgId,
    } as any);

    if (error) {
        return [];
    }

    return data || [];
}

/**
 * Build the RAG context prompt for the chatbot.
 * Combines policy chunks + chat history into a structured prompt.
 */
export function buildRAGPrompt(
    policyChunks: { content: string }[],
    chatHistory: { role: string; message: string }[],
    userMessage: string
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
    const contextText = policyChunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n');

    const systemPrompt = `You are a compassionate and knowledgeable POSH (Prevention of Sexual Harassment) advisor.
You help employees understand their rights, the complaint process, and workplace safety policies.

IMPORTANT RULES:
- Answer ONLY based on the provided policy context below
- If the answer is not in the context, say "I don't have specific policy information about that, but I recommend speaking with your HR department or ICC member."
- Be empathetic, supportive, and professional
- Use simple language that is easy to understand
- Never dismiss concerns — always validate feelings
- Provide actionable next steps when possible
- If someone is in immediate danger, always recommend using the Panic Button feature

POLICY CONTEXT:
${contextText}`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
    ];

    // Add chat history (last 10 messages)
    const recentHistory = chatHistory.slice(-10);
    for (const msg of recentHistory) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.message,
        });
    }

    // Add the current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
}

/**
 * Embed and store a policy document chunk.
 * Used during policy upload / seeding.
 */
export async function embedAndStorePolicyChunk(
    content: string,
    orgId: string
): Promise<void> {
    const embedding = await generateEmbedding(content);

    const { error } = await supabase.from('policy_embeddings').insert({
        org_id: orgId,
        content,
        embedding,
    } as any);

    if (error) {
        throw error;
    }
}

/**
 * Split a document into chunks (~500 chars each, paragraph-based).
 */
export function splitIntoParagraphs(text: string, maxChars: number = 500): string[] {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        if ((currentChunk + '\n\n' + paragraph).length > maxChars && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = paragraph;
        } else {
            currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
