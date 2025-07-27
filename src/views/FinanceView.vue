<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <header class="page-header">
      <div class="header-content">
        <h1>Manajemen Keuangan</h1>
        <p>Kelola pemasukan dan pengeluaran acara Anda secara terperinci.</p>
      </div>
      <div
        v-if="financeStore.error"
        class="error-banner"
        @click="financeStore.clearError()"
      >
        <span class="error-icon">⚠️</span>
        {{ financeStore.error }}
        <button class="close-error">×</button>
      </div>
    </header>

    <!-- Kartu Ringkasan Keuangan -->
    <div class="summary-grid">
      <div class="summary-card income-card">
        <div class="card-icon"><i class="pi pi-arrow-down-right"></i></div>
        <div class="card-content">
          <h3>Total Pemasukan</h3>
          <p class="income-text">
            {{ formatCurrency(financeStore.totalIncome) }}
          </p>
          <span class="card-count"
            >{{ financeStore.incomes.length }} transaksi</span
          >
        </div>
      </div>
      <div class="summary-card expense-card">
        <div class="card-icon"><i class="pi pi-arrow-up-right"></i></div>
        <div class="card-content">
          <h3>Total Pengeluaran</h3>
          <p class="expense-text">
            {{ formatCurrency(financeStore.totalExpense) }}
          </p>
          <span class="card-count"
            >{{ financeStore.expenses.length }} transaksi</span
          >
        </div>
      </div>
      <div class="summary-card balance-card">
        <div class="card-icon"><i class="pi pi-wallet"></i></div>
        <div class="card-content">
          <h3>Saldo Akhir</h3>
          <p
            class="balance-text"
            :class="{ negative: financeStore.balance < 0 }"
          >
            {{ formatCurrency(financeStore.balance) }}
          </p>
          <span
            class="card-status"
            :class="{ deficit: financeStore.balance < 0 }"
            >{{ financeStore.balance >= 0 ? "Surplus" : "Defisit" }}</span
          >
        </div>
      </div>
    </div>

    <!-- [BARU] Visualisasi & Laporan Keuangan -->
    <div class="finance-details-grid">
      <!-- [BARU] Grafik Pengeluaran -->
      <div class="chart-wrapper">
        <div class="chart-header">
          <h2><i class="pi pi-chart-pie"></i> Komposisi Pengeluaran</h2>
          <p>Berdasarkan Kategori</p>
        </div>
        <div class="chart-content">
          <canvas ref="expenseChartCanvas"></canvas>
          <div v-if="!financeStore.expenses.length" class="chart-empty-state">
            <i class="pi pi-chart-pie"></i>
            <p>Grafik akan muncul setelah ada data pengeluaran.</p>
          </div>
        </div>
      </div>

      <!-- [BARU] Tabel Laporan Keuangan (Buku Besar) -->
      <div class="ledger-wrapper">
        <div class="ledger-header">
          <div class="ledger-title">
            <h2><i class="pi pi-book"></i> Laporan Keuangan</h2>
            <p>Semua transaksi terurut berdasarkan tanggal.</p>
          </div>
          <div class="ledger-filter">
            <select
              v-model="selectedCategoryFilter"
              class="category-filter-dropdown"
            >
              <option value="">Semua Kategori</option>
              <optgroup label="Pemasukan">
                <option
                  v-for="cat in incomeCategories"
                  :key="`filter-in-${cat}`"
                  :value="cat"
                >
                  {{ cat }}
                </option>
              </optgroup>
              <optgroup label="Pengeluaran">
                <option
                  v-for="cat in expenseCategories"
                  :key="`filter-out-${cat}`"
                  :value="cat"
                >
                  {{ cat }}
                </option>
              </optgroup>
            </select>
          </div>
        </div>
        <div class="ledger-table-container">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
                <th class="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredLedger.length">
                <td colspan="5" class="empty-state">
                  <div class="empty-content">
                    <div class="empty-icon"><i class="pi pi-file"></i></div>
                    <p>Tidak ada transaksi yang cocok dengan filter.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="entry in filteredLedger"
                :key="entry.id"
                class="ledger-row"
              >
                <td>{{ formatDate(entry.date) }}</td>
                <td>
                  <div class="ledger-description">
                    {{ entry.description }}
                    <span
                      class="ledger-category-tag"
                      :class="
                        entry.type === 'income' ? 'income-tag' : 'expense-tag'
                      "
                    >
                      {{ entry.category }}
                    </span>
                  </div>
                </td>
                <td class="text-right amount-cell debit-amount">
                  {{
                    entry.type === "expense"
                      ? formatCurrency(entry.amount)
                      : "-"
                  }}
                </td>
                <td class="text-right amount-cell credit-amount">
                  {{
                    entry.type === "income" ? formatCurrency(entry.amount) : "-"
                  }}
                </td>
                <td class="text-right amount-cell balance-amount">
                  {{ formatCurrency(entry.runningBalance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Kontainer untuk Tabel Pemasukan dan Pengeluaran (Tetap Ada) -->
    <div class="tables-container">
      <!-- Tabel Pemasukan -->
      <div class="table-wrapper">
        <div class="table-header">
          <div class="header-content-table">
            <h2><i class="pi pi-chart-line"></i> Pemasukan</h2>
            <span class="table-summary income-summary"
              >Total: {{ formatCurrency(financeStore.totalIncome) }}</span
            >
          </div>
          <button
            v-if="authStore.isAdmin"
            @click="openModal('income')"
            class="btn btn-income"
          >
            <i class="pi pi-plus"></i>
            Tambah
          </button>
        </div>
        <div class="table-content">
          <div v-if="financeStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data...</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th class="text-right">Jumlah</th>
                <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!financeStore.incomes.length">
                <td :colspan="authStore.isAdmin ? 5 : 4" class="empty-state">
                  <div class="empty-content">
                    <div class="empty-icon"><i class="pi pi-inbox"></i></div>
                    <p>Belum ada data pemasukan.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="item in financeStore.incomes"
                :key="item.id"
                class="data-row"
              >
                <td>{{ formatDate(item.date) }}</td>
                <td>
                  <div class="cell-content">
                    <span class="description">{{ item.description }}</span>
                  </div>
                </td>
                <td>
                  <span class="tag income-tag">{{ item.category }}</span>
                </td>
                <td class="text-right amount-cell">
                  {{ formatCurrency(item.amount) }}
                </td>
                <td v-if="authStore.isAdmin" class="actions">
                  <button
                    @click="openModal('income', item)"
                    class="btn btn-icon-only btn-secondary"
                    title="Edit"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    @click="confirmDelete('income', item)"
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

      <!-- Tabel Pengeluaran -->
      <div class="table-wrapper">
        <div class="table-header">
          <div class="header-content-table">
            <h2><i class="pi pi-chart-bar"></i> Pengeluaran</h2>
            <span class="table-summary expense-summary"
              >Total: {{ formatCurrency(financeStore.totalExpense) }}</span
            >
          </div>
          <button
            v-if="authStore.isAdmin"
            @click="openModal('expense')"
            class="btn btn-expense"
          >
            <i class="pi pi-plus"></i>
            Tambah
          </button>
        </div>
        <div class="table-content">
          <div v-if="financeStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data...</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th class="text-right">Jumlah</th>
                <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!financeStore.expenses.length">
                <td :colspan="authStore.isAdmin ? 5 : 4" class="empty-state">
                  <div class="empty-content">
                    <div class="empty-icon">
                      <i class="pi pi-shopping-cart"></i>
                    </div>
                    <p>Belum ada data pengeluaran.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="item in financeStore.expenses"
                :key="item.id"
                class="data-row"
              >
                <td>{{ formatDate(item.date) }}</td>
                <td>
                  <div class="cell-content">
                    <span class="description">{{ item.description }}</span>
                  </div>
                </td>
                <td>
                  <span class="tag expense-tag">{{ item.category }}</span>
                </td>
                <td class="text-right amount-cell">
                  {{ formatCurrency(item.amount) }}
                </td>
                <td v-if="authStore.isAdmin" class="actions">
                  <button
                    @click="openModal('expense', item)"
                    class="btn btn-icon-only btn-secondary"
                    title="Edit"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    @click="confirmDelete('expense', item)"
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

    <!-- Modal untuk Tambah/Edit Transaksi -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ formTitle }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <form @submit.prevent="saveTransaction" class="transaction-form">
          <div class="form-group">
            <label for="date"
              ><i class="pi pi-calendar"></i> Tanggal Transaksi</label
            >
            <input
              id="date"
              type="date"
              v-model="editableTransaction.date"
              required
            />
          </div>
          <div class="form-group">
            <label for="description"
              ><i class="pi pi-file-edit"></i> Deskripsi Transaksi</label
            >
            <input
              id="description"
              type="text"
              v-model="editableTransaction.description"
              placeholder="Contoh: Sponsor dari Toko Jaya Abadi"
              required
              maxlength="100"
            />
            <small class="form-help">Maksimal 100 karakter</small>
          </div>
          <div class="form-group">
            <label for="amount"
              ><i class="pi pi-wallet"></i> Jumlah (Rupiah)</label
            >
            <div class="amount-input-wrapper">
              <span class="currency-prefix">Rp</span>
              <input
                id="amount"
                type="number"
                v-model.number="editableTransaction.amount"
                placeholder="0"
                required
              />
            </div>
            <small class="form-help"
              >Masukkan jumlah tanpa titik atau koma</small
            >
          </div>
          <div class="form-group">
            <label for="category"><i class="pi pi-tag"></i> Kategori</label>
            <select
              id="category"
              v-model="editableTransaction.category"
              required
            >
              <option disabled value="">Pilih kategori transaksi...</option>
              <option v-for="cat in currentCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              class="btn"
              :class="
                transactionType === 'income' ? 'btn-income' : 'btn-expense'
              "
              :disabled="!isFormValid || isSubmitting"
            >
              <span v-if="isSubmitting" class="btn-spinner"></span>
              {{ isSubmitting ? "Menyimpan..." : "Simpan Transaksi" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dialog Konfirmasi Hapus -->
    <div
      v-if="isDeleteDialogVisible"
      class="dialog-overlay-new"
      @click.self="closeConfirmDialog"
    >
      <div class="dialog-content-new">
        <div class="dialog-header-new">
          <div class="dialog-icon-wrapper">
            <svg
              class="dialog-icon-new"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div class="dialog-title-group">
            <h3>Konfirmasi Hapus Transaksi</h3>
            <p>Apakah Anda yakin ingin menghapus data ini secara permanen?</p>
          </div>
        </div>
        <div class="dialog-body-new">
          <div class="dialog-transaction-details">
            <div class="dialog-detail-item">
              <strong>Tanggal:</strong>
              <span>{{ formatDate(editableTransaction.date) }}</span>
            </div>
            <div class="dialog-detail-item">
              <strong>Deskripsi:</strong>
              <span>{{ editableTransaction.description }}</span>
            </div>
            <div class="dialog-detail-item">
              <strong>Kategori:</strong>
              <span>{{ editableTransaction.category }}</span>
            </div>
            <div class="dialog-detail-item">
              <strong>Jumlah:</strong>
              <span class="amount">{{
                formatCurrency(editableTransaction.amount)
              }}</span>
            </div>
          </div>
          <div class="dialog-warning">
            <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
          </div>
        </div>
        <div class="dialog-actions-new">
          <button @click="closeConfirmDialog" class="btn btn-secondary">
            Batal
          </button>
          <button
            @click="deleteConfirmed"
            class="btn btn-danger"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="btn-spinner"></span>
            {{ isDeleting ? "Menghapus..." : "Ya, Hapus" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, nextTick } from "vue";
import { useFinanceStore } from "../stores/financeStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import Chart from "chart.js/auto";

const financeStore = useFinanceStore();
const authStore = useAuthStore();
const toast = useToast();

const isModalVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const transactionType = ref("income");

// [BARU] Ref untuk canvas chart dan instance chart
const expenseChartCanvas = ref(null);
let expenseChart = null;

// [BARU] Ref untuk filter kategori di laporan
const selectedCategoryFilter = ref("");

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialFormState = () => ({
  id: null,
  description: "",
  amount: 0,
  category: "",
  date: getTodayDate(), // [DIUBAH] Menambahkan tanggal
});

let editableTransaction = reactive(getInitialFormState());

const incomeCategories = ref([
  "Dana Sponsor",
  "Iuran Warga",
  "Pendaftaran Lomba",
  "Donasi",
  "Hibah",
  "Lainnya",
]);
const expenseCategories = ref([
  "Akomodasi",
  "Hadiah",
  "Konsumsi",
  "Perlengkapan",
  "Operasional",
  "Transport",
  "Dekorasi",
  "Lainnya",
]);

const formTitle = computed(() => {
  const action = isEditing.value ? "Edit" : "Tambah";
  const type = transactionType.value === "income" ? "Pemasukan" : "Pengeluaran";
  return `${action} ${type}`;
});

const currentCategories = computed(() => {
  return transactionType.value === "income"
    ? incomeCategories.value
    : expenseCategories.value;
});

const isFormValid = computed(() => {
  return (
    editableTransaction.description.trim() &&
    editableTransaction.amount > 0 &&
    editableTransaction.category &&
    editableTransaction.date && // [DIUBAH] Validasi tanggal
    !isSubmitting.value
  );
});

onMounted(async () => {
  await financeStore.fetchAll();
  // [BARU] Render chart setelah data dimuat
  await nextTick();
  renderExpenseChart();
});

// [BARU] Computed property untuk data chart
const expenseChartData = computed(() => {
  const dataByCategory = financeStore.expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  const labels = Object.keys(dataByCategory);
  const data = Object.values(dataByCategory);

  // Warna yang lebih menarik untuk chart
  const backgroundColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#E7E9ED",
    "#8A2BE2",
    "#7FFF00",
    "#D2691E",
  ];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        hoverOffset: 4,
      },
    ],
  };
});

// [BARU] Fungsi untuk merender atau update chart
const renderExpenseChart = () => {
  if (expenseChartCanvas.value) {
    if (expenseChart) {
      expenseChart.destroy();
    }
    if (financeStore.expenses.length > 0) {
      const ctx = expenseChartCanvas.value.getContext("2d");
      expenseChart = new Chart(ctx, {
        type: "pie",
        data: expenseChartData.value,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
          },
        },
      });
    }
  }
};

