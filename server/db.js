require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    console.warn('⚠️  WARNING: Supabase keys missing or invalid. Server will run in MOCK MODE.');
    module.exports = null;
} else {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        module.exports = supabase;
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error.message);
        module.exports = null;
    }
}
