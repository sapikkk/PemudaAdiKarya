<template>
  <div class="dashboard-view">
    <div class="header">
      <h1>Dashboard Ringkasan</h1>
      <p>Selamat datang! Berikut adalah ringkasan kegiatan acara Anda.</p>
    </div>
    <!-- Kartu Ringkasan Atas (Keuangan) -->
    <div class="summary-grid-top">
      <!-- Card Total Pemasukan -->
      <Card class="summary-card finance-card income">
        <template #title>
          <div class="card-title">
            <i class="pi pi-arrow-down"></i>
            <span>Total Pemasukan</span>
          </div>
        </template>
        <template #content>
          <div class="card-value">
            {{ formatCurrency(financeStore.totalIncome) }}
          </div>
          <div class="card-label">
            Dari {{ financeStore.incomes.length }} transaksi
          </div>
        </template>
      </Card>

      <!-- Card Saldo Akhir -->
      <Card class="summary-card finance-card balance">
        <template #title>
          <div class="card-title">
            <i class="pi pi-wallet"></i>
            <span>Saldo Akhir</span>
          </div>
        </template>
        <template #content>
          <div class="card-value">
            {{ formatCurrency(financeStore.balance) }}
          </div>
          <div
            class="card-label"
            :class="{ 'deficit-label': financeStore.balance < 0 }"
          >
            {{ financeStore.balance >= 0 ? "Surplus" : "Defisit" }}
          </div>
        </template>
      </Card>
    </div>

    <!-- Kartu Ringkasan Bawah (Data Operasional) -->
    <div class="summary-grid-bottom">
      <!-- Card Total Peserta -->
      <Card class="summary-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-users"></i>
            <span>Total Peserta</span>
          </div>
        </template>
        <template #content>
          <div class="card-value">
            {{ participantStore.participants.length }}
          </div>
          <div class="card-label">Orang</div>
        </template>
      </Card>

      <!-- Card Total Lomba -->
      <Card class="summary-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-trophy"></i>
            <span>Total Lomba</span>
          </div>
        </template>
        <template #content>
          <div class="card-value">
            {{ competitionStore.competitions.length }}
          </div>
          <div class="card-label">Lomba</div>
        </template>
      </Card>

      <!-- Card Total Panitia -->
      <Card class="summary-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-id-card"></i>
            <span>Total Panitia</span>
          </div>
        </template>
        <template #content>
          <div class="card-value">{{ teamStore.members.length }}</div>
          <div class="card-label">Orang</div>
        </template>
      </Card>

      <!-- Card Total Tugas -->
      <Card class="summary-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-calendar-check"></i>
            <span>Total Tugas</span>
          </div>
        </template>
        <template #content>
          <!-- Data ini sekarang akan menampilkan jumlah tugas yang benar sesuai peran user -->
          <div class="card-value">{{ tasksStore.tasks.length }}</div>
          <div class="card-label">Tugas</div>
        </template>
      </Card>
    </div>

    <!-- Detail Sections -->
    <div class="detail-sections">
      <!-- Timeline Tugas Segera (Chart) -->
      <div class="section-wrapper timeline-section">
        <div class="section-header">
          <h2>Timeline Tugas Segera (7 Hari)</h2>
          <div class="task-count-badge">{{ upcomingTasks.length }} tugas</div>
        </div>
        <div v-if="upcomingTasks.length > 0" class="chart-wrapper">
          <Chart
            type="line"
            :data="taskTimelineData"
            :options="timelineChartOptions"
            class="timeline-chart"
          />
        </div>
        <div v-else class="no-data">
          <i class="pi pi-calendar-times"></i>
          <p>Tidak ada tugas yang akan datang dalam 7 hari ke depan</p>
        </div>
      </div>

      <!-- Daftar Tugas Detail -->
      <div class="section-wrapper">
        <div class="section-header">
          <h2>Detail Tugas Segera</h2>
        </div>
        <div v-if="upcomingTasks.length > 0" class="task-list">
          <div
            v-for="task in upcomingTasks.slice(0, 5)"
            :key="task.id"
            class="task-item"
          >
            <div class="task-info">
              <h4>{{ task.text }}</h4>
              <div class="task-meta">
                <span class="task-date">
                  <i class="pi pi-calendar"></i>
                  {{ formatDate(task.start_date) }}
                </span>
                <span class="task-duration">
                  <i class="pi pi-clock"></i>
                  {{ task.duration }} hari
                </span>
              </div>
            </div>
            <div class="task-progress">
              <div class="progress-container">
                <ProgressBar
                  :value="getProgressPercentage(task.progress)"
                  class="custom-progressbar"
                />
                <span class="progress-text"
                  >{{ getProgressPercentage(task.progress) }}%</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data small">
          <p>Tidak ada tugas segera</p>
        </div>
      </div>

      <!-- Daftar Lomba dengan Chart -->
      <div class="section-wrapper">
        <div class="section-header">
          <h2>Statistik Lomba</h2>
        </div>
        <div
          v-if="competitionsWithParticipantCount.length > 0"
          class="chart-wrapper"
        >
          <Chart
            type="bar"
            :data="competitionChartData"
            :options="competitionChartOptions"
            class="competition-chart"
          />
        </div>
        <div v-else class="no-data">
          <i class="pi pi-trophy"></i>
          <p>Belum ada lomba yang dibuat</p>
        </div>
      </div>

      <!-- Chart Pengeluaran -->
      <div class="section-wrapper">
        <div class="section-header">
          <h2>Ringkasan Pengeluaran</h2>
          <div v-if="hasExpenseData" class="expense-total">
            Total: {{ formatCurrency(financeStore.totalExpense) }}
          </div>
        </div>
        <div v-if="hasExpenseData" class="chart-wrapper">
          <Chart
            type="doughnut"
            :data="expenseChartData"
            :options="expenseChartOptions"
            class="expense-chart"
          />
        </div>
        <div v-else class="no-data">
          <i class="pi pi-chart-pie"></i>
          <p>Belum ada data pengeluaran</p>
        </div>
      </div>
    </div>
  </div>
  <div class="section-wrapper">
    <div class="section-header">
      <h2>Aktivitas Terbaru</h2>
    </div>
    <ActivityLogView />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTeamStore } from "../stores/teamStore";
