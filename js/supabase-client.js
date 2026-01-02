/**
 * SIMPEG PPPK - Supabase Client
 */

// Hardcoded defaults
const DEFAULT_URL = 'https://nkkszblyffksojkizomh.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3N6Ymx5ZmZrc29qa2l6b21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTgwMDUsImV4cCI6MjA4Mjg3NDAwNX0.qfHVnczBIIvRELkykBWHFlpVvvm6e7EhXDDzp4zMRu0';

// Check for local overrides (set via Settings UI)
const SUPABASE_URL = localStorage.getItem('supabase_url') || DEFAULT_URL;
const SUPABASE_KEY = localStorage.getItem('supabase_key') || DEFAULT_KEY;

// Use window.supabase (from CDN) to create the client instance
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
