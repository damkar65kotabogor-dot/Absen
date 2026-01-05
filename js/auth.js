const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem(Data.KEYS.CURRENT_USER);
    },

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem(Data.KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    // Login (Now asynchronous)
    async login(username, password) {
        console.log(`Login attempt for user: ${username}`);
        let users = [];
        let source = 'Supabase';

        try {
            users = await Data.getUsers();
            if (users.length === 0) throw new Error('DB_EMPTY');
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
            console.log(`User found via ${source}, role:`, user.role);
            const { password: _, ...userWithoutPassword } = user;
            userWithoutPassword.authSource = source;

            // Ensure we have pegawaiId
            await this.syncPegawaiId(userWithoutPassword);

            localStorage.setItem(Data.KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'Username atau password salah!' };
    },

    // Sync pegawaiId from database
    async syncPegawaiId(userObj) {
        try {
            const pegawaiData = await Data.getPegawai();
            const pegawai = pegawaiData.find(p => p.user_id === userObj.id);
            if (pegawai) {
                userObj.pegawaiId = pegawai.id;
                userObj.nip = pegawai.nip;
                console.log('Synced pegawaiId:', pegawai.id);
                return true;
            }
            console.warn('No pegawai record found for user_id:', userObj.id);
            return false;
        } catch (err) {
            console.error('Error syncing pegawaiId:', err);
            return false;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem(Data.KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    // Check role
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    },

    // Require authentication
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Require specific role
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
