const Auth = {
    // Safe helper to get CURRENT_USER key (fallback jika Data atau Data.KEYS tidak tersedia)
    _currentUserKey() {
        try {
            if (typeof Data !== 'undefined' && Data && Data.KEYS && Data.KEYS.CURRENT_USER) {
                return Data.KEYS.CURRENT_USER;
            }
        } catch (e) {
            // ignore
        }
        return 'current_user';
    },

    // Check if user is logged in
    isLoggedIn() {
        try {
            return !!localStorage.getItem(this._currentUserKey());
        } catch (e) {
            console.error('isLoggedIn error', e);
            return false;
        }
    },

    // Get current user
    getCurrentUser() {
        try {
            const user = localStorage.getItem(this._currentUserKey());
            return user ? JSON.parse(user) : null;
        } catch (e) {
            console.error("Error parsing user data", e);
            return null;
        }
    },

    // Login (Asynchronous dengan pengecekan defensif dan trim)
    async login(username, password) {
        console.log(`Login attempt for user: ${String(username ?? '')}`);
        let users = [];
        let source = 'Supabase';

        // Bersihkan input dari spasi yang tidak sengaja
        const cleanUsername = String(username ?? '').trim();
        const cleanPassword = String(password ?? '').trim();

        try {
            // Coba ambil dari cloud jika Data.getUsers tersedia
            if (typeof Data !== 'undefined' && Data && typeof Data.getUsers === 'function') {
                try {
                    const res = await Data.getUsers();
                    if (Array.isArray(res) && res.length > 0) {
                        users = res;
                    } else {
                        // jika kosong, biarkan users tetap array kosong untuk fallback ke localStorage
                        users = [];
                    }
                } catch (err) {
                    console.warn('Data.getUsers gagal:', err);
                }
            }

            // Fallback ke localStorage jika tidak ada user dari cloud
            if (!Array.isArray(users) || users.length === 0) {
                const localData = localStorage.getItem('simpeg_users');
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        if (Array.isArray(parsed)) {
                            users = parsed;
                            source = 'LocalStorage';
                        }
                    } catch (err) {
                        console.warn('Gagal parse simpeg_users dari localStorage:', err);
                    }
                }
            }

            // Pastikan users adalah array
            if (!Array.isArray(users)) users = [];

            // Pencocokan data dengan konversi String dan Trim agar akurat
            const user = users.find(u =>
                String((u && u.username) ?? '').trim() === cleanUsername &&
                String((u && u.password) ?? '').trim() === cleanPassword
            );

            if (user) {
                console.log(`User found via ${source}, role:`, user.role);
                const { password: _, ...userWithoutPassword } = user;
                userWithoutPassword.authSource = source;

                // Pastikan sinkronisasi pegawai_id berhasil (jangan gagalkan login jika sync gagal)
                try {
                    await this.syncPegawaiId(userWithoutPassword);
                } catch (syncErr) {
                    console.warn('syncPegawaiId warning:', syncErr);
                }

                try {
                    localStorage.setItem(this._currentUserKey(), JSON.stringify(userWithoutPassword));
                } catch (err) {
                    console.error('Failed to save current user to localStorage:', err);
                }

                return { success: true, user: userWithoutPassword };
            }

            return { success: false, message: 'Username atau password salah!' };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'Terjadi kesalahan saat proses login.' };
        }
    },

    // Sync pegawaiId from database (defensive)
    async syncPegawaiId(userObj) {
        try {
            if (!userObj || !userObj.id) return false;
            if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

            const { data: pegawai, error } = await supabaseClient
                .from('pegawai')
                .select('id, nip')
                .eq('user_id', userObj.id)
                .maybeSingle();

            if (error) {
                console.warn('supabase error while fetching pegawai:', error);
                return false;
            }

            if (pegawai) {
                userObj.pegawaiId = pegawai.id ?? null;
                userObj.nip = pegawai.nip ?? null;
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
        try {
            localStorage.removeItem(this._currentUserKey());
        } catch (e) {
            console.warn('Failed to remove current user key during logout', e);
        } finally {
            try { window.location.href = 'index.html'; } catch (e) { console.error('Redirect failed', e); }
        }
    },

    hasRole(role) {
        try {
            const user = this.getCurrentUser();
            if (!user) return false;
            return Array.isArray(role) ? role.includes(user.role) : user.role === role;
        } catch (e) {
            console.error('hasRole error', e);
            return false;
        }
    },

    requireAuth() {
        try {
            if (!this.isLoggedIn()) {
                window.location.href = 'index.html';
                return false;
            }
            return true;
        } catch (e) {
            console.error('requireAuth error', e);
            try { window.location.href = 'index.html'; } catch (_) {}
            return false;
        }
    },

    requireRole(role) {
        try {
            if (!this.requireAuth()) return false;
            if (!this.hasRole(role)) {
                alert('Anda tidak memiliki akses ke halaman ini!');
                window.location.href = 'dashboard.html';
                return false;
            }
            return true;
        } catch (e) {
            console.error('requireRole error', e);
            alert('Terjadi kesalahan otorisasi.');
            try { window.location.href = 'dashboard.html'; } catch (_) {}
            return false;
        }
    }
};

// Expose globally untuk kompatibilitas kode lama yang mengakses window.Auth
if (typeof window !== 'undefined') {
    window.Auth = window.Auth || Auth;
            }
