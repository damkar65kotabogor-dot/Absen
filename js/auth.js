/**
 * SIMPEG PPPK - Authentication Module
 */

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

    // Login
    login(username, password) {
        const users = Data.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const { password: _, ...userWithoutPassword } = user;

            // Get pegawai data if exists
            const pegawai = Data.getPegawai().find(p => p.userId === user.id);
            if (pegawai) {
                userWithoutPassword.pegawaiId = pegawai.id;
                userWithoutPassword.pegawaiData = pegawai;
            }

            localStorage.setItem(Data.KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

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
