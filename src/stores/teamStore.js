import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3001'

export const useTeamStore = defineStore('team', {
    state: () => ({
        divisions: [],
        members: [],
        error: null,
        loading: false
    }),
    getters: {
        // Getter untuk menggabungkan data anggota dengan nama divisinya
        membersWithDivision: (state) => {
            return state.members.map(member => {
                const division = state.divisions.find(d => d.id === member.divisionId)
                return {
                    ...member,
                    divisionName: division ? division.name : 'Tidak ada divisi'
                }
            })
        }
    },
    actions: {
        // Set loading state
        setLoading(status) {
            this.loading = status
        },

        // Set error state
        setError(error) {
            this.error = error
        },

        // Clear error
        clearError() {
            this.error = null
        },

        // Mengambil semua data dari server
        async fetchAll() {
            this.setLoading(true)
            this.clearError()
            try {
                const [divisionsRes, membersRes] = await Promise.all([
                    axios.get(`${API_URL}/divisions`),
                    axios.get(`${API_URL}/members`)
                ])
                this.divisions = divisionsRes.data
                this.members = membersRes.data
            } catch (error) {
                console.error("Gagal mengambil data tim:", error)
                this.setError(error.response?.data?.message || "Gagal mengambil data tim")
                throw error
            } finally {
                this.setLoading(false)
            }
        },

        // Menambah anggota baru
        async addMember(memberData) {
            this.clearError()
            try {
                // Pastikan data yang dikirim valid
                const payload = {
                    name: memberData.name?.trim(),
                    divisionId: memberData.divisionId
                }

                if (!payload.name || !payload.divisionId) {
                    throw new Error("Nama dan divisi harus diisi")
                }

                const response = await axios.post(`${API_URL}/members`, payload)
                this.members.push(response.data)
                return response.data
            } catch (error) {
                console.error("Gagal menambah anggota:", error)
                this.setError(error.response?.data?.message || error.message || "Gagal menambah anggota")
                throw error
            }
        },

        // Memperbarui anggota
        async updateMember(memberData) {
            this.clearError()

            if (!memberData || !memberData.id) {
                const errorMsg = "Data anggota atau ID tidak valid"
                console.error(errorMsg, memberData)
                this.setError(errorMsg)
                throw new Error(errorMsg)
            }

            try {
                const payload = {
                    name: memberData.name?.trim(),
                    divisionId: memberData.divisionId
                }

                if (!payload.name || !payload.divisionId) {
                    throw new Error("Nama dan divisi harus diisi")
                }

                const response = await axios.put(`${API_URL}/members/${memberData.id}`, payload)
                const index = this.members.findIndex(m => m.id === memberData.id)
                if (index !== -1) {
                    this.members[index] = response.data
                } else {
                    // Jika tidak ditemukan di array lokal, tambahkan
                    this.members.push(response.data)
                }
                return response.data
            } catch (error) {
                console.error("Gagal memperbarui anggota:", error)
                this.setError(error.response?.data?.message || error.message || "Gagal memperbarui anggota")
                throw error
            }
        },

        // Menghapus anggota
        async deleteMember(memberId) {
            this.clearError()

            if (!memberId) {
                const errorMsg = "ID anggota tidak valid"
                console.error(errorMsg)
                this.setError(errorMsg)
                throw new Error(errorMsg)
            }

            try {
                await axios.delete(`${API_URL}/members/${memberId}`)
                this.members = this.members.filter(m => m.id !== memberId)
                return true
            } catch (error) {
                console.error("Gagal menghapus anggota:", error)
                this.setError(error.response?.data?.message || "Gagal menghapus anggota")
                throw error
            }
        }
    }
})