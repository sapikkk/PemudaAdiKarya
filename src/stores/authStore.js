import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

// PERBAIKAN 1: Dynamic API URL berdasarkan environment
const API_URL = (() => {
    // Jika di production (deployed), gunakan URL production
    if (import.meta.env.PROD) {
        return '/api/users'; // Sesuaikan dengan URL production Anda
    }
    
    // Jika di development
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        console.log('Current hostname:', hostname);
        console.log('Current port:', port);
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001/users';
        } else {
            // Untuk mobile access, gunakan IP address yang sama dengan frontend
            const apiUrl = `http://${hostname}:3001/users`;
            console.log('Using API URL for mobile:', apiUrl);
            return apiUrl;
        }
    }
    
    return 'http://localhost:3001/users'; // fallback
})();

console.log('Final API_URL:', API_URL);

// PERBAIKAN 2: Safe localStorage operations untuk mobile
const safeLocalStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('localStorage getItem failed:', error);
            return null;
        }
    },
    
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn('localStorage setItem failed:', error);
            return false;
        }
    },
    
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('localStorage removeItem failed:', error);
            return false;
        }
    }
};

export const useAuthStore = defineStore('auth', {
    // --------------------------------------------------
    // STATE
    // --------------------------------------------------
    state: () => ({
        user: (() => {
            try {
                const userData = safeLocalStorage.getItem('user');
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
                console.warn('Failed to parse user data from localStorage:', error);
                return null;
            }
        })(),
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
                console.log('Attempting login with API URL:', API_URL); // Debug log
                
                // PERBAIKAN 3: Tambahkan timeout dan error handling yang lebih baik
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
                
                // 1. Ambil data user dari API berdasarkan email
                const response = await fetch(`${API_URL}?email=${encodeURIComponent(credentials.email)}`, {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}. Gagal menghubungi server.`);
                }
                
                const users = await response.json();

                // 2. Cek apakah user ditemukan dan password cocok
                if (users.length === 0 || users[0].password !== credentials.password) {
                    throw new Error('Email atau password yang Anda masukkan salah.');
                }

                // 3. Jika berhasil, simpan data user di state dan localStorage
                const loggedInUser = users[0];
                this.user = loggedInUser;
                
                // PERBAIKAN 4: Safe localStorage dengan fallback
                const saved = safeLocalStorage.setItem('user', JSON.stringify(loggedInUser));
                if (!saved) {
                    console.warn('Failed to save user data to localStorage, using session storage only');
                }

                console.log('Login successful for user:', loggedInUser.email); // Debug log

            } catch (error) {
                if (error.name === 'AbortError') {
                    this.error = 'Koneksi timeout. Periksa koneksi internet Anda.';
                } else if (error.message.includes('Failed to fetch')) {
                    this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                } else {
                    this.error = error.message;
                }
                
                console.error('Login error:', error); // Debug log
                this.user = null;
                safeLocalStorage.removeItem('user');
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
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                // 1. Cek apakah email sudah terdaftar
                const checkResponse = await fetch(`${API_URL}?email=${encodeURIComponent(userData.email)}`, {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!checkResponse.ok) {
                    throw new Error('Gagal menghubungi server untuk verifikasi email.');
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
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}. Registrasi gagal.`);
                }

                console.log('Registration successful for user:', userData.email); // Debug log

            } catch (error) {
                if (error.name === 'AbortError') {
                    this.error = 'Koneksi timeout. Periksa koneksi internet Anda.';
                } else if (error.message.includes('Failed to fetch')) {
                    this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
                } else {
                    this.error = error.message;
                }
                
                console.error('Registration error:', error); // Debug log
            } finally {
                this.loading = false;
            }
        },

        /**
         * Menangani proses logout.
         */
        logout() {
            this.user = null;
            safeLocalStorage.removeItem('user');
            console.log('User logged out'); // Debug log
        },

        /**
         * PERBAIKAN 5: Method untuk mengecek dan restore session
         */
        checkAuthState() {
            try {
                const userData = safeLocalStorage.getItem('user');
                if (userData) {
                    this.user = JSON.parse(userData);
                    console.log('Auth state restored for user:', this.user.email);
                } else {
                    this.user = null;
                }
            } catch (error) {
                console.warn('Failed to restore auth state:', error);
                this.user = null;
                safeLocalStorage.removeItem('user');
            }
        },
    },
});
