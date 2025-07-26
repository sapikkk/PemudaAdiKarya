import { defineStore } from 'pinia';
import axios from 'axios';

// URL ke json-server API Anda
const API_URL = 'http://localhost:3001/proposals';

export const useProposalStore = defineStore('proposal', {
    state: () => ({
        proposals: [],
        isLoading: false,
        error: null,
    }),
    actions: {
        // Mengambil semua data proposal dari server
        async fetchProposals() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(API_URL);
                // Mengurutkan proposal berdasarkan tanggal update terbaru
                this.proposals = response.data.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
            } catch (err) {
                this.error = 'Gagal mengambil data proposal: ' + (err.message || 'Network Error');
                console.error(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        // Menyimpan proposal (baik baru atau pembaruan)
        async saveProposal(proposal) {
            this.isLoading = true;
            this.error = null;
            try {
                // Tambahkan/update timestamp
                proposal.lastUpdated = new Date().toISOString();

                if (proposal.id) {
                    // Jika ada ID, perbarui proposal (PUT)
                    const response = await axios.put(`${API_URL}/${proposal.id}`, proposal);
                    const index = this.proposals.findIndex(p => p.id === proposal.id);
                    if (index !== -1) {
                        this.proposals[index] = response.data;
                    }
                } else {
                    // Jika tidak ada ID, buat proposal baru (POST)
                    const response = await axios.post(API_URL, proposal);
                    this.proposals.unshift(response.data); // Tambahkan ke awal array
                }
                // Urutkan lagi setelah ada perubahan
                this.proposals.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
            } catch (err) {
                this.error = 'Gagal menyimpan proposal: ' + (err.message || 'Network Error');
                console.error(this.error);
                throw new Error(this.error); // Lemparkan error agar bisa ditangkap di komponen
            } finally {
                this.isLoading = false;
            }
        },

        // Menghapus proposal
        async deleteProposal(proposalId) {
            this.isLoading = true;
            this.error = null;
            try {
                await axios.delete(`${API_URL}/${proposalId}`);
                this.proposals = this.proposals.filter(p => p.id !== proposalId);
            } catch (err) {
                this.error = 'Gagal menghapus proposal: ' + (err.message || 'Network Error');
                console.error(this.error);
                throw new Error(this.error); // Lemparkan error
            } finally {
                this.isLoading = false;
            }
        },
    },
});
