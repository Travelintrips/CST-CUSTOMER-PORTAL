# Customer Portal DEV — Undangan RFQ Vendor melalui CST WA Gateway

## Sistem resmi
- WA Gateway: `https://aicst.co.id` (CST, bukan Fonnte).
- Existing gateway client: `customer-portal`, companyKey `1`.
- Existing RFQ: #23; vendor Quote: #18; Supplier: #24; antrean WA: #93.
- Satu antrean dan satu quotation dipertahankan. Tidak ada pembuatan ulang.

## Audit registri gateway, 17 November 2026
- Client `customer-portal` sudah ada dan active.
- **Active API token = 0**, scopes `messages:send`, `messages:read`; **device scope belum ada**.
- Device `customer-portal-dev` belum tercatat / belum dipasangkan.
- Device milik Fleet, Tenant, Sport Center, AI Core, Handling dan SKY tidak boleh dipakai sebagai pengirim Customer Portal.

## Persiapan terpisah untuk administrator gateway
1. Gunakan menu Admin resmi di `https://aicst.co.id/admin` untuk membuat/menghubungkan perangkat khusus `customer-portal-dev`; pasangkan nomor WhatsApp yang benar-benar diotorisasi (QR harus dilakukan oleh pemilik nomor).
2. Kaitkan **hanya** perangkat itu kepada client `customer-portal`. Scopes efektif: `messages:send`, `messages:read`, `device:customer-portal-dev`, companyKey `1`. Jangan aktifkan scope per perangkat lain.
3. Terbitkan satu token API client yang sah, khusus untuk Customer Portal DEV, bukan token Gateway Admin/Fleet/Tenant. Simpan rahasianya hanya pada konfigurasi runtime DEV.
4. Pada runtime Customer Portal DEV, atur (nilai sebenarnya tidak dimasukkan ke repository atau komentar):
   - `CUSTOMER_PORTAL_WA_GATEWAY_TOKEN_DEV` = token client khusus
   - `CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV` = `customer-portal-dev`
   - `CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV` = nomor perangkat yang dipasangkan dalam format `62...`
   - `CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED` = `false` hingga verifikasi device + PIC selesai
5. Cek Admin readiness dengan sesi Super Admin DEV. Gateway harus mengembalikan **tepat satu** device yang matching, `ONLINE`, `enabled=true`, company `1`, nomor sesuai.
6. Setelah approval PIC dan identitas sender benar, Super Admin dapat mengaktifkan flag DEV dan mengirim **hanya antrean #93**. Jangan gunakan shared worker dengan `limit=1`.

## Semantik status
- REST `POST /v1/messages` gateway merespons HTTP 202 `queued` + `messageId`. Ini **bukan** bukti WhatsApp sudah terkirim/dibaca.
- Antrean Customer Portal berpindah dari `pending` ke `queued`, `attempt_count=1`, dan `payload_json.gateway_delivery.message_id` disimpan. `sent_at` **tidak ditetapkan** sebelum bukti terkirim.
- Gunakan `GET /v1/messages/:messageId` (token app yang sama, `messages:read`) untuk melihat `queued/sent/delivered/read/failed` secara nyata. Jangan retry otomatis apabila provider response ambigu.
- Quote #18 menjadi `opened` hanya jika vendor membuka link, bukan saat Admin melakukan check.

## Cakupan rilis
Perubahan terbatas pada jalur undangan vendor Customer Portal DEV, menghapus adapter Fonnte khusus jalur tersebut. Modul WA lama di luar undangan tidak boleh berubah tanpa audit tersendiri. Deployment PROD, gateway clients/devices yang sudah ada, Fleet, Tenant, AP/GL dan transaksi live tidak disentuh saat uji sintetis.
