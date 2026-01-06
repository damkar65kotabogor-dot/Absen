-- SIMPEG PPPK - Supabase Schema Script
-- Run this in the Supabase SQL Editor

-- 1. Master Tables
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pegawai', -- admin, pimpinan, pegawai
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS unit_kerja (
    id BIGSERIAL PRIMARY KEY,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    kepala TEXT,
    parent_id BIGINT REFERENCES unit_kerja(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jabatan (
    id BIGSERIAL PRIMARY KEY,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    golongan TEXT,
    tunjangan BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 2. Profile Related Tables (Requested by User)

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

-- 3. Operational Tables
CREATE TABLE IF NOT EXISTS absensi (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_masuk TIME,
    jam_keluar TIME,
    lokasi_lat DECIMAL(10,8),
    lokasi_lng DECIMAL(11,8),
    status TEXT, -- hadir, terlambat, izin, sakit, cuti
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cuti (
    id BIGSERIAL PRIMARY KEY,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    jenis_cuti TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    alasan TEXT,
    jumlah_hari INTEGER,
    tanggal_pengajuan DATE DEFAULT CURRENT_DATE,
    approved_by TEXT,
    approved_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Permit All for simplicity in this project
-- ENABLE RLS
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

-- CREATE POLICIES (Allow all for anon role)
DROP POLICY IF EXISTS "Permit All" ON users;
CREATE POLICY "Permit All" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON unit_kerja;
CREATE POLICY "Permit All" ON unit_kerja FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON jabatan;
CREATE POLICY "Permit All" ON jabatan FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON pegawai;
CREATE POLICY "Permit All" ON pegawai FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON pendidikan;
CREATE POLICY "Permit All" ON pendidikan FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON riwayat_jabatan;
CREATE POLICY "Permit All" ON riwayat_jabatan FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON riwayat_pangkat;
CREATE POLICY "Permit All" ON riwayat_pangkat FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON diklat;
CREATE POLICY "Permit All" ON diklat FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON kgb;
CREATE POLICY "Permit All" ON kgb FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON skp;
CREATE POLICY "Permit All" ON skp FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON keluarga;
CREATE POLICY "Permit All" ON keluarga FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON absensi;
CREATE POLICY "Permit All" ON absensi FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permit All" ON cuti;
CREATE POLICY "Permit All" ON cuti FOR ALL TO anon USING (true) WITH CHECK (true);
