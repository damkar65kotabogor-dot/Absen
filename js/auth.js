const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem(Data.KEYS.CURRENT_USER);
    },

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem(Data.KEYS.CURRENT_USER);
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },

    // Login (Asynchronous)
    async login(username, password) {
        console.log(`Login attempt for user: ${username}`);
        let users = [];
        let source = 'Supabase';

        try {
            users = await Data.getUsers();
            if (!users || users.length === 0) throw new Error('DB_EMPTY');
        } catch (err) {
            console.warn('Cloud login failed, checking LocalStorage fallback...');
            const localData = localStorage.getItem('simpeg_users');
            if (localData) {
                users = JSON.parse(localData);
                source = 'LocalStorage';
            }
        }

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            userWithoutPassword.authSource = source;

            // Sync data pegawai (NIP & ID) agar load data di halaman lain lancar
            await this.syncPegawaiId(userWithoutPassword);

            localStorage.setItem(Data.KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'Username atau password salah!' };
    },

    // Sync pegawaiId from database
    async syncPegawaiId(userObj) {
        try {
            // Pastikan supabaseClient sudah siap
            const { data: pegawai, error } = await supabaseClient
                .from('pegawai')
                .select('id, nip')
                .eq('user_id', userObj.id)
                .maybeSingle();

            if (error) throw error;

            if (pegawai) {
                userObj.pegawaiId = pegawai.id;
                userObj.nip = pegawai.nip;
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error syncing pegawaiId:', err);
            return false;
        }
    },

    logout() {
        localStorage.removeItem(Data.KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    },

    // PERBAIKAN: Gunakan ini dengan hati-hati
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};