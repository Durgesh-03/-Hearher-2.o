// Complaint Wizard — Phase 4
import ComplaintWizard from '@/components/complaints/ComplaintWizard';

export default function NewComplaintPage() {
    return (
        <div className="page-enter max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1 gradient-text">📝 File a Complaint</h1>
                <p className="text-slate-400">
                    Your identity will be protected. Speak up without fear.
                </p>
            </div>

            <ComplaintWizard />
        </div>
    );
}
