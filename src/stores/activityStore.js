import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3001/activities';

export const useActivityStore = defineStore('activity', {
    state: () => ({
        activities: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        groupedActivities: (state) => {
            return state.activities.reduce((acc, activity) => {
                const status = activity.status || 'todo';
                if (!acc[status]) {
                    acc[status] = [];
                }
                acc[status].push(activity);
                return acc;
            }, { todo: [], inprogress: [], done: [] });
        },
    },

    actions: {
        async fetchAll() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(API_URL);
                this.activities = response.data;
            } catch (err) {
                this.error = 'Gagal mengambil data aktivitas.';
                console.error(err);
            } finally {
                this.isLoading = false;
            }
        },

        async addActivity(activityData) {
            this.isLoading = true;
            this.error = null;
            try {
                const { id, ...dataWithoutId } = activityData;
                const payload = {
                    ...dataWithoutId,
                    status: 'todo',
                    createdAt: new Date().toISOString(),
                };
                const response = await axios.post(API_URL, payload);
                this.activities.push(response.data);
            } catch (err) {
                this.error = 'Gagal menambah aktivitas.';
                console.error(err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        // --- 👇 PERUBAHAN ADA DI FUNGSI INI 👇 ---
        async updateActivity(activityData) {
            // PENJAGA: Jangan lakukan apa pun jika ID tidak valid.
            if (!activityData.id) {
                console.error("Update dibatalkan: ID aktivitas tidak valid.", activityData);
                this.error = "Gagal memperbarui: ID aktivitas tidak ditemukan.";
                return; // Hentikan eksekusi fungsi
            }

            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.put(`${API_URL}/${activityData.id}`, activityData);
                const index = this.activities.findIndex(a => a.id === activityData.id);
                if (index !== -1) {
                    this.activities[index] = response.data;
                }
            } catch (err) {
                this.error = 'Gagal memperbarui aktivitas.';
                console.error(err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },
        // --- 👆 BATAS AKHIR PERUBAHAN 👆 ---

        async deleteActivity(activityId) {
            // PENJAGA: Jangan lakukan apa pun jika ID tidak valid.
            if (!activityId) {
                console.error("Penghapusan dibatalkan: ID aktivitas tidak valid.");
                this.error = "Gagal menghapus: ID aktivitas tidak ditemukan.";
                return;
            }
            this.isLoading = true;
            this.error = null;
            try {
                await axios.delete(`${API_URL}/${activityId}`);
                this.activities = this.activities.filter(a => a.id !== activityId);
            } catch (err) {
                this.error = 'Gagal menghapus aktivitas.';
                console.error(err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
