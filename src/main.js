import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// PrimeVue and Theme
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';

// Import global dashboard styles
import './assets/dashboard.css';

import ToastService from 'primevue/toastservice';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';


const app = createApp(App);

app.use(createPinia());
app.use(router);
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
app.use(ToastService);

// Mendaftarkan komponen PrimeVue yang sering dipakai secara global
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
app.component('Button', Button);
app.component('Card', Card);
app.component('Dialog', Dialog);
app.component('Toast', Toast);
app.component('InputText', InputText);
app.component('Password', Password);

app.mount('#app');
