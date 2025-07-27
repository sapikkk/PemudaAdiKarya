<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="card-title">Selamat Datang Kembali!</h2>
      <p class="card-subtitle">Silakan masuk untuk melanjutkan.</p>

      <!-- PERBAIKAN: Tambahkan debug info di development -->
      <div v-if="showDebugInfo" class="debug-info">
        <p><strong>Debug Info:</strong></p>
        <p>Environment: {{ isDev ? 'Development' : 'Production' }}</p>
        <p>Host: {{ window.location.hostname }}</p>
        <p>API URL: {{ apiUrl }}</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="contoh@email.com"
            class="form-input"
            :disabled="authStore.loading"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            class="form-input"
            :disabled="authStore.loading"
            required
          />
        </div>

        <!-- PERBAIKAN: Error display yang lebih baik -->
        <div v-if="authStore.error && !authStore.loading" class="form-error">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <strong>Login Gagal:</strong>
            <p>{{ authStore.error }}</p>
            <button 
              type="button" 
              class="retry-btn"
              @click="clearErrorAndRetry"
            >
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- PERBAIKAN: Loading state yang lebih informatif -->
        <div v-if="authStore.loading" class="loading-info">
          <div class="spinner"></div>
          <p>{{ loadingMessage }}</p>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="authStore.loading || !email || !password"
        >
          {{ authStore.loading ? loadingMessage : "Login" }}
        </button>
      </form>

      <!-- PERBAIKAN: Tambahkan quick login untuk testing -->
      <div v-if="isDev" class="quick-login">
        <p class="quick-login-title">Quick Login (Dev Only):</p>
        <div class="quick-login-buttons">
          <button 
            type="button" 
            class="btn btn-secondary btn-small"
            @click="quickLogin('admin')"
            :disabled="authStore.loading"
          >
            Login as Admin
          </button>
          <button 
            type="button" 
            class="btn btn-secondary btn-small"
            @click="quickLogin('user')"
            :disabled="authStore.loading"
          >
            Login as User
          </button>
        </div>
      </div>

      <div class="switch-link">
        <p>
          Belum punya akun?
          <router-link :to="{ name: 'Register' }">Daftar di sini</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

// PERBAIKAN: Computed properties untuk debugging
const isDev = computed(() => import.meta.env.DEV);
const showDebugInfo = ref(false);
const loadingMessage = ref("Memproses...");

// PERBAIKAN: Get API URL untuk debugging
const apiUrl = computed(() => {
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:3001/users';
  }
  if (window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api/users`;
  }
  return `${window.location.origin}/api/users`;
});

// PERBAIKAN: Initialize auth store
onMounted(() => {
  authStore.initializeAuth();
  
  // Show debug info in development
  if (isDev.value) {
    showDebugInfo.value = true;
  }
  
  // Check if already authenticated
  if (authStore.isAuthenticated) {
    router.push({ name: "Dashboard" });
  }
});

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.add({
      severity: "warn",
      summary: "Input Tidak Lengkap",
      detail: "Harap isi email dan password.",
      life: 3000,
    });
    return;
  }

  // PERBAIKAN: Update loading message
  loadingMessage.value = "Menghubungi server...";
  
  setTimeout(() => {
    if (authStore.loading) {
      loadingMessage.value = "Memverifikasi kredensial...";
    }
  }, 2000);

  await authStore.login({ 
    email: email.value.trim(), 
    password: password.value 
  });

  if (!authStore.error) {
    toast.add({
      severity: "success",
      summary: "Login Berhasil!",
      detail: `Selamat datang kembali, ${authStore.user.name}.`,
      life: 3000,
    });
    router.push({ name: "Dashboard" });
  } else {
    // PERBAIKAN: Toast error untuk feedback yang lebih baik
    toast.add({
      severity: "error",
      summary: "Login Gagal",
      detail: authStore.error,
      life: 5000,
    });
  }
  
  loadingMessage.value = "Memproses...";
};

// PERBAIKAN: Quick login untuk development
const quickLogin = async (role) => {
  if (role === 'admin') {
    email.value = 'admin@example.com';
    password.value = 'admin123';
  } else {
    email.value = 'user@example.com';
    password.value = 'user123';
  }
  await handleLogin();
};

// PERBAIKAN: Clear error dan retry
const clearErrorAndRetry = () => {
  authStore.clearError();
  // Focus ke email input
  document.getElementById('email')?.focus();
};

onUnmounted(() => {
  authStore.clearError();
});

// PERBAIKAN: Make window available in template
const window = globalThis.window;
</script>

<style scoped>
/* General Layout */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.card-subtitle {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

/* PERBAIKAN: Debug info styles */
.debug-info {
  background-color: var(--bg-debug);
  border: 1px solid var(--border-debug);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
  text-align: left;
  color: var(--text-debug);
}

.debug-info p {
  margin: 0.25rem 0;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.w-full {
  width: 100%;
}

/* PERBAIKAN: Better error styles */
.form-error {
  background-color: var(--bg-error);
  border: 1px solid var(--text-error);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-content strong {
  color: var(--text-error);
  display: block;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: var(--text-error);
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
}

.retry-btn {
  background-color: var(--text-error);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.retry-btn:hover {
  opacity: 0.8;
}

/* PERBAIKAN: Loading styles */
.loading-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--bg-loading);
  border-radius: 6px;
  color: var(--text-secondary);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* PERBAIKAN: Quick login styles */
.quick-login {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: var(--bg-debug);
  border-radius: 6px;
  border: 1px dashed var(--border-debug);
}

.quick-login-title {
  font-size: 0.9rem;
  color: var(--text-debug);
  margin-bottom: 0.75rem;
}

.quick-login-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.switch-link {
  margin-top: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.switch-link a {
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

.switch-link a:hover {
  text-decoration: underline;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-primary);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* CSS Variables for Light & Dark Mode */
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-loading: #f1f5f9;
  --bg-debug: #eff6ff;
  --border-color: #e2e8f0;
  --border-debug: #3b82f6;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --text-debug: #1e40af;
  --bg-error: #fef2f2;
  --text-error: #ef4444;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-loading: #334155;
  --bg-debug: #1e3a8a;
  --border-color: #4a5568;
  --border-debug: #60a5fa;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --text-debug: #93c5fd;
  --bg-error: #452323;
  --text-error: #fca5a5;
}

/* PERBAIKAN: Mobile responsiveness */
@media (max-width: 480px) {
  .auth-container {
    padding: 0.5rem;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .quick-login-buttons {
    flex-direction: column;
  }
  
  .btn-small {
    width: 100%;
  }
}
</style>
