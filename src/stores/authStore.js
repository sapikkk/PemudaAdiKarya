import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

// API URL yang sederhana
const API_URL = import.meta.env.PROD 
    ? '/api/users'  // Production
    : 'http://localhost:3001/users';  // Development

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
                console.log('Attempting login with API_URL:', API_URL);
                
                // 1. Ambil data user dari API berdasarkan email
                const response = await fetch(`${API_URL}?email=${credentials.email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log('Login response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Login response error:', errorText);
                    throw new Error(`Server error: ${response.status} - ${response.statusText}`);
                }
                
                const users = await response.json();
                console.log('Users found:', users.length);

                // 2. Cek apakah user ditemukan dan password cocok
                if (users.length === 0 || users[0].password !== credentials.password) {
                    throw new Error('Email atau password yang Anda masukkan salah.');
                }

                // 3. Jika berhasil, simpan data user di state dan localStorage
                const loggedInUser = users[0];
                this.user = loggedInUser;
                localStorage.setItem('user', JSON.stringify(loggedInUser));

            } catch (error) {
                console.error('Login error:', error);
                
                // Handle specific error types
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                } else if (error.message.includes('500')) {
                    this.error = 'Server sedang bermasalah. Silakan coba lagi nanti.';
                } else if (error.message.includes('404')) {
                    this.error = 'Service tidak ditemukan. Hubungi administrator.';
                } else {
                    this.error = error.message || 'Terjadi kesalahan saat login';
                }
                
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
                const checkResponse = await fetch(`${API_URL}?email=${userData.email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!checkResponse.ok) {
                    throw new Error(`Server error: ${checkResponse.status}`);
                }
                
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
                    throw new Error(`Registrasi gagal: ${response.status}`);
                }

            } catch (error) {
                console.error('Register error:', error);
                this.error = error.message || 'Terjadi kesalahan saat registrasi';
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
