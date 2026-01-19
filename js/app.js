/**
 * SIMPEG PPPK Paruh Waktu - Main Application
 */

const App = {
    initialized: null,

    // Initialize application
    init() {
        if (this.initialized) return this.initialized;

        this.initialized = (async () => {
            try {
                await Data.init();
                this.setupEventListeners();
                this.renderSidebar();
                await this.updateUserInfo();
                return true;
            } catch (err) {
                console.error('App initialization failed:', err);
                return false;
            }
        })();

        return this.initialized;
    },

    // Setup global event listeners
    setupEventListeners() {
        // Toggle sidebar - unified handler for mobile and desktop
        const toggleBtn = document.getElementById('toggleSidebar');
        const toggleBtnDesktop = document.getElementById('toggleSidebarDesktop');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        if (toggleBtnDesktop) {
            toggleBtnDesktop.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        // Mobile menu toggle (legacy support)
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

        // Sidebar close button (mobile)
        const sidebarCloseBtn = document.querySelector('.sidebar-close');
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', () => this.closeMobileSidebar());
        }
    },

    // Toggle sidebar (desktop collapse / mobile slide)
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const overlay = document.querySelector('.sidebar-overlay');

        if (!sidebar) return; // Defensive check

        // On mobile, toggle open class and overlay
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.classList.toggle('show');
            }
            // Prevent body scroll when sidebar is open
            if (sidebar.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        } else {
            // On desktop, toggle collapsed class
            sidebar.classList.toggle('collapsed');
            if (mainContent) {
                mainContent.classList.toggle('sidebar-collapsed');
            }
        }
    },

    // Close mobile sidebar
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebar) sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('show');
        }
        // Restore body scroll
        document.body.style.overflow = '';
    },

    // Toggle mobile sidebar
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (!sidebar) return;

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
    async updateUserInfo() {
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
            try {
                // Check if user has a profile photo in pegawai data
                const pegawaiData = await Data.getPegawai();
                const pegawai = pegawaiData.find(p => p.user_id === user.id);
                if (pegawai && pegawai.foto) {
                    userAvatar.innerHTML = `<img src="${pegawai.foto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                    userAvatar.style.background = 'none';
                } else {
                    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    userAvatar.textContent = initials;
                    userAvatar.style.background = ''; // Restore default background
                    userAvatar.innerHTML = initials; // Clear any img
                }
            } catch (err) {
                console.warn('Failed to update avatar:', err);
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

    // Allowed Locations configuration
    ALLOWED_LOCATIONS: [
        {
            name: "Mako Sukasari (Pusat)",
            lat: -6.620377,
            lng: 106.815888,
            radius: 500 // meters (increased from 50m)
        },
        {
            name: "Sektor Yasmin",
            lat: -6.561782,
            lng: 106.765182,
            radius: 500 // meters (increased from 50m)
        },
        {
            name: "Sektor Cibuluh",
            lat: -6.549295,
            lng: 106.823164,
            radius: 500 // meters (increased from 50m)
        }
    ],

    // Haversine formula to calculate distance in meters
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    },

    // Validate Location with Geofencing
    validateLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                this.showToast('Browser Anda tidak mendukung Geolocation', 'danger');
                resolve(false);
                return;
            }

            const loadingToast = document.createElement('div');
            loadingToast.className = 'alert alert-info';
            loadingToast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 3000;';
            loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Mendapatkan lokasi...';
            document.body.appendChild(loadingToast);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    loadingToast.remove();
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    let insideLocation = null;
                    let nearestLocation = null;
                    let minDistance = Infinity;

                    // Check all locations
                    for (const loc of this.ALLOWED_LOCATIONS) {
                        const distance = this.calculateDistance(userLat, userLng, loc.lat, loc.lng);

                        // Track nearest for error message
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestLocation = loc;
                        }

                        if (distance <= loc.radius) {
                            insideLocation = loc;
                            break; // Stop if found
                        }
                    }

                    if (insideLocation) {
                        this.showToast(`Lokasi terdeteksi: ${insideLocation.name}`, 'success');
                        resolve(true);
                    } else {
                        const distStr = Math.round(minDistance);
                        const msg = nearestLocation
                            ? `Anda berada di luar jangkauan. Lokasi terdekat: ${nearestLocation.name} (${distStr}m)`
                            : 'Anda berada di luar jangkauan lokasi absensi.';

                        this.showToast(msg, 'danger');
                        resolve(false);
                    }
                },
                (error) => {
                    loadingToast.remove();
                    let errMsg = 'Gagal mendapatkan lokasi.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED: errMsg = 'Izin lokasi ditolak via Browser.'; break;
                        case error.POSITION_UNAVAILABLE: errMsg = 'Informasi lokasi tidak tersedia.'; break;
                        case error.TIMEOUT: errMsg = 'Waktu permintaan lokasi habis.'; break;
                    }
                    this.showToast(errMsg, 'danger');
                    resolve(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    // Modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await App.init();

    // Re-setup event listeners after a short delay to ensure all elements are rendered
    // Reduced from 500ms to 100ms for better performance
    setTimeout(() => {
        console.log('Re-checking event listeners...');

        const toggleBtn = document.getElementById('toggleSidebar');
        const toggleBtnDesktop = document.getElementById('toggleSidebarDesktop');

        if (toggleBtn && !toggleBtn.hasAttribute('data-listener-attached')) {
            console.log('Attaching listener to toggleSidebar');
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                App.toggleSidebar();
            });
            toggleBtn.setAttribute('data-listener-attached', 'true');
        }

        if (toggleBtnDesktop && !toggleBtnDesktop.hasAttribute('data-listener-attached')) {
            console.log('Attaching listener to toggleSidebarDesktop');
            toggleBtnDesktop.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                App.toggleSidebar();
            });
            toggleBtnDesktop.setAttribute('data-listener-attached', 'true');
        }

        // Also attach to sidebar close button
        const sidebarCloseBtn = document.querySelector('.sidebar-close');
        if (sidebarCloseBtn && !sidebarCloseBtn.hasAttribute('data-listener-attached')) {
            console.log('Attaching listener to sidebar-close');
            sidebarCloseBtn.addEventListener('click', () => App.closeMobileSidebar());
            sidebarCloseBtn.setAttribute('data-listener-attached', 'true');
        }
    }, 100); // Reduced from 500ms
});
// Global Error Handler to catch silent failures
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global Error:', message, error);
    if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Error: ${message}`, 'danger');
    }
    return false;
};

window.onunhandledrejection = function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Database Error: ${event.reason.message || event.reason}`, 'danger');
    }
};
