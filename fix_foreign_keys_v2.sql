-- SIMPEG PPPK - FORCE FIX FOREIGN KEYS
-- Run this if employee deletion still fails with "Key is still referenced" error

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. Find and DROP all foreign keys that reference the 'pegawai' table
    FOR r IN (
        SELECT tc.constraint_name, tc.table_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu 
          ON tc.constraint_name = kcu.constraint_name 
          AND tc.table_schema = kcu.table_schema 
        JOIN information_schema.constraint_column_usage AS ccu 
          ON ccu.constraint_name = tc.constraint_name 
          AND ccu.table_schema = tc.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'pegawai'
          AND tc.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT ' || r.constraint_name;
        RAISE NOTICE 'Dropped constraint % from table %', r.constraint_name, r.table_name;
    END LOOP;

    -- 2. Re-add the essential ones with ON DELETE CASCADE
    
    -- Absensi
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'absensi') THEN
        ALTER TABLE public.absensi ADD CONSTRAINT absensi_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- Cuti
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cuti') THEN
        ALTER TABLE public.cuti ADD CONSTRAINT cuti_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- Pendidikan
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pendidikan') THEN
        ALTER TABLE public.pendidikan ADD CONSTRAINT pendidikan_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- Keluarga
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'keluarga') THEN
        ALTER TABLE public.keluarga ADD CONSTRAINT keluarga_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- Diklat
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diklat') THEN
        ALTER TABLE public.diklat ADD CONSTRAINT diklat_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- SKP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skp') THEN
        ALTER TABLE public.skp ADD CONSTRAINT skp_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- KGB
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kgb') THEN
        ALTER TABLE public.kgb ADD CONSTRAINT kgb_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- Riwayat Jabatan
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'riwayat_jabatan') THEN
        ALTER TABLE public.riwayat_jabatan ADD CONSTRAINT riwayat_jabatan_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    -- Riwayat Pangkat
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'riwayat_pangkat') THEN
        ALTER TABLE public.riwayat_pangkat ADD CONSTRAINT riwayat_pangkat_pegawai_id_fkey 
        FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE CASCADE;
    END IF;

    RAISE NOTICE 'Foreign keys re-added with CASCADE delete.';
END $$;