// [BARU] Watcher untuk memperbarui chart saat data berubah
watch(
  () => financeStore.expenses,
  () => {
    renderExpenseChart();
  },
  { deep: true }
);

// [BARU] Computed property untuk Laporan Keuangan (Buku Besar)
const financialLedger = computed(() => {
  const combined = [
    ...financeStore.incomes.map((item) => ({ ...item, type: "income" })),
    ...financeStore.expenses.map((item) => ({ ...item, type: "expense" })),
  ];

  combined.sort(
    (a, b) =>
      new Date(a.date) - new Date(b.date) ||
      (a.createdAt > b.createdAt ? 1 : -1)
  );

  let runningBalance = 0;
  return combined.map((item) => {
    if (item.type === "income") {
      runningBalance += item.amount;
    } else {
      runningBalance -= item.amount;
    }
    return { ...item, runningBalance };
  });
});

// [BARU] Computed property untuk memfilter laporan
const filteredLedger = computed(() => {
  if (!selectedCategoryFilter.value) {
    return financialLedger.value;
  }
  return financialLedger.value.filter(
    (entry) => entry.category === selectedCategoryFilter.value
  );
});

const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// [BARU] Fungsi untuk format tanggal
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

const resetForm = () => {
  Object.assign(editableTransaction, getInitialFormState());
  isEditing.value = false;
  isSubmitting.value = false;
};

