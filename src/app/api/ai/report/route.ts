// POST /api/ai/report — Gemini annual compliance report generation
import { NextRequest, NextResponse } from 'next/server';
import { generateAnnualReport } from '@/lib/gemini';
import { getDashboardStats } from '@/lib/data-service';

export async function POST(req: NextRequest) {
    try {
        const { orgId, orgName, year } = await req.json();
        if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });

        const stats = await getDashboardStats(orgId);
        const reportYear = year || new Date().getFullYear();
        const name = orgName || 'Organization';

        const report = await generateAnnualReport(stats, name, reportYear);
        return NextResponse.json({ report, year: reportYear, generatedAt: new Date().toISOString() });
    } catch {
        return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
    }
}
