const Data = {
    // Storage keys (still used for some local state if needed)
    KEYS: {
        CURRENT_USER: 'simpeg_current_user',
        PENDIDIKAN: 'pendidikan',
        RIWAYAT_JABATAN: 'riwayat_jabatan',
        RIWAYAT_PANGKAT: 'riwayat_pangkat',
        DIKLAT: 'diklat',
        KGB: 'kgb',
        SKP: 'riwayat_skp',
        KELUARGA: 'keluarga',
        JABATAN: 'jabatan',
        UNIT_KERJA: 'unit_kerja',
        PANGKAT: 'riwayat_pangkat',
        DIKLAT_KEY: 'diklat'
    },

    // Internal ready promise
    _ready: null,

    isReady() {
        if (!this._ready) return this.init();
        return this._ready;
    },

    // Initialize - Migrates data if necessary
    async init() {
        if (this._ready) return this._ready;

        this._ready = (async () => {
            try {
                console.log('Initializing SIMPEG Data Layer...');
                const { data: users, error: userError } = await supabaseClient.from('users').select('id').limit(1);
                const { data: pegawai, error: pegError } = await supabaseClient.from('pegawai').select('id').limit(1);

                if (userError || pegError) {
                    const isTableMissing = (userError?.code === '42P01' || pegError?.code === '42P01');
                    console.error('Supabase connection error:', userError?.message || pegError?.message);

                    if (typeof App !== 'undefined' && App.showToast) {
                        if (isTableMissing) {
                            App.showToast('Tabel database belum dibuat! Silakan jalankan script SQL yang diberikan.', 'danger');
                        } else {
                            // Silently fail init if it's just a network issue, let specific calls handle errors
                        }
                    }
                    return false;
                }

                if (users.length === 0 || pegawai.length === 0) {
                    console.log('Essential data missing, seeding initial data...');
                    await this.seedData();
                } else {
                    console.log('Database connected and ready.');
                }
                return true;
            } catch (err) {
                console.error('Unexpected error during initialization:', err);
                return false;
            }
        })();

        return this._ready;
    },

    // Seed initial data to Supabase
    async seedData() {
        console.log('Seeding initial data...');

        // 1. Users
        const initialUsers = [
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
            { username: 'pimpinan', password: 'pimpinan123', role: 'pimpinan', name: 'Kepala Dinas' }
        ];

        const { data: createdUsers, error: userError } = await supabaseClient
            .from('users')
            .insert(initialUsers)
            .select();

        if (userError) {
            console.error('Error seeding users:', userError);
            return;
        }

        const adminUser = createdUsers.find(u => u.username === 'admin');
        const pimpinanUser = createdUsers.find(u => u.username === 'pimpinan');

        // 2. Unit Kerja
        const unitKerja = [
            { kode: 'DPKP', nama: 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor', kepala: 'Kepala Dinas' }
        ];
        const { data: createdUnits } = await supabaseClient.from('unit_kerja').insert(unitKerja).select();
        const unitId = createdUnits[0].id;

        // 3. Jabatan
        const jabatan = [
            { kode: 'J001', nama: 'Operator Layanan Operasional', golongan: '-', tunjangan: 0 },
            { kode: 'J002', nama: 'Pengelola Umum Operasional', golongan: '-', tunjangan: 0 }
        ];
        const { data: createdJabatan } = await supabaseClient.from('jabatan').insert(jabatan).select();
        const jabatanId = createdJabatan[0].id;

        // 4. Pegawai (Link to users)
        const pegawai = [
            {
                user_id: adminUser.id,
                nip: '197001012023011001',
                nama: 'Administrator',
                unit_kerja_id: unitId,
                jabatan_id: jabatanId,
                status: 'aktif'
            },
            {
                user_id: pimpinanUser.id,
                nip: '197505052023011002',
                nama: 'Kepala Dinas',
                unit_kerja_id: unitId,
                jabatan_id: jabatanId,
                status: 'aktif'
            }
        ];
        await supabaseClient.from('pegawai').insert(pegawai);

        console.log('Seeding completed successfully.');
    },

    // Generic CRUD operations using Supabase
    async getAll(table) {
        const { data, error } = await supabaseClient.from(table).select('*');
        if (error) {
            console.error(`Error fetching from ${table}:`, error);
            return [];
        }
        return data;
    },

    async getById(table, id) {
        const { data, error } = await supabaseClient.from(table).select('*').eq('id', id).single();
        if (error) {
            console.error(`Error fetching from ${table} with id ${id}:`, error);
            return null;
        }
        return data;
    },

    async create(table, item) {
        try {
            const { data, error } = await supabaseClient.from(table).insert(item).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error creating in ${table}:`, JSON.stringify(error, null, 2));
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Gagal: ${error.message || error}`, 'danger');
            }
            return null;
        }
    },

    async update(table, id, updates) {
        try {
            const { data, error } = await supabaseClient.from(table).update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error updating in ${table}:`, error);
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Gagal memperbarui data di ${table}: ${error.message}`, 'danger');
            }
            return null;
        }
    },

    async delete(table, id) {
        try {
            const { error } = await supabaseClient.from(table).delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`Error deleting from ${table}:`, error);
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Gagal menghapus data dari ${table}: ${error.message}`, 'danger');
            }
            return false;
        }
    },

    // Specific Getters (Now asynchronous)
    async getUsers() { return this.getAll('users'); },
    async getPegawai() { return this.getAll('pegawai'); },
    async getJabatan() { return this.getAll(this.KEYS.JABATAN); },
    async getUnitKerja() { return this.getAll(this.KEYS.UNIT_KERJA); },
    async getAbsensi() { return this.getAll('absensi'); },
    async getCuti() { return this.getAll('cuti'); },
    async getPendidikan() { return this.getAll(this.KEYS.PENDIDIKAN); },
    async getKeluarga() { return this.getAll(this.KEYS.KELUARGA); },
    async getRiwayatJabatan() { return this.getAll(this.KEYS.RIWAYAT_JABATAN); },
    async getRiwayatPangkat() { return this.getAll(this.KEYS.RIWAYAT_PANGKAT); },
    async getDiklat() { return this.getAll(this.KEYS.DIKLAT); },
    async getKgb() { return this.getAll(this.KEYS.KGB); },
    async getSkp() { return this.getAll(this.KEYS.SKP); },

    // Get pegawai with related data
    async getPegawaiWithRelations() {
        const { data, error } = await supabaseClient
            .from('pegawai')
            .select(`
                *,
                jabatan:jabatan_id (*),
                unit_kerja:unit_kerja_id (*)
            `);

        if (error) {
            console.error('Error fetching pegawai with relations:', error);
            return [];
        }
        return data;
    },

    // Get statistics
    async getStats() {
        const today = new Date().toISOString().split('T')[0];

        const { data: pegawai, error: errP } = await supabaseClient.from('pegawai').select('id, status');
        const { data: absensi, error: errA } = await supabaseClient.from('absensi').select('*').eq('tanggal', today);
        const { count: cutiPending, error: errC } = await supabaseClient.from('cuti').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        if (errP || errA || errC) {
            console.error('Error fetching stats:', errP || errA || errC);
            return { totalPegawai: 0, hadirHariIni: 0, tidakHadir: 0, cutiPending: 0, terlambatHariIni: 0 };
        }

        const totalPegawai = pegawai.filter(p => p.status === 'aktif').length;
        const hadirHariIni = absensi.length;
        const terlambatHariIni = absensi.filter(a => a.status === 'terlambat').length;

        return {
            totalPegawai: totalPegawai,
            hadirHariIni: hadirHariIni,
            tidakHadir: Math.max(0, totalPegawai - hadirHariIni),
            cutiPending: cutiPending || 0,
            terlambatHariIni: terlambatHariIni
        };
    },

    async getAbsensiWithPegawai() {
        const { data, error } = await supabaseClient
            .from('absensi')
            .select(`
                *,
                pegawai:pegawai_id (*)
            `)
            .order('tanggal', { ascending: false });

        if (error) {
            console.error('Error fetching absensi with pegawai:', error);
            return [];
        }
        return data;
    },

    async getPegawaiByNip(nip) {
        const { data, error } = await supabaseClient
            .from('pegawai')
            .select('*')
            .eq('nip', nip)
            .maybeSingle();
        if (error) {
            console.error('Error fetching pegawai by NIP:', error);
            return null;
        }
        return data;
    }
};

// Initialize on DOM load to ensure other modules (App) are available
document.addEventListener('DOMContentLoaded', () => {
    Data.init();
});
