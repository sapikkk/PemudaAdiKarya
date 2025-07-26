<template>
  <div class="participants-view">
    <!-- Header Halaman -->
    <header class="page-header">
      <h1>Manajemen Peserta</h1>
      <!-- Tombol Tambah hanya untuk Admin -->
      <button
        v-if="authStore.isAdmin"
        @click="openModal()"
        class="btn btn-primary"
      >
        Tambah Peserta
      </button>
    </header>

    <!-- State: Loading -->
    <div v-if="isLoading && !participants.length" class="state-feedback">
      <p>Memuat data peserta...</p>
    </div>

    <!-- State: Error -->
    <div v-else-if="error" class="state-feedback error">
      <p>Terjadi kesalahan: {{ error }}</p>
      <button
        @click="fetchData"
        class="btn btn-secondary"
        style="margin-top: 1rem"
      >
        Coba Lagi
      </button>
    </div>

    <!-- State: Data Tersedia -->
    <div v-else-if="participantsWithDetails.length" class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nama Peserta</th>
            <th>Kontak</th>
            <th>Lomba yang Diikuti</th>
            <!-- Kolom Aksi hanya untuk Admin -->
            <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in participantsWithDetails" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.contact || "-" }}</td>
            <td>
              <div v-if="p.competitions.length" class="tag-group">
                <span v-for="comp in p.competitions" :key="comp.id" class="tag">
                  {{ comp.name }}
                </span>
              </div>
              <span v-else class="text-muted">Belum terdaftar</span>
            </td>
            <!-- Tombol Aksi hanya untuk Admin -->
            <td v-if="authStore.isAdmin" class="actions">
              <button @click="openModal(p)" class="btn btn-secondary">
                Edit
              </button>
              <button @click="openConfirmDialog(p)" class="btn btn-danger">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- State: Kosong -->
    <div v-else class="state-feedback">
      <p>Belum ada peserta yang terdaftar.</p>
    </div>

    <!-- Modal untuk Tambah/Edit Peserta (hanya bisa diakses Admin) -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? "Edit Peserta" : "Tambah Peserta Baru" }}</h2>
        <form @submit.prevent="saveParticipant">
          <div class="form-group">
            <label for="name">Nama Peserta</label>
            <input
              id="name"
              type="text"
              v-model="editableParticipant.name"
              required
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="contact">Kontak (Email/No. HP)</label>
            <input
              id="contact"
              type="text"
              v-model="editableParticipant.contact"
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label>Daftarkan ke Lomba</label>
            <div class="checkbox-group">
              <div v-for="comp in competitionStore.competitions" :key="comp.id">
                <input
                  type="checkbox"
                  :id="'comp-' + comp.id"
                  :value="comp.id"
                  v-model="editableParticipant.competitionIds"
                  :disabled="isSubmitting"
                />
                <label :for="'comp-' + comp.id">{{ comp.name }}</label>
              </div>
            </div>
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
              :disabled="!editableParticipant.name || isSubmitting"
            >
              {{ isSubmitting ? "Menyimpan..." : "Simpan" }}
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
          Apakah Anda yakin ingin menghapus peserta
          <b>{{ participantToDelete?.name }}</b
          >?
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
import { ref, onMounted, computed, reactive } from "vue";
import { useParticipantStore } from "../stores/participantStore";
import { useCompetitionStore } from "../stores/competitionStore";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";

// Inisialisasi Stores
const participantStore = useParticipantStore();
const competitionStore = useCompetitionStore();
const authStore = useAuthStore();

// State reaktif dari store
const { participants, isLoading, error } = storeToRefs(participantStore);

// State lokal untuk UI
const isModalVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const formError = ref("");

// State untuk form dan data yang akan dihapus
const getInitialFormState = () => ({
  id: null,
  name: "",
  contact: "",
  competitionIds: [],
});
let editableParticipant = reactive(getInitialFormState());
const participantToDelete = ref(null);

// Mengambil data saat komponen dimuat
const fetchData = async () => {
  try {
    await Promise.all([
      participantStore.fetchAll(),
      competitionStore.fetchAll(),
    ]);
  } catch (err) {
    console.error("Gagal memuat data:", err);
  }
};

onMounted(fetchData);

// Computed property untuk menggabungkan data peserta dengan detail lomba
const participantsWithDetails = computed(() => {
  return participants.value.map((p) => ({
    ...p,
    competitions: (p.competitionIds || [])
      .map((id) => competitionStore.competitions.find((c) => c.id === id))
      .filter(Boolean),
  }));
});

// Fungsi Modal
const openModal = (participant = null) => {
  formError.value = "";
  if (participant) {
    isEditing.value = true;
    console.log("Opening modal for edit with participant:", participant); // Debug log
    Object.assign(editableParticipant, {
      id: participant.id,
      name: participant.name || "",
      contact: participant.contact || "",
      competitionIds: Array.isArray(participant.competitionIds)
        ? [...participant.competitionIds]
        : [],
    });
  } else {
    isEditing.value = false;
    console.log("Opening modal for new participant"); // Debug log
    Object.assign(editableParticipant, getInitialFormState());
  }
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  formError.value = "";
};

const saveParticipant = async () => {
  if (isSubmitting.value || !editableParticipant.name) return;

  formError.value = "";
  isSubmitting.value = true;

  try {
    const payload = {
      name: editableParticipant.name?.trim(),
      contact: editableParticipant.contact?.trim() || "",
      competitionIds: Array.isArray(editableParticipant.competitionIds)
        ? editableParticipant.competitionIds
        : [],
    };

    if (isEditing.value) {
      if (!editableParticipant.id && editableParticipant.id !== 0) {
        throw new Error("ID peserta tidak valid untuk update");
      }
      payload.id = editableParticipant.id;
      console.log("Updating participant with payload:", payload); // Debug log
      await participantStore.updateParticipant(payload);
    } else {
      console.log("Adding new participant with payload:", payload); // Debug log
      await participantStore.addParticipant(payload);
    }

    if (!participantStore.error) {
      closeModal();
    } else {
      formError.value = participantStore.error;
    }
  } catch (err) {
    console.error("Error in saveParticipant:", err); // Debug log
    formError.value = err.message || "Terjadi kesalahan saat menyimpan data";
  } finally {
    isSubmitting.value = false;
  }
};

// Fungsi Dialog Konfirmasi
const openConfirmDialog = (participant) => {
  participantToDelete.value = participant;
  isConfirmDialogVisible.value = true;
};

const closeConfirmDialog = () => {
  isConfirmDialogVisible.value = false;
  participantToDelete.value = null;
};

const deleteConfirmed = async () => {
  if (isDeleting.value || !participantToDelete.value) return;

  isDeleting.value = true;
  try {
    await participantStore.deleteParticipant(participantToDelete.value.id);
    closeConfirmDialog();
  } catch (err) {
    console.error("Gagal menghapus peserta:", err);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
/* General Layout */
.participants-view {
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

h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
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
.text-muted {
  color: #a0aec0;
}

/* Tags */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag {
  background-color: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
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

/* Modal */
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
.modal-content h2,
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1a202c;
}
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}
.form-group input[type="text"] {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  box-sizing: border-box;
}
.form-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.checkbox-group div {
  display: flex;
  align-items: center;
}
.checkbox-group input {
  margin-right: 0.5rem;
}
.checkbox-group input:disabled {
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
</style>
