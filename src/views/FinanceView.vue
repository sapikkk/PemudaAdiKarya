<template>
  <div class="page-container">
    <!-- Header Halaman -->
    <header class="page-header">
      <div class="header-content">
        <h1>Manajemen Keuangan</h1>
        <p>Kelola pemasukan dan pengeluaran acara Anda secara terperinci.</p>
      </div>
      <!-- Error banner akan tetap ada jika store mengembalikan error -->
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
      <!-- Kartu ringkasan tetap sama -->
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

    <!-- Kontainer untuk Tabel Pemasukan dan Pengeluaran -->
    <div class="tables-container">
      <!-- Tabel Pemasukan -->
      <div class="table-wrapper">
        <div class="table-header">
          <div class="header-content-table">
            <h2><i class="pi pi-chart-line"></i> Pemasukan</h2>
            <span class="table-summary"
              >Total: {{ formatCurrency(financeStore.totalIncome) }}</span
            >
          </div>
          <!-- Tombol Tambah hanya untuk Admin -->
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
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th class="text-right">Jumlah</th>
                <!-- Kolom Aksi hanya untuk Admin -->
                <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!financeStore.incomes.length">
                <td :colspan="authStore.isAdmin ? 4 : 3" class="empty-state">
                  <div class="empty-content">
                    <div class="empty-icon"><i class="pi pi-inbox"></i></div>
                    <p>Belum ada data pemasukan.</p>
                    <button
                      v-if="authStore.isAdmin"
                      @click="openModal('income')"
                      class="btn btn-income btn-sm"
                    >
                      Tambah Pemasukan Pertama
                    </button>
                  </div>
                </td>
              </tr>
              <tr
                v-for="item in financeStore.incomes"
                :key="item.id"
                class="data-row"
              >
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
                <!-- Tombol Aksi hanya untuk Admin -->
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
            <span class="table-summary"
              >Total: {{ formatCurrency(financeStore.totalExpense) }}</span
            >
          </div>
          <!-- Tombol Tambah hanya untuk Admin -->
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
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th class="text-right">Jumlah</th>
                <!-- Kolom Aksi hanya untuk Admin -->
                <th v-if="authStore.isAdmin" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!financeStore.expenses.length">
                <td :colspan="authStore.isAdmin ? 4 : 3" class="empty-state">
                  <div class="empty-content">
                    <div class="empty-icon">
                      <i class="pi pi-shopping-cart"></i>
                    </div>
                    <p>Belum ada data pengeluaran.</p>
                    <button
                      v-if="authStore.isAdmin"
                      @click="openModal('expense')"
                      class="btn btn-expense btn-sm"
                    >
                      Tambah Pengeluaran Pertama
                    </button>
                  </div>
                </td>
              </tr>
              <tr
                v-for="item in financeStore.expenses"
                :key="item.id"
                class="data-row"
              >
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
                <!-- Tombol Aksi hanya untuk Admin -->
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
      <!-- Konten modal tidak berubah -->
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ formTitle }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <form @submit.prevent="saveTransaction" class="transaction-form">
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
              <!-- [DIPERBAIKI] Atribut 'step' dihapus untuk memungkinkan input angka bebas -->
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
import { ref, onMounted, computed, reactive } from "vue";
import { useFinanceStore } from "../stores/financeStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";

const financeStore = useFinanceStore();
const authStore = useAuthStore();
const toast = useToast();

const isModalVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const transactionType = ref("income");

const getInitialFormState = () => ({
  id: null,
  description: "",
  amount: 0,
  category: "",
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
    !isSubmitting.value
  );
});

onMounted(async () => {
  await financeStore.fetchAll();
});

const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
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
/* [DIPERBAIKI] Menggunakan variabel tema Aura dari PrimeVue */
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
  background: var(--p-surface-card);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--p-surface-border);
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
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
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
  color: var(--p-text-color);
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
.tables-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.table-wrapper {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--p-surface-border);
}
.header-content-table h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.table-summary {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
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
  color: var(--p-text-muted-color);
  height: 100%;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid var(--p-surface-100);
  border-top: 4px solid var(--p-primary-color);
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
  border-bottom: 1px solid var(--p-surface-border);
  vertical-align: middle;
}
th {
  background: var(--p-surface-ground);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  letter-spacing: 0.05em;
}
td {
  font-size: 0.9rem;
}
.data-row {
  transition: background-color 0.2s ease;
}
.data-row:hover {
  background-color: var(--p-surface-ground);
}
.description {
  font-weight: 500;
  color: var(--p-text-color);
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
  color: #9ca3af;
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
.btn-income:hover:not {
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
  background-color: var(--p-surface-100);
  color: var(--p-text-color);
  border: 1px solid var(--p-surface-border);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--p-surface-200);
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
  background-color: var(--p-green-100);
  color: var(--p-green-700);
}
.expense-tag {
  background-color: var(--p-red-100);
  color: var(--p-red-700);
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 16px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease;
  overflow: hidden;
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
  border-bottom: 1px solid var(--p-surface-border);
}
.modal-header h2 {
  margin: 0;
  color: var(--p-text-color);
  font-size: 1.25rem;
  font-weight: 600;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--p-text-muted-color);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-close:hover {
  background-color: var(--p-surface-100);
  color: var(--p-text-color);
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
  color: var(--p-text-color);
  font-size: 0.875rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: var(--p-surface-ground);
  color: var(--p-text-color);
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 3px var(--p-primary-200);
}
.amount-input-wrapper {
  display: flex;
  align-items: center;
}
.currency-prefix {
  padding: 0.75rem 1rem;
  background: var(--p-surface-100);
  border: 1px solid var(--p-surface-border);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: var(--p-text-muted-color);
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
  color: var(--p-text-muted-color);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem 2rem 1.5rem 2rem;
  border-top: 1px solid var(--p-surface-border);
  background-color: var(--p-surface-ground);
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
  background-color: white;
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
  color: rgb(255, 0, 0);
}

.dialog-title-group p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.dialog-body-new {
  margin-top: 1.5rem;
  background-color: #ffffff;
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
