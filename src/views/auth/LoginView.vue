<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="card-title">Selamat Datang Kembali!</h1>
        <p class="card-subtitle">Silakan masuk untuk melanjutkan.</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="contoh@email.com"
            class="form-input"
            :class="{ 'form-input-error': emailError }"
            required
            autocomplete="email"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
          />
          <span v-if="emailError" class="form-error-text">{{ emailError }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password"
              class="form-input"
              :class="{ 'form-input-error': passwordError }"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePassword"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <span v-if="passwordError" class="form-error-text">{{ passwordError }}</span>
        </div>

        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            Ingat saya
          </label>
          <router-link to="/forgot-password" class="forgot-link">
            Lupa password?
          </router-link>
        </div>

        <div v-if="authStore.error && !authStore.loading" class="form-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :disabled="authStore.loading || !isFormValid"
          :aria-busy="authStore.loading"
        >
          <span v-if="authStore.loading" class="btn-loading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Memproses...
          </span>
          <span v-else>Masuk</span>
        </button>
      </form>

      <div class="auth-divider">
        <span>atau</span>
      </div>

      <div class="social-login">
        <button type="button" class="btn btn-social" @click="loginWithGoogle" :disabled="authStore.loading">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </button>
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
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const emailError = ref("");
const passwordError = ref("");

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

// Form validation
const isFormValid = computed(() => {
  return email.value.length > 0 && 
         password.value.length > 0 && 
         !emailError.value && 
         !passwordError.value;
});

// Validate email
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value) {
    emailError.value = "Email tidak boleh kosong";
  } else if (!emailRegex.test(email.value)) {
    emailError.value = "Format email tidak valid";
  } else {
    emailError.value = "";
  }
};

// Validate password
const validatePassword = () => {
  if (!password.value) {
    passwordError.value = "Password tidak boleh kosong";
  } else if (password.value.length < 6) {
    passwordError.value = "Password minimal 6 karakter";
  } else {
    passwordError.value = "";
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  // Validate form
  validateEmail();
  validatePassword();
  
  if (!isFormValid.value) {
    return;
  }

  try {
    await authStore.login({ 
      email: email.value, 
      password: password.value,
      rememberMe: rememberMe.value
    });

    if (!authStore.error) {
      toast.add({
        severity: "success",
        summary: "Login Berhasil!",
        detail: `Selamat datang kembali, ${authStore.user?.name || 'User'}.`,
        life: 3000,
      });
      
      // Redirect to intended page or dashboard
      const redirectTo = route.query.redirect || { name: "Dashboard" };
      router.push(redirectTo);
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.add({
      severity: "error",
      summary: "Login Gagal",
      detail: "Terjadi kesalahan. Silakan coba lagi.",
      life: 5000,
    });
  }
};

const loginWithGoogle = async () => {
  try {
    // Implement Google OAuth login
    toast.add({
      severity: "info",
      summary: "Fitur Segera Hadir",
      detail: "Login dengan Google akan segera tersedia.",
      life: 3000,
    });
  } catch (error) {
    console.error('Google login error:', error);
  }
};

// Real-time validation
const handleEmailInput = () => {
  if (emailError.value) {
    validateEmail();
  }
};

const handlePasswordInput = () => {
  if (passwordError.value) {
    validatePassword();
  }
};

onMounted(() => {
  // Clear any existing errors
  authStore.error = null;
  
  // Focus on email input
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.focus();
  }
  
  // Add real-time validation
  const emailInput2 = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput2) {
    emailInput2.addEventListener('blur', validateEmail);
    emailInput2.addEventListener('input', handleEmailInput);
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('blur', validatePassword);
    passwordInput.addEventListener('input', handlePasswordInput);
  }
});

onUnmounted(() => {
  authStore.error = null;
  
  // Clean up event listeners
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) {
    emailInput.removeEventListener('blur', validateEmail);
    emailInput.removeEventListener('input', handleEmailInput);
  }
  
  if (passwordInput) {
    passwordInput.removeEventListener('blur', validatePassword);
    passwordInput.removeEventListener('input', handlePasswordInput);
  }
});
</script>

<style scoped>
/* Mobile-First Auth Container */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%);
  padding: 1rem;
  position: relative;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem 1.5rem;
  background-color: var(--surface-card);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
}

.auth-header {
  margin-bottom: 2rem;
}

.card-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  line-height: var(--line-height-tight);
}

.card-subtitle {
  margin-bottom: 0;
  color: var(--text-color-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

/* Form Styles */
.auth-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: var(--font-size-sm);
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-sizing: border-box;
  font-family: inherit;
  font-size: var(--font-size-base);
  background-color: var(--surface-0);
  color: var(--text-color);
  transition: all 0.2s ease;
  line-height: var(--line-height-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-error {
  border-color: var(--error-color);
}

.form-input-error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color-secondary);
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-color);
}

.password-toggle:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.form-error-text {
  display: block;
  color: var(--error-color);
  font-size: var(--font-size-xs);
  margin-top: 0.5rem;
  font-weight: 500;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
}

.checkbox-container input {
  margin-right: 0.5rem;
  accent-color: var(--primary-color);
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-color-dark);
  text-decoration: underline;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--error-color);
  font-size: var(--font-size-sm);
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--surface-50);
  border: 1px solid var(--error-color);
  border-radius: var(--border-radius-md);
  text-align: left;
}

.form-error svg {
  flex-shrink: 0;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: 2px solid transparent;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  line-height: var(--line-height-normal);
  min-height: 48px; /* Accessibility: minimum touch target */
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-full {
  width: 100%;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
  border-color: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-social {
  background-color: var(--surface-0);
  color: var(--text-color);
  border-color: var(--border-color);
  width: 100%;
}

.btn-social:hover:not(:disabled) {
  background-color: var(--surface-50);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-loading svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Divider */
.auth-divider {
  position: relative;
  margin: 2rem 0;
  text-align: center;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-color);
}

.auth-divider span {
  background-color: var(--surface-card);
  color: var(--text-color-secondary);
  padding: 0 1rem;
  font-size: var(--font-size-sm);
  position: relative;
}

/* Social Login */
.social-login {
  margin-bottom: 2rem;
}

/* Switch Link */
.switch-link {
  text-align: center;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}

.switch-link p {
  margin: 0;
}

.switch-link a {
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.switch-link a:hover {
  color: var(--primary-color-dark);
  text-decoration: underline;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .auth-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .auth-card {
    padding: 1.5rem 1rem;
    max-width: none;
    border-radius: var(--border-radius-lg);
    margin: 0;
  }
  
  .card-title {
    font-size: var(--font-size-xl);
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .form-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Tablet styles */
@media (min-width: 481px) and (max-width: 768px) {
  .auth-card {
    max-width: 450px;
    padding: 2.5rem 2rem;
  }
}

/* Desktop styles */
@media (min-width: 769px) {
  .auth-card {
    max-width: 420px;
    padding: 3rem 2.5rem;
  }
  
  .btn:hover {
    transform: translateY(-2px);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .form-input {
    border-width: 2px;
  }
  
  .btn {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .form-input,
  .password-toggle {
    transition: none;
  }
  
  .btn-loading svg {
    animation: none;
  }
}

/* Dark mode specific adjustments */
.dark .auth-container {
  background: linear-gradient(135deg, var(--surface-0) 0%, var(--surface-50) 100%);
}

.dark .form-error {
  background-color: rgba(239, 68, 68, 0.1);
}

.dark .auth-divider span {
  background-color: var(--surface-card);
}
</style>
