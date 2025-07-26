<template>
  <!-- 
    Komponen dinamis ini akan merender layout yang sesuai.
    Jika Anda di halaman login, ia akan menjadi <AuthLayout>.
    Jika Anda di dasbor, ia akan menjadi <AdminLayout>.
  -->
  <component :is="layout">
    <RouterView />
  </component>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

const route = useRoute();

// Daftar semua layout yang tersedia di aplikasi Anda
const layouts = {
  AdminLayout,
  AuthLayout,
};

// 'computed property' ini secara cerdas menentukan layout mana yang akan digunakan.
// Ia melihat 'meta.layout' dari rute saat ini di router/index.js.
// Jika tidak ada yang ditentukan, ia akan menggunakan 'AuthLayout' sebagai default.
const layout = computed(() => {
  const layoutName = route.meta.layout || "AuthLayout";
  return layouts[layoutName];
});
</script>

<style>
/* STYLE GLOBAL TETAP DI SINI.
  Hanya style yang spesifik untuk layout dasbor (seperti .sidebar, .main-content) 
  yang telah dipindahkan ke AdminLayout.vue.
*/

/* Design System Variables */
:root {
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Layout */
  --sidebar-width: 280px;
  --mobile-header-height: 60px;
}

/* Light Theme Colors */
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

/* Dark Theme Colors */
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

/* Reset dan Base Styles */
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
</style>
