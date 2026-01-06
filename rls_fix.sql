-- SIMPEG PPPK - Comprehensive RLS Fix
-- CARA MENJALANKAN: Salin seluruh kode ini dan jalankan di Supabase SQL Editor.
-- Script ini akan membuka izin akses tabel untuk role 'anon' dan 'authenticated'.

-- 1. Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendidikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE diklat ENABLE ROW LEVEL SECURITY;
ALTER TABLE keluarga ENABLE ROW LEVEL SECURITY;
ALTER TABLE skp ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_pangkat ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kgb ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuti ENABLE ROW LEVEL SECURITY;

-- 2. Create 'Permit All' policies for ALL tables (Allows anon access)
DO $$ 
DECLARE
    tab text;
BEGIN
    FOR tab IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'unit_kerja', 'jabatan', 'pegawai', 'pendidikan', 'diklat', 'keluarga', 'skp', 'riwayat_pangkat', 'riwayat_jabatan', 'kgb', 'absensi', 'cuti')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Permit All" ON %I', tab);
        EXECUTE format('CREATE POLICY "Permit All" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', tab);
    END LOOP;
END $$;

-- 3. Fix cuti table columns (Ensure TEXT type for names)
DO $$ 
BEGIN 
    -- Fix approved_by type if it exists as something else
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cuti' AND column_name = 'approved_by' AND data_type != 'text'
    ) THEN
        ALTER TABLE cuti ALTER COLUMN approved_by TYPE TEXT;
    END IF;
END $$;