const openModal = (type, data = null) => {
  transactionType.value = type;
  financeStore.clearError();
  if (data && data.id) {
    isEditing.value = true;
    Object.assign(editableTransaction, data);
  } else {
    resetForm();
    isEditing.value = false;
  }
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  resetForm();
};

const saveTransaction = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;
  try {
    const payload = {
      description: editableTransaction.description.trim(),
      category: editableTransaction.category.trim(),
      amount: Number(editableTransaction.amount),
      date: editableTransaction.date, // [DIUBAH] Menyimpan tanggal
    };
    let success = false;
    if (isEditing.value) {
      payload.id = editableTransaction.id;
      success = await financeStore.updateTransaction(
        payload,
        transactionType.value
      );
    } else {
      success = await financeStore.addTransaction(
        payload,
        transactionType.value
      );
    }
    if (success) {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: `Transaksi berhasil ${
          isEditing.value ? "diperbarui" : "ditambahkan"
        }.`,
        life: 3000,
      });
      closeModal();
    } else {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: financeStore.error || "Gagal menyimpan transaksi.",
        life: 4000,
      });
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: `Terjadi kesalahan: ${error.message}`,
      life: 4000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (type, data) => {
  if (!data || !data.id) return;
  transactionType.value = type;
  Object.assign(editableTransaction, data);
  financeStore.clearError();
  isDeleteDialogVisible.value = true;
};

