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
        const users = await Data.getUsers();

        if (users.length === 0) {
            console.warn('No users found in database. Seeding might be in progress or failed.');
        }

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log('User found, role:', user.role);
            const { password: _, ...userWithoutPassword } = user;

            // Get pegawai data if exists
            const pegawaiData = await Data.getPegawai();
            const pegawai = pegawaiData.find(p => p.user_id === user.id);
            if (pegawai) {
                console.log('Linked employee record found:', pegawai.nama);
                userWithoutPassword.pegawaiId = pegawai.id;
                userWithoutPassword.pegawaiData = pegawai;
            } else {
                console.log('No linked employee record found for this user.');
            }

            localStorage.setItem(Data.KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

        console.warn('Login failed: Invalid username or password.');
        return { success: false, message: 'Username atau password salah!' };
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
