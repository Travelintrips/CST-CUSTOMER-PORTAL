# Customer Portal DEV — sinkronisasi otomatis status WA Gateway existing

Status dasar dan tombol manual sudah diimplementasikan serta deployed oleh **PR #201**. Perubahan ini hanya menambahkan pemanggilan berkala terhadap service PR #201 yang sudah PASS, **bukan membangun ulang Gateway, undangan, atau service sinkronisasi**.

## Batas operasi
- Hanya runtime `APP_ENV=development`, `NODE_ENV` bukan production, database terpilih dari `SUPABASE_DATABASE_URL_DEV`, dan `CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED=true`.
- Token harus merupakan token khusus client `customer-portal` yang sudah ada, pengirim terpasang `ai-core`/••••6556. Perubahan perangkat atau nomor memblokir poller (fail closed).
- Poller baru dimulai setelah startup dan pemeriksaan database menyatakan runtime `ready`; dihentikan sewaktu shutdown. Satu pemeriksaan awal sesudah 12 detik, lalu setiap 120 detik; pembacaan maksimal 8 antrean per siklus dan hanya satu siklus aktif per proses.
- Query SELECT terbatas pada undangan `rfq_vendor_invited` yang sudah `queued`, `attempt_count=1`, `sent_at IS NULL`, punya ID provider, memiliki pasangan RFQ/Quote/Supplier perusahaan CST (ID 1). Antrean #93 yang `pending` dan antrean perusahaan lain tidak ikut.
- Setiap antrean dilewatkan ke **`syncDevVendorWhatsAppStatus` PR #201**, yang melakukan `GET /v1/messages/:id`, memverifikasi client, device, perusahaan, ID pesan dan waktu kirim lalu mengubah database DEV dengan SQL guarded/idempoten.
- Tidak ada `POST /v1/messages`, pengiriman ulang, penambahan jurnal, perubahan Gateway PROD, perubahan worker legacy Fonnte, atau perubahan PROD Customer Portal.
- Jika Gateway masih `queued`, tidak tersedia, atau bukti tidak cocok, status tidak dinaikkan secara palsu. Error ditahan untuk pemeriksaan ulang status; *tidak ada retry pesan WhatsApp*.
- Tombol manual **Periksa Status Pengiriman WA (Tanpa Kirim Ulang)** tetap tersedia bagi Admin sebagai jalur pengecekan langsung.

## Baseline dan bukti uji
- RFQ #24 / Quote #19 / antrean #95 dan RFQ #25 / Quote #20 / antrean #96 sudah tersinkronisasi `sent` dengan `sent_at` asli Gateway; belum ada bukti `delivered/read` untuk kedua undangan.
- Uji Vitest: pembatasan lingkungan, pemilihan antrean, satu panggilan ke service existing, penanganan kegagalan tanpa pengiriman, siklus berkala dan berhenti saat shutdown.
- PostgreSQL 16 terisolasi tanpa jaringan: pilih hanya antrean valid, tidak memilih #93, antrean perusahaan lain, atau `sent` historis.

## Verifikasi pasca-deploy
1. Pastikan rilis DEV tersertifikasi, `/api/readyz` 200, gateway `/health` 200, perangkat 6556 ONLINE.
2. Periksa aplikasi DEV mencatat polling tanpa error, tidak ada antrean yang salah naik status, dan `wa-send` tidak bertambah karena polling.
3. RFQ/Quote baru cukup memakai alur Admin existing; status `queued` akan disinkronkan dari Gateway jika bukti `sent` terverifikasi. Tidak perlu mengklik tombol untuk sinkronisasi normal.
