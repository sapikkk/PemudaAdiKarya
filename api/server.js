// Mengimpor library yang diperlukan
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

// Membuat instance server dari json-server
const server = jsonServer.create();

// Solusi 1: Embed data langsung dalam kode (Rekomendasi untuk Vercel)
const dbData = {

  "users": [
    {
      "id": "1",
      "name": "Admin",
      "email": "admin@gmail.com",
      "password": "admin",
      "role": "admin"
    },
    {
      "id": "2",
      "name": "User",
      "email": "user@gmail.com",
      "password": "userpassword",
      "role": "user"
    },
    {
      "id": "2b0c",
      "name": "Syapik",
      "email": "sapik@gmail.com",
      "password": "password",
      "role": "user"
    }
  ],
  "divisions": [
    {
      "id": "1",
      "name": "Penasihat"
    },
    {
      "id": "2",
      "name": "Pelaksana"
    },
    {
      "id": "3",
      "name": "Sekretaris Pelaksana"
    },
    {
      "id": "4",
      "name": "Bendahara Pelaksana"
    },
    {
      "id": "5",
      "name": "Acara"
    },
    {
      "id": "6",
      "name": "Perlengkapan"
    },
    {
      "id": "7",
      "name": "Konsumsi"
    },
    {
      "id": "8",
      "name": "Publikasi & Dokumentasi"
    },
    {
      "id": "9",
      "name": "Pendanaan"
    },
    {
      "id": "10",
      "name": "Dekorasi"
    },
    {
      "id": "11",
      "name": "Transportasi"
    },
    {
      "id": "12",
      "name": "lomba batita"
    },
    {
      "id": "13",
      "name": "lomba balita"
    },
    {
      "id": "14",
      "name": "lomba sd"
    },
    {
      "id": "15",
      "name": "lomba smp"
    },
    {
      "id": "16",
      "name": "lomba ibuk-ibuk"
    },
    {
      "id": "17",
      "name": "lomba domino"
    },
    {
      "id": "18",
      "name": "lomba tarik tambang"
    }
  ],
  "members": [
    {
      "name": "Pak Sutaji",
      "divisionId": "1",
      "id": "da81"
    },
    {
      "id": "3324",
      "name": "PAK WARDI",
      "divisionId": "1"
    },
    {
      "name": "Jakfar Shodiq",
      "divisionId": "3",
      "id": "0403"
    },
    {
      "name": "Kak Dini",
      "divisionId": "4",
      "id": "11d9"
    },
    {
      "name": "Prasetya Ramdani",
      "divisionId": "4",
      "id": "31ec"
    },
    {
      "name": "Prasetya Ramdani",
      "divisionId": "12",
      "id": "3b20"
    },
    {
      "name": "Nopal",
      "divisionId": "6",
      "id": "71b4"
    },
    {
      "name": "Zidan",
      "divisionId": "5",
      "id": "ad27"
    },
    {
      "name": "Rafi",
      "divisionId": "7",
      "id": "21a6"
    },
    {
      "name": "Rafly R",
      "divisionId": "10",
      "id": "89fd"
    },
    {
      "name": "Syafiq",
      "divisionId": "18",
      "id": "89f7"
    },
    {
      "id": "f8f3",
      "name": "Syafiq",
      "divisionId": "2"
    },
    {
      "id": "462e",
      "name": "Jakfar Shodiq",
      "divisionId": "17"
    },
    {
      "id": "b5e8",
      "name": "Zidan",
      "divisionId": "16"
    },
    {
      "id": "81fd",
      "name": "Rafly R",
      "divisionId": "13"
    },
    {
      "id": "b69f",
      "name": "Nopal",
      "divisionId": "14"
    },
    {
      "id": "b28d",
      "name": "Rafi",
      "divisionId": "15"
    },
    {
      "id": "9c28",
      "name": "Pak Rama",
      "divisionId": "1"
    }
  ],
  "proposals": [
    {
      "id": "ad3c",
      "status": "Disetujui",
      "submissionDate": "2025-07-24T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:28:18.799Z",
          "log": "Proposal \"CV. Ramindo Karya Abadi\" dibuat oleh Kak Dini."
        },
        {
          "timestamp": "2025-07-25T10:34:19.276Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Diproses\"."
        },
        {
          "timestamp": "2025-07-25T10:34:54.300Z",
          "log": "Status diubah dari \"Diproses\" menjadi \"Disetujui\". Disposisi diperbarui menjadi \"sudah di transfer melalui norek kak dini\". Respon donatur diperbarui menjadi \"sudah selesai.\"."
        }
      ],
      "name": "CV. Ramindo Karya Abadi",
      "submitterName": "Kak Dini",
      "disposition": "sudah di transfer melalui norek kak dini",
      "donorResponse": "sudah selesai.",
      "lastUpdated": "2025-07-25T10:34:54.300Z"
    },
    {
      "id": "6ceb",
      "status": "Disetujui",
      "submissionDate": "2025-07-25T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:28:49.712Z",
          "log": "Proposal \"Ferry gondaldi\" dibuat oleh syafiq."
        },
        {
          "timestamp": "2025-07-25T10:37:47.912Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Disetujui\". Disposisi diperbarui menjadi \"sudah di transfer\". Respon donatur diperbarui menjadi \"sudah di respon dan selesai\"."
        }
      ],
      "name": "Ferry gonaldi",
      "submitterName": "syafiq",
      "disposition": "sudah di transfer",
      "donorResponse": "sudah di respon dan selesai",
      "lastUpdated": "2025-07-26T16:20:22.012Z"
    },
    {
      "id": "7878",
      "status": "Disetujui",
      "submissionDate": "2025-07-23T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:29:53.562Z",
          "log": "Proposal \"Kartama Skin Care\" dibuat oleh sapik."
        },
        {
          "timestamp": "2025-07-25T10:36:45.293Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Diproses\". Disposisi diperbarui menjadi \"sedang transfer\". Respon donatur diperbarui menjadi \"maaf belum bisa bergabung\"."
        },
        {
          "timestamp": "2025-07-25T10:36:57.029Z",
          "log": "Status diubah dari \"Diproses\" menjadi \"Disetujui\". Disposisi diperbarui menjadi \"sudah  transfer\"."
        }
      ],
      "name": "Kartama Skin Care",
      "submitterName": "sapik",
      "disposition": "sudah  transfer",
      "donorResponse": "maaf belum bisa bergabung",
      "lastUpdated": "2025-07-25T10:36:57.030Z"
    },
    {
      "id": "3070",
      "status": "Diproses",
      "submissionDate": "2025-07-25T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:30:44.869Z",
          "log": "Proposal \"PRIORITAS GROUP WILAYAH III\" dibuat oleh sapik."
        },
        {
          "timestamp": "2025-07-25T10:38:20.262Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Diproses\". Disposisi diperbarui menjadi \"belum jumpa sama orang tua pemilik untuk pembicaraan lanjut\". Respon donatur diperbarui menjadi \"sudah di respon melalui wa\"."
        },
        {
          "timestamp": "2025-07-27T08:50:02.931Z",
          "log": "Disposisi diperbarui menjadi \"sudah aman, menunggu proses selanjutnya\". Respon donatur diperbarui menjadi \"akhir bulan ini lagi banyak yang diurus, tapi jelas, ini sudah aman, tinggal nunggu info aja lagi, tidak ada yang perlu di risaukan lagi\n\"."
        }
      ],
      "name": "PRIORITAS GROUP WILAYAH III",
      "submitterName": "sapik",
      "disposition": "sudah aman, menunggu proses selanjutnya",
      "donorResponse": "akhir bulan ini lagi banyak yang diurus, tapi jelas, ini sudah aman, tinggal nunggu info aja lagi, tidak ada yang perlu di risaukan lagi\n",
      "lastUpdated": "2025-07-27T08:50:02.931Z"
    },
    {
      "id": "e798",
      "status": "Diajukan",
      "submissionDate": "2025-07-25T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:31:50.372Z",
          "log": "Proposal \"Ikhtiar Mulia Konstruksi (IMK)\" dibuat oleh sapik."
        },
        {
          "timestamp": "2025-07-25T10:36:23.038Z",
          "log": "Disposisi diperbarui menjadi \"belum ada jawaban\"."
        }
      ],
      "name": "Ikhtiar Mulia Konstruksi (IMK)",
      "submitterName": "sapik",
      "disposition": "belum ada jawaban",
      "donorResponse": "sudah di jawab dan minta diingatkan lagi nanti",
      "lastUpdated": "2025-07-25T10:36:23.038Z"
    },
    {
      "id": "8bd2",
      "status": "Diproses",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:32:22.453Z",
          "log": "Proposal \"KIMIA FARMA\" dibuat oleh sapik."
        },
        {
          "timestamp": "2025-07-26T06:41:30.498Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Diproses\". Disposisi diperbarui menjadi \"menunggu konfirmasi dari pihak atasan kak uul\". Respon donatur diperbarui menjadi \"akan di cek minggu ini karena belum banyak ke kantor\"."
        }
      ],
      "name": "KIMIA FARMA",
      "submitterName": "sapik",
      "disposition": "menunggu konfirmasi dari pihak atasan kak uul",
      "lastUpdated": "2025-07-26T06:41:30.499Z",
      "donorResponse": "akan di cek minggu ini karena belum banyak ke kantor"
    },
    {
      "id": "f71e",
      "status": "Diproses",
      "submissionDate": "2025-07-25T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:32:56.498Z",
          "log": "Proposal \"Proyek AMP Riau\" dibuat oleh Sapik."
        },
        {
          "timestamp": "2025-07-25T10:35:55.598Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Diproses\". Respon donatur diperbarui menjadi \"minggu ini bisa di beritahu progressnya seperti apa\"."
        },
        {
          "timestamp": "2025-07-27T10:04:30.864Z",
          "log": "Disposisi diperbarui menjadi \"sudah sampai atasan \". Respon donatur diperbarui menjadi \"Cek kondisi dulu, senin atau selasa dikabari\"."
        }
      ],
      "name": "Proyek AMP Riau",
      "submitterName": "Sapik",
      "disposition": "sudah sampai atasan ",
      "donorResponse": "Cek kondisi dulu, senin atau selasa dikabari",
      "lastUpdated": "2025-07-27T10:04:30.864Z"
    },
    {
      "id": "222c",
      "status": "Diproses",
      "submissionDate": "2025-07-22T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-25T10:33:52.412Z",
          "log": "Proposal \"Proyek Sigli Banda Aceh\" dibuat oleh Sapik."
        },
        {
          "timestamp": "2025-07-25T10:35:24.303Z",
          "log": "Status diubah dari \"Diajukan\" menjadi \"Diproses\". Disposisi diperbarui menjadi \"belum ada jawaban\". Respon donatur diperbarui menjadi \"sudah sampai sana belum ada keputusan cair. dan menunggu keputusan selanjutnya\n\"."
        }
      ],
      "name": "Proyek Sigli Banda Aceh",
      "submitterName": "Sapik",
      "disposition": "belum ada jawaban",
      "donorResponse": "sudah sampai sana belum ada keputusan cair. dan menunggu keputusan selanjutnya\n",
      "lastUpdated": "2025-07-25T10:35:24.304Z"
    },
    {
      "id": "e6b4",
      "status": "Diajukan",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-26T07:23:09.552Z",
          "log": "Proposal \"Ali Mahfud\" dibuat oleh Syafiq."
        },
        {
          "timestamp": "2025-07-26T07:45:20.185Z",
          "log": "Disposisi diperbarui menjadi \"bersedia menjadi sponsor\". Respon donatur diperbarui menjadi \"kirim file nya. \"."
        },
        {
          "timestamp": "2025-07-26T07:45:30.105Z",
          "log": "Respon donatur diperbarui menjadi \"belum ada balasan\"."
        }
      ],
      "name": "Ali Mahfud",
      "submitterName": "Syafiq",
      "disposition": "bersedia menjadi sponsor",
      "lastUpdated": "2025-07-26T07:45:30.105Z",
      "donorResponse": "belum ada balasan"
    },
    {
      "id": "d1e3",
      "status": "Diajukan",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-26T07:26:57.351Z",
          "log": "Proposal \"Samsu\" dibuat oleh Syafiq."
        }
      ],
      "name": "Samsu",
      "submitterName": "Syafiq",
      "disposition": "bismillah",
      "lastUpdated": "2025-07-26T07:26:57.351Z"
    },
    {
      "id": "a254",
      "status": "Diajukan",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-26T07:30:35.745Z",
          "log": "Proposal \"Muntaryanto\" dibuat oleh syafiq."
        },
        {
          "timestamp": "2025-07-26T07:45:51.282Z",
          "log": "Disposisi diperbarui menjadi \"sudah di kirim\". Respon donatur diperbarui menjadi \"belum ada balasan\"."
        }
      ],
      "name": "Muntaryanto",
      "submitterName": "syafiq",
      "disposition": "sudah di kirim",
      "lastUpdated": "2025-07-26T07:45:51.282Z",
      "donorResponse": "belum ada balasan"
    },
    {
      "id": "aabe",
      "status": "Diajukan",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-26T07:35:24.077Z",
          "log": "Proposal \"Teguh\" dibuat oleh sapik."
        },
        {
          "timestamp": "2025-07-26T07:44:40.463Z",
          "log": "Disposisi diperbarui menjadi \"sudah di kabari, dan proposal di ajukan via wa\". Respon donatur diperbarui menjadi \"minta berikan di teras rumah\"."
        },
        {
          "timestamp": "2025-07-26T07:44:56.496Z",
          "log": "Disposisi diperbarui menjadi \"ajukan via wa\". Respon donatur diperbarui menjadi \"sudah diterima dan di baca\"."
        },
        {
          "timestamp": "2025-07-27T08:49:14.484Z",
          "log": "Respon donatur diperbarui menjadi \"besok pagi ya, saya sedang ada acara diluar fiq.\"."
        }
      ],
      "name": "Teguh",
      "submitterName": "sapik",
      "disposition": "ajukan via wa",
      "lastUpdated": "2025-07-27T08:49:14.485Z",
      "donorResponse": "besok pagi ya, saya sedang ada acara diluar fiq."
    },
    {
      "id": "e7db",
      "status": "Diajukan",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-26T07:44:14.090Z",
          "log": "Proposal \"Sudarmanto\" dibuat oleh sapik."
        }
      ],
      "name": "Sudarmanto",
      "submitterName": "sapik",
      "disposition": "baru di kabari\n",
      "lastUpdated": "2025-07-26T07:44:14.091Z"
    },
    {
      "id": "5738",
      "status": "Diajukan",
      "submissionDate": "2025-07-26T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-26T08:27:38.260Z",
          "log": "Proposal \"Ade Widyowati\" dibuat oleh sapik."
        },
        {
          "timestamp": "2025-07-27T10:09:53.076Z",
          "log": "Disposisi diperbarui menjadi \"bos di proyek belum di tempat\". Respon donatur diperbarui menjadi \"kalau sudah tf nanti di kabari\n\"."
        }
      ],
      "name": "Ade Widyowati",
      "submitterName": "sapik",
      "donorResponse": "kalau sudah tf nanti di kabari\n",
      "disposition": "bos di proyek belum di tempat",
      "lastUpdated": "2025-07-27T10:09:53.076Z"
    },
    {
      "id": "c132",
      "status": "Diajukan",
      "submissionDate": "2025-07-27T00:00:00.000Z",
      "history": [
        {
          "timestamp": "2025-07-27T09:26:27.807Z",
          "log": "Proposal \"Sudarmanto\" dibuat oleh syafiq."
        }
      ],
      "name": "Sudarmanto",
      "submitterName": "syafiq",
      "disposition": "di read, dan insya allah ",
      "donorResponse": "read.",
      "lastUpdated": "2025-07-27T09:26:27.807Z"
    }
  ],
  "tasks": [
    {
      "id": "c41a",
      "text": "rapat konsep acara di musola",
      "start_date": "2025-07-19",
      "duration": 2,
      "progress": 1,
      "parent": 0
    },
    {
      "id": "3ae3",
      "text": "pembuatan surat administrasi ",
      "start_date": "2025-07-20",
      "duration": 3,
      "progress": 1,
      "parent": 0,
      "userId": "2"
    },
    {
      "id": "5588",
      "text": "perencanaan konsep lomba",
      "start_date": "2025-07-19",
      "duration": 2,
      "progress": 1,
      "parent": 0,
      "userId": "2"
    },
    {
      "id": "7639",
      "text": "pengajuan struktur panitia",
      "start_date": "2025-07-21",
      "duration": 4,
      "progress": 1,
      "parent": 0
    },
    {
      "id": "9ea8",
      "text": "rancangan anggaran proposal",
      "start_date": "2025-07-20",
      "duration": 3,
      "progress": 1,
      "parent": 0
    },
    {
      "id": "bbfd",
      "text": "persiapan administrasi",
      "start_date": "2025-07-22",
      "duration": 7,
      "progress": 0,
      "parent": 0
    },
    {
      "id": "d834",
      "text": "rapat koordinasi pemuda",
      "start_date": "2025-07-24",
      "duration": 9,
      "progress": 0,
      "parent": 0
    },
    {
      "id": "dc74",
      "text": "persiapan proposal ",
      "start_date": "2025-07-31",
      "duration": 1,
      "progress": 1,
      "parent": 0
    },
    {
      "id": "66c9",
      "text": "perencanaan struktur panitia",
      "start_date": "2025-07-28",
      "duration": 5,
      "progress": 0.664,
      "parent": 0
    }
  ],
  "incomes": [
    {
      "description": "Kartama Skin Care",
      "category": "Dana Sponsor",
      "amount": 500000,
      "date": "2025-07-25",
      "id": "9dc4"
    },
    {
      "description": "CV. Ramindo Karya Mandiri",
      "category": "Dana Sponsor",
      "amount": 1000000,
      "date": "2025-07-25",
      "id": "579d"
    },
    {
      "description": "Pak Ferry Gonaldi",
      "category": "Donasi",
      "amount": 200000,
      "date": "2025-07-25",
      "id": "d4a8"
    },
    {
      "id": "fb6e",
      "description": "Sisa Anggaran Tahun Lalu",
      "category": "Hibah",
      "amount": 2765500
    }
  ],
  "expenses": [],
  "competitions": [
    {
      "name": "Mengumpulkan bola Warna",
      "description": "Anak anak Batita (ORANG)",
      "id": "65af"
    },
    {
      "name": "Piramid Bola",
      "description": "anak Balita (ORANG)",
      "id": "ad61"
    },
    {
      "id": "8907",
      "name": "Injak Bola",
      "description": "Anak SMP (ORANG)"
    },
    {
      "id": "fa44",
      "name": "Tarik Tambang",
      "description": "Bapak-bapak, Pemuda (TIM)"
    },
    {
      "id": "afb5",
      "name": "Mengumpulkan Bola Warna Corong",
      "description": "Ibuk-Ibuk (ORANG)"
    },
    {
      "id": "cbd5",
      "name": "Domino",
      "description": "Bapak-bapak, pemuda (TIM)"
    },
    {
      "id": "cda1",
      "name": "Jemur Kertas",
      "description": "Anak Balita (ORANG)"
    }
  ],
  "participants": [
    {
      "id": "4912",
      "name": "Bang Ipan",
      "contact": "124234232r",
      "competitionIds": [
        "65af"
      ]
    }
  ],
  "activities": [
    {
      "id": "activity-6",
      "title": "Beli konsumsi untuk panitia",
      "description": "Beli konsumsi untuk panitia selama acara.",
      "divisionId": "7",
      "status": "pending",
      "createdAt": "2025-07-25T12:00:00.000Z"
    },
    {
      "id": "activity-7",
      "title": "Persiapan dekorasi panggung",
      "description": "Siapkan dekorasi untuk panggung utama.",
      "divisionId": "10",
      "status": "in-progress",
      "createdAt": "2025-07-25T13:00:00.000Z"
    },
    {
      "id": "5f7d",
      "title": "kontak",
      "description": "kabari : \npak teguh\npak darmanto\npak ali mahfud\npak samsu\nmas ridho \npersikabo mas agung\npt bang bobby pak jumino\nselasar",
      "divisionId": "2",
      "status": "inprogress",
      "createdAt": "2025-07-25T11:49:41.738Z"
    },
    {
      "id": "6692",
      "title": "buat cap stempel",
      "description": "untuk surat menyurat",
      "divisionId": "5",
      "status": "inprogress",
      "createdAt": "2025-07-25T11:50:16.505Z"
    },
    {
      "id": "bea8",
      "title": "rafi",
      "description": "list kan semua perlengkapan yang di butuhkan",
      "divisionId": "6",
      "status": "inprogress",
      "createdAt": "2025-07-25T11:50:36.813Z"
    },
    {
      "id": "5ae5",
      "title": "kabari kak rina",
      "description": "usaha kakak zidan ",
      "divisionId": "7",
      "status": "todo",
      "createdAt": "2025-07-25T11:52:08.392Z"
    },
    {
      "id": "0214",
      "title": "PROPOSAL",
      "description": "kita coba buat proposal sore sabtu ini dengan kak dini",
      "divisionId": "4",
      "status": "todo",
      "createdAt": "2025-07-26T06:52:26.150Z"
    }
  ]
};

// Solusi 2: Baca file db.json secara sinkron (alternatif)
let router;
try {
  // Coba baca dari root directory
  const dbPath = path.join(process.cwd(), 'db.json');
  if (fs.existsSync(dbPath)) {
    router = jsonServer.router(dbPath);
  } else {
    // Jika tidak ada, gunakan data yang di-embed
    router = jsonServer.router(dbData);
  }
} catch (error) {
  console.log('Menggunakan data embedded karena db.json tidak ditemukan');
  router = jsonServer.router(dbData);
}

// Menggunakan middleware default dari json-server
const middlewares = jsonServer.defaults({
  // Disable static file serving untuk Vercel
  static: false
});

// Menerapkan middleware ke server
server.use(middlewares);

// Custom middleware untuk CORS (opsional, jika diperlukan)
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Menerapkan router ke server
server.use('/api', router); // Tambahkan prefix /api untuk Vercel

// Export untuk Vercel
module.exports = server;
