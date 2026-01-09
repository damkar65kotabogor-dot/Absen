-- Diagnostic Queries untuk SIMPEG PPPK
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Salin dan jalankan query ini satu per satu untuk diagnosis

-- ============================================================
-- 1. CEK JUMLAH DATA DI SETIAP TABEL
-- ============================================================  
SELECT 'pegawai' as tabel, COUNT(*) as jumlah_baris FROM pegawai
UNION ALL
SELECT 'absensi' as tabel, COUNT(*) as jumlah_baris FROM absensi
UNION ALL
SELECT 'jabatan' as tabel, COUNT(*) as jumlah_baris FROM jabatan
UNION ALL
SELECT 'unit_kerja' as tabel, COUNT(*) as jumlah_baris FROM unit_kerja
UNION ALL
SELECT 'users' as tabel, COUNT(*) as jumlah_baris FROM users;

-- ============================================================
-- 2. CEK RLS POLICIES YANG AKTIF
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    CASE WHEN qual IS NULL THEN 'NO RESTRICTION' ELSE qual END as using_clause,
    CASE WHEN with_check IS NULL THEN 'NO RESTRICTION' ELSE with_check END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- 3. CEK RLS STATUS DI SETIAP TABEL
-- ============================================================
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'pegawai', 'absensi', 'jabatan', 'unit_kerja', 
                  'pendidikan', 'keluarga', 'riwayat_jabatan', 'riwayat_pangkat', 
                  'diklat', 'kgb', 'skp', 'cuti')
ORDER BY tablename;

-- ============================================================
-- 4. TEST QUERY JOIN (seperti yang digunakan aplikasi)
-- ============================================================
-- Test getPegawaiWithRelations()
SELECT 
    p.*,
    j.id as jabatan_id_check,
    j.nama as jabatan_nama,
    u.id as unit_kerja_id_check,
    u.nama as unit_kerja_nama
FROM pegawai p
LEFT JOIN jabatan j ON p.jabatan_id = j.id
LEFT JOIN unit_kerja u ON p.unit_kerja_id = u.id
LIMIT 5;

-- ============================================================
-- 5. TEST QUERY ABSENSI JOIN (seperti yang digunakan aplikasi)  
-- ============================================================
-- Test getAbsensiWithPegawai()
SELECT 
    a.*,
    p.id as pegawai_id_check,
    p.nama as pegawai_nama,
    p.nip as pegawai_nip
FROM absensi a
LEFT JOIN pegawai p ON a.pegawai_id = p.id
ORDER BY a.tanggal DESC
LIMIT 5;

-- ============================================================
-- 6. CEK FOREIGN KEY CONSTRAINTS
-- ============================================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('pegawai', 'absensi')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================
-- 7. CEK SAMPLE DATA PEGAWAI
-- ============================================================
SELECT * FROM pegawai LIMIT 3;

-- ============================================================
-- 8. CEK SAMPLE DATA ABSENSI
-- ============================================================
SELECT * FROM absensi ORDER BY tanggal DESC LIMIT 3;
