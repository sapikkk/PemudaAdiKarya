<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <header class="page-header">
      <h1>Manajemen Tim Panitia</h1>
      <!-- Tombol ini hanya muncul untuk admin -->
      <button
        v-if="authStore.isAdmin"
        @click="openModal()"
        class="btn btn-primary"
      >
        <i class="pi pi-plus"></i>
        Tambah Anggota
      </button>
    </header>

    <!-- State: Loading atau Error -->
    <div v-if="loading" class="state-feedback">Memuat data tim...</div>
    <div v-else-if="error" class="state-feedback error">
      Gagal memuat data: {{ error }}
      <button
        @click="fetchData"
        class="btn btn-secondary"
        style="margin-top: 1rem"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Tabel Anggota Tim (Dikelompokkan) -->
    <div v-else-if="groupedMembers.length" class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nama Anggota</th>
            <th>Divisi / Jabatan</th>
            <!-- Kolom Aksi hanya muncul untuk admin -->
            <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loop melalui anggota yang sudah dikelompokkan -->
          <tr v-for="member in groupedMembers" :key="member.name">
            <td>{{ member.name }}</td>
            <td>
              <!-- Tampilkan semua divisi sebagai tag -->
              <div class="tags-container">
                <span v-for="role in member.roles" :key="role.id" class="tag">
                  {{ role.divisionName || "N/A" }}
                </span>
              </div>
            </td>
            <!-- Tombol Aksi hanya muncul untuk admin -->
            <td v-if="authStore.isAdmin" class="actions">
              <button @click="openModal(member)" class="btn btn-secondary">
                Edit
              </button>
              <button @click="openConfirmDialog(member)" class="btn btn-danger">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- State: Kosong -->
    <div v-else class="state-feedback">
      <p>Belum ada anggota tim yang ditambahkan.</p>
    </div>

    <!-- Modal untuk Tambah/Edit Anggota -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? "Edit Anggota Tim" : "Tambah Anggota Baru" }}</h2>
        <form @submit.prevent="saveMember">
          <!-- Input Nama Anggota -->
          <div class="form-group">
            <label for="name">Nama Anggota</label>
            <input
              id="name"
              type="text"
              v-model="editableMember.name"
              required
              :disabled="isSubmitting"
            />
          </div>

          <!-- Bagian Divisi/Jabatan yang Dinamis -->
          <div>
            <label>Divisi / Jabatan</label>
            <div
              v-for="(role, index) in editableMember.roles"
              :key="index"
              class="role-entry"
            >
              <select
                v-model="role.divisionId"
                required
                :disabled="isSubmitting"
                class="role-select"
              >
                <option disabled value="">Pilih Divisi</option>
                <option
                  v-for="div in teamStore.divisions"
                  :key="div.id"
                  :value="div.id"
                >
                  {{ div.name }}
                </option>
              </select>
              <button
                type="button"
                @click="removeRole(index)"
                class="btn btn-danger btn-sm"
                v-if="editableMember.roles.length > 1"
                :disabled="isSubmitting"
              >
                Hapus
              </button>
            </div>
            <button
              type="button"
              @click="addRole"
              class="btn btn-secondary btn-sm"
              style="margin-top: 0.5rem"
              :disabled="isSubmitting"
            >
              + Tambah Divisi Lagi
            </button>
          </div>

          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>
          <div class="form-actions">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
              :disabled="isSubmitting"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid || isSubmitting"
            >
              {{ isSubmitting ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dialog Konfirmasi Hapus -->
    <div
      v-if="isDeleteDialogVisible"
      class="modal-overlay"
      @click.self="closeConfirmDialog"
    >
      <div class="modal-content dialog">
        <h3>Konfirmasi Hapus</h3>
        <p>
          Apakah Anda yakin ingin menghapus
          <b>{{ memberToDelete?.name }}</b> dari semua divisi?
        </p>
        <div class="form-actions">
          <button
            @click="closeConfirmDialog"
            class="btn btn-secondary"
            :disabled="isDeleting"
          >
            Tidak
          </button>
          <button
            @click="deleteConfirmed"
            class="btn btn-danger"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "Menghapus..." : "Ya, Hapus" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useTeamStore } from "../stores/teamStore";
import { useAuthStore } from "@/stores/authStore"; // <-- 1. Impor Auth Store
import { useToast } from "primevue/usetoast"; // <-- 2. Impor useToast
import { storeToRefs } from "pinia";

const teamStore = useTeamStore();
const authStore = useAuthStore(); // <-- 3. Inisialisasi Auth Store
const toast = useToast(); // <-- 4. Inisialisasi Toast
const { error } = storeToRefs(teamStore);

const loading = ref(false);
const isModalVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const formError = ref("");

// --- PERUBAHAN UTAMA: Struktur data untuk form ---
const getInitialFormState = () => ({
  name: "",
  // `roles` digunakan untuk mode Tambah dan Edit
  // Untuk Edit, `id` asli disimpan untuk perbandingan
  roles: [{ divisionId: "", id: null }],
  // Menyimpan state awal saat edit
  originalRoles: [],
});

let editableMember = reactive(getInitialFormState());
const memberToDelete = ref(null);

// --- PERUBAHAN UTAMA: Computed property untuk mengelompokkan data ---
const groupedMembers = computed(() => {
  if (!teamStore.membersWithDivision.length) return [];

  const groups = teamStore.membersWithDivision.reduce((acc, member) => {
    // Jika nama belum ada di accumulator, buat entri baru
    if (!acc[member.name]) {
      acc[member.name] = {
        name: member.name,
        roles: [],
      };
    }
    // Tambahkan role/divisi ke anggota yang sesuai
    acc[member.name].roles.push({
      id: member.id,
      divisionId: member.divisionId,
      divisionName: member.divisionName,
    });
    return acc;
  }, {});

  // Ubah objek menjadi array
  return Object.values(groups);
});

const isFormValid = computed(() => {
  if (!editableMember.name?.trim()) return false;
  // Pastikan setiap role memiliki divisionId yang dipilih
  return editableMember.roles.every((role) => !!role.divisionId);
});

const addRole = () => {
  editableMember.roles.push({ divisionId: "", id: null });
};

const removeRole = (index) => {
  if (editableMember.roles.length > 1) {
    editableMember.roles.splice(index, 1);
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    await teamStore.fetchAll();
  } catch (err) {
    console.error("Gagal memuat data tim:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const openModal = (member = null) => {
  formError.value = "";
  Object.assign(editableMember, getInitialFormState());

  if (member) {
    // Mode EDIT
    isEditing.value = true;
    editableMember.name = member.name;
    // Salin roles yang ada, pastikan deep copy
    editableMember.roles = JSON.parse(JSON.stringify(member.roles));
    editableMember.originalRoles = JSON.parse(JSON.stringify(member.roles));
  } else {
    // Mode TAMBAH BARU
    isEditing.value = false;
  }
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  formError.value = "";
};

const saveMember = async () => {
  if (isSubmitting.value || !isFormValid.value) return;

  formError.value = "";
  isSubmitting.value = true;

  try {
    const action = isEditing.value ? "diperbarui" : "ditambahkan";
    if (isEditing.value) {
      // --- LOGIKA EDIT YANG LEBIH KOMPLEKS ---
      const originalRoleIds = new Set(
        editableMember.originalRoles.map((r) => r.divisionId)
      );
      const currentRoleIds = new Set(
        editableMember.roles.map((r) => r.divisionId)
      );

      const nameChanged =
        editableMember.originalRoles.length > 0 &&
        editableMember.originalRoles[0].name !== editableMember.name;

      // 1. Cari divisi yang perlu DIHAPUS
      const rolesToDelete = editableMember.originalRoles.filter(
        (r) => !currentRoleIds.has(r.divisionId)
      );

      // 2. Cari divisi yang perlu DITAMBAH
      const rolesToAdd = editableMember.roles.filter(
        (r) => !originalRoleIds.has(r.divisionId)
      );

      // 3. Cari divisi yang perlu DIUPDATE (karena nama berubah)
      const rolesToUpdate = editableMember.originalRoles.filter(
        (r) => currentRoleIds.has(r.divisionId) && nameChanged
      );

      const promises = [];

      rolesToDelete.forEach((role) =>
        promises.push(teamStore.deleteMember(role.id))
      );
      rolesToAdd.forEach((role) =>
        promises.push(
          teamStore.addMember({
            name: editableMember.name,
            divisionId: role.divisionId,
          })
        )
      );
      rolesToUpdate.forEach((role) =>
        promises.push(
          teamStore.updateMember({
            id: role.id,
            name: editableMember.name,
            divisionId: role.divisionId,
          })
        )
      );

      await Promise.all(promises);
    } else {
      // --- LOGIKA TAMBAH BARU (TETAP SAMA) ---
      const memberPromises = editableMember.roles.map((role) => {
        const payload = {
          name: editableMember.name?.trim(),
          divisionId: role.divisionId,
        };
        return teamStore.addMember(payload);
      });
      await Promise.all(memberPromises);
    }

    if (!teamStore.error) {
      // <-- 5. Tampilkan notifikasi sukses
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: `Anggota tim "${editableMember.name}" berhasil ${action}.`,
        life: 3000,
      });
      closeModal();
    } else {
      formError.value = teamStore.error;
    }
  } catch (err) {
    console.error("Error in saveMember:", err);
    formError.value = err.message || "Terjadi kesalahan saat menyimpan data";
    // <-- 6. Tampilkan notifikasi error
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: formError.value,
      life: 4000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const openConfirmDialog = (member) => {
  memberToDelete.value = member;
  isDeleteDialogVisible.value = true;
};

const closeConfirmDialog = () => {
  isDeleteDialogVisible.value = false;
  memberToDelete.value = null;
};

const deleteConfirmed = async () => {
  if (isDeleting.value || !memberToDelete.value) return;

  isDeleting.value = true;
  try {
    // Hapus semua entri untuk anggota ini
    const deletePromises = memberToDelete.value.roles.map((role) =>
      teamStore.deleteMember(role.id)
    );
    await Promise.all(deletePromises);
    // <-- 7. Tampilkan notifikasi sukses
    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: `Anggota "${memberToDelete.value.name}" telah dihapus.`,
      life: 3000,
    });
    closeConfirmDialog();
  } catch (err) {
    console.error("Gagal menghapus anggota:", err);
    // <-- 8. Tampilkan notifikasi error
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Tidak dapat menghapus anggota.",
      life: 4000,
    });
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
/* General Layout */
.page-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}
h1,
h2,
h3 {
  color: #1a202c;
}
h1 {
  font-size: 1.75rem;
  font-weight: 600;
}
h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

/* Table */
.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  vertical-align: middle;
}
th {
  background-color: #f7fafc;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #718096;
}
tr:last-child td {
  border-bottom: none;
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.text-center {
  text-align: center;
}

/* Buttons & Tags */
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
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
  background-color: #ffffff;
  color: #4a5568;
  border-color: #cbd5e0;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #f7fafc;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}
.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  background-color: #f0abfc;
  color: #86198f;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Modal & Form */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.modal-content.dialog {
  max-width: 400px;
}
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label,
.role-entry + label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}
.form-group input,
.form-group select,
.role-select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
}
.form-group input:disabled,
.form-group select:disabled,
.role-select:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}
.form-error {
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}
/* Style untuk baris role/divisi */
.role-entry {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}
.role-select {
  flex-grow: 1;
}

/* State Feedback */
.state-feedback {
  text-align: center;
  padding: 3rem;
  background-color: #f7fafc;
  border-radius: 8px;
  color: #718096;
}
.state-feedback.error {
  background-color: #fed7d7;
  color: #c53030;
}
</style>
