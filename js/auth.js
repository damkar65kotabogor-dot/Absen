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
            console.error("Error parsing user data", e);
            return null;
        }
    },

    // Login (Asynchronous with Trim Fix)
    async login(username, password) {
        console.log(`Login attempt for user: ${username}`);
        let users = [];
        let source = 'Supabase';

        // Bersihkan input dari spasi yang tidak sengaja
        const cleanUsername = String(username).trim();
        const cleanPassword = String(password).trim();

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

        // Pencocokan data dengan konversi String dan Trim agar akurat
        const user = users.find(u => 
            String(u.username).trim() === cleanUsername && 
            String(u.password).trim() === cleanPassword
        );

        if (user) {
            console.log(`User found via ${source}, role:`, user.role);
            const { password: _, ...userWithoutPassword } = user;
            userWithoutPassword.authSource = source;

            // Pastikan sinkronisasi pegawai_id berhasil
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
            if (typeof supabaseClient === 'undefined') return false;

            const { data: pegawai, error } = await supabaseClient
                .from('pegawai')
                .select('id, nip')
                .eq('user_id', userObj.id)
                .maybeSingle();

            if (error) throw error;

            if (pegawai) {
                userObj.pegawaiId = pegawai.id;
                userObj.nip = pegawai.nip;
                console.log('Synced pegawaiId:', pegawai.id);
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
        return Array.isArray(role) ? role.includes(user.role) : user.role === role;
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    requireRole(role) {
        if (!this.requireAuth()) return false;
        if (!this.hasRole(role)) {
            alert('Anda tidak memiliki akses ke halaman ini!');
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }
};
