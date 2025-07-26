import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useFinanceStore = defineStore('finance', {
    state: () => ({
        incomes: [],
        expenses: [],
        loading: false,
        error: null
    }),
    getters: {
        totalIncome: (state) => {
            return state.incomes.reduce((total, item) => total + (item.amount || 0), 0);
        },
        totalExpense: (state) => {
            return state.expenses.reduce((total, item) => total + (item.amount || 0), 0);
        },
        balance() {
            return this.totalIncome - this.totalExpense;
        },
    },
    actions: {
        // Reset error state
        clearError() {
            this.error = null;
        },

        // Set loading state
        setLoading(loading) {
            this.loading = loading;
        },

        // Set error state
        setError(error) {
            this.error = error;
            console.error('Finance Store Error:', error);
        },

        // Mengambil semua data dari server
        async fetchAll() {
            this.setLoading(true);
            this.clearError();
            
            try {
                const [incomesRes, expensesRes] = await Promise.all([
                    axios.get(`${API_URL}/incomes`),
                    axios.get(`${API_URL}/expenses`)
                ]);
                
                this.incomes = Array.isArray(incomesRes.data) ? incomesRes.data : [];
                this.expenses = Array.isArray(expensesRes.data) ? expensesRes.data : [];
            } catch (error) {
                this.setError(`Gagal mengambil data keuangan: ${error.message}`);
                // Set default empty arrays if fetch fails
                this.incomes = [];
                this.expenses = [];
            } finally {
                this.setLoading(false);
            }
        },

        // Menambah transaksi baru (pemasukan atau pengeluaran)
        async addTransaction(transactionData, type) {
            this.clearError();
            
            // Validate input data
            if (!transactionData || !transactionData.description || !transactionData.amount || !transactionData.category) {
                this.setError('Data transaksi tidak lengkap');
                return false;
            }

            // Ensure amount is a number
            const cleanData = {
                ...transactionData,
                amount: Number(transactionData.amount),
                description: transactionData.description.trim(),
                category: transactionData.category.trim()
            };

            try {
                const endpoint = type === 'income' ? 'incomes' : 'expenses';
                const response = await axios.post(`${API_URL}/${endpoint}`, cleanData);
                
                if (response.data) {
                    if (type === 'income') {
                        this.incomes.push(response.data);
                    } else {
                        this.expenses.push(response.data);
                    }
                    return true;
                }
            } catch (error) {
                this.setError(`Gagal menambah ${type === 'income' ? 'pemasukan' : 'pengeluaran'}: ${error.message}`);
                return false;
            }
        },

        // Memperbarui transaksi
        async updateTransaction(transactionData, type) {
            this.clearError();
            
            // Validate input data
            if (!transactionData || !transactionData.id) {
                this.setError('ID transaksi tidak valid');
                return false;
            }

            if (!transactionData.description || !transactionData.amount || !transactionData.category) {
                this.setError('Data transaksi tidak lengkap');
                return false;
            }

            // Ensure amount is a number
            const cleanData = {
                ...transactionData,
                amount: Number(transactionData.amount),
                description: transactionData.description.trim(),
                category: transactionData.category.trim()
            };

            try {
                const endpoint = type === 'income' ? 'incomes' : 'expenses';
                const response = await axios.put(`${API_URL}/${endpoint}/${cleanData.id}`, cleanData);

                if (response.data) {
                    const list = type === 'income' ? this.incomes : this.expenses;
                    const index = list.findIndex(t => t.id === cleanData.id);
                    
                    if (index !== -1) {
                        list[index] = response.data;
                        return true;
                    } else {
                        this.setError('Transaksi tidak ditemukan dalam daftar lokal');
                        return false;
                    }
                }
            } catch (error) {
                this.setError(`Gagal memperbarui ${type === 'income' ? 'pemasukan' : 'pengeluaran'}: ${error.message}`);
                return false;
            }
        },

        // Menghapus transaksi
        async deleteTransaction(transactionId, type) {
            this.clearError();
            
            // Validate input
            if (!transactionId) {
                this.setError('ID transaksi tidak valid');
                return false;
            }

            try {
                const endpoint = type === 'income' ? 'incomes' : 'expenses';
                await axios.delete(`${API_URL}/${endpoint}/${transactionId}`);
                
                if (type === 'income') {
                    this.incomes = this.incomes.filter(t => t.id !== transactionId);
                } else {
                    this.expenses = this.expenses.filter(t => t.id !== transactionId);
                }
                return true;
            } catch (error) {
                this.setError(`Gagal menghapus ${type === 'income' ? 'pemasukan' : 'pengeluaran'}: ${error.message}`);
                return false;
            }
        }
    }
})