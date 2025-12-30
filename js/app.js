/**
 * SIMPEG PPPK Paruh Waktu - Main Application
 */

const App = {
    // Initialize application
    init() {
        Data.init();
        this.setupEventListeners();
        this.renderSidebar();
        this.updateUserInfo();
    },

    // Setup global event listeners
    setupEventListeners() {
        // Toggle sidebar
        const toggleBtn = document.getElementById('toggleSidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
    },

    // Toggle sidebar (desktop collapse)
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const overlay = document.querySelector('.sidebar-overlay');

        // On mobile, toggle open class
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.classList.toggle('show');
            }
        } else {
            // On desktop, toggle collapsed class
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
        }
    },

    // Close mobile sidebar
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },

    // Toggle mobile sidebar
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        sidebar.classList.toggle('open');
        if (overlay) {
            overlay.classList.toggle('show');
        }
    },

    // Render sidebar based on role
    renderSidebar() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const sidebar = document.querySelector('.sidebar-nav');
        if (!sidebar) return;

        const menuItems = this.getMenuItems(user.role);

        sidebar.innerHTML = menuItems.map(section => `
      <div class="nav-section">
        <div class="nav-section-title">${section.title}</div>
        ${section.items.map(item => `
          <a href="${item.href}" class="nav-item ${this.isActivePage(item.href) ? 'active' : ''}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    // Get menu items based on role
    getMenuItems(role) {
        const menus = {
            admin: [
                {
                    title: 'Menu Utama',
                    items: [
                        { href: 'dashboard.html', icon: 'layout-dashboard', label: 'Dashboard' }
                    ]
                },
                {
                    title: 'Kepegawaian',
                    items: [
                        { href: 'pegawai.html', icon: 'users', label: 'Data Pegawai' },
                        { href: 'jabatan.html', icon: 'briefcase', label: 'Jabatan' },
                        { href: 'unit-kerja.html', icon: 'building-2', label: 'Unit Kerja' }
                    ]
                },
                {
                    title: 'Kehadiran',
                    items: [
                        { href: 'absensi.html', icon: 'clock', label: 'Absensi' },
                        { href: 'cuti.html', icon: 'calendar-off', label: 'Pengajuan Cuti' }
                    ]
                },
                {
                    title: 'Laporan',
                    items: [
                        { href: 'laporan.html', icon: 'file-text', label: 'Laporan' }
                    ]
                }
            ],
            pegawai: [
                {
                    title: 'Menu Utama',
                    items: [
                        { href: 'dashboard.html', icon: 'layout-dashboard', label: 'Dashboard' }
                    ]
                },
                {
                    title: 'Kehadiran',
                    items: [
                        { href: 'absensi.html', icon: 'clock', label: 'Absensi' },
                        { href: 'cuti.html', icon: 'calendar-off', label: 'Pengajuan Cuti' }
                    ]
                }
            ],
            pimpinan: [
                {
                    title: 'Menu Utama',
                    items: [
                        { href: 'dashboard.html', icon: 'layout-dashboard', label: 'Dashboard' }
                    ]
                },
                {
                    title: 'Kepegawaian',
                    items: [
                        { href: 'pegawai.html', icon: 'users', label: 'Data Pegawai' }
                    ]
                },
                {
                    title: 'Kehadiran',
                    items: [
                        { href: 'absensi.html', icon: 'clock', label: 'Absensi' },
                        { href: 'cuti.html', icon: 'calendar-off', label: 'Persetujuan Cuti' }
                    ]
                },
                {
                    title: 'Laporan',
                    items: [
                        { href: 'laporan.html', icon: 'file-text', label: 'Laporan' }
                    ]
                }
            ]
        };

        return menus[role] || menus.pegawai;
    },

    // Check if current page is active
    isActivePage(href) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return currentPage === href;
    },

    // Update user info in sidebar
    updateUserInfo() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        const userAvatar = document.querySelector('.user-avatar');

        if (userName) userName.textContent = user.name;
        if (userRole) {
            const roleLabels = { admin: 'Administrator', pegawai: 'Pegawai', pimpinan: 'Pimpinan' };
            userRole.textContent = roleLabels[user.role] || user.role;
        }

        if (userAvatar) {
            // Check if user has a profile photo in pegawai data
            const pegawai = Data.getPegawai().find(p => p.userId === user.id);
            if (pegawai && pegawai.foto) {
                userAvatar.innerHTML = `<img src="${pegawai.foto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                userAvatar.style.background = 'none';
            } else {
                userAvatar.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                userAvatar.style.background = ''; // Restore default background
                userAvatar.innerHTML = userAvatar.textContent; // Clear any img
            }
        }
    },

    // Open modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} animate-slideUp`;
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 3000; min-width: 300px;';
        toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'danger' ? 'x-circle' : 'info'}" class="alert-icon"></i>
      <span>${message}</span>
    `;
        document.body.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Format date
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    },

    // Format time
    formatTime(timeStr) {
        return timeStr || '-';
    },

    // Format currency
    formatCurrency(num) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    },

    // Get status badge
    getStatusBadge(status) {
        const badges = {
            aktif: '<span class="badge badge-success">Aktif</span>',
            nonaktif: '<span class="badge badge-danger">Nonaktif</span>',
            pending: '<span class="badge badge-warning">Menunggu</span>',
            approved: '<span class="badge badge-success">Disetujui</span>',
            rejected: '<span class="badge badge-danger">Ditolak</span>',
            tepat_waktu: '<span class="badge badge-success">Tepat Waktu</span>',
            terlambat: '<span class="badge badge-warning">Terlambat</span>'
        };
        return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