import { useTasksStore } from "../stores/tasksStore";
import { useFinanceStore } from "../stores/financeStore";
import { useCompetitionStore } from "../stores/competitionStore";
import { useParticipantStore } from "../stores/participantStore";
import ActivityLogView from "./ActivityLogView.vue";
// Impor komponen PrimeVue
import Card from "primevue/card";
import ProgressBar from "primevue/progressbar";
import Chart from "primevue/chart";

// Inisialisasi semua store yang dibutuhkan
const teamStore = useTeamStore();
const tasksStore = useTasksStore();
const financeStore = useFinanceStore();
const competitionStore = useCompetitionStore();
const participantStore = useParticipantStore();

const loading = ref(false);

// Ambil semua data saat komponen dimuat
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      teamStore.fetchAll(),
      tasksStore.fetchTasks(), // <-- DIUBAH DARI fetchAll() MENJADI fetchTasks()
      financeStore.fetchAll(),
      competitionStore.fetchAll(),
      participantStore.fetchAll(),
    ]);
  } catch (error) {
    console.error("Gagal memuat data dasbor:", error);
  } finally {
    loading.value = false;
  }
});

// --- Computed Properties & Helpers ---

const getProgressPercentage = (progress) =>
  typeof progress === "number" ? Math.round(progress * 100) : 0;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  if (typeof value !== "number") return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Tugas yang akan datang dalam 7 hari ke depan
