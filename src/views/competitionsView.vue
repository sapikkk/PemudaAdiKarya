<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <header class="page-header">
      <h1>Manajemen Lomba</h1>
      <!-- Tombol Tambah hanya untuk Admin -->
      <button
        v-if="authStore.isAdmin"
        @click="openModal()"
        class="btn btn-primary"
      >
        Tambah Lomba
      </button>
    </header>

    <!-- State: Loading -->
    <div v-if="isLoading && !competitions.length" class="state-feedback">
      <p>Memuat data lomba...</p>
    </div>

    <!-- State: Error -->
    <div v-else-if="error" class="state-feedback error">
      <p>Terjadi kesalahan: {{ error }}</p>
      <button @click="fetchData" class="btn">Coba Lagi</button>
    </div>

    <!-- State: Data Tersedia -->
    <div v-else-if="competitions.length" class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px"></th>
            <th>Nama Lomba</th>
            <th>Deskripsi</th>
            <!-- Kolom Aksi hanya untuk Admin -->
            <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-for="comp in competitions" :key="comp.id">
          <tr class="main-row">
            <td>
              <button @click="toggleExpand(comp.id)" class="btn-expand">
                {{ isExpanded(comp.id) ? "−" : "+" }}
              </button>
            </td>
            <td>{{ comp.name }}</td>
            <td>{{ comp.description || "-" }}</td>
            <!-- Tombol Aksi hanya untuk Admin -->
            <td v-if="authStore.isAdmin" class="actions">
              <button @click="openModal(comp)" class="btn btn-secondary">
                Edit
              </button>
              <button @click="openConfirmDialog(comp)" class="btn btn-danger">
                Hapus
              </button>
            </td>
          </tr>
          <!-- Baris Ekspansi untuk menampilkan peserta (terlihat oleh semua user) -->
          <tr v-if="isExpanded(comp.id)" class="expansion-row">
            <td :colspan="authStore.isAdmin ? 4 : 3">
              <div class="participants-list">
                <h4>Peserta di Lomba {{ comp.name }}</h4>
                <div v-if="getParticipantsForCompetition(comp.id).length">
                  <ul>
                    <li
                      v-for="p in getParticipantsForCompetition(comp.id)"
                      :key="p.id"
                    >
                      {{ p.name }}
                      <span class="text-muted"
                        >({{ p.contact || "Kontak tidak ada" }})</span
                      >
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p class="text-muted">
                    Belum ada peserta yang terdaftar di lomba ini.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- State: Kosong -->
    <div v-else class="state-feedback">
      <p>Belum ada lomba yang dibuat.</p>
    </div>

    <!-- Modal untuk Tambah/Edit Lomba (hanya bisa diakses Admin) -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? "Edit Lomba" : "Tambah Lomba Baru" }}</h2>
        <form @submit.prevent="saveCompetition">
          <div class="form-group">
            <label for="name">Nama Lomba</label>
            <input
              id="name"
              type="text"
              v-model="editableCompetition.name"
              required
            />
          </div>
          <div class="form-group">
            <label for="description">Deskripsi Singkat</label>
            <textarea
              id="description"
              v-model="editableCompetition.description"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="rules">Aturan & Ketentuan</label>
            <textarea
              id="rules"
              v-model="editableCompetition.rules"
              rows="5"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!editableCompetition.name"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dialog Konfirmasi Hapus (hanya bisa diakses Admin) -->
    <div
      v-if="isConfirmDialogVisible"
      class="modal-overlay"
      @click.self="closeConfirmDialog"
    >
      <div class="modal-content dialog">
        <h3>Konfirmasi Hapus</h3>
        <p>
          Apakah Anda yakin ingin menghapus lomba
          <b>{{ competitionToDelete.name }}</b
          >?
        </p>
        <div class="form-actions">
          <button @click="closeConfirmDialog" class="btn btn-secondary">
            Tidak
          </button>
          <button @click="deleteConfirmed" class="btn btn-danger">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useCompetitionStore } from "../stores/competitionStore";
import { useParticipantStore } from "../stores/participantStore";
import { useAuthStore } from "@/stores/authStore"; // Import auth store
import { storeToRefs } from "pinia";

// Inisialisasi Stores
const competitionStore = useCompetitionStore();
const participantStore = useParticipantStore();
const authStore = useAuthStore(); // Inisialisasi auth store

// State reaktif dari stores
const { competitions, isLoading, error } = storeToRefs(competitionStore);
const { participants } = storeToRefs(participantStore);

