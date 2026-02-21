'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth-context';
import { PageLoader } from '@/components/ui/Spinner';
import POSHChatbot from '@/components/chat/POSHChatbot';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    return (
        <ToastProvider>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                    {/* TopBar */}
                    <TopBar />

                    {/* Page Content */}
                    <main className="flex-1 p-6 overflow-auto">
                        <div className="page-enter">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <POSHChatbot />
        </ToastProvider>
    );
}
