# Tracecode

Tracecode adalah aplikasi web untuk mengisi data berformat AAMVA, membuat representasi payload untuk kebutuhan pengembangan dan pengujian, melihat hasil parsing internal, serta mengelola akun dan kredit pengguna.

Dokumen ini menjelaskan perilaku yang terlihat dari kode proyek saat ini. Keberhasilan generator atau parser internal **bukan** bukti bahwa dokumen, barcode, atau hasil scan diterima oleh aplikasi pihak ketiga. Data yang dibuat aplikasi bukan credential resmi.

## Daftar isi

- [Gambaran aplikasi](#gambaran-aplikasi)
- [Fitur dan halaman](#fitur-dan-halaman)
- [Cara kerja generator](#cara-kerja-generator)
- [Batas validasi](#batas-validasi)
- [Teknologi dan arsitektur](#teknologi-dan-arsitektur)
- [Struktur proyek](#struktur-proyek)
- [Menjalankan proyek](#menjalankan-proyek)
- [Konfigurasi lingkungan](#konfigurasi-lingkungan)
- [Data dan layanan](#data-dan-layanan)
- [Pengujian dan pemeriksaan](#pengujian-dan-pemeriksaan)
- [Catatan pengembangan](#catatan-pengembangan)

## Gambaran aplikasi

Frontend dibangun dengan React dan Vite. Aplikasi menyediakan halaman untuk membuat payload, melihat dokumentasi API, mengelola akun, melihat riwayat, dan mengelola kredit. Kode generator dan parser bersama berada di `base44/shared/`.

Ada dua bagian backend yang hidup berdampingan di repository:

1. Fungsi Base44 di `base44/functions/`, dengan konfigurasi proyek di `base44/config.jsonc`.
2. Supabase yang dipakai oleh adapter browser di `src/api/base44Client.js`, termasuk autentikasi, akses tabel, RPC, dan Supabase Edge Functions untuk pembayaran.

Adapter browser tersebut bernama `base44`, tetapi bukan semua pemanggilan fungsi browser diteruskan ke Base44. Sebagian operasi ditangani langsung di adapter menggunakan generator lokal atau Supabase. Karena itu, konfigurasi frontend, konfigurasi Supabase, fungsi Base44, dan skema database harus diperiksa sebagai bagian terpisah saat menyiapkan deployment.

## Fitur dan halaman

Rute utama didaftarkan di `src/App.jsx`. Halaman yang tersedia meliputi:

| Halaman | Fungsi |
| --- | --- |
| Landing | Halaman informasi dan pengenalan aplikasi. |
| Generate | Form data, pilihan yurisdiksi dan profil, hasil payload, serta hasil parsing internal. |
| API Docs | Dokumentasi endpoint API yang disajikan oleh aplikasi. |
| Pricing | Informasi paket/kredit yang disajikan pada frontend. |
| Login, Register, Reset Password | Alur autentikasi dan reset kata sandi. |
| History | Halaman riwayat aktivitas/generasi yang disediakan aplikasi. |
| Settings | Pengaturan profil pengguna yang tersedia di UI. |
| Admin | UI tindakan administrasi akun/kredit yang tersedia di aplikasi. |

Ketersediaan dan hasil suatu tindakan bergantung pada konfigurasi backend, tabel, fungsi, kebijakan akses, serta status autentikasi. Keberadaan halaman atau tombol tidak dengan sendirinya memastikan bahwa semua operasi sudah tersedia di setiap mode backend.

## Cara kerja generator

Definisi field bersama dan metadata yurisdiksi berada di `base44/shared/jurisdictions.js`. Pembuatan, normalisasi, parsing, dan validasi internal payload berada di `base44/shared/aamva.js`.

Frontend memakai modul tersebut melalui re-export `src/lib/aamva.js`. Dengan begitu, halaman generator menggunakan implementasi bersama yang sama, bukan salinan generator terpisah di `src/lib/`.

Alur umum halaman Generate:

1. Pengguna mengisi data pada form yang dibentuk dari definisi field bersama.
2. Aplikasi memilih kode yurisdiksi dan profil.
3. Frontend memanggil fungsi `generateBarcode` melalui adapter di `src/api/base44Client.js`.
4. Adapter menjalankan generator bersama di browser, lalu—bila Supabase aktif—memeriksa dan mengurangi kredit akun.
5. Hasil generator ditampilkan untuk diperiksa oleh pengguna.

### Dukungan yurisdiksi dan profil

Daftar yurisdiksi runtime disimpan sebagai data statis di `base44/shared/jurisdictions.js` dan mencakup negara bagian AS serta District of Columbia. Metadata seperti issuer, versi, dan profil tidak otomatis diambil dari DMV atau layanan resmi.

Model saat ini memakai definisi field dan urutan bersama, lalu menerapkan metadata profil. Daftar `requiredFields` pada profil menentukan field mana yang ditandai wajib; model ini belum menjadi implementasi lengkap aturan penerbitan yang unik untuk setiap negara bagian. Profil juga bukan konfigurasi yang membuktikan kecocokan dengan perangkat atau aplikasi pemindai tertentu.

Halaman Generate saat ini memulai dengan yurisdiksi Nevada dan profil `scandit`. Nilai awal ini ditentukan oleh halaman, bukan dimuat dari pengaturan default pengguna. Mengganti yurisdiksi memperbarui pilihan yurisdiksi dan beberapa nilai terkait, tetapi tidak otomatis membersihkan atau memetakan ulang seluruh data yang sudah dimasukkan. Periksa ulang semua nilai setelah mengganti yurisdiksi.

Folder `informasi/` berisi bahan referensi yurisdiksi. Kode runtime saat ini tidak membaca folder tersebut untuk membentuk konfigurasi generator. Perubahan pada file referensi di folder itu saja tidak mengubah hasil aplikasi.

Isi folder referensi saat ini mencakup `aamva_fields.xlsx`, `field_master.csv`, `state_fields.csv`, `state_summary.csv`, `states.csv`, dan `states.json`. File-file tersebut adalah bahan kerja/referensi, bukan sumber konfigurasi runtime yang otomatis disinkronkan.

## Batas validasi

Validasi di aplikasi ditujukan untuk pemeriksaan internal, antara lain bentuk data, nilai field, dan kemampuan parser membaca hasil generator. Pemeriksaan tersebut tidak memverifikasi:

- keaslian dokumen atau kepemilikan identitas;
- penerbitan atau keberadaan nomor dokumen oleh DMV;
- kesesuaian implementasi dengan seluruh aturan operasional suatu yurisdiksi;
- penerimaan payload oleh Scandit atau pemindai/aplikasi pihak ketiga;
- status hukum atau kelayakan penggunaan suatu dokumen.

Pada jalur generator yang digunakan halaman, respons berhasil mencatat status internal sebagai `valid`, dan UI dapat menampilkan label `VALID`. Status itu menunjukkan bahwa proses internal berhasil menghasilkan keluaran; status tersebut bukan sertifikasi, pemeriksaan otoritas, atau hasil verifikasi eksternal. Parser juga hanya memeriksa struktur dan nilai yang dapat diproses oleh implementasi lokal.

Untuk membuktikan kesesuaian yurisdiksi, setiap aturan harus dibandingkan dengan sumber resmi yang relevan dan diuji dengan data yang berhak digunakan. Hasil pengujian di satu yurisdiksi tidak membuktikan dukungan untuk yurisdiksi lain.

## Teknologi dan arsitektur

- **Frontend:** React 18, Vite 6, JavaScript/JSX.
- **UI:** Tailwind CSS, Radix UI, dan komponen yang digunakan oleh aplikasi.
- **Routing:** React Router.
- **Data/auth browser:** Supabase JS melalui `src/api/base44Client.js`.
- **Fungsi Base44:** Deno/TypeScript di `base44/functions/`.
- **Supabase Edge Functions:** fungsi Deno di `supabase/functions/`.
- **Generator dan parser:** modul JavaScript bersama di `base44/shared/`.

`vite.config.js` memasang plugin React dan alias `@` ke direktori `src/`. Vite hanya menjalankan frontend; `npm run dev` tidak dengan sendirinya menjalankan layanan Base44 atau Supabase lokal.

## Struktur proyek

```text
.
├── base44/
│   ├── config.jsonc             # Perintah install, build, serve, dan output Base44
│   ├── entities/                # User, riwayat generasi, kredit, dan referral
│   ├── functions/               # Fungsi backend dan endpoint Base44
│   └── shared/                  # Generator, parser, yurisdiksi, dan tes terkait
├── informasi/                   # Bahan referensi; tidak dibaca otomatis oleh runtime
├── src/
│   ├── api/base44Client.js       # Adapter browser untuk Supabase dan fungsi aplikasi
│   ├── components/              # Komponen UI, termasuk field generator
│   ├── pages/                   # Halaman dan rute aplikasi
│   └── ...
├── supabase/
│   ├── functions/               # Supabase Edge Functions
│   └── migrations/              # Migrasi database Supabase
├── vite.config.js
└── package.json
```

## Menjalankan proyek

### Prasyarat

- Node.js dan npm yang sesuai dengan versi proyek/deployment.
- Akses ke proyek Supabase bila menguji autentikasi, penyimpanan akun, kredit, atau pembayaran.
- Akses ke proyek Base44 bila menjalankan atau menerbitkan fungsi Base44.

### Instalasi dan frontend

```powershell
npm install
npm run dev
```

Vite menampilkan alamat lokal setelah server siap. Perintah ini menjalankan frontend saja. Operasi yang bergantung pada Supabase memerlukan URL dan anon key yang benar serta tabel, fungsi RPC, kebijakan akses, dan Edge Functions yang sudah disiapkan.

### Perintah proyek

| Perintah | Tujuan |
| --- | --- |
| `npm run dev` | Menjalankan server development Vite. |
| `npm run build` | Membuat build frontend untuk produksi di `dist/`. |
| `npm run lint` | Menjalankan ESLint pada source yang dikonfigurasi. |
| `npm run lint:fix` | Menjalankan ESLint dengan perbaikan otomatis yang tersedia. |
| `npm run typecheck` | Menjalankan pemeriksaan tipe yang ditentukan dalam `package.json`. |

Tidak ada skrip `npm test` pada `package.json` saat ini. Tes generator yang tersedia dapat dijalankan dengan:

```powershell
node --test base44/shared/aamva.test.js
```

### Workflow Base44

`base44/config.jsonc` mendefinisikan perintah proyek Base44, termasuk install, build, serve, dan direktori output. Gunakan Base44 CLI/workflow yang sesuai dengan konfigurasi tersebut ketika bekerja dengan backend atau deployment Base44. Jangan menganggap bahwa menjalankan Vite saja telah menyalakan backend Base44.

## Konfigurasi lingkungan

Frontend membaca konfigurasi Vite berikut:

| Variabel | Kegunaan |
| --- | --- |
| `VITE_SUPABASE_URL` | URL proyek Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key untuk akses dari browser sesuai kebijakan RLS. |
| `VITE_BASE44_APP_ID` | Identitas aplikasi yang digunakan oleh konfigurasi/komponen Base44 yang membutuhkannya. |

Buat `.env.local` untuk nilai lokal. File tersebut diabaikan oleh Git; jangan memasukkan secret ke source, README, atau variabel frontend. Variabel dengan awalan `VITE_` dikirim ke bundle browser, jadi jangan pernah menaruh service-role key atau secret backend di sana.

`src/api/base44Client.js` memiliki nilai fallback untuk sebagian konfigurasi. Fallback tersebut tidak menggantikan konfigurasi deployment yang benar; pastikan nilai proyek yang digunakan memang milik lingkungan yang ingin diuji.

## Data dan layanan

### Supabase

Adapter browser memakai Supabase Auth dan tabel `users`; sejumlah operasi juga memakai tabel `logins`, Supabase RPC, dan Supabase Functions. Skema dan migrasi yang tersedia perlu diterapkan serta dikonfigurasi pada proyek Supabase yang dipakai.

Saat Supabase tidak dikonfigurasi, adapter memiliki jalur penyimpanan lokal berbasis browser untuk sejumlah alur pengembangan. Data pada jalur tersebut berada di `localStorage` browser dan bukan akun/database bersama. Jalur ini bukan pengganti konfigurasi autentikasi dan otorisasi untuk deployment.

Khususnya, pada implementasi adapter saat ini:

- `generateBarcode` menjalankan generator di sisi browser; jika Supabase aktif, adapter memeriksa sesi dan saldo kredit lalu mengurangi satu kredit.
- `setupProfile`, `withdrawReferral`, `trackLogin`, dan `adminAction` memiliki implementasi adapter yang berbeda antara mode Supabase dan penyimpanan lokal.
- Implementasi admin di adapter browser tidak identik dengan seluruh operasi fungsi backend Base44. Periksa handler dan kebijakan database sebelum mengandalkan tindakan admin.

### Base44

Direktori `base44/entities/` dan `base44/functions/` berisi definisi dan fungsi untuk workflow Base44. Kode tersebut tersedia terpisah dari adapter browser. Sebagian fungsi lama terkait top-up Trakteer di Base44 mengembalikan HTTP 410 dan tidak digunakan sebagai jalur pembayaran aktif oleh frontend.

Entitas yang didefinisikan di repository meliputi `User`, `GenerationHistory`, `CreditTransaction`, dan `ReferralTransaction`. Endpoint Base44 yang tersedia di source mencakup:

| Fungsi | Tujuan umum |
| --- | --- |
| `generateBarcode` | Pembuatan keluaran generator melalui handler backend. |
| `generateBarcodeApi` | Jalur generasi untuk API. |
| `statesApi`, `fieldsApi` | Menyediakan data yurisdiksi dan field untuk API. |
| `accountInfoApi` | Informasi akun untuk API. |
| `setupProfile`, `trackLogin` | Penyiapan profil dan pencatatan login. |
| `withdrawReferral`, `adminAction` | Operasi referral dan administrasi. |
| `topUpCredits`, `trakteerWebhook` | Handler lama yang saat ini mengembalikan HTTP 410. |

Keberadaan source endpoint tidak berarti endpoint tersebut sudah dipasang atau digunakan oleh frontend pada deployment aktif. Untuk kontrak request/response, autentikasi, dan konfigurasi masing-masing, rujuk handler di `base44/functions/` dan dokumentasi API dalam aplikasi.

### Pembayaran Trakteer

Frontend memanggil Supabase Function `create-trakteer-order`. Webhook dan proses pembayaran yang aktif berada di `supabase/functions/`. Alur pembayaran memerlukan konfigurasi Supabase, kredensial backend, webhook, serta tabel yang cocok; jangan menaruh kredensial pembayaran di frontend.

### Data yurisdiksi

Metadata runtime didefinisikan secara statis di `base44/shared/jurisdictions.js`. Referensi yang diletakkan di `informasi/` belum diimpor atau diproses otomatis. Untuk mengubah perilaku runtime, konfigurasi terkait harus diintegrasikan ke modul yang digunakan aplikasi dan ditutup dengan tes.

## Pengujian dan pemeriksaan

Untuk perubahan generator atau parser, jalankan:

```powershell
node --test base44/shared/aamva.test.js
npm run build
```

Untuk pemeriksaan source yang lebih luas:

```powershell
npm run lint
npm run typecheck
```

Build yang berhasil memastikan bundler dapat memproses frontend; tes internal memeriksa kasus yang didefinisikan di dalam repository. Keduanya bukan pengganti pengujian integrasi terhadap konfigurasi Supabase/Base44 atau validasi eksternal.

## Catatan pengembangan

- Pertahankan satu sumber konfigurasi bersama untuk field yang benar-benar bersifat umum; letakkan variasi yurisdiksi pada konfigurasi yurisdiksi yang teruji.
- Jangan menyimpulkan bahwa pemilihan nama state saja menghasilkan format khusus state. Pastikan semua field, kewajiban, normalisasi, urutan, metadata, dan jalur output yang relevan benar-benar dikonfigurasi dan diuji.
- Gunakan bahan referensi yurisdiksi secara eksplisit. File referensi yang belum terhubung ke runtime tidak memengaruhi hasil aplikasi.
- Bedakan status sukses generator, hasil parser internal, dan verifikasi eksternal dalam UI serta dokumentasi.
- Jangan mengirim data pribadi nyata ke lingkungan pengembangan yang tidak berwenang. Gunakan data sintetis yang tidak merujuk kepada individu nyata untuk pengujian.
