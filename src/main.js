// src/main.js

import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Impor Konfigurasi
import App from './App.vue';
import router from './router';

// Impor PrimeVue & Tema Modern
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';

// --- BAGIAN 1: PASTIKAN SEMUA KOMPONEN DI-IMPORT DI SINI ---
import Chart from 'primevue/chart';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';   // <-- Pastikan ini ada
import Password from 'primevue/password';     // <-- Pastikan ini ada
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';       // <-- Pastikan ini ada
import Divider from 'primevue/divider';       // <-- Pastikan ini ada

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

// Gunakan PrimeVue dengan konfigurasi tema yang benar
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark',
            cssLayer: false
        }
    }
});

// Register ToastService
app.use(ToastService);

// --- BAGIAN 2: PASTIKAN SEMUA KOMPONEN DIDAFTARKAN DI SINI ---
app.component('Chart', Chart);
app.component('Button', Button);
app.component('Toast', Toast);
app.component('Card', Card);
app.component('InputText', InputText); // <-- Pastikan ini ada
app.component('Password', Password);   // <-- Pastikan ini ada
app.component('Dialog', Dialog);
app.component('Message', Message);     // <-- Pastikan ini ada
app.component('Divider', Divider);     // <-- Pastikan ini ada


app.mount('#app');
