# TraceCode Site — AAMVA PDF417 Barcode Generator

> **TraceCode Site** adalah aplikasi web untuk membuat (generate) dan memvalidasi **barcode PDF417** yang sesuai dengan standar **AAMVA (American Association of Motor Vehicle Administrators) 2025** — format data yang dipakai di belakang barcode 2D pada kartu Driver License (SIM) / ID seluruh negara bagian AS.

Barcode yang dihasilkan terdeteksi sebagai *driver license* oleh scanner profesional (Zebra, Honeywell, Scandit, dll) karena struktur *header*, *subfile*, *offset*, dan *control characters* (LF, RS, CR) mengikuti **AAMVA DL/ID Card Design Standard 2025 (Annex D.12.3)** secara presisi byte-per-byte.

---

## Daftar Isi

1. [Apa Itu AAMVA PDF417?](#apa-itu-aamva-pdf417)
2. [Fitur Utama](#fitur-utama)
3. [Tech Stack & Bahasa Pemrograman](#tech-stack--bahasa-pemrograman)
4. [Library yang Dipakai](#library-yang-dipakai)
5. [Struktur Folder & Penjelasan Tiap File](#struktur-folder--penjelasan-tiap-file)
6. [Cara Kerja Generator (Alur Lengkap)](#cara-kerja-generator-alur-lengkap)
7. [Struktur Payload AAMVA (Byte Map)](#struktur-payload-aamva-byte-map)
8. [Menjalankan di Lokal](#menjalankan-di-lokal)
9. [Build untuk Produksi](#build-untuk-produksi)
10. [Push ke Git / GitHub](#push-ke-git--github)
11. [Membuat Generator Baru dengan Python](#membuat-generator-baru-dengan-python)
12. [Cara Pakai & Edit Aplikasi](#cara-pakai--edit-aplikasi)
13. [Troubleshooting](#troubleshooting)
14. [Disclaimer](#disclaimer)

---

## Apa Itu AAMVA PDF417?

**PDF417** adalah format barcode 2D bertumpuk (stacked) yang bisa menyimpan hingga ~2.7 KB data teks. Di kartu Driver License AS, PDF417 dipakai untuk menyimpan seluruh data pemegang kartu (nama, alamat, tanggal lahir, dll) dalam satu payload terstruktur.

**AAMVA** menetapkan standar bagaimana payload tersebut harus disusun agar scanner dari vendor mana pun bisa membacanya. Setiap negara bagian (jurisdiction) memiliki:
- **IIN (Issuer Identification Number)** — 6 digit, unik per negara bagian (mis. Nevada = `636049`)
- **AAMVA Version** — 2 digit (versi standar AAMVA, saat ini `10`)
- **Jurisdiction Version** — 2 digit (versi implementasi negara bagian)

### Contoh Payload Nyata

```
@␊␞␍ANSI 636049101001DL00310201DL␊DCSSMITH␊DACJOHN␊DAG123 MAIN ST␊DAILAS VEGAS␊DAJNV␊DAK89101␊DCGUSA␊DBB01151985␊DBD07242023␊DBA07242031␊DBC1␊DAU70 IN␊DAYBRO␊DAZBRO␊DAQNV1234567␍
```

Simbol `␊` = LF (Line Feed, `0x0A`), `␞` = RS (Record Separator, `0x1E`), `␍` = CR (Carriage Return, `0x0D`).

---

## Fitur Utama

| Fitur | Status |
|-------|--------|
| Generate barcode PDF417 AAMVA 2025 compliant | ✅ |
| 50 negara bagian AS + DC (IIN & versi lengkap) | ✅ |
| 3 profil scanner (Scandit, Show-Me ID, FIDScan) | ✅ |
| Auto-fill data dummy realistis | ✅ |
| Validasi & parsing payload (header, subfile, fields) | ✅ |
| Inspector byte-level (hex, escaped, visual, byte map) | ✅ |
| Download PNG barcode | ✅ |
| Copy payload ke clipboard | ✅ |
| Sistem kredit & top-up (Stripe) | ✅ |
| Riwayat generate & transaksi | ✅ |
| Auth (email/password, Google OAuth, OTP) | ✅ |
| Row-Level Security per user | ✅ |

---

## Tech Stack & Bahasa Pemrograman

| Lapisan | Teknologi |
|---------|-----------|
| **Frontend** | React 18 + Vite 6 (JavaScript/JSX) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui (Radix UI) |
| **Animasi** | Framer Motion |
| **Routing** | React Router DOM 6 |
| **Barcode** | bwip-js (PDF417 renderer) |
| **Backend** | Base44 BaaS (Deno Deploy edge functions, TypeScript) |
| **Database** | Base44 Entities (MongoDB-backed, JSON schema) |
| **Auth** | Base44 Auth (email/OTP/Google OAuth) |
| **Pembayaran** | Stripe (via Base44) |
| **Runtime Backend** | Deno (TypeScript) — `base44/functions/*/entry.ts` |
| **Runtime Frontend** | Browser (ESM) — Vite dev server / static build |
| **Package Manager** | npm |

> **Bahasa utama:** JavaScript (frontend) + TypeScript (backend edge functions).  
> **Bahasa shared logic:** JavaScript (`base44/shared/*.js`) — dipakai bersama oleh frontend & backend.

---

## Library yang Dipakai

### Frontend (dari `package.json`)

| Library | Versi | Fungsi |
|---------|-------|--------|
| `react` / `react-dom` | ^18.2.0 | Framework UI |
| `react-router-dom` | ^6.26.0 | Routing antar halaman |
| `bwip-js` | ^4.11.2 | **Render barcode PDF417** ke canvas |
| `pdf417-generator` | ^1.1.1 | Alternatif renderer PDF417 |
| `framer-motion` | ^11.16.4 | Animasi transisi |
| `tailwindcss` | ^3.4.17 | Utility CSS |
| `lucide-react` | ^0.475.0 | Icon set |
| `@tanstack/react-query` | ^5.84.1 | Data fetching & cache |
| `react-hook-form` | ^7.54.2 | Form state |
| `date-fns` | ^3.6.0 | Manipulasi tanggal |
| `recharts` | ^2.15.4 | Grafik (untuk dashboard) |
| `jspdf` + `html2canvas` | — | Export PDF (opsional) |
| `@base44/sdk` | ^0.8.40 | Base44 client SDK |
| `@base44/vite-plugin` | ^1.0.30 | Vite plugin untuk Base44 |
| `@stripe/stripe-js` | ^5.2.0 | Pembayaran Stripe |
| shadcn/ui (Radix UI) | berbagai | Komponen UI primitives |

### Backend (Deno / edge functions)

| Library | Fungsi |
|---------|--------|
| `npm:@base44/sdk@0.8.40` | Akses entity, auth, user dari edge function |
| `base44/shared/aamva.js` | Engine generate/parse/validate payload (shared) |
| `base44/shared/jurisdictions.js` | Data 50 negara bagian + field definitions |

---

## Struktur Folder & Penjelasan Tiap File

```
tracecode-site/
├── index.html                      # Entry HTML — title "TraceCode Site", mount point
├── package.json                    # Daftar dependency & script npm
├── vite.config.js                  # Konfigurasi Vite + plugin Base44
├── tailwind.config.js              # Mapping token CSS → class Tailwind
├── postcss.config.js               # PostCSS (autoprefixer + tailwind)
├── jsconfig.json                   # Alias path @/ → src/
├── README.md                       # Dokumen ini
│
├── src/
│   ├── main.jsx                    # Entry point React, import App & index.css
│   ├── App.jsx                     # Router utama + AuthProvider + QueryClient
│   ├── index.css                   # Design token (warna, font, radius) + utilitas
│   │
│   ├── api/
│   │   └── base44Client.js         # Instance Base44 SDK terinisialisasi
│   │
│   ├── lib/
│   │   ├── aamva.js                # ⭐ RE-EXPORT engine: generate/parse/validate
│   │   ├── pdf417.js               # ⭐ Render barcode PDF417 via bwip-js
│   │   ├── AuthContext.jsx         # Provider auth global (user, credits, login)
│   │   ├── query-client.js         # Konfigurasi React Query client
│   │   ├── utils.js                # Helper cn() untuk merge class Tailwind
│   │   ├── app-params.js           # Parameter app (app id, base url)
│   │   └── PageNotFound.jsx        # Halaman 404
│   │
│   ├── pages/
│   │   ├── Home.jsx                # ⭐ Halaman utama generator (form + create)
│   │   ├── Validate.jsx            # Halaman validasi & parsing payload
│   │   ├── History.jsx             # Riwayat generate & transaksi kredit
│   │   ├── Pricing.jsx             # Halaman beli paket kredit
│   │   ├── Settings.jsx            # Pengaturan user (storeRawPayloads, dll)
│   │   ├── Login.jsx               # Login (email/password + Google)
│   │   ├── Register.jsx            # Register → OTP → verify
│   │   ├── ForgotPassword.jsx      # Request reset password
│   │   └── ResetPassword.jsx       # Reset password dengan token
│   │
│   ├── components/
│   │   ├── Layout.jsx              # ⭐ Sidebar nav + content area (Outlet)
│   │   ├── ProtectedRoute.jsx      # Gate halaman yang butuh login
│   │   ├── ScrollToTop.jsx         # Scroll ke atas saat ganti route
│   │   ├── UserNotRegisteredError.jsx
│   │   ├── GoogleIcon.jsx          # Icon Google untuk tombol OAuth
│   │   ├── AuthLayout.jsx          # Wrapper layout untuk halaman auth
│   │   │
│   │   ├── aamva/
│   │   │   ├── JurisdictionSelector.jsx  # Dropdown pilih negara bagian
│   │   │   ├── ProfileSelector.jsx        # Pilih profil scanner
│   │   │   ├── FormField.jsx             # ⭐ Input field dinamis (text/select/date)
│   │   │   ├── BarcodeResult.jsx         # ⭐ Tampilkan barcode + tombol aksi
│   │   │   ├── Inspector.jsx             # Modal inspect byte-level
│   │   │   ├── TopUpModal.jsx            # Modal beli kredit
│   │   │   └── LoginPromptModal.jsx      # Modal suruh login
│   │   │
│   │   └── ui/                            # shadcn/ui components
│   │       ├── button.jsx, input.jsx, label.jsx, ...
│   │       ├── dialog.jsx, sheet.jsx, ...
│   │       ├── toast.jsx, toaster.jsx, use-toast.jsx
│   │       ├── select.jsx, dropdown-menu.jsx, ...
│   │       └── (30+ komponen shadcn lainnya)
│   │
│   ├── hooks/
│   │   ├── use-mobile.jsx          # Deteksi mobile
│   │   └── use-size.jsx            # Ukuran element
│   │
│   └── utils/
│       └── index.ts               # Helper umum (createPageUrl, dll)
│
├── base44/
│   ├── config.jsonc               # Konfigurasi app Base44
│   │
│   ├── entities/                  # Skema database (JSON)
│   │   ├── User.jsonc              # User bawaan (id, email, role, credits)
│   │   ├── GenerationHistory.jsonc # Riwayat generate barcode
│   │   └── CreditTransaction.jsonc # Riwayat transaksi kredit + RLS
│   │
│   ├── functions/                 # Backend edge functions (Deno/TypeScript)
│   │   ├── generateBarcode/
│   │   │   └── entry.ts            # ⭐ Endpoint generate barcode + deduct credit
│   │   └── topUpCredits/
│   │       └── entry.ts           # Endpoint top-up kredit via Stripe
│   │
│   ├── shared/                    # Logic bersama frontend & backend
│   │   ├── aamva.js               # ⭐ ENGINE: generatePayload, parsePayload, validate
│   │   └── jurisdictions.js       # ⭐ Data 50 state, field defs, profiles, test data
│   │
│   ├── agents/                    # Konfigurasi AI agent (jika ada)
│   └── workflows/                 # Workflow otomatis (jika ada)
│
└── .gitignore                     # File yang diabaikan git
```

### File Penting & Fungsinya

| File | Fungsi | Kapan Diedit |
|------|--------|--------------|
| `base44/shared/aamva.js` | **Engine inti** — generate, parse, validate payload AAMVA | Saat ubah logika header/separator/offset, tambah field, fix bug parsing |
| `base44/shared/jurisdictions.js` | Data 50 negara bagian (IIN, versi), definisi field, profil, generator data dummy | Saat tambah/edit state, ubah field, tambah profil scanner, ubah auto-fill |
| `src/lib/pdf417.js` | Render barcode PDF417 ke canvas via bwip-js + download PNG | Saat ubah error correction level, scale, padding |
| `src/pages/Home.jsx` | UI generator utama (form, tombol CREATE, auto-fill, hasil) | Saat ubah layout form, alur generate, tampilan hasil |
| `src/components/aamva/BarcodeResult.jsx` | Tampilan barcode hasil + tombol (download, copy, inspect, validate) | Saat ubah tampilan hasil atau tombol aksi |
| `src/components/aamva/FormField.jsx` | Render input field dinamis sesuai tipe (text/select/date) | Saat ubah cara input field ditampilkan |
| `base44/functions/generateBarcode/entry.ts` | API endpoint generate (auth, deduct credit, log history) | Saat ubah logika credit, logging, atau response |
| `index.html` | Title website, meta tag, favicon | Saat ganti judul/tab browser |

---

## Cara Kerja Generator (Alur Lengkap)

### 1. User Mengisi Form (Home.jsx)

User pilih **jurisdiction** (negara bagian) dan **profil** (Scandit/Show-Me ID/FIDScan), lalu isi form atau klik **AUTO FILL**.

`generateTestValue(fieldId, jurisdictionCode)` di `jurisdictions.js` menghasilkan data dummy realistis:
- Nama dari daftar nama AS populer
- Alamat acak (nomor + nama jalan + tipe)
- Kota sesuai negara bagian
- Tanggal lahir 1945–2000, issue date 3 tahun terakhir, expiry 4–8 tahun ke depan
- Height 60–80 inch, weight 100–250 lb
- DL number = kode state + 7 digit
- DD & ICN = hex/alphanumeric acak

### 2. Klik CREATE → `handleGenerate()`

```javascript
// Home.jsx
const res = await base44.functions.invoke('generateBarcode', {
  formData, jurisdictionCode, profileKey, options: { eclevel: 5, scale: 3 }
});
```

### 3. Backend `generateBarcode/entry.ts` (Deno)

```typescript
// 1. Verifikasi user login
const user = await base44.auth.me();

// 2. Cek kredit (≥1)
if (user.credits < 1) return Response.json({ code: 'INSUFFICIENT_CREDITS' }, { status: 403 });

// 3. Deduct 1 credit atomically
await base44.entities.User.update(user.id, { credits: user.credits - 1 });

// 4. Log transaksi
await base44.entities.CreditTransaction.create({ action: 'usage', credits: -1, ... });

// 5. Generate payload
const result = generatePayload(formData, jurisdictionCode, profileKey, options);

// 6. Log history (tanpa PII kecuali storeRawPayloads=true)
await base44.entities.GenerationHistory.create({ ... });

// 7. Return payload + metadata
return Response.json({ success: true, payload: result.payloadString, ... });
```

### 4. `generatePayload()` di `aamva.js` — Inti Engine

#### Langkah Build Header (AAMVA 2025 Annex D.12.3)

```
Byte 0:    @ (0x40)              — Compliance Indicator
Byte 1:    LF (0x0A)             — Data Element Separator
Byte 2:    RS (0x1E)             — Record Separator
Byte 3:    CR (0x0D)             — Segment Terminator
Byte 4-8:  "ANSI " (5 byte)      — File Type + trailing space
Byte 9-14: IIN (6 digit)         — mis. "636049" untuk Nevada
Byte 15-16: AAMVA Version (2)    — "10"
Byte 17-18: Jurisdiction Ver (2) — "10" (dipotong dari "1000" jadi 2 char)
Byte 19-20: Number of Entries (2)— "01"
```

Total header fixed = **21 byte**.

#### Langkah Build Subfile Designator (10 byte per subfile)

```
Byte 21-22: "DL"                 — Subfile Type
Byte 23-26: Offset (4 digit)     — "0031" (21 header + 10 designator = 31)
Byte 27-30: Length (4 digit)     — panjang subfile DL
```

#### Langkah Build DL Subfile

```
DL                    — Subfile type (2 byte)
LF + "DCS" + value    — Last Name
LF + "DAC" + value    — First Name
LF + "DAG" + value    — Address
...
LF + "DAQ" + value    — DL Number
CR                    — Segment Terminator
```

Field dipisah **LF** (`0x0A`), diakhiri **CR** (`0x0D`). Urutan field mengikuti `DEFAULT_FIELD_ORDER`.

#### Offset Calculation

```
Total Header = 21 (fixed) + 10 × numEntries (designator)
            = 21 + 10 = 31 (untuk 1 subfile)
DL Offset   = 31  ← harus 4 digit: "0031"
```

### 5. Frontend Render Barcode

`BarcodeResult.jsx` menerima `result.payload` (string dengan control chars), lalu:

```javascript
// pdf417.js
bwipjs.toCanvas(canvas, {
  bcid: 'pdf417',
  text: payloadString,   // raw string dengan LF/RS/CR
  scale: 3,
  eclevel: 5,            // error correction level 5 (tinggi)
  paddingwidth: 5,
  paddingheight: 5,
});
return canvas.toDataURL('image/png');
```

### 6. Hasil

- **Barcode PNG** ditampilkan di canvas
- **Payload string** bisa di-copy
- **Inspector** menampilkan hex, escaped, visual, dan byte map
- Tombol **VALIDATE** mengirim payload ke halaman Validate untuk di-parse ulang

---

## Struktur Payload AAMVA (Byte Map)

Untuk 1 subfile (DL only), payload total = `0031` (31 byte header) + subfile data:

```
Offset  Byte    Field
──────  ────    ──────────────────────────
0       1       @ Compliance Indicator
1       1       LF Data Element Separator
2       1       RS Record Separator
3       1       CR Segment Terminator
4       5       "ANSI " File Type
9       6       IIN (636049)
15      2       AAMVA Version (10)
17      2       Jurisdiction Version (10)
19      2       Number of Entries (01)
21      2       DL Subfile Type
23      4       DL Offset (0031)
27      4       DL Length (0xxx)
31      ...     DL Subfile Data
                DL LF DCS... LF DAC... ... LF DAQ... CR
```

### Field ID AAMVA Standar

| ID | Nama | Wajib? |
|----|------|--------|
| `DAQ` | DL Number | ✅ |
| `DCS` | Last Name (Family) | ✅ |
| `DAC` | First Name (Given) | ✅ |
| `DAD` | Middle Name | – |
| `DAG` | Address (Street) | ✅ |
| `DAI` | City | ✅ |
| `DAJ` | State (Jurisdiction) | ✅ |
| `DAK` | ZIP Code | ✅ |
| `DCG` | Country | ✅ |
| `DBB` | Birth Date (MMDDCCYY) | ✅ |
| `DBD` | Issue Date | ✅ |
| `DBA` | Expiry Date | ✅ |
| `DBC` | Sex (1=Male, 2=Female, 9=Unspecified) | ✅ |
| `DAU` | Height (NN IN) | – |
| `DDB` | Weight (NNN LBS) | – |
| `DAY` | Eye Color | – |
| `DAZ` | Hair Color | – |
| `DCE` | DL Class | – |
| `DAR` | Restrictions | – |
| `DAS` | Endorsement | – |
| `DCF` | Document Discriminator (DD) | – |
| `DCK` | Inventory Control Number (ICN) | – |
| `DDJ` | Organ Donor | – |

---

## Menjalankan di Lokal

### Prasyarat

1. **Node.js** ≥ 18
2. **npm** ≥ 9
3. **Base44 CLI** (opsional, untuk dev backend lokal): `npm install -g base44@latest`

### Langkah

```bash
# 1. Clone repository
git clone <repo-url>
cd tracecode-site

# 2. Install dependency
npm install

# 3a. Jalankan frontend saja (pakai backend hosted Base44)
npm run dev
# → Buka URL yang Vite cetak (biasanya http://localhost:5173)

# 3b. ATAU jalankan full-stack (frontend + backend lokal Base44)
base44 dev
# → Backend lokal jalan + frontend otomatis start
```

### Konfigurasi `.env.local` (untuk frontend-only dev)

Buat file `.env.local` di root project:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

- `VITE_BASE44_APP_ID` — ID app Base44 (ada di dashboard Base44)
- `VITE_BASE44_APP_BASE_URL` — URL backend Base44 tempat request `/api` dikirim

> Jika pakai `base44 dev`, variabel ini di-inject otomatis — `.env.local` tidak perlu.

---

## Build untuk Produksi

```bash
# Build static files ke folder dist/
npm run build

# Preview build secara lokal
npm run preview
```

Output build ada di `dist/` — file static yang bisa di-host di mana saja (Vercel, Netlify, GitHub Pages, dll).

> **Publish via Base44:** Setelah push ke git, buka dashboard Base44 lalu publish dari UI. Base44 handle hosting, SSL, dan deploy otomatis.

```bash
base44 dashboard open
```

---

## Push ke Git / GitHub

### Setup Awal (jika belum)

```bash
# Inisialisasi git (jika belum)
git init

# Hubungkan ke remote GitHub
git remote add origin https://github.com/username/tracecode-site.git

# Verifikasi remote
git remote -v
```

### Workflow Push Sehari-hari

```bash
# 1. Lihat status perubahan
git status

# 2. Stage semua perubahan
git add .

# 3. Commit dengan pesan deskriptif
git commit -m "feat: hapus badge TEST DATA, fix offset AAMVA header"
# atau
git commit -m "fix: truncate jurisdictionVersion ke 2 digit di header"
git commit -m "docs: update README dengan dokumentasi lengkap"

# 4. Push ke GitHub
git push origin main
# atau jika branch utama bernama master:
git push origin master
```

### Branch & Pull Request (untuk tim)

```bash
# Buat branch baru untuk fitur
git checkout -b feat/nama-fitur

# Kerjakan, commit, push branch
git push -u origin feat/nama-fitur

# Buat Pull Request di GitHub → review → merge
git checkout main
git pull origin main
git branch -d feat/nama-fitur   # hapus branch lokal setelah merge
```

### Sinkronisasi dengan Base44 Builder

> Setiap perubahan yang di-push ke repo akan otomatis **ter-sync** dengan Base44 Builder (2-way sync).  
> Begitu juga sebaliknya — perubahan yang dibuat di Builder akan ter-push ke repo.

Jadi workflow-nya:
1. Edit kode di lokal (VS Code / editor apa pun)
2. `git push`
3. Perubahan langsung muncul di Base44 Builder
4. Publish lewat dashboard saat siap

---

## Membuat Generator Baru dengan Python

Jika ingin membuat generator AAMVA PDF417 **mandiri** dengan Python (tanpa Base44), berikut panduan lengkapnya.

### Library Python yang Dibutuhukan

```bash
pip install pdf417 pdf417gen pillow
```

| Library | Fungsi |
|---------|--------|
| `pdf417gen` | Encode teks → barcode PDF417 (matrix) |
| `pillow` (PIL) | Render matrix barcode ke gambar PNG |
| (opsional) `treepoem` | Alternatif generator barcode berbasis BWIPP |

### Struktur Project Python

```
aamva-pdf417-py/
├── aamva/
│   ├── __init__.py
│   ├── generator.py       # Generate payload AAMVA
│   ├── jurisdictions.py   # Data 50 state + IIN
│   ├── fields.py          # Definisi field ID
│   └── barcode.py         # Render PDF417 ke PNG
├── main.py                # CLI / entry point
├── requirements.txt
└── README.md
```

### Kode: `aamva/jurisdictions.py`

```python
# Data 50 negara bagian AS + DC
JURISDICTIONS = {
    "NV": {"name": "Nevada",         "iin": "636049", "aamva_ver": "10", "jur_ver": "10"},
    "CA": {"name": "California",     "iin": "636014", "aamva_ver": "10", "jur_ver": "10"},
    "TX": {"name": "Texas",          "iin": "636015", "aamva_ver": "10", "jur_ver": "09"},
    "FL": {"name": "Florida",        "iin": "636010", "aamva_ver": "10", "jur_ver": "09"},
    "NY": {"name": "New York",       "iin": "636001", "aamva_ver": "10", "jur_ver": "10"},
    # ... tambah sisanya sesuai data AAMVA
}

def get_jurisdiction(code):
    return JURISDICTIONS.get(code, JURISDICTIONS["NV"])
```

### Kode: `aamva/generator.py`

```python
# Karakter kontrol AAMVA (byte literal)
LF = b'\x0a'   # Line Feed — Data Element Separator
RS = b'\x1e'   # Record Separator
CR = b'\x0d'   # Carriage Return — Segment Terminator

def generate_payload(data, jurisdiction_code):
    """
    Generate payload AAMVA 2025 (Annex D.12.3) sebagai bytes.
    
    data: dict berisi field value, mis:
        {
            "DCS": "SMITH", "DAC": "JOHN", "DAG": "123 MAIN ST",
            "DAI": "LAS VEGAS", "DAJ": "NV", "DAK": "89101",
            "DCG": "USA", "DBB": "01151985", "DBD": "07242023",
            "DBA": "07242031", "DBC": "1", "DAU": "70 IN",
            "DAY": "BRO", "DAZ": "BRO", "DAQ": "NV1234567"
        }
    """
    jur = get_jurisdiction(jurisdiction_code)
    
    # Urutan field AAMVA standar untuk DL subfile
    FIELD_ORDER = [
        "DCS", "DDE", "DAC", "DDF", "DAD", "DDG", "DCU",
        "DAG", "DAI", "DAJ", "DAK", "DCG",
        "DBB", "DBD", "DBA", "DBC", "DAU", "DDB", "DAY", "DAZ",
        "DCE", "DAR", "DAS", "DCF", "DCK", "DDJ", "DAQ",
    ]
    
    # Build DL subfile bytes
    dl_bytes = b"DL"
    for field_id in FIELD_ORDER:
        value = data.get(field_id, "")
        if not value:
            continue
        # Normalize: uppercase semua kecuali field tertentu
        value = normalize_value(field_id, value)
        dl_bytes += LF + field_id.encode("ascii") + value.encode("latin1")
    dl_bytes += CR  # Segment terminator di akhir
    
    dl_length = len(dl_bytes)
    
    # Build header
    num_entries = 1
    header_fixed = b"@" + LF + RS + CR + b"ANSI "  # 9 byte
    header_fixed += jur["iin"].encode("ascii")     # 6 byte
    header_fixed += jur["aamva_ver"].encode("ascii")  # 2 byte
    header_fixed += jur["jur_ver"].encode("ascii")   # 2 byte
    header_fixed += str(num_entries).zfill(2).encode("ascii")  # 2 byte
    
    # Designator: TYPE(2) + OFFSET(4) + LENGTH(4) = 10 byte
    total_header = len(header_fixed) + 10 * num_entries
    dl_offset = total_header
    
    designator = b"DL"
    designator += str(dl_offset).zfill(4).encode("ascii")
    designator += str(dl_length).zfill(4).encode("ascii")
    
    # Assemble
    payload = header_fixed + designator + dl_bytes
    return payload


def normalize_value(field_id, value):
    """Normalisasi value sesuai aturan AAMVA."""
    v = str(value).strip().upper()
    
    if field_id in ("DBB", "DBD", "DBA"):
        # Date: pastikan MMDDCCYY (8 digit)
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) == 6:  # MMDDYY → MMDDCCYY
            yy = int(digits[4:])
            cc = "20" if yy < 50 else "19"
            digits = digits[:4] + cc + digits[4:]
        return digits
    if field_id == "DAU":
        # Height: format "NN IN"
        inches = "".join(c for c in v if c.isdigit())
        return f"{inches} IN"
    if field_id == "DDB":
        # Weight: format "NNN LBS"
        lbs = "".join(c for c in v if c.isdigit())
        return f"{lbs} LBS"
    if field_id == "DAJ":
        return v[:2]  # State: 2 letter
    if field_id == "DCG":
        if v in ("UNITED STATES", "US"):
            return "USA"
        return v[:3]
    return v


# Contoh penggunaan
if __name__ == "__main__":
    from aamva.jurisdictions import get_jurisdiction
    
    data = {
        "DCS": "SMITH", "DAC": "JOHN", "DAG": "123 MAIN ST",
        "DAI": "LAS VEGAS", "DAJ": "NV", "DAK": "89101",
        "DCG": "USA", "DBB": "01151985", "DBD": "07242023",
        "DBA": "07242031", "DBC": "1", "DAU": "70",
        "DAY": "BRO", "DAZ": "BRO", "DAQ": "NV1234567",
    }
    
    payload_bytes = generate_payload(data, "NV")
    print("Payload length:", len(payload_bytes), "bytes")
    print("Hex:", payload_bytes.hex(" "))
    print("Repr:", repr(payload_bytes))
```

### Kode: `aamva/barcode.py`

```python
import pdf417gen
from PIL import Image

def render_barcode(payload_bytes, filename="barcode.png", scale=3, eclevel=5):
    """
    Render payload bytes menjadi PNG barcode PDF417.
    
    Args:
        payload_bytes: bytes — payload AAMVA
        filename: str — nama file output
        scale: int — ukuran pixel per module (default 3)
        eclevel: int — error correction level 0-8 (default 5 = tinggi)
    """
    # pdf417gen butuh string, decode bytes dengan latin1 untuk preserve control chars
    payload_str = payload_bytes.decode("latin1")
    
    # Encode ke codewords
    codes = pdf417gen.encode(
        payload_str,
        error_correction_level=eclevel,  # 0-8, makin tinggi makin tahan error
    )
    
    # Render ke matrix
    image = pdf417gen.render_image(
        codes,
        scale=scale,          # pixel per module
        ratio=3,               # aspect ratio bar
        padding=5,             # padding border
        monochrome=True,       # hitam-putih
    )
    
    image.save(filename, "PNG")
    print(f"Barcode saved to {filename}")
    return filename


# Contoh
if __name__ == "__main__":
    from aamva.generator import generate_payload
    
    data = {
        "DCS": "SMITH", "DAC": "JOHN", "DAG": "123 MAIN ST",
        "DAI": "LAS VEGAS", "DAJ": "NV", "DAK": "89101",
        "DCG": "USA", "DBB": "01151985", "DBD": "07242023",
        "DBA": "07242031", "DBC": "1", "DAQ": "NV1234567",
    }
    
    payload = generate_payload(data, "NV")
    render_barcode(payload, "test_barcode.png", scale=3, eclevel=5)
```

### Kode: `main.py` (CLI)

```python
#!/usr/bin/env python3
"""
CLI untuk generate AAMVA PDF417 barcode.

Usage:
    python main.py --state NV --output barcode.png
    python main.py --state NV --auto-fill --output barcode.png
    python main.py --payload "raw_payload_string" --output barcode.png
"""
import argparse
import json
import random
import string
from aamva.generator import generate_payload
from aamva.barcode import render_barcode
from aamva.jurisdictions import get_jurisdiction


def auto_fill_data(state_code):
    """Generate data dummy realistis untuk testing."""
    first_names = ["JAMES", "JOHN", "ROBERT", "MICHAEL", "WILLIAM"]
    last_names = ["SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES"]
    streets = ["MAIN", "OAK", "MAPLE", "ELM", "CEDAR"]
    street_types = ["ST", "AVE", "BLVD", "DR", "RD"]
    
    year = random.randint(1945, 2000)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    birth = f"{month:02d}{day:02d}{year}"
    
    issue_year = 2023
    expiry_year = 2031
    
    return {
        "DCS": random.choice(last_names),
        "DAC": random.choice(first_names),
        "DAG": f"{random.randint(100, 9999)} {random.choice(streets)} {random.choice(street_types)}",
        "DAI": "LAS VEGAS" if state_code == "NV" else "ANYTOWN",
        "DAJ": state_code,
        "DAK": str(random.randint(10000, 99999)),
        "DCG": "USA",
        "DBB": birth,
        "DBD": f"0724{issue_year}",
        "DBA": f"0724{expiry_year}",
        "DBC": random.choice(["1", "2"]),
        "DAU": f"{random.randint(60, 80)} IN",
        "DAY": random.choice(["BRO", "BLU", "GRN", "HAZ"]),
        "DAZ": random.choice(["BLK", "BRO", "BLD"]),
        "DAQ": state_code + str(random.randint(1000000, 9999999)),
    }


def main():
    parser = argparse.ArgumentParser(description="AAMVA PDF417 Barcode Generator")
    parser.add_argument("--state", default="NV", help="Jurisdiction code (default: NV)")
    parser.add_argument("--output", "-o", default="barcode.png", help="Output PNG filename")
    parser.add_argument("--auto-fill", action="store_true", help="Generate dummy data")
    parser.add_argument("--data", type=str, help="JSON string of field data")
    parser.add_argument("--eclevel", type=int, default=5, help="Error correction level 0-8")
    parser.add_argument("--scale", type=int, default=3, help="Scale (pixels per module)")
    args = parser.parse_args()
    
    # Ambil data
    if args.data:
        data = json.loads(args.data)
    elif args.auto_fill:
        data = auto_fill_data(args.state)
    else:
        # Interactive input
        data = {}
        data["DCS"] = input("Last Name: ").upper()
        data["DAC"] = input("First Name: ").upper()
        data["DAG"] = input("Address: ").upper()
        data["DAI"] = input("City: ").upper()
        data["DAJ"] = args.state
        data["DAK"] = input("ZIP: ")
        data["DCG"] = "USA"
        data["DBB"] = input("Birth Date (MMDDYYYY): ")
        data["DBD"] = input("Issue Date (MMDDYYYY): ")
        data["DBA"] = input("Expiry Date (MMDDYYYY): ")
        data["DBC"] = input("Sex (1=M, 2=F): ")
        data["DAQ"] = input("DL Number: ").upper()
    
    # Generate
    payload = generate_payload(data, args.state)
    print(f"\nPayload: {len(payload)} bytes")
    print(f"Header: ANSI {get_jurisdiction(args.state)['iin']}{get_jurisdiction(args.state)['aamva_ver']}{get_jurisdiction(args.state)['jur_ver']}01")
    print(f"DL Offset: 0031")
    
    # Render barcode
    render_barcode(payload, args.output, scale=args.scale, eclevel=args.eclevel)
    print(f"\n✅ Barcode saved: {args.output}")


if __name__ == "__main__":
    main()
```

### Cara Pakai Python Generator

```bash
# 1. Install dependency
pip install pdf417gen pillow

# 2. Auto-fill data dummy
python main.py --state NV --auto-fill --output nv_barcode.png

# 3. Input manual interaktif
python main.py --state CA --output ca_barcode.png

# 4. Lewat JSON
python main.py --state TX --data '{"DCS":"DOE","DAC":"JANE","DAJ":"TX","DAQ":"TX123","DCG":"USA"}' --output tx.png

# 5. Custom error correction & scale
python main.py --state NY --auto-fill --eclevel 8 --scale 5 --output ny_hires.png
```

### Catatan Penting Python

1. **`pdf417gen`** butuh payload sebagai **string**, bukan bytes. Decode dengan `latin1` agar control character (`\x0a`, `\x1e`, `\x0d`) tidak rusak.
2. **Error correction level** 5–8 direkomendasikan untuk barcode yang akan di-scan di kondisi sulit.
3. **Scale** ≥ 3 untuk hasil yang bisa di-scan scanner biasa; scale 5+ untuk print fisik.
4. **Encoding** selalu `latin1` / `ascii` — **jangan UTF-8** karena akan merusak byte control character.

---

## Cara Pakai & Edit Aplikasi

### Mengganti Judul Website

Edit `index.html`:

```html
<title>TraceCode Site</title>
```

### Mengganti Warna Tema

Edit `src/index.css` — ubah nilai CSS variable di `:root` dan `.dark`:

```css
:root {
  --accent: 142 100% 50%;  /* Ubah hue/saturation/lightness di sini */
  --background: 0 0% 2%;   /* Background utama */
}
```

### Menambah / Mengubah Negara Bagian

Edit `base44/shared/jurisdictions.js` — array `JURISDICTIONS`:

```javascript
{ name: 'Nevada', code: 'NV', iin: '636049', aamvaVersion: '10',
  jurisdictionVersion: '1000', revision: 'Rev. 05/24/2021 (1000)', includeZk: false },
```

> ⚠️ `jurisdictionVersion` disimpan 4 digit, tapi saat build header hanya 2 digit pertama yang dipakai (dipotong otomatis).

### Menambah Field Baru

1. Tambah definisi di `base44/shared/jurisdictions.js` → `STANDARD_FIELDS`:

```javascript
DZZ: { fieldId: 'DZZ', label: 'Custom Field', name: 'customField',
       type: 'text', required: false, maxLength: 20, row: 4 },
```

2. Tambah field ID ke `DEFAULT_FIELD_ORDER` array.
3. (Opsional) Tambah generator data dummy di `generateTestValue()`.
4. (Opsional) Tambah normalisasi di `normalizeValue()` di `aamva.js`.

### Menambah Profil Scanner

Edit `base44/shared/jurisdictions.js` → `PROFILES`:

```javascript
custom: {
  key: 'custom',
  name: 'Custom Scanner',
  eclevel: 5,
  description: 'Profil custom',
  requiredFields: ['DAQ', 'DCS', 'DAC', 'DBB', 'DBA'],
},
```

### Mengubah Error Correction / Scale Barcode

Edit `src/pages/Home.jsx` — `handleGenerate()`:

```javascript
const res = await base44.functions.invoke('generateBarcode', {
  formData, jurisdictionCode: jurisdiction, profileKey: profile,
  options: { eclevel: 8, scale: 5 },  // ← ubah di sini
});
```

Atau edit `src/lib/pdf417.js` untuk default value.

### Mengubah Credit per Generate

Edit `base44/functions/generateBarcode/entry.ts`:

```typescript
if (userCredits < 1) { ... }       // ← ubah angka minimum
const newBalance = userCredits - 1;  // ← ubah biaya
```

### Mengaktifkan Simpan Raw Payload

User bisa toggle di halaman Settings (`storeRawPayloads`). Saat `true`, raw payload disimpan di `GenerationHistory.rawPayload`.

---

## Troubleshooting

### Barcode Tidak Terdeteksi Scanner

1. **Cek offset** — harus `0031` untuk 1 subfile. Jika `0033`, berarti header terlalu panjang (jurisdictionVersion tidak terpotong ke 2 digit).
2. **Cek separator** — field dalam subfile harus dipisah `LF` (`0x0A`), bukan `RS`.
3. **Cek segment terminator** — subfile harus diakhiri `CR` (`0x0D`).
4. **Cek error correction** — gunakan `eclevel ≥ 5`.
5. **Cek scale** — gunakan `scale ≥ 3` untuk scan fisik.

### Error "Invalid number of entries"

Terjadi saat `numEntries` diparse sebagai `"00"`. Fix: pastikan `numEntries` diformat 2 digit dengan `padStart(2, '0')` → `"01"`.

### Control Character Hilang / Berubah

Pastikan encoding pakai **`latin1`** (bukan UTF-8). Di JavaScript:

```javascript
const decoder = new TextDecoder('latin1');  // ✅ benar
// BUKAN: new TextDecoder('utf-8')          // ❌ merusak RS/CR
```

### Credit Tidak Berkurang Setelah Generate

Cek `base44/functions/generateBarcode/entry.ts` — pastikan `base44.entities.User.update(user.id, { credits: newBalance })` berhasil dieksekusi sebelum generate payload.

### Admin Tidak Bisa Menambah Credit

Untuk backend Supabase, penyesuaian saldo memakai RPC `admin_adjust_user_credits`. Jalankan SQL di `supabase/init.sql` sekali melalui **Supabase Dashboard → SQL Editor** setelah memperbarui project. RPC memeriksa `public.users.role = 'admin'` di database dan memperbarui saldo secara atomik, termasuk untuk akun admin yang sedang login. Tanpa fungsi ini, frontend akan menampilkan error dari Supabase dan saldo tidak berubah.

Setelah SQL berhasil dijalankan, refresh halaman Admin dan coba tambahkan bilangan bulat positif. Jika ditolak, pastikan baris akun admin di `public.users` memiliki `role` bernilai persis `admin`; response/error yang sebenarnya akan tampil di halaman Admin.

### Frontend Tidak Connect ke Backend

Cek `.env.local`:

```bash
VITE_BASE44_APP_ID=<benar>
VITE_BASE44_APP_BASE_URL=https://<benar>.base44.app
```

Atau gunakan `base44 dev` untuk auto-inject.

---

## Disclaimer

Aplikasi ini dibuat untuk **tujuan edukasi, testing, dan development** — menguji pembacaan barcode AAMVA, validasi parser, dan simulasi data. 

**PENGGUNAAN untuk memalsukan dokumen identitas, menipu, atau aktivitas ilegal apa pun adalah PELANGGARAN HUKUM dan sepenuhnya di luar tanggung jawab pembuat aplikasi ini.** Generator ini menghasilkan data sintetis/(dummy), bukan dokumen resmi.

---

**Dibangun dengan Base44 · AAMVA 2025 Standard · PDF417**