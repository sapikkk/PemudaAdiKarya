import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

// PERBAIKAN: Deteksi environment dan gunakan URL yang sesuai
const getApiUrl = () => {
    // Jika di development (localhost)
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
        return 'http://localhost:3001/users';
    }
    
    // Jika di production, gunakan URL relatif atau absolute sesuai deployment
    // Ganti dengan URL API production Anda
    if (window.location.hostname.includes('vercel.app')) {
        return `${window.location.origin}/api/users`;
    }
    
    // Fallback untuk domain production lainnya
    return `${window.location.origin}/api/users`;
};

const API_URL = getApiUrl();

export const useAuthStore = defineStore('auth', {
    // --------------------------------------------------
    // STATE
    // --------------------------------------------------
    state: () => ({
        user: null, // PERBAIKAN: Jangan parse localStorage di state initialization
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
         * PERBAIKAN: Initialize user dari localStorage setelah store dibuat
         */
        initializeAuth() {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    this.user = JSON.parse(savedUser);
                }
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
                localStorage.removeItem('user');
                this.user = null;
            }
        },

        /**
         * Menangani proses login user.
         * @param {object} credentials - Berisi email dan password.
         */
        async login(credentials) {
            this.loading = true;
            this.error = null;
            
            try {
                console.log('Attempting login with API URL:', API_URL); // Debug log
                
                // PERBAIKAN: Tambahkan timeout dan error handling yang lebih baik
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

                const response = await fetch(`${API_URL}?email=${encodeURIComponent(credentials.email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error (${response.status}): ${errorText || 'Gagal menghubungi server'}`);
                }

                const users = await response.json();

                // Cek apakah user ditemukan dan password cocok
                if (users.length === 0 || users[0].password !== credentials.password) {
                    throw new Error('Email atau password yang Anda masukkan salah.');
                }

                // Jika berhasil, simpan data user di state dan localStorage
                const loggedInUser = users[0];
                this.user = loggedInUser;
                
                try {
                    localStorage.setItem('user', JSON.stringify(loggedInUser));
                } catch (storageError) {
                    console.warn('Failed to save to localStorage:', storageError);
                    // Login tetap berhasil meski localStorage gagal
                }

                console.log('Login successful for:', loggedInUser.email);

            } catch (error) {
                console.error('Login error:', error);
                
                // PERBAIKAN: Error handling yang lebih spesifik
                if (error.name === 'AbortError') {
                    this.error = 'Login timeout. Periksa koneksi internet Anda dan coba lagi.';
                } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                } else {
                    this.error = error.message;
                }
                
                this.user = null;
                try {
                    localStorage.removeItem('user');
                } catch (storageError) {
                    console.warn('Failed to remove from localStorage:', storageError);
                }
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
                console.log('Attempting registration with API URL:', API_URL); // Debug log
                
                // PERBAIKAN: Tambahkan timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                // 1. Cek apakah email sudah terdaftar
                const checkResponse = await fetch(`${API_URL}?email=${encodeURIComponent(userData.email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    signal: controller.signal
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
                    id: Date.now(), // PERBAIKAN: Tambahkan ID sederhana
                };

                const response = await fetch(API_URL.replace('/users', '/users'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Registrasi gagal (${response.status}): ${errorText || 'Silakan coba lagi'}`);
                }

                console.log('Registration successful for:', userData.email);

            } catch (error) {
                console.error('Registration error:', error);
                
                if (error.name === 'AbortError') {
                    this.error = 'Registrasi timeout. Periksa koneksi internet Anda dan coba lagi.';
                } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                } else {
                    this.error = error.message;
                }
            } finally {
                this.loading = false;
            }
        },

        /**
         * Menangani proses logout.
         */
        logout() {
            this.user = null;
            try {
                localStorage.removeItem('user');
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
            }
            console.log('User logged out');
        },

        /**
         * PERBAIKAN: Clear error state
         */
        clearError() {
            this.error = null;
        }
    },
});
