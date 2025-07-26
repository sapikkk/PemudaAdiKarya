<template>
  <div class="app-layout" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="mobile-header-content">
        <h3>Dashboard 17an</h3>
        <div class="mobile-controls">
          <Button
            icon="pi pi-palette"
            @click="themeStore.toggleTheme()"
            class="p-button-text theme-toggle"
            :title="
              themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            "
          />
          <Button
            :icon="isMobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'"
            @click="toggleMobileMenu"
            class="p-button-text mobile-menu-toggle"
          />
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileMenuOpen }">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h3>Dashboard 17an</h3>
          <Button
            icon="pi pi-palette"
            @click="themeStore.toggleTheme()"
            class="p-button-text theme-toggle desktop-only"
            :title="
              themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            "
          />
        </div>

        <!-- Navigasi dinamis berdasarkan peran -->
        <nav class="sidebar-nav">
          <RouterLink
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            @click="closeMobileMenu"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>

      <!-- User Info & Logout -->
      <div v-if="authStore.user" class="sidebar-footer">
        <router-link to="/profile" class="user-info-link">
          <div class="user-info">
            <div class="user-avatar">
              <i class="pi pi-user"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <span class="user-role">{{ authStore.user?.role }}</span>
            </div>
          </div>
        </router-link>
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          class="p-button-danger p-button-text logout-button"
          @click="handleLogout"
        />
      </div>
    </aside>

    <!-- Konten Utama -->
    <main class="main-content">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </main>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- Toast untuk notifikasi -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useThemeStore } from "@/stores/ThemeStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Toast from "primevue/toast";

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();
const isMobileMenuOpen = ref(false);

// [FIX 1] Path rute disesuaikan dengan file asli Anda
const adminMenu = [
  { label: "Dashboard", to: "/", icon: "pi pi-home" },
  { label: "Manajemen Tim", to: "/tim", icon: "pi pi-users" },
  { label: "Jadwal & Tugas", to: "/jadwal", icon: "pi pi-calendar" },
  { label: "Manajemen Keuangan", to: "/keuangan", icon: "pi pi-wallet" },
  { label: "Manajemen Lomba", to: "/lomba", icon: "pi pi-sitemap" },
  { label: "Manajemen Peserta", to: "/peserta", icon: "pi pi-id-card" },
  { label: "Log Aktivitas", to: "/aktivitas", icon: "pi pi-history" },
];

const userMenu = [
  { label: "Dashboard", to: "/", icon: "pi pi-home" },
  { label: "Manajemen Tim", to: "/tim", icon: "pi pi-users" },
  { label: "Jadwal & Tugas", to: "/jadwal", icon: "pi pi-calendar" },
  { label: "Manajemen Keuangan", to: "/keuangan", icon: "pi pi-wallet" },
  { label: "Manajemen Lomba", to: "/lomba", icon: "pi pi-sitemap" },
  { label: "Manajemen Peserta", to: "/peserta", icon: "pi pi-id-card" },
];

// Computed property untuk memilih menu yang sesuai secara dinamis
const menu = computed(() => {
  return authStore.isAdmin ? adminMenu : userMenu;
});

// Logika mobile menu dari file Anda
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Logika logout dengan notifikasi
const handleLogout = () => {
  authStore.logout();
  toast.add({
    severity: "success",
    summary: "Logout Berhasil",
    detail: "Anda telah keluar dari aplikasi.",
    life: 3000,
  });
  router.push("/login");
};

// Inisialisasi dari file Anda
onMounted(() => {
  themeStore.initTheme();
  if (!authStore.user) {
    authStore.fetchUser();
  }
});
</script>

<style>
/* Seluruh gaya visual diambil dari file Anda karena sudah sangat baik */
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --sidebar-width: 280px;
  --mobile-header-height: 60px;
}

.light {
  --primary-color: #3b82f6;
  --primary-color-dark: #2563eb;
  --surface-0: #ffffff;
  --surface-50: #f8fafc;
  --surface-100: #f1f5f9;
  --surface-200: #e2e8f0;
  --surface-300: #cbd5e1;
  --surface-card: #ffffff;
  --text-color: #0f172a;
  --text-color-secondary: #64748b;
  --border-color: #e2e8f0;
  --card-shadow: var(--shadow-sm);
}

.dark {
  --primary-color: #60a5fa;
  --primary-color-dark: #3b82f6;
  --surface-0: #0f172a;
  --surface-50: #1e293b;
  --surface-100: #334155;
  --surface-200: #475569;
  --surface-300: #64748b;
  --surface-card: #1e293b;
  --text-color: #f1f5f9;
  --text-color-secondary: #94a3b8;
  --border-color: #334155;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  background-color: var(--surface-0);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--mobile-header-height);
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
}

.mobile-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md);
  height: 100%;
}

.mobile-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: var(--font-size-lg);
}

.mobile-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--surface-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 999;
  transition: transform 0.3s ease;
}

.sidebar-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: var(--font-size-xl);
}

.theme-toggle {
  color: var(--text-color-secondary) !important;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--surface-100);
  color: var(--text-color);
}

.nav-link .pi {
  font-size: var(--font-size-lg);
  width: 20px;
}

/* [FIX 2] Mengembalikan gaya menu aktif ke konsep awal Anda */
.router-link-exact-active {
  background-color: var(--surface-200);
  color: var(--primary-color);
  font-weight: 600;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.user-info-link {
  text-decoration: none;
  display: block;
  border-radius: var(--border-radius-lg);
  transition: background-color 0.2s ease;
  padding: var(--spacing-sm);
}

.user-info-link:hover {
  background-color: var(--surface-100);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.user-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--text-color-secondary);
  text-transform: capitalize;
}

.logout-button {
  width: 100%;
  justify-content: center;
  margin-top: 0.5rem;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - var(--sidebar-width));
}

.content-wrapper {
  flex-grow: 1;
  padding: var(--spacing-xl);
  background-color: var(--surface-50);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .mobile-header {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1001;
    padding-top: var(--mobile-header-height);
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-top: var(--mobile-header-height);
    width: 100%;
  }

  .content-wrapper {
    padding: var(--spacing-lg);
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .desktop-only {
    display: none;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--spacing-md);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  .main-content {
    width: calc(100% - 240px);
  }

  .content-wrapper {
    padding: var(--spacing-lg);
  }
}
</style>
