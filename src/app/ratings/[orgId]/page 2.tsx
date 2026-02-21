// Organization Detail — Phase 9
export default async function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params;
    return (
        <main className="min-h-screen p-6 max-w-4xl mx-auto page-enter">
            <h1 className="text-2xl font-bold mb-1">🏢 Organization Details</h1>
            <p className="text-slate-400 mb-8">Safety score, badges, and reviews for org: {orgId}</p>
            <div className="glass-card"><p className="text-slate-400">Org detail — coming in Phase 9</p></div>
        </main>
    );
}
