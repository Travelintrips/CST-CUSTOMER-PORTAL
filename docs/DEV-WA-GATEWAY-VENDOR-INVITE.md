# Customer Portal DEV — memakai WA Gateway CST PROD yang sudah ada

## Keputusan
- **Gateway existing:** `https://aicst.co.id` dengan `GET /v1/devices` dan `POST /v1/messages`.
- **Tidak perlu membuat gateway baru, perangkat WhatsApp baru, atau memindai QR baru** jika memakai salah satu perangkat PROD yang sudah online dan diizinkan.
- Gunakan **client aplikasi existing** `customer-portal`, companyKey `1`, yang sudah terdaftar di WA Gateway. Jangan memakai token milik Fleet, Tenant, Sport Center atau AI Core.
- WA Gateway tidak dimodifikasi oleh perubahan Customer Portal ini. Pengiriman Customer Portal tetap OFF sampai hak akses aplikasi dan perangkat pengirim benar.

## Audit registri PROD (17 November 2026)
- Client `customer-portal`: active, `messages:read` dan `messages:send`, **0 token aktif**, **0 device scope**.
- Device `primary-01`: OFFLINE dan disabled.
- Perangkat online existing: `sport-center-report`, `mina-ai-sport-center`, `tenant-pos`, dan `ai-core`. Semua sudah digunakan oleh aplikasi lain; tidak ada pilihan yang boleh diambil otomatis tanpa persetujuan penggunaan identitas pengirimnya.
- Artinya, **gateway dan perangkat sudah ada**, tetapi aplikasi Customer Portal belum diberi hak menggunakan perangkat mana pun.

## Penyambungan memakai perangkat PROD existing
1. Tentukan **satu** perangkat WA Gateway PROD yang sudah online dan secara eksplisit diizinkan sebagai pengirim Customer Portal. Verifikasi nama device dan nomor penuh secara privat di Admin Gateway; jangan menebak dari empat digit terakhir.
2. Pada **client existing `customer-portal`**, Administrator WA Gateway menetapkan scope `messages:read`, `messages:send`, dan **`device:<id-perangkat-existing-yang-disetujui>` saja** (companyKey `1`). Jangan mengubah scope/token milik aplikasi lain.
3. Terbitkan satu token API **untuk client existing `customer-portal`** karena saat ini 0 token aktif. Token tersebut hanya disimpan dalam environment Customer Portal DEV. Ini tidak membuat gateway maupun WhatsApp device baru.
4. Pada runtime DEV `/etc/cst-customer-portal-dev/runtime.env`, isi:
   - `CUSTOMER_PORTAL_WA_GATEWAY_TOKEN_DEV`: token milik client existing `customer-portal`.
   - `CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV`: **device ID PROD existing yang diizinkan**, bukan otomatis `customer-portal-dev`.
   - `CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV`: nomor perangkat tersebut dalam format `62...`.
   - `CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED=false` sampai semua pemeriksaan sender/PIC lulus.
5. Saat Admin memeriksa readiness, API client harus hanya melihat **satu** perangkat yang cocok dengan ID dan nomor yang ditetapkan, `ONLINE`, `enabled=true`, company `1`. Token umum yang bisa melihat banyak device akan ditolak.
6. Periksa ulang tujuan WhatsApp PIC Supplier dan status Quote; hanya antrean undangan baru yang sah dapat diteruskan, tanpa retry otomatis jika status ambigu.

## RFQ #23 dan Quote #18 yang sudah selesai
- RFQ #23 saat audit terakhir sudah `awarded`, Quote #18 sudah `selected`. **Tidak ada undangan WhatsApp #93 yang perlu dikirim lagi.**
- Antrean #93 tetap `pending` dengan `attempt_count=0`, `sent_at=NULL` sebagai histori. Jangan tandai `sent` palsu atau memaksakan send.
- Permintaan WhatsApp baru menggunakan claim satu antrean yang idempoten. Gateway `queued` belum membuktikan `sent/delivered`; status sebenarnya dapat dicek melalui `GET /v1/messages/:messageId` dengan token aplikasi Customer Portal.

## Batas keselamatan
- Jangan membuat gateway/device/QR baru atau menebak perangkat alternatif ketika belum ada penetapan resmi.
- Jangan meminjam, memutar, atau membagikan token Fleet, Tenant, Sport Center, AI Core, ataupun Admin Gateway.
- Pertahankan fitur yang PASS di Customer Portal DEV; PROD Gateway aktif, Fleet, Tenant, Finance/AP/GL, dan transaksi riil tetap tidak tersentuh ketika menguji adapter sintetis.
