<template>
  <div class="auth-layout">
    <!-- Tempatkan komponen Toast di sini juga -->
    <Toast />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
// Tidak perlu mengimpor komponen Toast di sini karena sudah global
</script>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(
    --p-surface-ground
  ); /* Menggunakan variabel dari tema Aura */
  padding: 1rem;
}
</style>