const upcomingTasks = computed(() => {
  if (!tasksStore.tasks?.length) return []; // Diubah dari taskStore menjadi tasksStore
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return tasksStore.tasks // Diubah dari taskStore menjadi tasksStore
    .filter((task) => {
      if (!task.start_date) return false;
      const startDate = new Date(task.start_date);
      const progress = typeof task.progress === "number" ? task.progress : 0;
      return startDate >= today && startDate <= nextWeek && progress < 1;
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
});

// Data untuk timeline chart tugas
const taskTimelineData = computed(() => {
  if (!upcomingTasks.value.length) return { labels: [], datasets: [] };

  const labels = upcomingTasks.value.slice(0, 7).map((task) => {
    const date = new Date(task.start_date);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  });

  const progressData = upcomingTasks.value
    .slice(0, 7)
    .map((task) => getProgressPercentage(task.progress));

  return {
    labels,
    datasets: [
      {
        label: "Progress Tugas (%)",
        data: progressData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };
});

// Opsi untuk timeline chart
const timelineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#3b82f6",
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: function (value) {
          return value + "%";
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}));

// Data lomba dengan jumlah peserta
const competitionsWithParticipantCount = computed(() => {
  if (!competitionStore.competitions?.length) return [];
  return competitionStore.competitions.map((comp) => ({
    ...comp,
    participantCount: participantStore.participants.filter((p) =>
      (p.competitionIds || []).includes(comp.id)
    ).length,
  }));
});

// Data untuk chart lomba
const competitionChartData = computed(() => {
  if (!competitionsWithParticipantCount.value.length)
    return { labels: [], datasets: [] };

  const competitions = competitionsWithParticipantCount.value.slice(0, 6);
  const labels = competitions.map((comp) =>
    comp.name.length > 15 ? comp.name.substring(0, 15) + "..." : comp.name
  );
  const data = competitions.map((comp) => comp.participantCount);

  return {
    labels,
    datasets: [
      {
        label: "Jumlah Peserta",
        data,
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };
});

// Opsi untuk chart lomba
const competitionChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}));

// Data pengeluaran
const hasExpenseData = computed(() => financeStore.expenses?.length > 0);

const expenseChartData = computed(() => {
  if (!hasExpenseData.value) return { labels: [], datasets: [] };

  const categories = {};
  financeStore.expenses.forEach((expense) => {
    const category = expense.category || "Lainnya";
    categories[category] = (categories[category] || 0) + expense.amount;
  });

  return {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#84cc16",
          "#22c55e",
          "#14b8a6",
          "#06b6d4",
          "#6366f1",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };
});

// Opsi untuk chart pengeluaran
const expenseChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      callbacks: {
        label: function (context) {
          return context.label + ": " + formatCurrency(context.raw);
        },
      },
    },
  },
  cutout: "60%",
}));
</script>

<style scoped>
.dashboard-view {
  padding: 1.5rem 2rem;
  max-width: 1400px;
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

/* NEW: Grid Layout for Summary Cards */
.summary-grid-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-grid-bottom {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.summary-card {
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  transition: all 0.2s ease;
  background-color: var(--surface-card);
}

.summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.summary-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.summary-card :deep(.p-card-title) {
  margin-bottom: 1rem;
}

.summary-card :deep(.p-card-content) {
  padding: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-title i {
  font-size: 1.2rem;
}

.card-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.card-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

/* Specific styles for finance cards */
.finance-card.income .card-title i,
.finance-card.income .card-value {
  color: #10b981;
}

.finance-card.balance .card-title i,
.finance-card.balance .card-value {
  color: #3b82f6;
}

.finance-card.balance .card-value.deficit-label,
.deficit-label {
  color: #ef4444;
}

.detail-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.section-wrapper {
  background-color: var(--surface-card);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.task-count-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.expense-total {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 600;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

.timeline-section .chart-wrapper {
  height: 250px;
}

.timeline-chart,
.competition-chart,
.expense-chart {
  width: 100% !important;
  height: 100% !important;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--surface-ground);
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  margin-bottom: 0.75rem;
}

.task-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.task-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-meta i {
  font-size: 0.75rem;
}

.task-progress {
  min-width: 120px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-progressbar {
  height: 8px;
  flex: 1;
  width: 100%;
  min-width: 150px;
  border-radius: 8px;
  background-color: var(--surface-100);
}

.custom-progressbar :deep(.p-progressbar-value) {
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-color);
  font-weight: 600;
  min-width: 35px;
  text-align: right;
}

.no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 250px;
  color: var(--text-color-secondary);
  text-align: center;
}

.no-data.small {
  min-height: 150px;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-data p {
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 1200px) {
  .summary-grid-bottom {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 1rem;
  }

  .summary-grid-top,
  .summary-grid-bottom {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .detail-sections {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-wrapper {
    padding: 1rem;
  }

  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .task-progress {
    width: 100%;
    min-width: auto;
  }

  .chart-wrapper {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .card-value {
    font-size: 1.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
