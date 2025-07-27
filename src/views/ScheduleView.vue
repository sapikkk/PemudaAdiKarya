<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <header class="page-header">
      <div class="header-content">
        <h1>Jadwal & Progres</h1>
        <p>
          Kelola jadwal proyek dan progres pengajuan proposal di satu tempat.
        </p>
      </div>
      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠️</span>
        Gagal memuat data: {{ error }}
      </div>
    </header>

    <div class="content-stack">
      <!-- [DIPERBARUI] Bagian Aktivitas & Log Terintegrasi -->
      <div class="content-wrapper">
        <div class="content-header">
          <div class="header-content-table">
            <h2>
              <i class="pi pi-chart-bar"></i> Aktivitas Proposal (Juli - Agustus
              2025)
            </h2>
            <span class="content-summary"
              >Menampilkan log pembaruan proposal dalam 2 bulan terakhir.</span
            >
          </div>
          <div class="header-actions-activity">
            <button
              @click="toggleActivityLogPanel"
              class="btn btn-icon-only btn-secondary"
              title="Lihat Log Aktivitas"
            >
              <i class="pi pi-bell"></i>
              <span v-if="unreadLogsCount > 0" class="notification-badge">{{
                unreadLogsCount
              }}</span>
            </button>
            <div v-if="showActivityLogPanel" class="activity-panel">
              <div class="activity-panel-header">
                <h3>Aktivitas Terbaru</h3>
              </div>
              <ul class="activity-log-list">
                <li v-if="!fullActivityLog.length" class="activity-log-empty">
                  Belum ada aktivitas yang tercatat.
                </li>
                <li
                  v-for="(log, index) in fullActivityLog.slice(0, 10)"
                  :key="index"
                  class="activity-log-item"
                >
                  <div class="activity-icon">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">
                      <span class="activity-proposal-name">{{
                        log.proposalName
                      }}</span>
                    </p>
                    <ul class="activity-changes-list">
                      <li
                        v-for="(change, cIndex) in log.log.split('|')"
                        :key="cIndex"
                        class="activity-change-item"
                      >
                        {{ change }}
                      </li>
                    </ul>
                    <span class="activity-date">{{
                      formatDateTime(log.timestamp)
                    }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="heatmap-wrapper">
          <div v-if="proposalStore.isLoading" class="loading-state mini">
            <div class="spinner"></div>
          </div>
          <div v-else class="heatmap-container">
            <div class="heatmap-months-header">
              <div
                v-for="month in heatmapMonths"
                :key="month.name"
                :style="{ gridColumn: `span ${month.span}` }"
                class="heatmap-month-label"
              >
                {{ month.name }}
              </div>
            </div>
            <div class="heatmap-grid-container">
              <div class="heatmap-weekdays">
                <div
                  v-for="dayLabel in heatmapWeekdays"
                  :key="dayLabel"
                  class="heatmap-weekday"
                >
                  {{ dayLabel }}
                </div>
              </div>
              <div class="heatmap-grid">
                <div
                  v-for="day in heatmapDays"
                  :key="day.date"
                  class="heatmap-day"
                  :class="getHeatmapColor(day.count)"
                  :title="`${day.count} aktivitas pada ${formatDate(day.date)}`"
                ></div>
              </div>
            </div>
          </div>
          <div class="heatmap-legend">
            <span>Kurang</span>
            <div class="heatmap-day level-0"></div>
            <div class="heatmap-day level-1"></div>
            <div class="heatmap-day level-2"></div>
            <div class="heatmap-day level-3"></div>
            <div class="heatmap-day level-4"></div>
            <span>Banyak</span>
          </div>
        </div>
      </div>

      <!-- Bagian Gantt Chart -->
      <div class="content-wrapper">
        <div class="content-header">
          <div class="header-content-table">
            <h2><i class="pi pi-calendar"></i> Jadwal & Tugas (Gantt Chart)</h2>
            <span v-if="authStore.isAdmin" class="content-summary"
              >Anda bisa drag-and-drop dan mengubah ukuran tugas.</span
            >
            <span v-else class="content-summary"
              >Mode hanya-lihat untuk tugas.</span
            >
          </div>
        </div>
        <div class="gantt-wrapper">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat jadwal...</p>
          </div>
          <div ref="ganttContainer" class="gantt-container"></div>
        </div>
      </div>

      <!-- [DIPERBARUI] Bagian Proposal -->
      <div class="content-wrapper">
        <div class="content-header proposal-header">
          <div class="header-content-table">
            <h2><i class="pi pi-file-edit"></i> Progres Proposal</h2>
            <span class="content-summary"
              >Menampilkan: {{ filteredProposals.length }} dari
              {{ proposalStore.proposals.length }} proposal</span
            >
          </div>
          <div class="header-actions">
            <div class="filter-grid">
              <div class="filter-group">
                <label for="statusFilter">Filter Status:</label>
                <select
                  id="statusFilter"
                  v-model="selectedStatusFilter"
                  class="filter-select"
                >
                  <option value="Semua">Semua</option>
                  <option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <label for="startDateFilter">Tanggal Mulai:</label>
                <input
                  type="date"
                  id="startDateFilter"
                  v-model="startDateFilter"
                  class="filter-date"
                />
              </div>
              <div class="filter-group">
                <label for="endDateFilter">Tanggal Akhir:</label>
                <input
                  type="date"
                  id="endDateFilter"
                  v-model="endDateFilter"
                  class="filter-date"
                />
              </div>
            </div>
            <button
              v-if="authStore.isAdmin"
              @click="openNew"
              class="btn btn-primary"
            >
              <i class="pi pi-plus"></i> Tambah Proposal
            </button>
          </div>
        </div>
        <div class="table-content">
          <div v-if="proposalStore.isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data proposal...</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Nama Proposal / Donatur</th>
                <th>Tgl Pengajuan</th>
                <th class="text-center">Status</th>
                <th>Disposisi / Progress</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredProposals.length">
                <td colspan="5" class="empty-state">
                  <div class="empty-content">
                    <div class="empty-icon"><i class="pi pi-inbox"></i></div>
                    <p>Tidak ada proposal yang cocok dengan filter saat ini.</p>
                    <button
                      @click="resetFilters"
                      class="btn btn-secondary btn-sm"
                    >
                      Reset Semua Filter
                    </button>
                  </div>
                </td>
              </tr>
              <tr
                v-for="item in filteredProposals"
                :key="item.id"
                class="data-row"
              >
                <td>
                  <div class="cell-content-stacked">
                    <span class="description">{{ item.name }}</span>
                    <span class="sub-description">
                      <i class="pi pi-user" style="font-size: 0.75rem"></i>
                      Diajukan oleh: {{ item.submitterName || "-" }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="cell-content-stacked">
                    <span class="description">{{
                      formatDate(item.submissionDate)
                    }}</span>
                    <span class="sub-description"
                      >Update: {{ formatDateTime(item.lastUpdated) }}</span
                    >
                  </div>
                </td>
                <td class="text-center">
                  <span class="tag" :class="getStatusClass(item.status)">{{
                    item.status
                  }}</span>
                </td>
                <td>
                  <div class="cell-content-stacked">
                    <span class="description">{{
                      item.disposition || "-"
                    }}</span>
                    <span class="sub-description"
                      >Respon: {{ item.donorResponse || "-" }}</span
                    >
                  </div>
                </td>
                <td class="actions">
                  <button
                    @click="showHistory(item)"
                    class="btn btn-icon-only btn-info"
                    title="Lihat Riwayat"
                  >
                    <i class="pi pi-history"></i>
                  </button>
                  <button
                    v-if="authStore.isAdmin"
                    @click="editProposal(item)"
                    class="btn btn-icon-only btn-secondary"
                    title="Edit"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    v-if="authStore.isAdmin"
                    @click="confirmDeleteProposal(item)"
                    class="btn btn-icon-only btn-danger"
                    title="Hapus"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi -->
    <Toast />

    <!-- Modal untuk Tambah/Edit Proposal -->
    <div v-if="proposalDialog" class="modal-overlay" @click.self="hideDialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? "Edit Proposal" : "Tambah Proposal Baru" }}</h2>
          <button @click="hideDialog" class="btn-close">×</button>
        </div>
        <form @submit.prevent="saveProposalHandler" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nama Proposal / Tujuan Donatur</label>
              <input
                id="name"
                type="text"
                v-model.trim="proposal.name"
                placeholder="Contoh: Proposal Sponsorship Acara 17an"
                required
                :class="{ invalid: submitted && !proposal.name }"
              />
              <small v-if="submitted && !proposal.name" class="form-error"
                >Nama proposal wajib diisi.</small
              >
            </div>
            <div class="form-group">
              <label for="submitterName">Nama Pengaju</label>
              <input
                id="submitterName"
                type="text"
                v-model.trim="proposal.submitterName"
                placeholder="Contoh: Budi Santoso"
                required
                :class="{ invalid: submitted && !proposal.submitterName }"
              />
              <small
                v-if="submitted && !proposal.submitterName"
                class="form-error"
                >Nama pengaju wajib diisi.</small
              >
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="submissionDate">Tanggal Pengajuan</label>
              <input
                id="submissionDate"
                type="date"
                v-model="proposal.submissionDate"
                required
              />
            </div>
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" v-model="proposal.status" required>
                <option
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="disposition">Disposisi / Progress Saat Ini</label>
            <textarea
              id="disposition"
              v-model="proposal.disposition"
              rows="3"
              placeholder="Contoh: Sudah dikirim dan menunggu respon"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="donorResponse">Jawaban dari Pihak Donatur</label>
            <textarea
              id="donorResponse"
              v-model="proposal.donorResponse"
              rows="3"
              placeholder="Contoh: Meminta revisi pada bagian anggaran"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="hideDialog" class="btn btn-secondary">
              Batal
            </button>
            <button type="submit" class="btn btn-primary">
              <span v-if="isSubmitting" class="btn-spinner"></span>
              {{ isSubmitting ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal untuk Riwayat Proposal -->
    <div
      v-if="historyDialog"
      class="modal-overlay"
      @click.self="historyDialog = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2>Riwayat Progres Proposal</h2>
          <button @click="historyDialog = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p class="history-title">
            <strong>Proposal:</strong> {{ proposal.name }}
          </p>
          <ul class="history-list">
            <li
              v-if="!proposal.history || !proposal.history.length"
              class="history-item-empty"
            >
              Belum ada riwayat perubahan.
            </li>
            <li
              v-for="(log, index) in proposal.history"
              :key="index"
              class="history-item"
            >
              <div class="history-icon"><i class="pi pi-check-circle"></i></div>
              <div class="history-content">
                <span class="history-log">{{
                  log.log.split("|").join(", ")
                }}</span>
                <span class="history-date">{{
                  formatDateTime(log.timestamp)
                }}</span>
              </div>
            </li>
          </ul>
        </div>
        <div class="form-actions">
          <button
            type="button"
            @click="historyDialog = false"
            class="btn btn-secondary"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog Konfirmasi Hapus -->
    <Dialog
      v-model:visible="deleteProposalDialog"
      :style="{ width: '450px' }"
      header="Konfirmasi Hapus"
      :modal="true"
      :draggable="false"
    >
      <div class="flex align-items-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="proposal"
          >Anda yakin ingin menghapus <b>{{ proposal.name }}</b
          >? Tindakan ini tidak dapat dibatalkan.</span
        >
      </div>
      <template #footer>
        <Button
          label="Tidak"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteProposalDialog = false"
        />
        <Button
          label="Ya, Hapus"
          icon="pi pi-check"
          class="p-button-danger p-button-text"
          @click="deleteProposalHandler"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { useTasksStore } from "@/stores/tasksStore";
import { useProposalStore } from "@/stores/proposalStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";

const ganttContainer = ref(null);
const tasksStore = useTasksStore();
const proposalStore = useProposalStore();
const authStore = useAuthStore();
const toast = useToast();
const loading = ref(true);
const error = ref(null);
const isSubmitting = ref(false);
const proposalDialog = ref(false);
const deleteProposalDialog = ref(false);
const historyDialog = ref(false);
const proposal = ref({});
const submitted = ref(false);
const isEditing = ref(false);

const selectedStatusFilter = ref("Semua");
const startDateFilter = ref("");
const endDateFilter = ref("");

const showActivityLogPanel = ref(false);
const unreadLogsCount = ref(0);

const toggleActivityLogPanel = () => {
  showActivityLogPanel.value = !showActivityLogPanel.value;
  if (showActivityLogPanel.value) {
    unreadLogsCount.value = 0;
  }
};

const statusOptions = ref([
  { label: "Diajukan", value: "Diajukan" },
  { label: "Diproses", value: "Diproses" },
  { label: "Revisi", value: "Revisi" },
  { label: "Disetujui", value: "Disetujui" },
  { label: "Ditolak", value: "Ditolak" },
]);

const filteredProposals = computed(() => {
  if (!proposalStore.proposals) return [];
  let proposals = proposalStore.proposals;
  if (selectedStatusFilter.value !== "Semua") {
    proposals = proposals.filter(
      (p) => p.status === selectedStatusFilter.value
    );
  }
  if (startDateFilter.value) {
    const start = new Date(startDateFilter.value).setHours(0, 0, 0, 0);
    proposals = proposals.filter((p) => new Date(p.lastUpdated) >= start);
  }
  if (endDateFilter.value) {
    const end = new Date(endDateFilter.value).setHours(23, 59, 59, 999);
    proposals = proposals.filter((p) => new Date(p.lastUpdated) <= end);
  }
  return proposals;
});

const resetFilters = () => {
  selectedStatusFilter.value = "Semua";
  startDateFilter.value = "";
  endDateFilter.value = "";
};

const activityCounts = computed(() => {
  const counts = {};
  proposalStore.proposals.forEach((p) => {
    if (p.history && p.history.length) {
      p.history.forEach((log) => {
        const date = new Date(log.timestamp).toISOString().split("T")[0];
        counts[date] = (counts[date] || 0) + 1;
      });
    }
  });
  return counts;
});

const heatmapDays = computed(() => {
  const days = [];
  const startDate = new Date("2025-07-01");
  const endDate = new Date("2025-08-23");

  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    if (currentDate >= startDate) {
      days.push({
        date: dateStr,
        count: activityCounts.value[dateStr] || 0,
      });
    } else {
      days.push({ date: dateStr, count: -1 });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
});

const heatmapMonths = computed(() => {
  if (!heatmapDays.value.length) return [];
  const months = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  let currentMonth = -1;
  let weekCount = 0;

  heatmapDays.value.forEach((day, index) => {
    if (index % 7 === 0) {
      const date = new Date(day.date);
      const month = date.getMonth();
      if (month !== currentMonth) {
        if (currentMonth !== -1) {
          months[months.length - 1].span = weekCount;
        }
        months.push({ name: monthNames[month], span: 1 });
        currentMonth = month;
        weekCount = 1;
      } else {
        weekCount++;
      }
    }
  });
  if (months.length > 0) {
    months[months.length - 1].span = weekCount;
  }
  return months;
});

const heatmapWeekdays = computed(() => {
  return ["", "Sen", "", "Rab", "", "Jum", ""];
});

const getHeatmapColor = (count) => {
  if (count < 0) return "level-placeholder";
  if (count === 0) return "level-0";
  if (count <= 2) return "level-1";
  if (count <= 4) return "level-2";
  if (count <= 6) return "level-3";
  return "level-4";
};

const fullActivityLog = computed(() => {
  if (!proposalStore.proposals) return [];
  return proposalStore.proposals
    .flatMap((p) =>
      (p.history || []).map((log) => ({
        ...log,
        proposalName: p.name,
        proposalId: p.id,
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const toYyyyMmDd = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "Disetujui":
      return "status-approved";
    case "Diproses":
      return "status-processing";
    case "Diajukan":
      return "status-submitted";
    case "Revisi":
      return "status-revision";
    case "Ditolak":
      return "status-rejected";
    default:
      return "";
  }
};

function formatDateGantt(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

async function initGantt() {
  if (!ganttContainer.value) return;
  try {
    gantt.locale = {
      date: {
        month_full: [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ],
        month_short: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Ags",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ],
        day_full: [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ],
        day_short: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
      },
      labels: {
        new_task: "Tugas baru",
        icon_save: "Simpan",
        icon_cancel: "Batal",
        icon_delete: "Hapus",
        section_description: "Nama & Deskripsi Tugas",
        section_time: "Periode Waktu",
        minutes: "Menit",
        hours: "Jam",
        days: "Hari",
        weeks: "Minggu",
        months: "Bulan",
        years: "Tahun",
      },
    };
    gantt.config.lightbox.sections = [
      {
        name: "description",
        height: 70,
        map_to: "text",
        type: "textarea",
        focus: true,
      },
      { name: "time", type: "time", map_to: "auto" },
    ];
    gantt.config.date_format = "%Y-%m-%d";
    const columns = [
      {
        name: "text",
        label: "Nama Tugas",
        tree: true,
        width: "300",
        resize: true,
        min_width: 200,
      },
      { name: "start_date", label: "Mulai", align: "center", width: 90 },
      { name: "duration", label: "Durasi", align: "center", width: 60 },
    ];
    if (authStore.isAdmin) {
      columns.push({ name: "add", label: "", width: 44 });
    }
    gantt.config.columns = columns;
    gantt.config.readonly = !authStore.isAdmin;
    gantt.config.work_time = true;
    gantt.config.skip_off_time = true;
    gantt.config.row_height = 45;
    gantt.config.scale_height = 50;
    gantt.config.autosize = false;
    gantt.config.fit_tasks = false;

    if (authStore.isAdmin) {
      gantt.createDataProcessor(async (entity, action, data, id) => {
        if (entity !== "task") return;
        try {
          switch (action) {
            case "create": {
              const taskToCreate = {
                text: data.text,
                start_date: formatDateGantt(data.start_date),
                duration: data.duration,
                progress: data.progress || 0,
                parent: data.parent || 0,
                userId: authStore.user.id,
              };
              const createdTask = await tasksStore.addTask(taskToCreate);
              return { tid: createdTask.id };
            }
            case "update": {
              const taskToUpdate = {
                id: id,
                text: data.text,
                start_date: formatDateGantt(data.start_date),
                duration: data.duration,
                progress: data.progress,
                parent: data.parent,
              };
              await tasksStore.updateTask(taskToUpdate);
              break;
            }
            case "delete":
              await tasksStore.deleteTask(id);
              break;
          }
          return { action: "updated" };
        } catch (e) {
          console.error(`Gagal pada aksi DataProcessor '${action}':`, e);
          toast.add({
            severity: "error",
            summary: "Gagal Sinkronisasi Gantt",
            detail: `Tidak dapat ${action} tugas.`,
            life: 3000,
          });
          return { action: "error" };
        }
      });
    }

    gantt.init(ganttContainer.value);
    gantt.plugins({ tooltip: true });
    gantt.parse({
      data: tasksStore.tasks.map((task) => ({
        ...task,
        progress: task.progress || 0,
      })),
    });
    gantt.render();
  } catch (err) {
    console.error("Gagal menginisialisasi Gantt:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

const openNew = () => {
  isEditing.value = false;
  submitted.value = false;
  proposal.value = {
    status: "Diajukan",
    submissionDate: toYyyyMmDd(new Date()),
    history: [],
  };
  proposalDialog.value = true;
};

const hideDialog = () => {
  proposalDialog.value = false;
  proposal.value = {};
};

const saveProposalHandler = async () => {
  submitted.value = true;
  if (
    !proposal.value.name ||
    !proposal.value.name.trim() ||
    !proposal.value.submissionDate ||
    !proposal.value.submitterName
  )
    return;

  isSubmitting.value = true;
  const payload = { ...proposal.value };

  if (isEditing.value) {
    const originalProposal = proposalStore.proposals.find(
      (p) => p.id === payload.id
    );
    if (originalProposal) {
      const changes = [];
      if (originalProposal.name !== payload.name)
        changes.push(
          `Nama diubah dari "${originalProposal.name}" menjadi "${payload.name}".`
        );
      if (originalProposal.status !== payload.status)
        changes.push(
          `Status diubah dari "${originalProposal.status}" menjadi "${payload.status}".`
        );
      if (originalProposal.disposition !== payload.disposition)
        changes.push(`Disposisi diperbarui.`);
      if (originalProposal.donorResponse !== payload.donorResponse)
        changes.push(`Respon donatur diperbarui.`);

      if (changes.length > 0) {
        if (!payload.history) payload.history = [];
        const logEntry = {
          timestamp: new Date().toISOString(),
          log: changes.join("|"),
          user: authStore.user?.name || "System",
        };
        payload.history.push(logEntry);
        unreadLogsCount.value += changes.length;
      }
    }
  } else {
    payload.history = [
      {
        timestamp: new Date().toISOString(),
        log: `Proposal dibuat oleh ${payload.submitterName}.`,
        user: authStore.user?.name || "System",
      },
    ];
    unreadLogsCount.value++;
  }

  try {
    payload.submissionDate = new Date(payload.submissionDate).toISOString();
    payload.lastUpdated = new Date().toISOString();
    await proposalStore.saveProposal(payload);
    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Data Proposal Tersimpan",
      life: 3000,
    });
    hideDialog();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: `Tidak dapat menyimpan data: ${err.message}`,
      life: 3000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const editProposal = (prod) => {
  isEditing.value = true;
  submitted.value = false;
  proposal.value = { ...prod, submissionDate: toYyyyMmDd(prod.submissionDate) };
  proposalDialog.value = true;
};

const confirmDeleteProposal = (prod) => {
  proposal.value = prod;
  deleteProposalDialog.value = true;
};

const deleteProposalHandler = async () => {
  try {
    await proposalStore.deleteProposal(proposal.value.id);
    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Proposal Dihapus",
      life: 3000,
    });
    deleteProposalDialog.value = false;
    proposal.value = {};
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Tidak dapat menghapus data",
      life: 3000,
    });
  }
};

const showHistory = (prod) => {
  proposal.value = prod;
  historyDialog.value = true;
};

onMounted(async () => {
  try {
    loading.value = true;
    
    // Pastikan semua store diinisialisasi sebelum digunakan
    await Promise.all([
      tasksStore.fetchTasks(),
      proposalStore.fetchProposals()
    ]);
    
    // Tunggu sampai data siap sebelum inisialisasi Gantt
    if (tasksStore.tasks && tasksStore.tasks.length) {
      await initGantt();
    }
  } catch (err) {
    console.error("Gagal memuat data:", err);
    error.value = err.message || 'Gagal memuat data';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (gantt && gantt.destructor) {
    gantt.destructor();
  }
});
</script>

<style>
/* Global Gantt Chart Styles (Unchanged) */
:root {
  --gantt-header-bg: #f8fafc;
  --gantt-header-border: #e2e8f0;
  --gantt-header-color: #475569;
  --gantt-row-bg: #ffffff;
  --gantt-row-odd-bg: #f8fafc;
  --gantt-task-bg: #3b82f6;
  --gantt-task-border: #2563eb;
  --gantt-task-progress-bg: #16a34a;
  --gantt-grid-border: #e2e8f0;
  --gantt-link-color: #ef4444;
}
.gantt_grid_scale .gantt_grid_head_cell,
.gantt_scale_cell {
  background-color: var(--gantt-header-bg) !important;
  border-bottom: 1px solid var(--gantt-header-border) !important;
  color: var(--gantt-header-color) !important;
  font-weight: 600 !important;
}
.gantt_task .gantt_task_scale .gantt_scale_cell {
  border-right: 1px solid var(--gantt-header-border) !important;
}
.gantt_grid_data .gantt_row.odd:not(.gantt_selected),
.gantt_task_row.odd:not(.gantt_selected) {
  background-color: var(--gantt-row-odd-bg);
}
.gantt_grid_data .gantt_row:not(.odd):not(.gantt_selected),
.gantt_task_row:not(.odd):not(.gantt_selected) {
  background-color: var(--gantt-row-bg);
}
.gantt_task_line {
  background-color: var(--gantt-task-bg);
  border: 1px solid var(--gantt-task-border);
  border-radius: 4px;
}
.gantt_task_line .gantt_task_progress {
  background-color: var(--gantt-task-progress-bg);
  border-radius: 4px;
}
.gantt_link_arrow,
.gantt_line_wrapper div {
  background-color: var(--gantt-link-color);
  border-color: var(--gantt-link-color);
}
.gantt_grid,
.gantt_hor_scroll {
  border-top: 1px solid var(--gantt-grid-border) !important;
}
.gantt_ver_scroll {
  border-left: 1px solid var(--gantt-grid-border) !important;
}
.gantt_task_content {
  font-weight: 500;
  color: white;
}
</style>

<style scoped>
@import "primeicons/primeicons.css";
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #38bdf8;
  --surface-ground: #f8fafc;
  --surface-card: #ffffff;
  --surface-border: #e5e7eb;
  --text-color: #1f2937;
  --text-color-secondary: #6b7280;
}
.page-container {
  max-width: 1600px;
  margin: 1.5rem auto;
  padding: 0 1.5rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
.page-header {
  margin-bottom: 2rem;
}
.header-content h1 {
  color: var(--text-color);
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0;
}
.header-content p {
  color: var(--text-color-secondary);
  font-size: 1.125rem;
  margin-top: 0.5rem;
}
.error-banner {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 1px solid #fca5a5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.content-stack {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.content-wrapper {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  overflow: visible;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  flex-shrink: 0;
  gap: 1rem;
  flex-wrap: wrap;
  position: relative;
}
.header-content-table {
  flex-grow: 1;
}
.header-content-table h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.content-summary {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.filter-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}
.filter-select,
.filter-date {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  background-color: var(--surface-card);
  color: var(--text-color);
  font-size: 0.875rem;
  font-weight: 500;
  transition: border-color 0.2s;
}
.filter-select:focus,
.filter-date:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.filter-select {
  min-width: 150px;
}
.gantt-wrapper {
  flex-grow: 1;
  height: 600px;
  position: relative;
  overflow: auto !important;
}
.gantt-container {
  height: 100%;
}
.table-content {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-color-secondary);
  min-height: 200px;
}
.loading-state.mini {
  min-height: 150px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}
th,
td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--surface-border);
  vertical-align: middle;
  white-space: nowrap;
}
th:nth-child(1),
td:nth-child(1) {
  min-width: 250px;
}
th:nth-child(4),
td:nth-child(4) {
  min-width: 280px;
}
th {
  background: var(--surface-ground);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-color-secondary);
  letter-spacing: 0.05em;
}
td {
  font-size: 0.9rem;
}
.data-row:hover {
  background-color: var(--surface-ground);
}
.cell-content-stacked {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  white-space: normal;
}
.description {
  font-weight: 600;
  color: var(--text-color);
}
.sub-description {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.text-center {
  text-align: center;
}
.empty-content {
  text-align: center;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
.empty-content p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}
.btn {
  padding: 0.6rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-primary {
  background-color: var(--primary-color);
  color: white;
}
.btn-primary:hover {
  background-color: #2563eb;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #4b5563;
}
.btn-secondary:hover {
  background-color: #d1d5db;
}
.btn-danger {
  background-color: #f87171;
  color: white;
}
.btn-danger:hover {
  background-color: var(--danger-color);
}
.btn-info {
  background-color: #60a5fa;
  color: white;
}
.btn-info:hover {
  background-color: var(--info-color);
}
.btn-icon-only {
  padding: 0.5rem;
  position: relative;
}
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  text-transform: capitalize;
}
.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}
.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-processing {
  background-color: #cffafe;
  color: #0e7490;
}
.status-revision {
  background-color: #fef3c7;
  color: #92400e;
}
.status-submitted {
  background-color: #dbeafe;
  color: #1e40af;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.modal-content {
  background: var(--surface-card);
  padding: 0;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--surface-border);
  flex-shrink: 0;
}
.modal-header h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color-secondary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-close:hover {
  background-color: #f3f4f6;
  color: var(--text-color);
}
.modal-body {
  padding: 1rem 2rem 2rem 2rem;
  overflow-y: auto;
  background: var(--surface-card);
}
.modal-form {
  padding: 2rem;
  overflow-y: auto;
  background: var(--surface-card);
}
.form-group {
  margin-bottom: 1.25rem;
  background: var(--surface-card);
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--surface-card);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.form-group textarea {
  resize: vertical;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.form-error {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
input.invalid {
  border-color: var(--danger-color);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--surface-border);
  background-color: var(--surface-ground);
  flex-shrink: 0;
}
.history-title {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
  border-left: 3px solid var(--primary-color);
  padding-left: 1rem;
}
.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.history-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  position: relative;
}
.history-item:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 28px;
  width: 2px;
  height: calc(100% - 10px);
  background-color: #e5e7eb;
}
.history-icon {
  font-size: 1.25rem;
  color: var(--success-color);
  background-color: #d1fae5;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}
.history-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.history-log {
  font-weight: 500;
  color: var(--text-color);
}
.history-date {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}
.history-item-empty {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 2rem;
}

/* --- [DIPERBARUI] Styles untuk Heatmap --- */
.heatmap-wrapper {
  padding: 1.5rem;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.heatmap-container {
  display: inline-flex;
  flex-direction: column;
  gap: 0.5rem;
}
.heatmap-months-header {
  display: grid;
  grid-auto-flow: column;
  gap: 4px;
  padding-left: 40px;
}
.heatmap-month-label {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}
.heatmap-grid-container {
  display: inline-flex;
  gap: 0.5rem;
}
.heatmap-weekdays {
  display: grid;
  grid-template-rows: repeat(7, 24px);
  grid-auto-flow: row;
  grid-gap: 4px;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}
.heatmap-weekday {
  height: 24px;
  line-height: 24px;
  text-align: right;
  padding-right: 0.5rem;
}
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 24px);
  grid-auto-flow: column;
  grid-gap: 4px;
}
.heatmap-day {
  width: 24px;
  height: 24px;
  background-color: #ebedf0;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.1s;
}
.heatmap-day:hover {
  transform: scale(1.1);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}
.heatmap-day.level-placeholder {
  background-color: transparent;
}
.heatmap-day.level-0 {
  background-color: #ebedf0;
}
.heatmap-day.level-1 {
  background-color: #dbeafe;
}
.heatmap-day.level-2 {
  background-color: #93c5fd;
}
.heatmap-day.level-3 {
  background-color: #60a5fa;
}
.heatmap-day.level-4 {
  background-color: #3b82f6;
}
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-top: 1rem;
  padding-right: 1rem;
}

/* --- [DIPERBARUI] Styles untuk Panel Log Aktivitas --- */
.header-actions-activity {
  position: relative;
}
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.activity-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 350px;
  max-height: 400px;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}
.activity-panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
}
.activity-panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.activity-log-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}
.activity-log-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
}
.activity-log-item:last-child {
  border-bottom: none;
}
.activity-icon {
  font-size: 1rem;
  color: var(--info-color);
  margin-top: 0.25rem;
}
.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}
.activity-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color);
}
.activity-proposal-name {
  font-weight: 600;
}
.activity-date {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}
.activity-log-empty {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 2rem;
}
.activity-changes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-color);
}
.activity-change-item {
  position: relative;
  padding-left: 1rem;
}
.activity-change-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--text-color-secondary);
}

/* --- [DIPERBARUI] Responsive Design --- */
@media (max-width: 992px) {
  .proposal-header {
    flex-direction: column;
    align-items: stretch;
  }
  .proposal-header .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-grid {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
@media (max-width: 768px) {
  .page-container {
    padding: 0 1rem;
    margin: 1rem auto;
  }
  .header-content h1 {
    font-size: 1.75rem;
  }
  .header-content p {
    font-size: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .form-grid .form-group {
    margin-bottom: 1.25rem;
  }
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
}
</style>
