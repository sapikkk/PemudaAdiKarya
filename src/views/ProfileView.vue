<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Profil Saya</h1>
      <p>Lihat dan kelola informasi akun Anda di sini.</p>
    </header>

    <div class="profile-card">
      <div class="profile-content">
        <div class="profile-avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="profile-details">
          <h2 class="user-name">{{ user.name }}</h2>
          <p class="user-email">
            <i class="pi pi-envelope"></i>
            <span>{{ user.email }}</span>
          </p>
          <div class="user-role">
            <i class="pi pi-shield"></i>
            <span>Peran:</span>
            <span class="tag" :class="roleClass(user.role)">{{
              user.role
            }}</span>
          </div>
        </div>
      </div>
      <div class="profile-footer">
        <button class="btn btn-secondary" disabled>
          <i class="pi pi-user-edit"></i>
          <span>Edit Profil</span>
        </button>
        <button class="btn btn-secondary" disabled>
          <i class="pi pi-key"></i>
          <span>Ubah Password</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

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

// Menentukan kelas CSS untuk Tag berdasarkan peran
const roleClass = (role) => {
  return role === "admin" ? "tag-admin" : "tag-member";
};
</script>

<style scoped>
@import "primeicons/primeicons.css";

/* General Layout */
.page-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* Profile Card */
.profile-card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem;
  text-align: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.user-email,
.user-role {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.user-role .tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.tag-admin {
  background-color: #dc2626;
  color: white;
}

.tag-member {
  background-color: #64748b;
  color: white;
}

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

/* Button Styles */
.btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-hover);
}

/* Responsive */
@media (min-width: 640px) {
  .profile-content {
    flex-direction: row;
    text-align: left;
  }
  .user-email,
  .user-role {
    justify-content: flex-start;
  }
}

/* CSS Variables for Light & Dark Mode */
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-hover: #f1f5f9;
  --border-color: #e2e8f0;
  --text-primary: #1a202c;
  --text-secondary: #718096;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-hover: #334155;
  --border-color: #4a5568;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
}
</style>
