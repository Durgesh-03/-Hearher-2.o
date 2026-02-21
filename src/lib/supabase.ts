import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from './database.types';

// ─── Environment Variables ───────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser Client (Client Components) ─────────────────────────────────────
export function createSupabaseBrowserClient() {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ─── Server Client (Server Components / API Routes) ─────────────────────────
export function createSupabaseServerClient(cookieStore: {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
    remove: (name: string, options?: Record<string, unknown>) => void;
}) {
    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: Record<string, unknown>) {
                cookieStore.set(name, value, options);
            },
            remove(name: string, options: Record<string, unknown>) {
                cookieStore.remove(name, options);
            },
        },
    });
}

// ─── Direct Admin Client (for demo/seeding — NOT for production) ─────────────
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