const closeConfirmDialog = () => {
  isDeleteDialogVisible.value = false;
  isDeleting.value = false;
};

const deleteConfirmed = async () => {
  if (!editableTransaction.id) return;
  isDeleting.value = true;
  try {
    const success = await financeStore.deleteTransaction(
      editableTransaction.id,
      transactionType.value
    );
    if (success) {
      toast.add({
        severity: "success",
        summary: "Berhasil Dihapus",
        detail: `Transaksi "${editableTransaction.description}" telah dihapus.`,
        life: 3000,
      });
      closeConfirmDialog();
    } else {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: financeStore.error || "Gagal menghapus transaksi.",
        life: 4000,
      });
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: `Terjadi kesalahan: ${error.message}`,
      life: 4000,
    });
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
/* [PERBAIKAN UTAMA] Menggunakan variabel tema Aura dari PrimeVue */
.page-container {
  max-width: 1400px;
  margin: 1.5rem auto;
  padding: 0 1.5rem;
  font-family: var(--p-font-family);
}
.page-header {
  margin-bottom: 2rem;
}
.header-content h1 {
  color: var(--p-text-color);
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0;
}
.header-content p {
  color: var(--p-text-muted-color);
  font-size: 1.125rem;
  margin-top: 0.5rem;
}
.error-banner {
  background-color: var(--p-red-100);
  color: var(--p-red-700);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 1px solid var(--p-red-200);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);
}
.error-banner:hover {
  background-color: var(--p-red-200);
}
.error-icon {
  font-size: 1.25rem;
}
.close-error {
  background: none;
  border: none;
  color: var(--p-red-700);
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}
.close-error:hover {
  background-color: var(--p-red-50);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.summary-card {
  background: var(--p-surface-card); /* DINAMIS */
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--p-surface-border); /* DINAMIS */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}
.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.75rem;
}
.card-icon i {
  font-size: inherit;
  line-height: 1;
  display: block;
}
.income-card .card-icon {
  background: var(--p-green-400);
}
.expense-card .card-icon {
  background: var(--p-red-400);
}
.balance-card .card-icon {
  background: var(--p-blue-400);
}
.card-content {
  flex: 1;
}
.card-content h3 {
  color: var(--p-text-muted-color); /* DINAMIS */
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}
.card-content p {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}
.income-text {
  color: var(--p-green-500);
}
.expense-text {
  color: var(--p-red-500);
}
.balance-text {
  color: var(--p-text-color); /* DINAMIS */
}
.balance-text.negative {
  color: var(--p-red-500);
}
.card-count,
.card-status {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
}
.card-status.deficit {
  color: var(--p-red-500);
  font-weight: 600;
}

