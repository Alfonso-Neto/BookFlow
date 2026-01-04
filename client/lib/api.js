import { supabase } from './supabase';

const API_URL = 'http://localhost:3001/api';

export async function fetchAPI(endpoint, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        headers,
        ...options,
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'API Error');
    }

    return res.json();
}
