import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

// --- Import Views ---
import DashboardView from "../views/DashboardView.vue";
import TeamView from "../views/TeamView.vue";
import ScheduleView from "../views/ScheduleView.vue";
import FinanceView from "../views/FinanceView.vue";
import competitionsView from "../views/competitionsView.vue";
import ParticipantsView from "../views/ParticipantsView.vue";
import ActivityLogView from "../views/ActivityLogView.vue";
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue"; // <-- 1. Impor view baru

const routes = [
    // --- Rute Autentikasi ---
    {
        path: "/login",
        name: "Login",
        component: LoginView,
        meta: { guestOnly: true, layout: 'AuthLayout' }
    },
    {
        path: "/register",
        name: "Register",
        component: RegisterView,
        meta: { guestOnly: true, layout: 'AuthLayout' }
    },

    // --- Rute Aplikasi Inti ---
    {
        path: "/",
        name: "Dashboard",
        component: DashboardView,
        meta: { requiresAuth: true, layout: 'AdminLayout' }
    },
    // <-- 2. Tambahkan rute baru untuk profil di sini
    {
        path: "/profil",
        name: "Profile",
        component: ProfileView,
        meta: { requiresAuth: true, layout: 'AdminLayout' }
    },
    {
        path: "/tim",
        name: "tim",
        component: TeamView,
        meta: { requiresAuth: true, layout: 'AdminLayout' }
    },
    {
        path: "/jadwal",
        name: "jadwal",
        component: ScheduleView,
        meta: { requiresAuth: true, layout: 'AdminLayout' }
    },
    {
        path: "/keuangan",
        name: "keuangan",
        component: FinanceView,
        meta: { requiresAuth: true, layout: 'AdminLayout' }
    },
    {
        path: "/lomba",
        name: "lomba",
        component: competitionsView,
        meta: { requiresAuth: true, layout: 'AdminLayout' }
    },
    {
        path: "/peserta",
        name: "peserta",
        component: ParticipantsView,
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'AdminLayout' }
    },
    {
        path: "/aktivitas",
        name: "aktivitas",
        component: ActivityLogView,
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'AdminLayout' }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// Navigation Guard (tetap sama)
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            next({ name: 'Login' });
        } else {
            if (to.meta.requiresAdmin && !isAdmin) {
                next({ name: 'Dashboard' });
            } else {
                next();
            }
        }
    }
    else if (to.meta.guestOnly) {
        if (isAuthenticated) {
            next({ name: 'Dashboard' });
        } else {
            next();
        }
    }
    else {
        next();
    }
});

export default router;
