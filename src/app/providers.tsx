'use client';

import { AuthProvider } from '@/lib/auth-context';

/**
 * Client-side providers wrapper.
 * All context providers live here to keep root layout as a Server Component.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
