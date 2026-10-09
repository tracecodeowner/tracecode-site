# Trakteer Webhook Setup Guide

## Overview

Trakteer webhook akan mengirim notifikasi pembayaran ke backend kita. Setelah pembayaran dikonfirmasi, credit otomatis ditambahkan ke user account.

---

## Step 1: Dapatkan Webhook Token dari Trakteer

1. Login ke Trakteer dashboard: https://trakteer.id/dashboard
2. Masuk ke **Settings** → **API/Webhook**
3. Cari **Webhook Token** atau **Secret Key**
4. Copy token tersebut

---

## Step 2: Setup Environment Variable

### Local Development (.env.local)

```bash
VITE_BASE44_WEBHOOK_TOKEN=trhook-cbk1qlJWKCABAy5970ilqXXG
```

Atau untuk backend, update `.env` di project root atau configure via Base44 dashboard.

---

## Step 3: Testing Locally dengan ngrok

Untuk test webhook di localhost, gunakan **ngrok** (expose local server ke internet).

### Install ngrok
```bash
# Via choco (Windows)
choco install ngrok

# Atau download dari https://ngrok.com/download
```

### Setup ngrok
```bash
# Daftar akun gratis di https://ngrok.com
# Dapatkan auth token dari dashboard

ngrok config add-authtoken YOUR_NGROK_TOKEN
```

### Run ngrok tunnel ke localhost:5173 (frontend) atau 4400 (Base44 backend)
```bash
# Frontend dev server
ngrok http 5173

# Atau untuk webhook function lokal (Base44 backend)
ngrok http 4400
```

Output akan seperti:
```
Forwarding                    https://abc123.ngrok.io -> http://localhost:4400
```

---

## Step 4: Configure Webhook URL di Trakteer

1. Login ke **Trakteer Dashboard** → **Settings** → **Webhook**
2. **Webhook URL**: 
   ```
   https://YOUR_BASE44_APP_ID.base44.app/api/functions/trakteerWebhook
   ```
   
   **Atau untuk local testing:**
   ```
   https://abc123.ngrok.io/api/functions/trakteerWebhook
   ```
   > Jika Base44 local backend aktif, gunakan URL ngrok yang memproksikan port 4400. Jika endpoint masih 404, pastikan Base44 backend sedang berjalan dan fungsi `trakteerWebhook` sudah ter-load.

3. **Webhook Token/Secret**: Paste token dari step 1
4. **Events**: Pilih `payment.completed`
5. **Save**

---

## Step 5: Test Webhook

### Manual Test via cURL

```bash
# Dari terminal (sesuaikan URL & token)
curl -X POST https://abc123.ngrok.io/api/functions/trakteerWebhook \
  -H "Content-Type: application/json" \
  -H "x-trakteer-token: trhook-cbk1qlJWKCABAy5970ilqXXG" \
  -d '{
    "invoiceId": "test-invoice-123",
    "status": "completed",
    "amount": 50000,
    "email": "your-test-email@example.com",
    "name": "Test User",
    "paymentMethod": "gopay",
    "completedDate": "2026-07-24T12:00:00Z"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook processed",
  "invoiceId": "test-invoice-123",
  "email": "your-test-email@example.com"
}
```

### Check user credits
1. Login ke app sebagai user tersebut
2. Verifikasi credits bertambah
3. Check History untuk melihat transaction record

---

## Step 6: Deploy ke Production

Ketika ready untuk production:

1. **Add Environment Variable di Base44 Dashboard:**
   - Go to Settings → Environment Variables
   - Add: `TRAKTEER_WEBHOOK_TOKEN = trhook-cbk1qlJWKCABAy5970ilqXXG`

2. **Update Webhook URL di Trakteer:**
   ```
   https://tracecode-prod.base44.app/api/functions/trakteerWebhook
   ```

3. **Test webhook di production:**
   ```bash
   # Gunakan production URL, bukan ngrok
   curl -X POST https://tracecode-prod.base44.app/api/functions/trakteerWebhook \
     -H "Content-Type: application/json" \
     -H "x-trakteer-token: trhook-cbk1qlJWKCABAy5970ilqXXG" \
     -d '{ ... }'
   ```

---

## Troubleshooting

### Webhook tidak terima callback
- ✅ Pastikan ngrok tunnel aktif (jika local)
- ✅ Pastikan webhook token benar di Trakteer settings
- ✅ Check Base44 logs: `base44 logs function trakteerWebhook`

### Credit tidak bertambah
- ✅ Pastikan email di payload sesuai dengan user di database
- ✅ Check database: buka Base44 Dashboard → Data → CreditTransaction
- ✅ Verifikasi user.credits field ter-update

### 401 Unauthorized
- ✅ Webhook token tidak match
- ✅ Header `x-trakteer-token` missing atau salah

---

## Webhook Payload Format

Trakteer mengirim JSON dengan struktur:
```typescript
{
  invoiceId: string;      // Unique ID dari Trakteer
  status: "completed" | "pending" | "failed";
  amount: number;          // Dalam IDR
  email: string;          // Email payer (PENTING: harus sesuai user email di DB)
  name: string;           // Nama payer
  paymentMethod: string;  // "gopay" | "ovo" | "dana" | "transfer" dll
  completedDate?: ISO string;
  note?: string;          // Custom note (bisa kita pakai untuk metadata)
}
```

---

## Credit Conversion

IDR → Credit mapping (default):
- IDR 10,000 = 1 credit
- IDR 50,000 = 5 credits
- IDR 100,000 = 10 credits
- IDR 250,000 = 25 credits
- IDR 500,000 = 50 credits

> Edit `base44/functions/trakteerWebhook/entry.ts` untuk ubah mapping

---

## Notes

- ✅ Webhook secure dengan token verification
- ✅ All payments recorded di CreditTransaction (audit trail)
- ✅ Duplicate payment prevention: check `externalId` di DB
- ✅ User email adalah identifier (harus unique di User entity)

