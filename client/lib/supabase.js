import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey;

console.log(`[Client] Supabase Configured: ${isConfigured} (URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey})`);

if (!isConfigured) {
    console.warn('⚠️ Missing Supabase environment variables! Check your .env.local file.');
}

// Create client only if configured, otherwise create a dummy object to prevent crash
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
            signUp: () => Promise.reject(new Error('Supabase not configured')),
            signOut: () => Promise.resolve({ error: null }),
        },
        from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) })
    };
