# Panduan Setup Payment Trakteer

Panduan ini menjelaskan setup pembayaran TraceCode dengan **Supabase Dashboard saja**;
Supabase CLI tidak diperlukan. SQL schema sudah dijalankan pada project Supabase. Ikuti
langkah deploy dua Edge Functions, simpan token webhook dengan aman, lalu tes pembayaran
sampai credits tercatat.

## Hasil yang akan disiapkan

- Paket yang tersedia: **$5 untuk 2 credits**.
- Unit Trakteer: **`2 Barcode`**, harga **Rp100.000 per unit**.
- Customer login, membuka `/pricing`, lalu membuat order.
- Aplikasi menampilkan kode referensi unik untuk order itu.
- Customer menyalin kode tersebut ke kolom pesan dukungan (`supporter_message`) saat
  membayar melalui halaman Trakteer.
- Webhook memverifikasi kode, unit, quantity, harga, dan transaction ID sebelum
  menambah 2 credits.

> Jangan memberikan credits secara manual hanya berdasarkan screenshot atau test event.
> Saldo hanya berubah setelah webhook menemukan order dan pembayaran cocok.

## 1. Pastikan project Supabase yang digunakan benar

Semua komponen harus menggunakan **project Supabase yang sama**: database tempat SQL
dijalankan, Edge Functions, secrets, dan konfigurasi frontend.

1. Buka Supabase Dashboard dan pilih project yang benar.
2. Catat **Project URL** dan **Project Ref/Project ID** dari halaman project/API settings.
   Contoh URL: `https://PROJECT_REF.supabase.co`.
3. Buka **Project Settings → API Keys** (atau halaman API settings pada dashboard).
   Siapkan **publishable/anon key** untuk frontend. Key ini boleh digunakan di browser
   dengan RLS aktif.
4. Pastikan konfigurasi build website mengarah ke Project URL dan key tersebut:

   ```dotenv
   VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=SUPABASE_PUBLISHABLE_ATAU_ANON_KEY
   ```

   Untuk development lokal, taruh nilai ini di `.env.local` di root repo, restart
   `npm run dev`, lalu buka ulang aplikasi. Untuk production, set environment variable
   pada dashboard hosting/Base44 yang menjalankan frontend, lalu rebuild/re-publish.

   Jangan gunakan `service_role` key sebagai `VITE_...` value. Jangan commit `.env.local`.

## 2. Deploy `create-trakteer-order` dari Dashboard

Function ini hanya dipanggil aplikasi setelah user login. Function memvalidasi sesi
Supabase, membuat order berstatus `pending`, lalu mengembalikan kode order.

1. Di Supabase Dashboard, pilih project → **Edge Functions**.
2. Klik **Deploy a new function** → **Via Editor**.
3. Isi nama function: **`create-trakteer-order`**.
4. Di repo, buka
   [`supabase/functions/create-trakteer-order/index.ts`](./supabase/functions/create-trakteer-order/index.ts),
   salin **seluruh file**, lalu ganti template di editor Dashboard dengan isinya.
5. Biarkan **Verify JWT** aktif untuk function ini. Hanya user yang sudah login yang
   boleh membuat order miliknya sendiri.
6. Klik **Deploy function** dan tunggu sampai deployment sukses.

Function ini menggunakan konfigurasi project Supabase secara otomatis dan membuat
reference acak seperti `TC-0123456789ABCDEF...`. Reference di aplikasi contoh saja;
selalu gunakan kode yang dibuat dari order aktual.

## 3. Deploy `trakteer-webhook` dari Dashboard

Function webhook dipanggil server Trakteer, bukan browser customer.

1. Masih di **Edge Functions**, pilih **Deploy a new function** → **Via Editor**.
2. Isi nama function: **`trakteer-webhook`**.
3. Di repo, buka
   [`supabase/functions/trakteer-webhook/index.ts`](./supabase/functions/trakteer-webhook/index.ts),
   salin seluruh file, lalu ganti template di editor.
4. Matikan **Verify JWT** untuk function ini. Trakteer tidak mengirim JWT Supabase;
   function memeriksa header `X-Webhook-Token` sendiri.
