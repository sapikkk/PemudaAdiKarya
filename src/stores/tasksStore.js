import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

// Pastikan URL ini sesuai dengan backend Anda
const API_BASE_URL = 'http://localhost:3001';

export const useTasksStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        loading: false,
        error: null,
    }),
    actions: {
        /**
         * Mengambil daftar tugas dari server.
         * Jika pengguna adalah admin, ambil semua tugas.
         * Jika pengguna biasa, hanya ambil tugas milik pengguna tersebut.
         */
        async fetchTasks() {
            this.loading = true;
            this.error = null;
            const authStore = useAuthStore();
            const user = authStore.user;

            if (!user) {
                this.loading = false;
                this.tasks = [];
                console.log('Tidak ada pengguna, pengambilan tugas dibatalkan.');
                return;
            }

            try {
                let url = `${API_BASE_URL}/tasks`;
                // Cek peran pengguna untuk menentukan URL
                if (!authStore.isAdmin) {
                    url += `?userId=${user.id}`;
                    console.log(`Mengambil tugas untuk pengguna ID: ${user.id}`);
                } else {
                    console.log('Mengambil semua tugas untuk admin.');
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Gagal mengambil data tugas (Status: ${response.status})`);
                }
                this.tasks = await response.json();
            } catch (error) {
                console.error("Error di fetchTasks:", error);
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Menambahkan tugas baru ke server dan state.
         * @param {object} taskData - Data tugas baru dari Gantt.
         */
        async addTask(taskData) {
            this.loading = true;
            try {
                const response = await fetch(`${API_BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(taskData),
                });
                if (!response.ok) {
                    throw new Error('Gagal menambahkan tugas baru.');
                }
                const createdTask = await response.json();
                // Tambahkan tugas baru ke state lokal
                this.tasks.push(createdTask);
                return createdTask; // Kembalikan tugas yang sudah dibuat ke Gantt
            } catch (error) {
                console.error("Error di addTask:", error);
                this.error = error.message;
                throw error; // Lempar error agar DataProcessor tahu ada masalah
            } finally {
                this.loading = false;
            }
        },

        /**
         * Memperbarui tugas yang ada di server dan state.
         * @param {object} taskData - Data tugas yang diperbarui dari Gantt.
         */
        async updateTask(taskData) {
            this.loading = true;
            try {
                const response = await fetch(`${API_BASE_URL}/tasks/${taskData.id}`, {
                    method: 'PUT', // atau PATCH
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(taskData),
                });
                if (!response.ok) {
                    throw new Error('Gagal memperbarui tugas.');
                }
                const updatedTask = await response.json();
                // Perbarui tugas di state lokal
                const index = this.tasks.findIndex(t => t.id === updatedTask.id);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }
                return updatedTask;
            } catch (error) {
                console.error("Error di updateTask:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Menghapus tugas berdasarkan ID-nya.
         * @param {string | number} taskId - ID dari tugas yang akan dihapus.
         */
        async deleteTask(taskId) {
            this.loading = true;
            try {
                const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Gagal menghapus tugas.');
                }
                // Hapus tugas dari state lokal
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    this.tasks.splice(index, 1);
                }
            } catch (error) {
                console.error("Error di deleteTask:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
