<template>
  <div class="register-card">
    <h2 class="card-title">Buat Akun Baru</h2>
    <p class="card-subtitle">Isi form di bawah untuk mendaftar.</p>

    <!-- Tampilkan pesan sukses jika registrasi berhasil -->
    <Message v-if="isSuccess" severity="success" :closable="false">
      Registrasi berhasil! Anda akan diarahkan ke halaman login.
    </Message>

    <form v-else @submit.prevent="handleRegister">
      <!-- Input untuk Nama Lengkap -->
      <div class="field">
        <label for="name">Nama Lengkap</label>
        <InputText
          id="name"
          v-model="name"
          type="text"
          placeholder="Masukkan nama lengkap Anda"
          class="w-full"
          required
        />
      </div>

      <!-- Input untuk Email -->
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

      <!-- Input untuk Password -->
      <div class="field">
        <label for="password">Password</label>
        <Password
          id="password"
          v-model="password"
          placeholder="Buat password Anda"
          :feedback="true"
          toggleMask
          class="w-full"
          inputClass="w-full"
          required
        >
          <template #header>
            <h6>Tingkat Keamanan Password</h6>
          </template>
          <template #footer>
            <Divider />
            <p class="mt-2">Saran</p>
            <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
              <li>Minimal satu huruf kecil</li>
              <li>Minimal satu huruf besar</li>
              <li>Minimal satu angka</li>
              <li>Minimal 8 karakter</li>
            </ul>
          </template>
        </Password>
      </div>

      <!-- Pesan Error -->
      <Message v-if="authStore.error" severity="error" :closable="false">{{
        authStore.error
      }}</Message>

      <!-- Tombol Submit -->
      <Button
        type="submit"
        label="Daftar"
        class="w-full submit-button"
        :loading="authStore.loading"
      />
    </form>

    <div class="login-link">
      <p>
        Sudah punya akun?
        <router-link :to="{ name: 'Login' }">Masuk di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

// Menggunakan komponen dari PrimeVue
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";
import Divider from "primevue/divider";

// --- State & Store ---
const name = ref("");
const email = ref("");
const password = ref("");
const isSuccess = ref(false); // State untuk menandai registrasi berhasil
const authStore = useAuthStore();
const router = useRouter();

// --- Methods ---
const handleRegister = async () => {
  // Validasi sederhana
  if (password.value.length < 8) {
    authStore.error = "Password harus memiliki minimal 8 karakter.";
    return;
  }

  await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  // Jika tidak ada error (registrasi berhasil)
  if (!authStore.error) {
    isSuccess.value = true;
    // Arahkan ke halaman login setelah 3 detik
    setTimeout(() => {
      router.push({ name: "Login" });
    }, 3000);
  }
};

// Bersihkan error saat komponen tidak lagi digunakan
onUnmounted(() => {
  authStore.error = null;
});
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  background-color: var(--surface-card);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--card-shadow);
  text-align: center;
}

.card-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.card-subtitle {
  margin-bottom: var(--spacing-xl);
  color: var(--text-color-secondary);
}

.field {
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.field label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-color);
}

.w-full {
  width: 100%;
}

.submit-button {
  margin-top: var(--spacing-md);
  padding: 0.75rem;
  font-weight: 600;
}

.p-message {
  margin-bottom: var(--spacing-lg);
}

.login-link {
  margin-top: var(--spacing-xl);
  color: var(--text-color-secondary);
}

.login-link a {
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