5. Deploy function. Jika sudah ada function dengan nama ini, edit function tersebut dan
   pilih **Deploy updates**. Pastikan yang dipasang adalah kode webhook di file ini,
   bukan kode `create-trakteer-order`.

URL webhook yang dipakai nanti:

```text
https://PROJECT_REF.supabase.co/functions/v1/trakteer-webhook
```

## 4. Simpan webhook token sebagai Supabase secret

Token harus sama antara pengaturan webhook Trakteer dan secret di Supabase.

1. Jika token lama pernah dibagikan atau masuk ke chat, **buat/rotasi token baru di
   Trakteer** sebelum production.
2. Di Supabase Dashboard, buka **Edge Functions → Secrets** (letaknya dapat tampil di
   halaman Edge Functions atau Project Settings).
3. Tambah secret dengan nama persis **`TRAKTEER_WEBHOOK_TOKEN`** dan isi value dengan
   token baru dari Trakteer.
4. Simpan perubahan. Jangan masukkan token ini ke frontend, `VITE_...`, source code,
   dokumentasi, screenshot, atau Git.
5. Jika secret dibuat setelah webhook function dideploy dan function belum membaca
   secret tersebut, deploy ulang `trakteer-webhook`.

Jangan membuat secret bernama `VITE_TRAKTEER_WEBHOOK_TOKEN`: prefix `VITE_` berarti nilai
akan dikirim ke browser, sehingga tidak aman.

## 5. Atur unit pada halaman kreator Trakteer

Di halaman kreator Trakteer, buka pengaturan unit/dukungan (nama menu mungkin berbeda
sesuai tampilan akun), lalu pastikan:

| Pengaturan | Nilai |
|---|---|
| Nama unit | `2 Barcode` |
| Harga per unit | `Rp100.000` |
| Quantity untuk paket aplikasi | `1` |

Nama unit harus cocok persis. Jangan rename unit atau mengubah harga tanpa memperbarui
validasi order di database/function dan menguji ulang pembayaran.

## 6. Pasang URL dan token webhook di Trakteer

1. Di Trakteer, buka **Integrasi → Webhook**.
2. Masukkan URL:

   ```text
   https://PROJECT_REF.supabase.co/functions/v1/trakteer-webhook
   ```

3. Isi/set webhook token dengan token yang sama yang disimpan pada secret
   `TRAKTEER_WEBHOOK_TOKEN`.
4. Trakteer harus mengirim token melalui header bernama **`X-Webhook-Token`**. Header
   names tidak case-sensitive, tetapi ejaan nama header harus benar.
5. Aktifkan event **tip** dan simpan pengaturan.
6. Gunakan tombol test webhook Trakteer. Test mengirim notifikasi contoh, bukan
   pembayaran/order yang dibuat dari aplikasi.

Respons `200 OK` dengan `{"success":true,"ignored":true,"reason":"unknown_order"}` pada
test webhook berarti endpoint menerima request dan token lolos, tetapi reference pada
payload test tidak ada di tabel order. Itu respons normal untuk test tersebut dan tidak
menambah credits. **Jangan mengharapkan test webhook menambah saldo.**

## 7. Uji pembelian end-to-end

Lakukan transaksi uji dengan akun customer yang dapat login ke aplikasi:

1. Buka website pada project production/staging yang sudah dikonfigurasi ke Supabase
   yang sama.
2. Login lalu buka `/pricing`.
3. Pilih paket **$5 / 2 credits** dan klik **Buat kode & lanjut bayar**.
4. Jika berhasil, aplikasi menampilkan kode order. Jika gagal, jangan lanjut membayar;
   periksa troubleshooting di bawah.
5. Klik **Buka Trakteer**. Pilih unit `2 Barcode`, quantity `1`, dengan nilai
   Rp100.000.
6. Paste kode order dari aplikasi **persis** ke kolom pesan dukungan/supporter message.
   Pastikan tidak ada karakter yang hilang atau tertukar. Jangan gunakan kode order lama
   atau milik customer lain.
