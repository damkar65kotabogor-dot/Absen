/**
 * SIMPEG PPPK - Data Module
 * Data Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor
 */

const Data = {
    // Storage keys
    KEYS: {
        USERS: 'simpeg_users',
        PEGAWAI: 'simpeg_pegawai',
        JABATAN: 'simpeg_jabatan',
        UNIT_KERJA: 'simpeg_unit_kerja',
        ABSENSI: 'simpeg_absensi',
        CUTI: 'simpeg_cuti',
        PENDIDIKAN: 'simpeg_pendidikan',
        CURRENT_USER: 'simpeg_current_user'
    },

    // Initialize with default data
    init() {
        if (!localStorage.getItem(this.KEYS.USERS)) {
            this.seedData();
        } else {
            // Migration: Convert DPKP usernames to NIP
            const users = JSON.parse(localStorage.getItem(this.KEYS.USERS));
            // Check if any user has DPKP format
            const needsMigration = users.some(u => u.role === 'pegawai' && u.username.startsWith('DPKP'));

            if (needsMigration) {
                const pegawai = JSON.parse(localStorage.getItem(this.KEYS.PEGAWAI) || '[]');
                const updatedUsers = users.map(u => {
                    if (u.role === 'pegawai' && u.username.startsWith('DPKP')) {
                        const p = pegawai.find(p => p.userId === u.id);
                        if (p && p.nip) {
                            return { ...u, username: p.nip };
                        }
                    }
                    return u;
                });

                localStorage.setItem(this.KEYS.USERS, JSON.stringify(updatedUsers));
                console.log('Migrated usernames to NIP successfully.');
            }
        }
    },

    // Seed initial data
    seedData() {
        // Users (for login)
        const users = [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
            { id: 2, username: 'pimpinan', password: 'pimpinan123', role: 'pimpinan', name: 'Kepala Dinas' },
            // Pegawai accounts - username = NIP, password from data
            { id: 3, username: '199804162025211000', password: '1998', role: 'pegawai', name: 'Adi Tya Kusuma' },
            { id: 4, username: '197502012025211300', password: '1975', role: 'pegawai', name: 'Agus Suhaeri' },
            { id: 5, username: '199709242025211061', password: '1997', role: 'pegawai', name: 'Akbar Solihin Zulkifli' },
            { id: 6, username: '199905182025211030', password: '1999', role: 'pegawai', name: 'Asep Saepul Anwar' },
            { id: 7, username: '199703202025211056', password: '1997', role: 'pegawai', name: 'Chaeril Hari Mugeni' },
            { id: 8, username: '199911262025211018', password: '1999', role: 'pegawai', name: 'Deni Bachtiar' },
            { id: 9, username: '199609212025211070', password: '1996', role: 'pegawai', name: 'Doni Safutra' },
            { id: 10, username: '199808232025211048', password: '1998', role: 'pegawai', name: 'Erdinda Sukmadinata' },
            { id: 11, username: '199705212025211051', password: '1997', role: 'pegawai', name: 'Fajar Triadi' },
            { id: 12, username: '199403092025211074', password: '1994', role: 'pegawai', name: 'Fauzi Ramadan' },
            { id: 13, username: '198807052025211119', password: '1988', role: 'pegawai', name: 'Juliyana Mulyadani' },
            { id: 14, username: '200001012025211065', password: '2000', role: 'pegawai', name: 'Nahdi Ramhan' },
            { id: 15, username: '199401112025211066', password: '1994', role: 'pegawai', name: 'Nandar Sukmana' },
            { id: 16, username: '199511032025211069', password: '1995', role: 'pegawai', name: 'Novaldi Setiawan' },
            { id: 17, username: '199811162025212048', password: '1998', role: 'pegawai', name: 'Raden Yunita' },
            { id: 18, username: '199801012025211072', password: '1998', role: 'pegawai', name: 'Rizky Ramandani' },
            { id: 19, username: '200001012025211041', password: '2000', role: 'pegawai', name: 'Sendy Dwi Pangga' },
            { id: 20, username: '199510252025211082', password: '1995', role: 'pegawai', name: 'Seno Albianto' },
            { id: 21, username: '199406192025212073', password: '1994', role: 'pegawai', name: 'Sri Handayani' },
            { id: 22, username: '199412302025211074', password: '1994', role: 'pegawai', name: 'Sugianto' },
            { id: 23, username: '199610222025211050', password: '1996', role: 'pegawai', name: 'Teguh Nurhakim' },
            { id: 24, username: '199902042025211036', password: '1999', role: 'pegawai', name: 'Vareski Nalfaredo' },
            { id: 25, username: '199701052025212046', password: '1997', role: 'pegawai', name: 'Vivi Hastuti' },
            { id: 26, username: '199706162025211052', password: '1997', role: 'pegawai', name: 'Zico Arya Pratama' },
            { id: 27, username: '197812222025211081', password: '1987', role: 'pegawai', name: 'Wellem Aula' },
            { id: 28, username: '198008092025211055', password: '1980', role: 'pegawai', name: 'David Indra' },
            { id: 29, username: '199303242025211140', password: '1993', role: 'pegawai', name: 'Rm. Rangga Putra' }
        ];

        // Unit Kerja
        const unitKerja = [
            { id: 1, kode: 'DPKP', nama: 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor', kepala: 'Kepala Dinas' }
        ];

        // Jabatan
        const jabatan = [
            { id: 1, kode: 'J001', nama: 'Operator Layanan Operasional', golongan: '-', tunjangan: 0 },
            { id: 2, kode: 'J002', nama: 'Pengelola Umum Operasional', golongan: '-', tunjangan: 0 }
        ];

        // Pegawai - Data from Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor
        const pegawai = [
            { id: 1, nip: '199804162025211000', nama: 'Adi Tya Kusuma', kode: 'DPKP001', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 3, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1998-04-16', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 2, nip: '197502012025211300', nama: 'Agus Suhaeri', kode: 'DPKP002', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 4, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1975-02-01', agama: 'Islam', statusNikah: 'Menikah', tanggalMasuk: '2025-02-11' },
            { id: 3, nip: '199709242025211061', nama: 'Akbar Solihin Zulkifli', kode: 'DPKP003', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 5, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1997-09-24', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 4, nip: '199905182025211030', nama: 'Asep Saepul Anwar', kode: 'DPKP004', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 6, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1999-05-18', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 5, nip: '199703202025211056', nama: 'Chaeril Hari Mugeni', kode: 'DPKP005', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 7, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1997-03-20', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 6, nip: '199911262025211018', nama: 'Deni Bachtiar', kode: 'DPKP006', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 8, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1999-11-26', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 7, nip: '199609212025211070', nama: 'Doni Safutra', kode: 'DPKP007', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 9, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1996-09-21', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 8, nip: '199808232025211048', nama: 'Erdinda Sukmadinata', kode: 'DPKP008', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 10, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1998-08-23', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 9, nip: '199705212025211051', nama: 'Fajar Triadi', kode: 'DPKP009', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 11, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1997-05-21', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 10, nip: '199403092025211074', nama: 'Fauzi Ramadan', kode: 'DPKP010', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 12, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1994-03-09', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 11, nip: '198807052025211119', nama: 'Juliyana Mulyadani', kode: 'DPKP011', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 13, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1988-07-05', agama: 'Islam', statusNikah: 'Menikah', tanggalMasuk: '2025-02-11' },
            { id: 12, nip: '200001012025211065', nama: 'Nahdi Ramhan', kode: 'DPKP012', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 14, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '2000-01-01', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 13, nip: '199401112025211066', nama: 'Nandar Sukmana', kode: 'DPKP013', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 15, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1994-01-11', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 14, nip: '199511032025211069', nama: 'Novaldi Setiawan', kode: 'DPKP014', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 16, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1995-11-03', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 15, nip: '199811162025212048', nama: 'Raden Yunita', kode: 'DPKP015', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 17, jenisKelamin: 'P', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1998-11-16', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 16, nip: '199801012025211072', nama: 'Rizky Ramandani', kode: 'DPKP016', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 18, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1998-01-01', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 17, nip: '200001012025211041', nama: 'Sendy Dwi Pangga', kode: 'DPKP017', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 19, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '2000-01-01', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 18, nip: '199510252025211082', nama: 'Seno Albianto', kode: 'DPKP018', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 20, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1995-10-25', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 19, nip: '199406192025212073', nama: 'Sri Handayani', kode: 'DPKP019', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 21, jenisKelamin: 'P', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1994-06-19', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 20, nip: '199412302025211074', nama: 'Sugianto', kode: 'DPKP020', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 22, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1994-12-30', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 21, nip: '199610222025211050', nama: 'Teguh Nurhakim', kode: 'DPKP021', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 23, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1996-10-22', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 22, nip: '199902042025211036', nama: 'Vareski Nalfaredo', kode: 'DPKP022', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 24, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1999-02-04', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 23, nip: '199701052025212046', nama: 'Vivi Hastuti', kode: 'DPKP023', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 25, jenisKelamin: 'P', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1997-01-05', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 24, nip: '199706162025211052', nama: 'Zico Arya Pratama', kode: 'DPKP024', jabatanId: 1, unitKerjaId: 1, status: 'aktif', userId: 26, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1997-06-16', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' },
            { id: 25, nip: '197812222025211081', nama: 'Wellem Aula', kode: 'DPKP025', jabatanId: 2, unitKerjaId: 1, status: 'aktif', userId: 27, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1978-12-22', agama: 'Islam', statusNikah: 'Menikah', tanggalMasuk: '2025-02-11' },
            { id: 26, nip: '198008092025211055', nama: 'David Indra', kode: 'DPKP026', jabatanId: 2, unitKerjaId: 1, status: 'aktif', userId: 28, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1980-08-09', agama: 'Islam', statusNikah: 'Menikah', tanggalMasuk: '2025-02-11' },
            { id: 27, nip: '199303242025211140', nama: 'Rm. Rangga Putra', kode: 'DPKP027', jabatanId: 2, unitKerjaId: 1, status: 'aktif', userId: 29, jenisKelamin: 'L', email: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '1993-03-24', agama: 'Islam', statusNikah: 'Belum Menikah', tanggalMasuk: '2025-02-11' }
        ];

        // Absensi (sample data for current month)
        const today = new Date();
        const absensi = [];
        for (let i = 1; i <= 5; i++) {
            for (let d = 1; d <= Math.min(today.getDate() - 1, 20); d++) {
                const date = new Date(today.getFullYear(), today.getMonth(), d);
                if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
                    const jamMasuk = `0${7 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}`;
                    const jamKeluar = `${16 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
                    absensi.push({
                        id: absensi.length + 1,
                        pegawaiId: i,
                        tanggal: date.toISOString().split('T')[0],
                        jamMasuk: jamMasuk,
                        jamKeluar: jamKeluar,
                        status: jamMasuk <= '08:00' ? 'tepat_waktu' : 'terlambat',
                        keterangan: ''
                    });
                }
            }
        }

        // Cuti (sample)
        const cuti = [
            {

            }
        ];

        // Save to localStorage
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(this.KEYS.UNIT_KERJA, JSON.stringify(unitKerja));
        localStorage.setItem(this.KEYS.JABATAN, JSON.stringify(jabatan));
        localStorage.setItem(this.KEYS.PEGAWAI, JSON.stringify(pegawai));
        localStorage.setItem(this.KEYS.ABSENSI, JSON.stringify(absensi));
        localStorage.setItem(this.KEYS.CUTI, JSON.stringify(cuti));
    },

    // Generic CRUD operations
    getAll(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === parseInt(id));
    },

    create(key, item) {
        const items = this.getAll(key);
        item.id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items));
        return item;
    },

    update(key, id, updates) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(key, JSON.stringify(items));
            return items[index];
        }
        return null;
    },

    delete(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(key, JSON.stringify(filtered));
        return filtered.length < items.length;
    },

    // Specific getters
    getUsers() { return this.getAll(this.KEYS.USERS); },
    getPegawai() { return this.getAll(this.KEYS.PEGAWAI); },
    getJabatan() { return this.getAll(this.KEYS.JABATAN); },
    getUnitKerja() { return this.getAll(this.KEYS.UNIT_KERJA); },
    getAbsensi() { return this.getAll(this.KEYS.ABSENSI); },
    getCuti() { return this.getAll(this.KEYS.CUTI); },
    getPendidikan() { return this.getAll(this.KEYS.PENDIDIKAN); },

    // Get pegawai with related data
    getPegawaiWithRelations() {
        const pegawai = this.getPegawai();
        const jabatan = this.getJabatan();
        const unitKerja = this.getUnitKerja();

        return pegawai.map(p => ({
            ...p,
            jabatan: jabatan.find(j => j.id === p.jabatanId),
            unitKerja: unitKerja.find(u => u.id === p.unitKerjaId)
        }));
    },

    // Get absensi with related data
    getAbsensiWithPegawai() {
        const absensi = this.getAbsensi();
        const pegawai = this.getPegawaiWithRelations();

        return absensi.map(a => ({
            ...a,
            pegawai: pegawai.find(p => p.id === a.pegawaiId)
        }));
    },

    // Get cuti with related data
    getCutiWithPegawai() {
        const cuti = this.getCuti();
        const pegawai = this.getPegawaiWithRelations();
        const users = this.getUsers();

        return cuti.map(c => ({
            ...c,
            pegawai: pegawai.find(p => p.id === c.pegawaiId),
            approver: users.find(u => u.id === c.approvedBy)
        }));
    },

    // Get statistics
    getStats() {
        const pegawai = this.getPegawai();
        const absensi = this.getAbsensi();
        const cuti = this.getCuti();
        const today = new Date().toISOString().split('T')[0];

        const absensiHariIni = absensi.filter(a => a.tanggal === today);
        const cutiPending = cuti.filter(c => c.status === 'pending');

        return {
            totalPegawai: pegawai.filter(p => p.status === 'aktif').length,
            hadirHariIni: absensiHariIni.length,
            tidakHadir: pegawai.filter(p => p.status === 'aktif').length - absensiHariIni.length,
            cutiPending: cutiPending.length,
            terlambatHariIni: absensiHariIni.filter(a => a.status === 'terlambat').length
        };
    },

    // Reset data
    reset() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        this.seedData();
    }
};

// Initialize data on load
Data.init();
