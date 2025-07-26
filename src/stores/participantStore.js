import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useParticipantStore = defineStore('participant', {
    state: () => ({
        participants: [],
        isLoading: false,
        error: null
    }),
    actions: {
        // Set loading state
        setLoading(status) {
            this.isLoading = status
        },

        // Set error state
        setError(error) {
            this.error = error
        },

        // Clear error
        clearError() {
            this.error = null
        },

        // Mengambil semua data peserta dari server
        async fetchAll() {
            this.setLoading(true)
            this.clearError()
            try {
                const response = await axios.get(`${API_URL}/participants`)
                this.participants = response.data
                return response.data
            } catch (error) {
                console.error("Gagal mengambil data peserta:", error)
                this.setError(error.response?.data?.message || "Gagal mengambil data peserta")
                throw error
            } finally {
                this.setLoading(false)
            }
        },

        // Menambah peserta baru
        async addParticipant(participantData) {
            this.clearError()
            try {
                // Validasi dan bersihkan data
                const payload = {
                    name: participantData.name?.trim(),
                    contact: participantData.contact?.trim() || '',
                    competitionIds: Array.isArray(participantData.competitionIds) 
                        ? participantData.competitionIds 
                        : []
                }

                if (!payload.name) {
                    throw new Error("Nama peserta harus diisi")
                }

                const response = await axios.post(`${API_URL}/participants`, payload)
                this.participants.push(response.data)
                return response.data
            } catch (error) {
                console.error("Gagal menambah peserta:", error)
                this.setError(error.response?.data?.message || error.message || "Gagal menambah peserta")
                throw error
            }
        },

        // Memperbarui peserta
        async updateParticipant(participantData) {
            this.clearError()
            
            if (!participantData || !participantData.id) {
                const errorMsg = "Data peserta atau ID tidak valid"
                console.error(errorMsg, participantData)
                this.setError(errorMsg)
                throw new Error(errorMsg)
            }

            try {
                const payload = {
                    name: participantData.name?.trim(),
                    contact: participantData.contact?.trim() || '',
                    competitionIds: Array.isArray(participantData.competitionIds) 
                        ? participantData.competitionIds 
                        : []
                }

                if (!payload.name) {
                    throw new Error("Nama peserta harus diisi")
                }

                const response = await axios.put(`${API_URL}/participants/${participantData.id}`, payload)
                const index = this.participants.findIndex(p => p.id === participantData.id)
                if (index !== -1) {
                    this.participants[index] = response.data
                } else {
                    // Jika tidak ditemukan di array lokal, tambahkan
                    this.participants.push(response.data)
                }
                return response.data
            } catch (error) {
                console.error("Gagal memperbarui peserta:", error)
                this.setError(error.response?.data?.message || error.message || "Gagal memperbarui peserta")
                throw error
            }
        },

        // Menghapus peserta
        async deleteParticipant(participantId) {
            this.clearError()
            
            if (!participantId) {
                const errorMsg = "ID peserta tidak valid"
                console.error(errorMsg)
                this.setError(errorMsg)
                throw new Error(errorMsg)
            }

            try {
                await axios.delete(`${API_URL}/participants/${participantId}`)
                this.participants = this.participants.filter(p => p.id !== participantId)
                return true
            } catch (error) {
                console.error("Gagal menghapus peserta:", error)
                this.setError(error.response?.data?.message || "Gagal menghapus peserta")
                throw error
            }
        }
    }
})