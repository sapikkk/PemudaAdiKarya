        import { defineStore } from 'pinia';
        import { useRouter } from 'vue-router';

        // Ganti URL ini agar sesuai dengan port json-server Anda
        const API_URL = 'http://localhost:3001/users'; // <-- DIUBAH DARI 3000 KE 3001

        export const useAuthStore = defineStore('auth', {
            // --------------------------------------------------
            // STATE
            // --------------------------------------------------
            state: () => ({
                user: JSON.parse(localStorage.getItem('user')),
                error: null,
                loading: false,
            }),

            // --------------------------------------------------
            // GETTERS
            // --------------------------------------------------
            getters: {
                isAuthenticated: (state) => !!state.user,
                isAdmin: (state) => state.user?.role === 'admin',
                isUser: (state) => state.user?.role === 'user',
            },

            // --------------------------------------------------
            // ACTIONS
            // --------------------------------------------------
            actions: {
                /**
                 * Menangani proses login user.
                 * @param {object} credentials - Berisi email dan password.
                 */
                async login(credentials) {
                    this.loading = true;
                    this.error = null;
                    try {
                        // 1. Ambil data user dari API berdasarkan email
                        const response = await fetch(`${API_URL}?email=${credentials.email}`);
                        if (!response.ok) {
                            throw new Error('Gagal menghubungi server.');
                        }
                        const users = await response.json();

                        // 2. Cek apakah user ditemukan dan password cocok
                        if (users.length === 0 || users[0].password !== credentials.password) {
                            throw new Error('Email atau password yang Anda masukkan salah.');
                        }

                        // 3. Jika berhasil, simpan data user di state dan localStorage
                        const loggedInUser = users[0];
                        this.user = loggedInUser;
                        localStorage.setItem('user', JSON.stringify(loggedInUser));

                    } catch (error) {
                        this.error = error.message;
                        this.user = null;
                        localStorage.removeItem('user');
                    } finally {
                        this.loading = false;
                    }
                },

                /**
                 * Menangani proses registrasi user baru.
                 * @param {object} userData - Berisi name, email, dan password.
                 */
                async register(userData) {
                    this.loading = true;
                    this.error = null;
                    try {
                        // 1. Cek apakah email sudah terdaftar
                        const checkResponse = await fetch(`${API_URL}?email=${userData.email}`);
                        const existingUsers = await checkResponse.json();
                        if (existingUsers.length > 0) {
                            throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain.');
                        }

                        // 2. Jika belum, buat user baru dengan role 'user'
                        const newUser = {
                            ...userData,
                            role: 'user',
                        };

                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(newUser),
                        });

                        if (!response.ok) {
                            throw new Error('Registrasi gagal. Silakan coba lagi.');
                        }

                    } catch (error) {
                        this.error = error.message;
                    } finally {
                        this.loading = false;
                    }
                },

                /**
                 * Menangani proses logout.
                 */
                logout() {
                    this.user = null;
                    localStorage.removeItem('user');
                },
            },
        });
