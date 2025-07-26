<template>
  <div class="profile-view">
    <div class="header">
      <h1>Profil Saya</h1>
      <p>Lihat dan kelola informasi akun Anda di sini.</p>
    </div>

    <div class="profile-card-wrapper">
      <Card class="profile-card">
        <template #content>
          <div class="profile-content">
            <div class="profile-avatar">
              <!-- Menampilkan inisial nama pengguna sebagai avatar -->
              <Avatar :label="userInitial" size="xlarge" shape="circle" />
            </div>
            <div class="profile-details">
              <h2 class="user-name">{{ user.name }}</h2>
              <p class="user-email">
                <i class="pi pi-envelope"></i>
                {{ user.email }}
              </p>
              <div class="user-role">
                <i class="pi pi-shield"></i>
                <span>Peran:</span>
                <Tag :value="user.role" :severity="roleSeverity(user.role)" />
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="profile-footer">
            <Button
              label="Edit Profil"
              icon="pi pi-user-edit"
              class="p-button-secondary"
              disabled
            />
            <Button
              label="Ubah Password"
              icon="pi pi-key"
              class="p-button-secondary"
              disabled
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

// Import komponen PrimeVue
import Card from "primevue/card";
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import Button from "primevue/button";

const authStore = useAuthStore();
const user = authStore.user;

// Membuat inisial dari nama pengguna untuk Avatar
const userInitial = computed(() => {
  if (user && user.name) {
    const nameParts = user.name.split(" ");
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }
  return "U"; // Default
});

// Menentukan warna Tag berdasarkan peran
const roleSeverity = (role) => {
  if (role === "admin") {
    return "danger";
  }
  return "info";
};
</script>

<style scoped>
.profile-view {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.header p {
  color: var(--text-color-secondary);
  font-size: 1rem;
  margin: 0;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-avatar :deep(.p-avatar) {
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 2rem;
  width: 100px;
  height: 100px;
}

.profile-details {
  flex-grow: 1;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.user-email,
.user-role {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.75rem;
}

.user-role .p-tag {
  text-transform: capitalize;
}

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
}
</style>
