import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Layouts
// Mengimpor komponen Layout untuk pengelompokan rute yang lebih rapi
import AdminLayout from '@/layouts/AdminLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

// Views
// Semua komponen halaman diimpor di sini
import DashboardView from '@/views/DashboardView.vue';
import TeamView from '@/views/TeamView.vue';
import ScheduleView from '@/views/ScheduleView.vue';
import FinanceView from '@/views/FinanceView.vue';
import CompetitionsView from '@/views/competitionsView.vue';
import ParticipantsView from '@/views/ParticipantsView.vue';
import ActivityLogView from '@/views/ActivityLogView.vue';
import ProfileView from '@/views/ProfileView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';

const routes = [
    {
        // Grup rute untuk halaman utama yang memerlukan login
        // Semua rute di dalam 'children' akan menggunakan AdminLayout
        path: '/',
        component: AdminLayout,
        meta: { requiresAuth: true }, // Semua rute di sini butuh login
        children: [
            {
                path: '', // Path kosong untuk halaman utama
                name: 'Dashboard',
                component: DashboardView,
            },
            {
                path: 'tim',
                name: 'Team',
                component: TeamView,
            },
            {
                path: 'jadwal',
                name: 'Schedule',
                component: ScheduleView,
                 meta: { fullWidth: true },
            },
            {
                path: 'keuangan',
                name: 'Finance',
                component: FinanceView,
            },
            {
                path: 'lomba',
                name: 'Competitions',
                component: CompetitionsView,
            },
            {
                // [PERBAIKAN] Rute ini sekarang bisa diakses semua pengguna (read-only untuk user biasa)
                path: 'peserta',
                name: 'Participants',
                component: ParticipantsView,
            },
            {
                // [PERBAIKAN] Rute ini sekarang bisa diakses semua pengguna (read-only untuk user biasa)
                path: 'aktivitas',
                name: 'ActivityLog',
                component: ActivityLogView,
            },
            {
                path: 'profile',
                name: 'Profile',
                component: ProfileView,
            },
        ],
    },
    {
        // Grup rute untuk halaman autentikasi (Login & Register)
        // Semua rute di dalam 'children' akan menggunakan AuthLayout
        path: '/auth',
        component: AuthLayout,
        meta: { guestOnly: true }, // Hanya bisa diakses oleh user yang belum login
        children: [
            {
                path: '/login',
                name: 'Login',
                component: LoginView,
            },
            {
                path: '/register',
                name: 'Register',
                component: RegisterView,
            },
        ],
    },
    // Rute fallback jika halaman tidak ditemukan, akan diarahkan ke Dashboard
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    // Kelas CSS yang akan ditambahkan ke link yang aktif
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active',
});

// Navigation Guard: Logika yang berjalan setiap kali pindah halaman
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const guestOnly = to.matched.some(record => record.meta.guestOnly);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    if (requiresAuth && !isAuthenticated) {
        // Jika halaman butuh login, tapi user belum login -> paksa ke halaman Login
        next({ name: 'Login' });
    } else if (guestOnly && isAuthenticated) {
        // Jika halaman hanya untuk tamu (login/register), tapi user sudah login -> paksa ke Dashboard
        next({ name: 'Dashboard' });
    } else if (requiresAdmin && !isAdmin) {
        // Jika halaman butuh admin, tapi user bukan admin -> paksa ke Dashboard
        // (Saat ini tidak ada rute yang menggunakan ini, tapi bagus untuk masa depan)
        next({ name: 'Dashboard' });
    } else {
        // Jika semua syarat terpenuhi, lanjutkan navigasi
        next();
    }
});

export default router;
