-- ============================================================
-- SIMPEG PPPK - COMPLETE SETUP SCRIPT
-- ============================================================
-- INSTRUKSI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy seluruh script ini
-- 3. Paste dan jalankan dengan tombol "RUN"
-- 4. Tunggu hingga selesai (akan muncul "Success. No rows returned")
-- 5. Refresh aplikasi web Anda
-- ============================================================

-- Drop existing policies first to avoid conflicts
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

-- ============================================================
-- 1. CREATE TABLES
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pegawai', -- admin, pimpinan, pegawai
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unit Kerja Table
CREATE TABLE IF NOT EXISTS unit_kerja (
    id BIGSERIAL PRIMARY KEY,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    kepala TEXT,
    parent_id BIGINT REFERENCES unit_kerja(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jabatan Table
CREATE TABLE IF NOT EXISTS jabatan (
    id BIGSERIAL PRIMARY KEY,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    golongan TEXT,
    tunjangan BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pegawai Table
CREATE TABLE IF NOT EXISTS pegawai (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nip TEXT UNIQUE NOT NULL,
    nik TEXT UNIQUE,
    nama TEXT NOT NULL,
    gelar_depan TEXT,
    gelar_belakang TEXT,
    tempat_lahir TEXT,
    tanggal_lahir DATE,
    jenis_kelamin CHAR(1), -- 'L' or 'P'
    agama TEXT,
    status_nikah TEXT,
    alamat TEXT,
    telepon TEXT,
    email TEXT,
    foto TEXT,
    unit_kerja_id BIGINT REFERENCES unit_kerja(id),
    jabatan_id BIGINT REFERENCES jabatan(id),
    tanggal_masuk DATE,
    status TEXT DEFAULT 'aktif', -- aktif, pensiun, keluar
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pendidikan Table
CREATE TABLE IF NOT EXISTS pendidikan (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    tingkat TEXT NOT NULL, -- SD, SMP, SMA, D3, S1, S2, S3
    nama_sekolah TEXT NOT NULL,
    jurusan TEXT,
    tahun_lulus INTEGER NOT NULL,
    no_ijazah TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Riwayat Jabatan Table
CREATE TABLE IF NOT EXISTS riwayat_jabatan (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    nama_jabatan TEXT NOT NULL,
    unit_kerja TEXT NOT NULL,
    tmt_jabatan DATE NOT NULL,
    nomor_sk TEXT,
    tanggal_sk DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Riwayat Pangkat Table
CREATE TABLE IF NOT EXISTS riwayat_pangkat (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    golongan TEXT NOT NULL,
    tmt_pangkat DATE NOT NULL,
    nomor_sk TEXT,
    tanggal_sk DATE,
    pejabat_penetap TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diklat Table
CREATE TABLE IF NOT EXISTS diklat (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    nama_diklat TEXT NOT NULL,
    tahun INTEGER NOT NULL,
    penyelenggara TEXT,
    no_sertifikat TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KGB Table
CREATE TABLE IF NOT EXISTS kgb (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    tmt_kgb DATE NOT NULL,
    gaji_pokok BIGINT NOT NULL,
    nomor_sk TEXT,
    tanggal_sk DATE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKP Table
CREATE TABLE IF NOT EXISTS skp (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    tahun INTEGER NOT NULL,
    nilai_skp DECIMAL(5,2) NOT NULL,
    pejabat_penilai TEXT,
    atasan_pejabat_penilai TEXT,
    orientasi_pelayanan DECIMAL(5,2),
    integritas DECIMAL(5,2),
    komitmen DECIMAL(5,2),
    disiplin DECIMAL(5,2),
    kerjasama DECIMAL(5,2),
    kepemimpinan DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keluarga Table
CREATE TABLE IF NOT EXISTS keluarga (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    hubungan TEXT NOT NULL, -- Suami, Istri, Anak, Ayah, Ibu
    jenis_kelamin CHAR(1),
    tanggal_lahir DATE,
    pekerjaan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Absensi Table
CREATE TABLE IF NOT EXISTS absensi (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_masuk TIME,
    jam_keluar TIME,
    lokasi_lat DECIMAL(10,8),
    lokasi_lng DECIMAL(11,8),
    status TEXT, -- tepat_waktu, terlambat, izin, sakit, cuti
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuti Table
CREATE TABLE IF NOT EXISTS cuti (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    jenis_cuti TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    alasan TEXT,
    jumlah_hari INTEGER,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    bukti_file TEXT,
    tanggal_pengajuan DATE DEFAULT CURRENT_DATE,
    approved_by TEXT,
    approved_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendidikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_pangkat ENABLE ROW LEVEL SECURITY;
ALTER TABLE diklat ENABLE ROW LEVEL SECURITY;
ALTER TABLE kgb ENABLE ROW LEVEL SECURITY;
ALTER TABLE skp ENABLE ROW LEVEL SECURITY;
ALTER TABLE keluarga ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuti ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. CREATE RLS POLICIES (Permit All for anon and authenticated)
-- ============================================================
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
        
        RAISE NOTICE 'Created RLS policy for table: %', tab;
    END LOOP;
END $$;

-- ============================================================
-- 4. SEED INITIAL DATA
-- ============================================================

-- Insert default users (admin, pimpinan)
INSERT INTO users (username, password, role, name) 
VALUES ('admin', 'admin123', 'admin', 'Administrator')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, role, name) 
VALUES ('pimpinan', 'pimpinan123', 'pimpinan', 'Kepala Dinas')
ON CONFLICT (username) DO NOTHING;

-- Insert default unit kerja
INSERT INTO unit_kerja (kode, nama, kepala) 
VALUES ('DPKP', 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor', 'Kepala Dinas')
ON CONFLICT (kode) DO NOTHING;

-- Insert default jabatan
INSERT INTO jabatan (kode, nama, golongan, tunjangan) 
VALUES ('J001', 'Operator Layanan Operasional', '-', 0)
ON CONFLICT (kode) DO NOTHING;

INSERT INTO jabatan (kode, nama, golongan, tunjangan) 
VALUES ('J002', 'Pengelola Umum Operasional', '-', 0)
ON CONFLICT (kode) DO NOTHING;

-- Insert pegawai for admin and pimpinan
INSERT INTO pegawai (user_id, nip, nama, unit_kerja_id, jabatan_id, status)
SELECT 
    (SELECT id FROM users WHERE username = 'admin'),
    '197001012023011001',
    'Administrator',
    (SELECT id FROM unit_kerja WHERE kode = 'DPKP'),
    (SELECT id FROM jabatan WHERE kode = 'J001'),
    'aktif'
WHERE NOT EXISTS (SELECT 1 FROM pegawai WHERE nip = '197001012023011001');

INSERT INTO pegawai (user_id, nip, nama, unit_kerja_id, jabatan_id, status)
SELECT 
    (SELECT id FROM users WHERE username = 'pimpinan'),
    '197505052023011002',
    'Kepala Dinas',
    (SELECT id FROM unit_kerja WHERE kode = 'DPKP'),
    (SELECT id FROM jabatan WHERE kode = 'J002'),
    'aktif'
WHERE NOT EXISTS (SELECT 1 FROM pegawai WHERE nip = '197505052023011002');

-- ============================================================
-- 5. VERIFICATION QUERIES (Check if setup successful)
-- ============================================================

-- Count records in each table
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'pegawai' as table_name, COUNT(*) as row_count FROM pegawai
UNION ALL
SELECT 'jabatan' as table_name, COUNT(*) as row_count FROM jabatan
UNION ALL
SELECT 'unit_kerja' as table_name, COUNT(*) as row_count FROM unit_kerja
UNION ALL
SELECT 'absensi' as table_name, COUNT(*) as row_count FROM absensi
ORDER BY table_name;

-- Show RLS policies
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'pegawai', 'absensi', 'jabatan', 'unit_kerja')
ORDER BY tablename;
