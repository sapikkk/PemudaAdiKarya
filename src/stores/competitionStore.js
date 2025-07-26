import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useCompetitionStore = defineStore('competition', {
    state: () => ({
        competitions: [],
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

        // Mengambil semua data lomba dari server
        async fetchAll() {
            this.setLoading(true)
            this.clearError()
            try {
                const response = await axios.get(`${API_URL}/competitions`)
                this.competitions = response.data
                return response.data
            } catch (error) {
                console.error("Gagal mengambil data lomba:", error)
                this.setError(error.response?.data?.message || "Gagal mengambil data lomba")
                throw error
            } finally {
                this.setLoading(false)
            }
        },

        // Menambah lomba baru
        async addCompetition(competitionData) {
            this.clearError()
            try {
                const payload = {
                    name: competitionData.name?.trim(),
                    description: competitionData.description?.trim() || ''
                }

                if (!payload.name) {
                    throw new Error("Nama lomba harus diisi")
                }

                const response = await axios.post(`${API_URL}/competitions`, payload)
                this.competitions.push(response.data)
                return response.data
            } catch (error) {
                console.error("Gagal menambah lomba:", error)
                this.setError(error.response?.data?.message || error.message || "Gagal menambah lomba")
                throw error
            }
        },

        // Memperbarui lomba
        async updateCompetition(competitionData) {
            this.clearError()
            
            if (!competitionData || !competitionData.id) {
                const errorMsg = "Data lomba atau ID tidak valid"
                console.error(errorMsg, competitionData)
                this.setError(errorMsg)
                throw new Error(errorMsg)
            }

            try {
                const payload = {
                    name: competitionData.name?.trim(),
                    description: competitionData.description?.trim() || ''
                }

                if (!payload.name) {
                    throw new Error("Nama lomba harus diisi")
                }

                const response = await axios.put(`${API_URL}/competitions/${competitionData.id}`, payload)
                const index = this.competitions.findIndex(c => c.id === competitionData.id)
                if (index !== -1) {
                    this.competitions[index] = response.data
                } else {
                    this.competitions.push(response.data)
                }
                return response.data
            } catch (error) {
                console.error("Gagal memperbarui lomba:", error)
                this.setError(error.response?.data?.message || error.message || "Gagal memperbarui lomba")
                throw error
            }
        },

        // Menghapus lomba
        async deleteCompetition(competitionId) {
            this.clearError()
            
            if (!competitionId) {
                const errorMsg = "ID lomba tidak valid"
                console.error(errorMsg)
                this.setError(errorMsg)
                throw new Error(errorMsg)
            }

            try {
                await axios.delete(`${API_URL}/competitions/${competitionId}`)
                this.competitions = this.competitions.filter(c => c.id !== competitionId)
                return true
            } catch (error) {
                console.error("Gagal menghapus lomba:", error)
                this.setError(error.response?.data?.message || "Gagal menghapus lomba")
                throw error
            }
        }
    }
})