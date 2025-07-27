<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="card-title">Selamat Datang Kembali!</h2>
      <p class="card-subtitle">Silakan masuk untuk melanjutkan.</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="contoh@email.com"
            class="form-input"
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
            required
          />
        </div>

        <div v-if="authStore.error && !authStore.loading" class="form-error">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? "Memproses..." : "Login" }}
        </button>
      </form>

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
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const handleLogin = async () => {
  await authStore.login({ email: email.value, password: password.value });

  if (!authStore.error) {
    toast.add({
      severity: "success",
      summary: "Login Berhasil!",
      detail: `Selamat datang kembali, ${authStore.user.name}.`,
      life: 3000,
    });
    router.push({ name: "Dashboard" });
  }
};

onUnmounted(() => {
  authStore.error = null;
});
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

.w-full {
  width: 100%;
}

.form-error {
  color: var(--text-error);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: var(--bg-error);
  border: 1px solid var(--text-error);
  border-radius: 6px;
  text-align: center;
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

/* CSS Variables for Light & Dark Mode */
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --border-color: #e2e8f0;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --bg-error: #fef2f2;
  --text-error: #ef4444;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --border-color: #4a5568;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --bg-error: #452323;
  --text-error: #fca5a5;
}
</style>
