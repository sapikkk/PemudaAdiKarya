<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <header class="page-header">
      <div class="header-content">
        <h1>Log Aktivitas</h1>
        <p>Lacak progres tugas untuk setiap divisi dalam format Kanban.</p>
      </div>
      <div class="header-actions">
        <!-- Filter Divisi -->
        <div class="filter-container">
          <label for="division-filter">Filter Divisi:</label>
          <select
            id="division-filter"
            v-model="selectedDivision"
            class="division-select"
          >
            <option value="all">Semua Divisi</option>
            <option
              v-for="division in teamStore.divisions"
              :key="division.id"
              :value="division.id"
            >
              {{ division.name }}
            </option>
          </select>
        </div>
        <!-- Tombol Tambah hanya untuk Admin -->
        <button
          v-if="authStore.isAdmin"
          @click="openModal()"
          class="btn btn-primary"
        >
          <i class="pi pi-plus"></i> Tambah Tugas
        </button>
      </div>
    </header>

    <!-- State Loading atau Error -->
    <div v-if="activityStore.isLoading" class="state-feedback">
      Memuat aktivitas...
    </div>
    <div v-else-if="activityStore.error" class="state-feedback error">
      {{ activityStore.error }}
    </div>

    <!-- Papan Kanban -->
    <div v-else class="kanban-board">
      <!-- Kolom To Do -->
      <div class="kanban-column">
        <h2 class="column-title todo-header">
          <i class="pi pi-list"></i> To Do ({{
            filteredActivities.todo.length
          }})
        </h2>
        <div class="card-list">
          <div
            v-for="activity in filteredActivities.todo"
            :key="activity.id"
            class="kanban-card"
          >
            <div class="card-header">
              <span class="card-division-tag">{{
                getDivisionName(activity.divisionId)
              }}</span>
              <!-- Tombol Aksi Kartu hanya untuk Admin -->
              <div v-if="authStore.isAdmin" class="card-actions">
                <button
                  @click="openModal(activity)"
                  class="btn-icon"
                  title="Edit"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="confirmDelete(activity)"
                  class="btn-icon"
                  title="Hapus"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
            <h3 class="card-title">{{ activity.title }}</h3>
            <p class="card-description">{{ activity.description }}</p>
            <!-- Tombol Pindah Kartu hanya untuk Admin -->
            <button
              v-if="authStore.isAdmin"
              @click="moveActivity(activity, 'inprogress')"
              class="btn-move"
            >
              Mulai Kerjakan <i class="pi pi-arrow-right"></i>
            </button>
          </div>
          <div v-if="!filteredActivities.todo.length" class="empty-column">
            Tidak ada tugas.
          </div>
        </div>
      </div>

      <!-- Kolom In Progress -->
      <div class="kanban-column">
        <h2 class="column-title inprogress-header">
          <i class="pi pi-spin pi-cog"></i> In Progress ({{
            filteredActivities.inprogress.length
          }})
        </h2>
        <div class="card-list">
          <div
            v-for="activity in filteredActivities.inprogress"
            :key="activity.id"
            class="kanban-card"
          >
            <div class="card-header">
              <span class="card-division-tag">{{
                getDivisionName(activity.divisionId)
              }}</span>
              <!-- Tombol Aksi Kartu hanya untuk Admin -->
              <div v-if="authStore.isAdmin" class="card-actions">
                <button
                  @click="openModal(activity)"
                  class="btn-icon"
                  title="Edit"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="confirmDelete(activity)"
                  class="btn-icon"
                  title="Hapus"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
            <h3 class="card-title">{{ activity.title }}</h3>
            <p class="card-description">{{ activity.description }}</p>
            <!-- Tombol Pindah Kartu hanya untuk Admin -->
            <button
              v-if="authStore.isAdmin"
              @click="moveActivity(activity, 'done')"
              class="btn-move"
            >
              Selesaikan <i class="pi pi-check"></i>
            </button>
          </div>
          <div
            v-if="!filteredActivities.inprogress.length"
            class="empty-column"
          >
            Tidak ada tugas yang sedang dikerjakan.
          </div>
        </div>
      </div>

      <!-- Kolom Done -->
      <div class="kanban-column">
        <h2 class="column-title done-header">
          <i class="pi pi-check-circle"></i> Done ({{
            filteredActivities.done.length
          }})
        </h2>
        <div class="card-list">
          <div
            v-for="activity in filteredActivities.done"
            :key="activity.id"
            class="kanban-card done-card"
          >
            <div class="card-header">
              <span class="card-division-tag">{{
                getDivisionName(activity.divisionId)
              }}</span>
              <!-- Tombol Aksi Kartu hanya untuk Admin -->
              <div v-if="authStore.isAdmin" class="card-actions">
                <button
                  @click="openModal(activity)"
                  class="btn-icon"
                  title="Edit"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="confirmDelete(activity)"
                  class="btn-icon"
                  title="Hapus"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
            <h3 class="card-title">{{ activity.title }}</h3>
            <p class="card-description">{{ activity.description }}</p>
          </div>
          <div v-if="!filteredActivities.done.length" class="empty-column">
            Belum ada tugas yang selesai.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal untuk Tambah/Edit Aktivitas (hanya bisa diakses Admin) -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? "Edit Tugas" : "Tambah Tugas Baru" }}</h2>
        <form @submit.prevent="saveActivity">
          <div class="form-group">
            <label for="title">Judul Tugas</label>
            <input
              id="title"
              type="text"
              v-model="editableActivity.title"
              required
            />
          </div>
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea
              id="description"
              v-model="editableActivity.description"
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="divisionId">Tugaskan ke Divisi</label>
            <select
              id="divisionId"
              v-model="editableActivity.divisionId"
              required
            >
              <option disabled value="">Pilih Divisi</option>
              <option
                v-for="division in teamStore.divisions"
                :key="division.id"
                :value="division.id"
              >
                {{ division.name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dialog Konfirmasi Hapus (hanya bisa diakses Admin) -->
    <div
      v-if="isDeleteDialogVisible"
      class="modal-overlay"
      @click.self="closeConfirmDialog"
    >
      <div class="modal-content dialog">
        <h3>Konfirmasi Hapus</h3>
        <p>
          Apakah Anda yakin ingin menghapus tugas
          <b>"{{ activityToDelete?.title }}"</b>?
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
import { ref, onMounted, computed, reactive } from "vue";
import { useActivityStore } from "../stores/activityStore";
import { useTeamStore } from "../stores/teamStore";
import { useAuthStore } from "@/stores/authStore"; // 1. Impor auth store

// Inisialisasi Stores
const activityStore = useActivityStore();
const teamStore = useTeamStore();
const authStore = useAuthStore(); // 2. Inisialisasi auth store

// State Lokal
const selectedDivision = ref("all");
const isModalVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isEditing = ref(false);
const activityToDelete = ref(null);

const getInitialFormState = () => ({
  id: null,
  title: "",
  description: "",
  divisionId: "",
});
let editableActivity = reactive(getInitialFormState());

// Computed property untuk memfilter aktivitas berdasarkan divisi yang dipilih
const filteredActivities = computed(() => {
  const { todo, inprogress, done } = activityStore.groupedActivities;

  if (selectedDivision.value === "all") {
    return { todo, inprogress, done };
  }

  const filterByDivision = (activities) =>
    activities.filter((a) => a.divisionId == selectedDivision.value);

  return {
    todo: filterByDivision(todo),
    inprogress: filterByDivision(inprogress),
    done: filterByDivision(done),
  };
});

const isFormValid = computed(() => {
  return editableActivity.title && editableActivity.divisionId;
});

// Mengambil data saat komponen dimuat
onMounted(() => {
  activityStore.fetchAll();
  teamStore.fetchAll();
});

// Fungsi untuk mendapatkan nama divisi dari ID
const getDivisionName = (divisionId) => {
  const division = teamStore.divisions.find((d) => d.id === divisionId);
  return division ? division.name : "N/A";
};

// Fungsi Modal
const openModal = (activity = null) => {
  if (activity) {
    isEditing.value = true;
    Object.assign(editableActivity, activity);
  } else {
    isEditing.value = false;
    Object.assign(editableActivity, getInitialFormState());
  }
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const saveActivity = async () => {
  if (!isFormValid.value) return;

  if (isEditing.value) {
    await activityStore.updateActivity({ ...editableActivity });
  } else {
    await activityStore.addActivity({ ...editableActivity });
  }
  closeModal();
};

// Fungsi untuk memindahkan kartu
const moveActivity = async (activity, newStatus) => {
  const updatedActivity = { ...activity, status: newStatus };
  await activityStore.updateActivity(updatedActivity);
};

// Fungsi Dialog Konfirmasi Hapus
const confirmDelete = (activity) => {
  activityToDelete.value = activity;
  isDeleteDialogVisible.value = true;
};

const closeConfirmDialog = () => {
  isDeleteDialogVisible.value = false;
  activityToDelete.value = null;
};

const deleteConfirmed = async () => {
  if (activityToDelete.value) {
    await activityStore.deleteActivity(activityToDelete.value.id);
  }
  closeConfirmDialog();
};
</script>

<style scoped>
@import "primeicons/primeicons.css";

.page-container {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.header-content p {
  color: #718096;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-container label {
  font-weight: 500;
  color: #4a5568;
}

.division-select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #cbd5e0;
  background-color: #fff;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #4a5568;
  border-color: #cbd5e0;
}
.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}
.btn-danger:hover {
  background-color: #b91c1c;
}

.state-feedback {
  text-align: center;
  padding: 3rem;
  background-color: #f7fafc;
  border-radius: 8px;
  color: #718096;
}
.state-feedback.error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.kanban-column {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 1rem;
  min-height: 300px;
}

.column-title {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  margin: -1rem -1rem 1rem -1rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.todo-header {
  background-color: #e0e7ff;
  color: #3730a3;
}
.inprogress-header {
  background-color: #fef9c3;
  color: #854d0e;
}
.done-header {
  background-color: #dcfce7;
  color: #166534;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-column {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

.kanban-card {
  background-color: #fff;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6366f1;
}

.kanban-column:nth-child(2) .kanban-card {
  border-left-color: #f59e0b;
}
.kanban-column:nth-child(3) .kanban-card {
  border-left-color: #22c55e;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-division-tag {
  background-color: #eef2ff;
  color: #4338ca;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 28px;
  height: 28px;
}
.btn-icon:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.card-description {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.btn-move {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
.btn-move:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e0;
}

.done-card {
  opacity: 0.8;
}
.done-card .card-title {
  text-decoration: line-through;
  color: #94a3b8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(221, 221, 221, 0.5);
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
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
