<template>
  <div class="login-card">
    <h2 class="card-title">Selamat Datang Kembali!</h2>
    <p class="card-subtitle">Silakan masuk untuk melanjutkan.</p>

    <form @submit.prevent="handleLogin">
      <div class="field">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="contoh@email.com"
          class="w-full"
          required
        />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <Password
          id="password"
          v-model="password"
          placeholder="Masukkan password"
          :feedback="false"
          toggleMask
          class="w-full"
          inputClass="w-full"
          required
        />
      </div>

      <!-- Menggunakan komponen Message untuk error inline -->
      <Message
        v-if="authStore.error && !authStore.loading"
        severity="error"
        :closable="false"
        >{{ authStore.error }}</Message
      >

      <Button
        type="submit"
        label="Login"
        class="w-full submit-button"
        :loading="authStore.loading"
      />
    </form>

    <div class="register-link">
      <p>
        Belum punya akun?
        <router-link :to="{ name: 'Register' }">Daftar di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import Message from "primevue/message"; // Impor Message untuk error inline

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const handleLogin = async () => {
  await authStore.login({ email: email.value, password: password.value });

  if (!authStore.error) {
    // Tampilkan notifikasi sukses
    toast.add({
      severity: "success",
      summary: "Login Berhasil!",
      detail: `Selamat datang kembali, ${authStore.user.name}.`,
      life: 3000,
    });
    router.push({ name: "Dashboard" });
  }
  // Tidak perlu notifikasi error di sini karena sudah ditangani oleh <Message>
};

onUnmounted(() => {
  authStore.error = null;
});
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background-color: var(--p-surface-card);
  border-radius: 12px;
  border: 1px solid var(--p-surface-border);
  box-shadow: 0 4px 20px var(--p-shadow-color);
  text-align: center;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--p-text-color);
}

.card-subtitle {
  margin-bottom: 2rem;
  color: var(--p-text-muted-color);
}

.field {
  margin-bottom: 1.5rem;
  text-align: left;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.w-full {
  width: 100%;
}

.submit-button {
  margin-top: 1rem;
  padding: 0.75rem;
}

.p-message {
  margin-bottom: 1.5rem;
}

.register-link {
  margin-top: 2rem;
  color: var(--p-text-muted-color);
}

.register-link a {
  font-weight: 600;
  color: var(--p-primary-color);
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
