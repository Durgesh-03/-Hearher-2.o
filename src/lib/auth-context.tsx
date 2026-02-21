'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from './database.types';

// ─── Auth Context Types ─────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signInAsRole: (role: UserRole) => void;
    signOut: () => void;
    switchRole: (role: UserRole) => void; // Demo: switch role without re-login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Demo Users (for working without Supabase) ──────────────────────────────
const DEMO_USERS: Record<UserRole, User> = {
    employee: {
        id: 'demo-emp-001',
        org_id: 'demo-org-001',
        email: 'priya@acmecorp.in',
        name: 'Priya Sharma',
        role: 'employee',
        avatar_url: null,
        department: 'Engineering',
        mfa_enabled: false,
        created_at: new Date().toISOString(),
    },
    hr: {
        id: 'demo-hr-001',
        org_id: 'demo-org-001',
        email: 'hr@acmecorp.in',
        name: 'Anjali Mehta',
        role: 'hr',
        avatar_url: null,
        department: 'Human Resources',
        mfa_enabled: true,
        created_at: new Date().toISOString(),
    },
    icc: {
        id: 'demo-icc-001',
        org_id: 'demo-org-001',
        email: 'icc@acmecorp.in',
        name: 'Justice Raman',
        role: 'icc',
        avatar_url: null,
        department: 'Legal',
        mfa_enabled: true,
        created_at: new Date().toISOString(),
    },
    security: {
        id: 'demo-sec-001',
        org_id: 'demo-org-001',
        email: 'security@acmecorp.in',
        name: 'Rajesh Kumar',
        role: 'security',
        avatar_url: null,
        department: 'Security',
        mfa_enabled: false,
        created_at: new Date().toISOString(),
    },
};

// ─── Auth Provider ──────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for saved session on mount
    useEffect(() => {
        const savedRole = localStorage.getItem('posh_demo_role') as UserRole | null;
        if (savedRole && DEMO_USERS[savedRole]) {
            setUser(DEMO_USERS[savedRole]);
        }
        setLoading(false);
    }, []);

    const signIn = useCallback(async (email: string, _password: string) => {
        setLoading(true);
        // Demo mode: match email to a demo user
        const matchedUser = Object.values(DEMO_USERS).find((u) => u.email === email);
        if (matchedUser) {
            setUser(matchedUser);
            localStorage.setItem('posh_demo_role', matchedUser.role);
        } else {
            // Default to employee
            setUser(DEMO_USERS.employee);
            localStorage.setItem('posh_demo_role', 'employee');
        }
        setLoading(false);
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
        localStorage.removeItem('posh_demo_role');
    }, []);

    const switchRole = useCallback((role: UserRole) => {
        setUser(DEMO_USERS[role]);
        localStorage.setItem('posh_demo_role', role);
    }, []);

    const signInAsRole = useCallback((role: UserRole) => {
        setUser(DEMO_USERS[role]);
        localStorage.setItem('posh_demo_role', role);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signInAsRole, signOut, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