/* [BARU] Grid untuk Chart dan Laporan */
.finance-details-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

/* [BARU] Styling untuk Chart Wrapper */
.chart-wrapper,
.ledger-wrapper {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.chart-header,
.ledger-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--p-surface-border);
}
.chart-header h2,
.ledger-title h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.chart-header p,
.ledger-title p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}
.chart-content {
  position: relative;
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.chart-empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--p-text-muted-color);
  text-align: center;
}
.chart-empty-state i {
  font-size: 3rem;
  opacity: 0.5;
}
.chart-empty-state p {
  margin-top: 1rem;
  font-size: 0.9rem;
}

/* [BARU] Styling untuk Laporan Keuangan (Ledger) */
.ledger-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.category-filter-dropdown {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--p-surface-border);
  background-color: var(--p-surface-ground);
  color: var(--p-text-color);
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}
.ledger-table-container {
  overflow-y: auto;
  flex-grow: 1;
  max-height: 400px; /* Atur tinggi maksimal */
}
.ledger-table-container table {
  width: 100%;
  border-collapse: collapse;
}
.ledger-row:hover {
  background-color: var(--p-surface-ground);
}
.ledger-description {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.ledger-category-tag {
  font-size: 0.7rem;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
}
.debit-amount {
  color: var(--p-red-500);
}
.credit-amount {
  color: var(--p-green-500);
}
.balance-amount {
  font-weight: 600;
}

.tables-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2.5rem;
}
.table-wrapper {
  background: var(--p-surface-card); /* DINAMIS */
  border: 1px solid var(--p-surface-border); /* DINAMIS */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.table-header {
  background: var(--p-surface-ground); /* DINAMIS */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--p-surface-border); /* DINAMIS */
}
.header-content-table h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color); /* DINAMIS */
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-summary {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
  transition: all 0.3s ease;
}