7. Selesaikan pembayaran dan tunggu sampai Trakteer mengirim event webhook.
8. Di Supabase Dashboard → **Table Editor**, periksa:
   - `trakteer_orders`: reference yang dipakai berubah menjadi `completed` dan memiliki
     `trakteer_transaction_id`.
   - `credit_transactions`: terdapat transaksi `topup` sebanyak `2` credits, provider
     `trakteer`.
   - `users`: saldo `credits` pemilik order bertambah 2.
9. Customer dapat refresh aplikasi atau login ulang untuk melihat saldo terbaru.

Satu pembayaran yang dikirim ulang oleh Trakteer aman untuk diproses ulang: transaksi
yang sudah sukses tidak akan menambah credits lagi.

## 8. Membaca respons webhook

| Respons | Arti | Tindakan |
|---|---|---|
| `200`, `status: processed` | Pembayaran cocok dan credits sudah ditambahkan | Pastikan tabel dan saldo berubah |
| `200`, `status: already_processed` | Webhook transaksi yang sama dikirim lagi | Normal; tidak ada credits tambahan |
| `200`, `reason: unknown_order` | Reference kosong/tidak cocok dengan order tersimpan | Untuk test webhook normal; untuk pembayaran nyata cocokkan supporter message dengan `reference` |
| `200`, `reason: incomplete_or_test_event` | Payload test/transaksi tidak memuat field wajib | Normal untuk test; uji dengan pembayaran nyata |
| `200`, `reason: payment_mismatch` | Nama unit, quantity, atau harga tidak sesuai order | Pastikan `2 Barcode`, quantity `1`, Rp100.000 |
| `401 Unauthorized` | Header token hilang/tidak sama | Samakan token Trakteer dan secret Supabase; pastikan header `X-Webhook-Token` |
| `401 Authentication required` | Biasanya kode order function tertempel di webhook, atau Verify JWT belum OFF | Pasang kode webhook yang benar dan matikan Verify JWT hanya di function webhook |
| `500 Webhook is not configured` | Secret atau konfigurasi Supabase function tidak tersedia | Pastikan secret `TRAKTEER_WEBHOOK_TOKEN` dan deploy ulang |
| `500 Webhook processing failed` | Pemrosesan database/function gagal | Buka Edge Function logs dan cek schema/RPC sudah diterapkan |

## 9. Troubleshooting pembuatan kode order

Jika klik **Buat kode & lanjut bayar** menghasilkan error:

- **`Authentication required`**: pastikan customer benar-benar login. Function
  `create-trakteer-order` perlu Verify JWT aktif dan harus menerima sesi Supabase yang
  valid dari aplikasi.
- **`Payment service is not configured`**: periksa deployment dan konfigurasi Edge
  Functions pada project yang dipakai aplikasi.
- **`Could not create payment order`**: buka
  **Edge Functions → `create-trakteer-order` → Logs**. Periksa bahwa SQL sudah dijalankan
  pada project ini dan tabel `trakteer_orders` tersedia.
- Order berhasil dibuat tetapi webhook membalas `unknown_order`: periksa bahwa frontend,
  webhook, dan database menggunakan Project Ref yang sama; kemudian cek apakah reference
  yang ditempel di Trakteer identik dengan row berstatus `pending` di `trakteer_orders`.

## Catatan keamanan

- Publishable/anon key frontend boleh digunakan di browser karena tabel dilindungi RLS.
- **Jangan pernah membagikan atau mengekspos `service_role` key**; key tersebut melewati
  RLS. Function memakai secret runtime Supabase di server.
- Token webhook hanya disimpan di Supabase Secrets dan Trakteer, tidak di source/Git.
- Endpoint legacy Base44 untuk top-up langsung dinonaktifkan. Jangan aktifkan kembali
  mekanisme yang memberi credits tanpa pembayaran webhook terverifikasi.
- Panduan resmi Trakteer: [Panduan Webhook](https://help.trakteer.id/help-center/articles/70/panduan-webhook).
- Panduan Dashboard Supabase: [Edge Functions via Dashboard](https://supabase.com/docs/guides/functions/quickstart-dashboard).
