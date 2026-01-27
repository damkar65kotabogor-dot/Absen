-- SIMPEG PPPK - Fix Foreign Key Constraints (Cascade Delete)
-- Run this in Supabase SQL Editor to allow deleting employees

-- 1. Drop existing constraints (they might have different names, but these are the defaults)
ALTER TABLE IF EXISTS absensi DROP CONSTRAINT IF EXISTS absensi_pegawai_id_fkey;
ALTER TABLE IF EXISTS cuti DROP CONSTRAINT IF EXISTS cuti_pegawai_id_fkey;
ALTER TABLE IF EXISTS pendidikan DROP CONSTRAINT IF EXISTS pendidikan_pegawai_id_fkey;
ALTER TABLE IF EXISTS keluarga DROP CONSTRAINT IF EXISTS keluarga_pegawai_id_fkey;
ALTER TABLE IF EXISTS diklat DROP CONSTRAINT IF EXISTS diklat_pegawai_id_fkey;
ALTER TABLE IF EXISTS riwayat_jabatan DROP CONSTRAINT IF EXISTS riwayat_jabatan_pegawai_id_fkey;
ALTER TABLE IF EXISTS riwayat_pangkat DROP CONSTRAINT IF EXISTS riwayat_pangkat_pegawai_id_fkey;
ALTER TABLE IF EXISTS kgb DROP CONSTRAINT IF EXISTS kgb_pegawai_id_fkey;
ALTER TABLE IF EXISTS skp DROP CONSTRAINT IF EXISTS skp_pegawai_id_fkey;

-- 2. Re-add constraints with ON DELETE CASCADE
ALTER TABLE absensi ADD CONSTRAINT absensi_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE cuti ADD CONSTRAINT cuti_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE pendidikan ADD CONSTRAINT pendidikan_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE keluarga ADD CONSTRAINT keluarga_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE diklat ADD CONSTRAINT diklat_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE riwayat_jabatan ADD CONSTRAINT riwayat_jabatan_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE riwayat_pangkat ADD CONSTRAINT riwayat_pangkat_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE kgb ADD CONSTRAINT kgb_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

ALTER TABLE skp ADD CONSTRAINT skp_pegawai_id_fkey 
    FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE;

-- 3. Also ensure user deletion propagates to pegawai if not already set
ALTER TABLE pegawai DROP CONSTRAINT IF EXISTS pegawai_user_id_fkey;
ALTER TABLE pegawai ADD CONSTRAINT pegawai_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
