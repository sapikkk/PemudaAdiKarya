# 🎯 Event Management System

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.17-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PrimeVue](https://img.shields.io/badge/PrimeVue-4.3.6-41B883?style=for-the-badge&logo=vue.js&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0.3-FFD700?style=for-the-badge&logo=vue.js&logoColor=black)

Sistem manajemen acara modern yang dibangun dengan **Vue.js 3**, **PrimeVue**, dan **Pinia** untuk mengelola berbagai aspek penyelenggaraan acara secara efisien dan profesional.

## 🌟 Fitur Utama

### 📊 **Dashboard Ringkasan**

- **Analitik Keuangan Real-time**: Total pemasukan, pengeluaran, dan saldo akhir
- **Statistik Peserta**: Jumlah peserta terdaftar dengan visualisasi
- **Status Kompetisi**: Overview lomba yang sedang berlangsung
- **Grafik Interaktif**: Menggunakan Chart.js untuk visualisasi data

### 💰 **Manajemen Keuangan**

- **Pemasukan & Pengeluaran**: CRUD lengkap dengan kategori
- **Laporan Keuangan**: Ringkasan finansial dengan filter tanggal
- **Multi-kategori**: Dana sponsor, iuran warga, hadiah, konsumsi, dll
- **Validasi Real-time**: Form validation dengan feedback instan
- **Export Data**: Kemampuan export laporan keuangan

### 👥 **Manajemen Tim**

- **Struktur Organisasi**: Hirarki divisi dan posisi
- **Assignment Tasks**: Pembagian tugas per divisi
- **Contact Management**: Informasi kontak tim lengkap
- **Role-based Access**: Akses berdasarkan peran (Admin/User)

### 📅 **Penjadwalan Kegiatan**

- **Timeline Management**: Penjadwalan aktivitas dengan Gantt Chart
- **Task Dependencies**: Ketergantungan antar tugas
- **Progress Tracking**: Monitoring kemajuan aktivitas
- **Deadline Alerts**: Notifikasi mendekati deadline

### 🏆 **Manajemen Kompetisi**

- **Multiple Competitions**: Kelola berbagai jenis lomba
- **Registration System**: Sistem pendaftaran peserta
- **Scoring System**: Sistem penilaian dan ranking
- **Prize Management**: Manajemen hadiah dan pemenang

### 👤 **Sistem Peserta**

- **Registration Forms**: Form pendaftaran yang customizable
- **Participant Database**: Database peserta lengkap
- **Check-in System**: Sistem absensi peserta
- **Communication Tools**: Broadcast pesan ke peserta

### 📝 **Log Aktivitas**

- **Activity Tracking**: Pencatatan semua aktivitas sistem
- **Audit Trail**: Jejak perubahan data
- **User Actions**: Log aktivitas per user
- **System Monitoring**: Monitoring performa sistem

## 🚀 Teknologi yang Digunakan

### **Frontend Framework**

- **Vue.js 3**: Composition API, Reactivity System
- **Vue Router 4**: SPA routing dengan guards
- **Pinia**: State management modern untuk Vue 3

### **UI Framework & Styling**

- **PrimeVue 4**: Enterprise-grade UI components
- **PrimeIcons**: Icon library yang comprehensive
- **Aura Theme**: Modern design system
- **CSS Custom Properties**: Dynamic theming support

### **Build Tools & Development**

- **Vite**: Lightning-fast build tool
- **ES Modules**: Modern JavaScript module system
- **Hot Module Replacement**: Instant development feedback

### **Data Visualization**

- **Chart.js**: Interactive charts dan graphs
- **DHTMLX Gantt**: Professional Gantt chart component

### **Backend Simulation**

- **JSON Server**: REST API mockup untuk development
- **Axios**: HTTP client untuk API calls

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

- **Node.js** (versi 16.0 atau lebih tinggi)
- **npm** atau **yarn** package manager
- **Git** untuk version control

```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version
```

## 🛠️ Instalasi & Setup

### 1. **Clone Repository**

```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
```

### 2. **Install Dependencies**

```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

### 3. **Setup Environment**

```bash
# Copy environment file (jika ada)
cp .env.example .env

# Edit konfigurasi sesuai kebutuhan
nano .env
```

### 4. **Jalankan Development Server**

```bash
# Start frontend development server
npm run dev

# Start JSON server untuk backend API
npm run serve-json
```

### 5. **Akses Aplikasi**

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

## 🏗️ Struktur Proyek

```
event-management-system/
├── 📁 public/                     # Static assets
│   └── vite.svg
├── 📁 src/                        # Source code
│   ├── 📁 assets/                 # Media assets
│   │   └── vue.svg
│   ├── 📁 components/             # Reusable components
│   │   └── HelloWorld.vue
│   ├── 📁 composables/            # Composition functions
│   │   └── useChartOptions.js
│   ├── 📁 layouts/                # Layout components
│   │   ├── AdminLayout.vue        # Dashboard layout
│   │   └── AuthLayout.vue         # Authentication layout
│   ├── 📁 router/                 # Vue Router configuration
│   │   └── index.js
│   ├── 📁 stores/                 # Pinia stores
│   │   ├── authStore.js           # Authentication state
│   │   ├── financeStore.js        # Financial data
│   │   ├── participantStore.js    # Participant management
│   │   ├── competitionStore.js    # Competition data
│   │   ├── teamStore.js           # Team management
│   │   ├── tasksStore.js          # Task management
│   │   ├── activityStore.js       # Activity logs
│   │   ├── proposalStore.js       # Proposal management
│   │   └── ThemeStore.js          # Theme configuration
│   ├── 📁 views/                  # Page components
│   │   ├── 📁 auth/               # Authentication pages
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   ├── DashboardView.vue      # Main dashboard
│   │   ├── FinanceView.vue        # Financial management
│   │   ├── TeamView.vue           # Team management
│   │   ├── ScheduleView.vue       # Schedule management
│   │   ├── competitionsView.vue   # Competition management
│   │   ├── ParticipantsView.vue   # Participant management
│   │   └── ActivityLogView.vue    # Activity logging
│   ├── App.vue                    # Root component
│   ├── main.js                    # Application entry point
│   └── style.css                  # Global styles
├── 📄 db.json                     # JSON Server database
├── 📄 package.json                # Dependencies & scripts
├── 📄 vite.config.js             # Vite configuration
└── 📄 README.md                   # Documentation
```

## ⚙️ Konfigurasi

### **Environment Variables**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Event Management System

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
```

### **Vite Configuration**

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

## 🔧 Scripts yang Tersedia

```bash
# Development
npm run dev          # Start development server
npm run serve-json   # Start JSON server backend

# Build & Preview
npm run build        # Build for production
npm run preview      # Preview production build

# Linting & Formatting
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🎨 Customization

### **Theme Configuration**

```javascript
// src/main.js - PrimeVue Theme Setup
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark",
      cssLayer: false,
    },
  },
});
```

### **Router Guards**

```javascript
// src/router/index.js - Authentication Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "Login" });
  } else {
    next();
  }
});
```

## 📱 Responsive Design

Aplikasi ini fully responsive dengan breakpoints:

- **Desktop**: ≥ 1024px
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🔐 Authentication & Authorization

### **Role-based Access Control**

- **Admin**: Full access ke semua fitur
- **User**: Read-only access dengan limited actions

### **Route Protection**

```javascript
{
  path: '/admin',
  meta: {
    requiresAuth: true,
    requiresAdmin: true
  }
}
```

## 📊 State Management dengan Pinia

### **Store Structure**

```javascript
// Example: financeStore.js
export const useFinanceStore = defineStore("finance", {
  state: () => ({
    incomes: [],
    expenses: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalIncome: (state) =>
      state.incomes.reduce((sum, item) => sum + item.amount, 0),
    balance: (state) => totalIncome - totalExpense,
  },

  actions: {
    async fetchTransactions() {
      // API calls
    },
  },
});
```

## 🚀 Deployment

### **Build untuk Production**

```bash
npm run build
```

### **Deploy ke Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### **Deploy ke Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🧪 Testing (Coming Soon)

```bash
# Unit Tests
npm run test:unit

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Port sudah digunakan**

   ```bash
   # Kill process di port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Module tidak ditemukan**

   ```bash
   # Clear cache dan reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Hot reload tidak bekerja**
   ```bash
   # Restart development server
   npm run dev
   ```

## 🤝 Contributing

Kami menerima kontribusi! Silakan ikuti langkah berikut:

1. **Fork** repository ini
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Coding Standards**

- Gunakan **Composition API** untuk Vue components
- Follow **ESLint** configuration
- Write **descriptive commit messages**
- Add **JSDoc comments** untuk functions

## 📄 License

Project ini dilisensikan under **MIT License** - lihat [LICENSE](LICENSE) file untuk detail.

## 👥 Team

- **Lead Developer**: [Your Name](https://github.com/your-username)
- **UI/UX Designer**: [Designer Name](https://github.com/designer-username)
- **Project Manager**: [Manager Name](https://github.com/manager-username)

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

- **GitHub Issues**: [Create an issue](https://github.com/your-username/event-management-system/issues)
- **Email**: support@yourdomain.com
- **Documentation**: [Wiki](https://github.com/your-username/event-management-system/wiki)

## 🔄 Changelog

### **v1.0.0** (Current)

- ✅ Initial release
- ✅ Complete dashboard dengan financial tracking
- ✅ Responsive design
- ✅ Authentication system
- ✅ Multi-role access control

### **Upcoming Features**

- 🔄 Real-time notifications
- 🔄 Email integration
- 🔄 Advanced reporting
- 🔄 Mobile app (React Native)
- 🔄 Multi-language support

---

**Built with ❤️ using Vue.js 3 & PrimeVue**
# PemudaAdiKarya
