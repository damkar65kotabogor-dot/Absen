-- Add File Upload Column to Cuti Table
-- Run this in Supabase SQL Editor after running supabase_schema.sql

-- Add bukti_file_url column to store file URL from Supabase Storage
ALTER TABLE cuti ADD COLUMN IF NOT EXISTS bukti_file_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cuti.bukti_file_url IS 'URL to supporting document/proof file stored in Supabase Storage bucket cuti-bukti';
