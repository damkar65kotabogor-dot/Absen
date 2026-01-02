/**
 * SIMPEG PPPK - Supabase Client
 */

const SUPABASE_URL = 'https://nkkszblyffksojkizomh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3N6Ymx5ZmZrc29qa2l6b21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTgwMDUsImV4cCI6MjA4Mjg3NDAwNX0.qfHVnczBIIvRELkykBWHFlpVvvm6e7EhXDDzp4zMRu0';

// Use window.supabase (from CDN) to create the client instance
// and assign it to a distinct global variable to avoid name conflicts.
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
