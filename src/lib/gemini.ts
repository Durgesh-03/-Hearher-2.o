/**
 * @file gemini.ts
 * Google Gemini AI client — all AI intelligence functions
 * Model: gemini-1.5-flash (fast, cost-effective, great for structured output)
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ─── Client ─────────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SAFETY = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function getModel(model = 'gemini-1.5-flash') {
    return genAI.getGenerativeModel({ model, safetySettings: SAFETY });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ComplaintAnalysis {
    sentiment: 'negative' | 'distressed' | 'neutral' | 'mixed';
    severity_score: number;       // 1-10
    category: string;             // verbal, physical, cyber, quid_pro_quo
    keywords: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    emotional_state: string;
    recommended_action: string;
}

export interface CredibilityAssessment {
    overall_score: number;        // 0-10
    dimensions: {
        consistency: number;
        detail_level: number;
        emotional_congruence: number;
        temporal_accuracy: number;
        corroboration: number;
        plausibility: number;
    };
    summary: string;
    flags: string[];
}

export interface StatementComparison {
    contradictions: { topic: string; complaint_says: string; accused_says: string }[];
    agreements: string[];
    evidence_gaps: string[];
    summary: string;
    credibility_leaning: 'complainant' | 'accused' | 'inconclusive';
}

export interface PatternAnalysis {
    patterns: { type: string; description: string; frequency: number; risk: string }[];
    earlyWarnings: string[];
    riskAreas: string[];
    summary: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function parseJSON<T>(text: string, fallback: T): T {
    try {
        // Strip markdown code fences if present
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(clean) as T;
    } catch {
        return fallback;
    }
}

// ─── 1. Complaint Analysis ───────────────────────────────────────────────────

export async function analyzeComplaint(description: string, type: string): Promise<ComplaintAnalysis> {
    const fallback: ComplaintAnalysis = {
        sentiment: 'negative',
        severity_score: 5,
        category: type,
        keywords: [],
        risk_level: 'medium',
        emotional_state: 'distressed',
        recommended_action: 'Assign ICC member for initial review.',
    };

    try {
        const model = getModel();
        const prompt = `You are a POSH Act (India 2013) expert. Analyze this workplace harassment complaint and respond ONLY with valid JSON.

Complaint type: ${type}
Description: "${description}"

Respond with exactly this JSON structure:
{
  "sentiment": "negative|distressed|neutral|mixed",
  "severity_score": <1-10 integer>,
  "category": "${type}",
  "keywords": ["word1", "word2", "word3"],
  "risk_level": "low|medium|high|critical",
  "emotional_state": "<short phrase describing the complainant's emotional state>",
  "recommended_action": "<one sentence recommended immediate HR action>"
}

severity_score guide: 1-3=minor discomfort, 4-6=significant harassment, 7-8=severe, 9-10=extremely serious/criminal.
risk_level: critical if physical threat or repeated pattern, high if quid pro quo or power imbalance, medium if verbal/cyber, low otherwise.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseJSON<ComplaintAnalysis>(text, fallback);
    } catch {
        return fallback;
    }
}

// ─── 2. Credibility Assessment ────────────────────────────────────────────────

export async function assessCredibility(
    complaintText: string,
    accusedResponse: string,
    evidence: string[] = []
): Promise<CredibilityAssessment> {
    const fallback: CredibilityAssessment = {
        overall_score: 5,
        dimensions: { consistency: 5, detail_level: 5, emotional_congruence: 5, temporal_accuracy: 5, corroboration: 5, plausibility: 5 },
        summary: 'Further review required.',
        flags: [],
    };

    try {
        const model = getModel();
        const evidenceText = evidence.length > 0 ? `\nEvidence submitted: ${evidence.join(', ')}` : '';

        const prompt = `You are an ICC (Internal Complaints Committee) expert under India's POSH Act 2013. Assess the credibility of this complaint.

Complainant's statement: "${complaintText}"
Accused's response: "${accusedResponse}"${evidenceText}

Respond ONLY with valid JSON:
{
  "overall_score": <0-10 float>,
  "dimensions": {
    "consistency": <0-10>,
    "detail_level": <0-10>,
    "emotional_congruence": <0-10>,
    "temporal_accuracy": <0-10>,
    "corroboration": <0-10>,
    "plausibility": <0-10>
  },
  "summary": "<2-3 sentence neutral assessment>",
  "flags": ["<any concerning factors>"]
}

Scoring: consistency=internal logical consistency, detail_level=specificity and recall quality, emotional_congruence=emotion matches described events, temporal_accuracy=timeline clarity, corroboration=supported by evidence/witnesses, plausibility=realistic given context.`;

        const result = await model.generateContent(prompt);
        return parseJSON<CredibilityAssessment>(result.response.text(), fallback);
    } catch {
        return fallback;
    }
}

// ─── 3. Statement Comparison ─────────────────────────────────────────────────

export async function compareStatements(
    complaintText: string,
    accusedResponse: string
): Promise<StatementComparison> {
    const fallback: StatementComparison = {
        contradictions: [],
        agreements: [],
        evidence_gaps: [],
        summary: 'Both statements have been noted. Further evidence required.',
        credibility_leaning: 'inconclusive',
    };

    try {
        const model = getModel();
        const prompt = `You are an ICC investigator under India's POSH Act 2013. Compare both sides of this workplace harassment case. Be neutral and factual.

Complainant's account: "${complaintText}"
Accused's response: "${accusedResponse}"

Respond ONLY with valid JSON:
{
  "contradictions": [
    {"topic": "<what aspect>", "complaint_says": "<complainant's version>", "accused_says": "<accused's version>"}
  ],
  "agreements": ["<points both parties agree on>"],
  "evidence_gaps": ["<what evidence would resolve key disputes>"],
  "summary": "<3-4 sentence neutral comparison>",
  "credibility_leaning": "complainant|accused|inconclusive"
}`;

        const result = await model.generateContent(prompt);
        return parseJSON<StatementComparison>(result.response.text(), fallback);
    } catch {
        return fallback;
    }
}

// ─── 4. Pattern Detection ─────────────────────────────────────────────────────

export async function detectPatterns(cases: { type: string; description: string; severity: number; date: string }[]): Promise<PatternAnalysis> {
    const fallback: PatternAnalysis = {
        patterns: [],
        earlyWarnings: [],
        riskAreas: [],
        summary: 'Insufficient data for pattern analysis.',
    };

    if (cases.length === 0) return fallback;

    try {
        const model = getModel();
        const caseSummary = cases.map((c, i) => `Case ${i + 1}: type=${c.type}, severity=${c.severity}/10, date=${c.date}, summary="${c.description.slice(0, 80)}"`).join('\n');

        const prompt = `You are an organizational safety analyst. Analyze these workplace harassment cases for patterns and risks.

Cases:
${caseSummary}

Respond ONLY with valid JSON:
{
  "patterns": [
    {"type": "<pattern type>", "description": "<what the pattern shows>", "frequency": <count>, "risk": "low|medium|high"}
  ],
  "earlyWarnings": ["<warning signals that need attention>"],
  "riskAreas": ["<departments, teams, or situations at risk>"],
  "summary": "<3-4 sentence executive summary of organizational risk>"
}`;

        const result = await model.generateContent(prompt);
        return parseJSON<PatternAnalysis>(result.response.text(), fallback);
    } catch {
        return fallback;
    }
}

// ─── 5. Annual Report Generation ─────────────────────────────────────────────

export async function generateAnnualReport(stats: {
    totalCases: number;
    resolvedCases: number;
    avgResolutionDays: number;
    casesByType: { type: string; count: number }[];
    complianceScore: number;
}, orgName: string, year: number): Promise<string> {
    try {
        const model = getModel();
        const prompt = `You are a POSH compliance officer. Write a formal annual report section for submission to the District Officer as required under Section 21 of POSH Act 2013.

Organization: ${orgName}
Year: ${year}
Data:
- Total complaints received: ${stats.totalCases}
- Complaints resolved: ${stats.resolvedCases}
- Average resolution time: ${stats.avgResolutionDays} days (legal limit: 90 days)
- Cases by type: ${stats.casesByType.map(c => `${c.type}: ${c.count}`).join(', ')}
- Compliance score: ${stats.complianceScore}%

Write a professional 3-paragraph report covering: actions taken, outcomes, and organizational measures implemented. Use formal language appropriate for a government submission.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch {
        return `Annual report for ${year}: ${stats.totalCases} complaints received, ${stats.resolvedCases} resolved with an average resolution time of ${stats.avgResolutionDays} days.`;
    }
}

// ─── 6. Text Embedding (for RAG) ─────────────────────────────────────────────

export async function embedText(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch {
        return [];
    }
}

// ─── 7. RAG Context Builder ───────────────────────────────────────────────────

export async function buildRAGAnswer(question: string, contextChunks: string[]): Promise<string> {
    try {
        const model = getModel();
        const context = contextChunks.join('\n\n---\n\n');

        const prompt = `You are a POSH Act 2013 (India) expert assistant helping an employee understand their rights and the complaints process. Answer based ONLY on the provided context. If the answer isn't in the context, say so honestly. Be empathetic, clear, and concise.

Context from POSH Act 2013:
${context}

Employee question: "${question}"

Answer in 2-4 sentences. Use simple language.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch {
        return "I'm sorry, I couldn't process your question. Please try again or contact your HR directly.";
    }
}
