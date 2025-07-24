const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hsdjbqqijtxehepifbfk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTE4NDQsImV4cCI6MjA2ODc4Nzg0NH0.q0KQo2E1KOG_0AL4D69PDD2gkVmx39V-_njV0anP2q0';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
