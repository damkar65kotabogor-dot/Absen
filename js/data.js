const Data = {
    // Storage keys (still used for some local state if needed)
    KEYS: {
        CURRENT_USER: 'simpeg_current_user'
    },

    // Initialize - Migrates data if necessary
    async init() {
        try {
            console.log('Initializing SIMPEG Data Layer...');
            const { data: users, error } = await supabaseClient.from('users').select('id').limit(1);

            if (error) {
                console.error('Supabase connection error:', error.message);
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast('Koneksi database gagal! Periksa konfigurasi.', 'danger');
                }
                return;
            }

            if (users.length === 0) {
                console.log('Database empty, seeding initial data...');
                await this.seedData();
            } else {
                console.log('Database connected and ready.');
            }
        } catch (err) {
            console.error('Unexpected error during initialization:', err);
        }
    },

    // Seed initial data to Supabase
    async seedData() {
        // ... (Existing seed data arrays go here, but we insert them into Supabase)
        // Note: For brevity, I will only insert the core data if not exists.

        // Users
        const users = [
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
            { username: 'pimpinan', password: 'pimpinan123', role: 'pimpinan', name: 'Kepala Dinas' }
        ];
        await supabaseClient.from('users').insert(users);

        // Unit Kerja
        const unitKerja = [
            { kode: 'DPKP', nama: 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor', kepala: 'Kepala Dinas' }
        ];
        await supabaseClient.from('unit_kerja').insert(unitKerja);

        // Jabatan
        const jabatan = [
            { kode: 'J001', nama: 'Operator Layanan Operasional', golongan: '-', tunjangan: 0 },
            { kode: 'J002', nama: 'Pengelola Umum Operasional', golongan: '-', tunjangan: 0 }
        ];
        await supabaseClient.from('jabatan').insert(jabatan);

        // Pegawai and Absensi seeding logic could be added here as well
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
        const { data, error } = await supabaseClient.from(table).insert(item).select().single();
        if (error) {
            console.error(`Error creating in ${table}:`, error);
            return null;
        }
        return data;
    },

    async update(table, id, updates) {
        const { data, error } = await supabaseClient.from(table).update(updates).eq('id', id).select().single();
        if (error) {
            console.error(`Error updating in ${table}:`, error);
            return null;
        }
        return data;
    },

    async delete(table, id) {
        const { error } = await supabaseClient.from(table).delete().eq('id', id);
        if (error) {
            console.error(`Error deleting from ${table}:`, error);
            return false;
        }
        return true;
    },

    // Specific Getters (Now asynchronous)
    async getUsers() { return this.getAll('users'); },
    async getPegawai() { return this.getAll('pegawai'); },
    async getJabatan() { return this.getAll('jabatan'); },
    async getUnitKerja() { return this.getAll('unit_kerja'); },
    async getAbsensi() { return this.getAll('absensi'); },
    async getCuti() { return this.getAll('cuti'); },

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

    // Get absensi with related data
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
    }
};

// Initialize on DOM load to ensure other modules (App) are available
document.addEventListener('DOMContentLoaded', () => {
    Data.init();
});