// State lokal untuk UI
const isModalVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const isEditing = ref(false);
const expandedRows = ref([]); // Menyimpan ID baris yang diperluas

// State untuk form dan data yang akan dihapus
const getInitialFormState = () => ({
  id: null,
  name: "",
  description: "",
  rules: "",
});
let editableCompetition = reactive(getInitialFormState());
const competitionToDelete = ref(null);

// Mengambil data saat komponen dimuat
const fetchData = async () => {
  await Promise.all([
    competitionStore.fetchAll(),
    participantStore.fetchAll(),
  ]).catch((err) => console.error("Gagal memuat data:", err));
};
onMounted(fetchData);

// Fungsi untuk mendapatkan peserta berdasarkan ID lomba
const getParticipantsForCompetition = (competitionId) => {
  return participants.value.filter((p) =>
    (p.competitionIds || []).includes(competitionId)
  );
};

// Fungsi untuk ekspansi baris
const toggleExpand = (id) => {
  const index = expandedRows.value.indexOf(id);
  if (index === -1) {
    expandedRows.value.push(id);
  } else {
    expandedRows.value.splice(index, 1);
  }
};
const isExpanded = (id) => expandedRows.value.includes(id);

// Fungsi Modal
const openModal = (competition = null) => {
  if (competition) {
    isEditing.value = true;
    Object.assign(editableCompetition, competition);
  } else {
    isEditing.value = false;
    Object.assign(editableCompetition, getInitialFormState());
  }
  isModalVisible.value = true;
};
const closeModal = () => (isModalVisible.value = false);

const saveCompetition = async () => {
  if (!editableCompetition.name) return;
  const payload = JSON.parse(JSON.stringify(editableCompetition));

  if (isEditing.value) {
    await competitionStore.updateCompetition(payload);
  } else {
    await competitionStore.addCompetition(payload);
  }

  if (!competitionStore.error) closeModal();
};

// Fungsi Dialog Konfirmasi
const openConfirmDialog = (competition) => {
  competitionToDelete.value = competition;
  isConfirmDialogVisible.value = true;
};
const closeConfirmDialog = () => {
  isConfirmDialogVisible.value = false;
  competitionToDelete.value = null;
};
const deleteConfirmed = async () => {
  await competitionStore.deleteCompetition(competitionToDelete.value.id);
  closeConfirmDialog();
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
  border-bottom: 1px solid var(--border-color);
}

h1,
h2,
h3,
h4 {
  color: var(--text-primary);
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
}
h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}
h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

/* Buttons */
.btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
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
.btn-primary:hover {
  background-color: #1d4ed8;
}
.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
.btn-secondary:hover {
  background-color: var(--bg-hover);
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}
.btn-danger:hover {
  background-color: #b91c1c;
}
.btn-expand {
  background: var(--bg-expand);
  border: 1px solid var(--border-color);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--text-secondary);
}

/* Table */
.table-container {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-primary);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  vertical-align: middle;
}
th {
  background-color: var(--bg-table-header);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
}
.main-row td {
  background-color: var(--bg-primary);
}
.expansion-row td {
  padding: 0;
  background-color: var(--bg-expansion);
}
tbody:last-child .main-row td,
tbody:last-child .expansion-row:last-child td {
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
.text-muted {
  color: var(--text-muted);
}

/* Expansion Content */
.participants-list {
  padding: 1.5rem 2rem;
}
.participants-list ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}
.participants-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}
.participants-list li:last-child {
  border-bottom: none;
}

/* State Feedback */
.state-feedback {
  text-align: center;
  padding: 3rem;
  background-color: var(--bg-state);
  border-radius: 8px;
  color: var(--text-secondary);
}
.state-feedback.error {
  background-color: var(--bg-error);
  color: var(--text-error);
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
  background-color: var(--bg-primary);
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
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

/* CSS Variables for Light Mode */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --bg-hover: #f7fafc;
  --bg-expand: #f1f5f9;
  --bg-table-header: #f7fafc;
  --bg-expansion: #f8fafc;
  --bg-state: #f7fafc;
  --bg-error: #fed7d7;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --text-muted: #a0aec0;
  --text-error: #c53030;
  --border-color: #e2e8f0;
}

/* CSS Variables for Dark Mode */
[data-theme="dark"] {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --bg-hover: #2d3748;
  --bg-expand: #2d3748;
  --bg-table-header: #2d3748;
  --bg-expansion: #2d3748;
  --bg-state: #2d3748;
  --bg-error: #742a2a;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --text-muted: #718096;
  --text-error: #fc8181;
  --border-color: #4a5568;
}
</style>