.income-summary {
  color: var(--p-primary-700);
  background-color: var(--p-primary-100);
  border: 1px solid var(--p-primary-200);
}

.expense-summary {
  color: var(--p-red-700);
  background-color: var(--p-red-100);
  border: 1px solid var(--p-red-200);
}

.dark .income-summary {
  color: var(--p-primary-200);
  background-color: color-mix(in srgb, var(--p-primary-700) 25%, transparent);
  border: 1px solid var(--p-primary-700);
  box-shadow: 0 0 8px color-mix(in srgb, var(--p-primary-500) 50%, transparent);
}

.dark .expense-summary {
  color: var(--p-red-200);
  background-color: color-mix(in srgb, var(--p-red-700) 25%, transparent);
  border: 1px solid var(--p-red-700);
  box-shadow: 0 0 8px color-mix(in srgb, var(--p-red-500) 50%, transparent);
}

.table-content {
  min-height: 250px;
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
  color: var(--p-text-muted-color); /* DINAMIS */
  height: 100%;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid var(--p-surface-100); /* DINAMIS */
  border-top: 4px solid var(--p-primary-color); /* DINAMIS */
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
}
th,
td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--p-surface-border); /* DINAMIS */
  vertical-align: middle;
}
th {
  background: var(--p-surface-ground); /* DINAMIS */
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-text-muted-color); /* DINAMIS */
  letter-spacing: 0.05em;
}
td {
  font-size: 0.9rem;
}
.data-row {
  transition: background-color 0.2s ease;
}
.data-row:hover {
  background-color: var(--p-surface-ground); /* DINAMIS */
}
.description {
  font-weight: 500;
  color: var(--p-text-color); /* DINAMIS */
}
.amount-cell {
  font-weight: 600;
}
.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  color: var(--p-text-muted-color); /* DINAMIS */
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
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}
.btn-icon-only {
  padding: 0.5rem;
  min-width: 36px;
  justify-content: center;
}
.btn-income {
  background: var(--p-green-500);
}
.btn-income:hover:not(:disabled) {
  background: var(--p-green-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
.btn-expense {
  background: var(--p-red-500);
}
.btn-expense:hover:not(:disabled) {
  background: var(--p-red-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
.btn-secondary {
  background-color: var(--p-surface-100); /* DINAMIS */
  color: var(--p-text-color); /* DINAMIS */
  border: 1px solid var(--p-surface-border); /* DINAMIS */
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--p-surface-200); /* DINAMIS */
}
.btn-danger {
  background-color: var(--p-red-500);
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: var(--p-red-600);
}
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
.income-tag {
  background-color: var(--p-green-100); /* DINAMIS */
  color: var(--p-green-700); /* DINAMIS */
}
.expense-tag {
  background-color: var(--p-red-100); /* DINAMIS */
  color: var(--p-red-700); /* DINAMIS */
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
/* MODAL STYLES - AGGRESSIVE DARK MODE FIX */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* MODAL CONTENT - SUPER HIGH SPECIFICITY */
.page-container .modal-overlay .modal-content {
  background: #ffffff !important;
  background-color: #ffffff !important;
  padding: 0;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0 !important;
  animation: modalAppear 0.3s ease-out;
  position: relative;
  z-index: 1001;
  color: #1a202c !important;
}

/* DARK MODE - MAXIMUM SPECIFICITY WITH !important */
html.dark .page-container .modal-overlay .modal-content,
html[data-theme="dark"] .page-container .modal-overlay .modal-content,
body.dark .page-container .modal-overlay .modal-content,
body[data-theme="dark"] .page-container .modal-overlay .modal-content,
[data-theme="dark"] .page-container .modal-overlay .modal-content,
.dark .page-container .modal-overlay .modal-content,
[data-bs-theme="dark"] .page-container .modal-overlay .modal-content {
  background: #2d3748 !important;
  background-color: #2d3748 !important;
  color: #f7fafc !important;
  border: 1px solid #4a5568 !important;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.6),
    0 10px 25px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) !important;
}
@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--p-surface-border); /* DINAMIS */
}
.modal-header h2 {
  margin: 0;
  color: var(--p-text-color); /* DINAMIS */
  font-size: 1.25rem;
  font-weight: 600;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--p-text-muted-color); /* DINAMIS */
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-close:hover {
  background-color: var(--p-surface-100); /* DINAMIS */
  color: var(--p-text-color); /* DINAMIS */
}
.transaction-form {
  padding: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--p-text-color); /* DINAMIS */
  font-size: 0.875rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #f1f5f9; /* DINAMIS */
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: var(--p-surface-ground); /* DINAMIS */
  color: var(--p-text-color); /* DINAMIS */
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--p-primary-color); /* DINAMIS */
  box-shadow: 0 0 0 3px var(--p-primary-200); /* DINAMIS */
}
.amount-input-wrapper {
  display: flex;
  align-items: center;
}
.currency-prefix {
  padding: 0.75rem 1rem;
  background: var(--p-surface-100); /* DINAMIS */
  border: 1px solid var(--p-surface-border); /* DINAMIS */
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: var(--p-text-muted-color); /* DINAMIS */
  font-weight: 500;
}
#amount {
  border-radius: 0 8px 8px 0;
}
#amount::-webkit-outer-spin-button,
#amount::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.form-help {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color); /* DINAMIS */
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem 2rem 1.5rem 2rem;
  border-top: 1px solid var(--p-surface-border); /* DINAMIS */
  background-color: var(--p-surface-ground); /* DINAMIS */
  margin: 2rem -2rem -2rem -2rem;
}

