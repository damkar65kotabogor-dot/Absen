-- SIMPEG PPPK - Comprehensive RLS Policy Fix
-- CARA MENJALANKAN: 
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Salin seluruh kode ini dan jalankan
-- 3. Script ini akan membuka izin akses tabel untuk role 'anon' dan 'authenticated'

-- Drop all existing policies first to avoid conflicts
DO $$ 
DECLARE
    tab text;
BEGIN
    FOR tab IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('users', 'unit_kerja', 'jabatan', 'pegawai', 'pendidikan', 'diklat', 'keluarga', 'skp', 'riwayat_pangkat', 'riwayat_jabatan', 'kgb', 'absensi', 'cuti')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Permit All" ON %I', tab);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all for anon" ON %I', tab);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all for authenticated" ON %I', tab);
    END LOOP;
END $$;

-- Enable RLS for all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unit_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pendidikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diklat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS keluarga ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skp ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS riwayat_pangkat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS riwayat_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kgb ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cuti ENABLE ROW LEVEL SECURITY;

-- Create comprehensive 'Permit All' policies for ALL tables
-- This allows both anon and authenticated users full access
DO $$ 
DECLARE
    tab text;
BEGIN
    FOR tab IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('users', 'unit_kerja', 'jabatan', 'pegawai', 'pendidikan', 'diklat', 'keluarga', 'skp', 'riwayat_pangkat', 'riwayat_jabatan', 'kgb', 'absensi', 'cuti')
    LOOP
        -- Create policy for anon and authenticated roles
        EXECUTE format('CREATE POLICY "Permit All" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', tab);
        
        RAISE NOTICE 'Created policy for table: %', tab;
    END LOOP;
END $$;

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'unit_kerja', 'jabatan', 'pegawai', 'pendidikan', 'diklat', 'keluarga', 'skp', 'riwayat_pangkat', 'riwayat_jabatan', 'kgb', 'absensi', 'cuti')
ORDER BY tablename;
