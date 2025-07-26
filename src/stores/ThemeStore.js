import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        isDark: false,
        theme: 'light'
    }),

    actions: {
        toggleTheme() {
            this.isDark = !this.isDark
            this.theme = this.isDark ? 'dark' : 'light'
            this.applyTheme()
            localStorage.setItem('theme', this.theme)
        },

        initTheme() {
            const savedTheme = localStorage.getItem('theme')
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

            if (savedTheme) {
                this.theme = savedTheme
                this.isDark = savedTheme === 'dark'
            } else {
                this.theme = systemPrefersDark ? 'dark' : 'light'
                this.isDark = systemPrefersDark
            }

            this.applyTheme()
        },

        applyTheme() {
            const html = document.documentElement
            if (this.isDark) {
                html.classList.add('dark')
                html.classList.remove('light')
            } else {
                html.classList.add('light')
                html.classList.remove('dark')
            }
        }
    }
})