/* Styling untuk Dialog Konfirmasi Hapus Baru */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.dialog-overlay-new {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.dialog-content-new {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: var(--p-surface-card);
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.3s ease;
  color: var(--p-text-color);
  border: 1px solid var(--p-surface-border);
}

.dialog-header-new {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.dialog-icon-wrapper {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--p-red-100);
  border-radius: 50%;
}

.dialog-icon-new {
  width: 24px;
  height: 24px;
  color: var(--p-red-600);
}

.dialog-title-group h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.dialog-title-group p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.dialog-body-new {
  margin-top: 1.5rem;
}

.dialog-transaction-details {
  padding: 1rem;
  background-color: var(--p-surface-ground);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
}

.dialog-detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}
.dialog-detail-item:not(:last-child) {
  border-bottom: 1px solid var(--p-surface-border);
}

.dialog-detail-item strong {
  color: var(--p-text-muted-color);
  font-weight: 500;
}

.dialog-detail-item span {
  font-weight: 500;
  text-align: right;
}

.dialog-detail-item .amount {
  color: var(--p-red-500);
  font-weight: 600;
}

.dialog-warning {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--p-yellow-800);
  background-color: var(--p-yellow-100);
  border-left: 4px solid var(--p-yellow-400);
  border-radius: 0 6px 6px 0;
}

.dialog-actions-new {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 1200px) {
  .finance-details-grid {
    grid-template-columns: 1fr;
  }
  .ledger-table-container {
    max-height: 350px;
  }
}

@media (max-width: 1024px) {
  .tables-container {
    grid-template-columns: 1fr;
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
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .ledger-header {
    flex-direction: column;
    gap: 1rem;
  }
  .table-content {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  table {
    min-width: 600px;
  }
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
@media (max-width: 480px) {
  .summary-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
