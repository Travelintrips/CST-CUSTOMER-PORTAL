# Customer Invoice DEV — satu persetujuan Owner/Super Admin

Keputusan bisnis: **cukup satu persetujuan Owner/Super Admin**, bukan dua
Admin independen. Terbatas ke penerbitan Invoice Customer pada CST-DEV.
Tidak ada perubahan ke PROD atau proses persetujuan bisnis lainnya.

## Alur yang dipertahankan

1. Admin Portal masuk menggunakan autentikasi Portal yang sah.
2. Perusahaan bersumber dari **sales_documents.company_id** pada database,
   bukan dari kolom yang boleh dipilih bebas oleh permintaan HTTP. Hanya
   company 1 (CST) atau 3 (PT Diva Servis) yang diizinkan.
3. Transaksi PostgreSQL memakai **direct-login company-scoped writer** untuk
   perusahaan itu; pemeriksaan `CURRENT_USER=SESSION_USER`, `NOBYPASSRLS`,
   dan RLS Invoice/GL/PPN/AR/audit/outbox wajib PASS.
4. Dalam **transaksi database yang sama**, email Portal Admin harus sesuai
   **tepat satu** identitas BizPortal aktif dengan `role=super_admin`,
   `system_role=super_admin`, `is_active=true` dan `status=active`,
   dibaca memakai `FOR SHARE` agar pencabutan role tidak balapan dengan COMMIT.
   Jika `company_id` pada Super Admin bernilai null, Owner berlaku secara
   global untuk perusahaan 1 dan 3; jika bernilai 1 atau 3, hanya untuk
   perusahaan tersebut.
5. **Satu persetujuan berupa sesi OTP/email Owner/Super Admin BizPortal
   dengan attestation Ed25519 yang diverifikasi**. Bukti tersebut terikat
   ke Portal Admin, identitas Invoice, perusahaan, actor ID kanonis,
   challenge, nonce dan kedaluwarsa; tidak dapat diganti oleh role/email
   kiriman body HTTP. Tidak ada permintaan review kepada Admin kedua,
   dan **tidak perlu portal_company_requests atau keanggotaan Admin Portal**
   sebagai syarat tambahan menerbitkan Invoice.
6. Hanya setelah bukti ditandatangani valid, gunakan **CanonicalPostingEngine
   asli** dan trigger AR/PPN/ledger/outbox/notification yang sudah PASS.
   Seluruh status Invoice/jurnal/AR/PPN/audit ikut transaksi yang sama;
   error membatalkan semuanya, replay selalu memerlukan OTP/sesi yang sah
   dan tidak membuat duplikasi.
   
Pemeriksaan pembatas perusahaan, active global Owner, RLS, session role,
dan callback tanda tangan **tidak boleh dimatikan** demi meluluskan tes.

## Apa yang tidak berubah

- Alur permohonan/peninjauan perusahaan untuk **onboarding dan Corporate PO**
  tetap menggunakan kontrol aslinya. Penghapusan syarat Admin kedua hanya
  berlaku pada jalur penerbitan **Customer Invoice**, bukan hak untuk
  mengaktifkan keanggotaan atau memperluas akses ke modul lain.
- Tidak ada perubahan SQL skema, PostgreSQL grants, RLS/role login, secret
  versi1, layanan OTP, Accounting engine atau pembayaran.
- PROD tidak diubah; Customer Portal aktif tetap pada release sebelumnya,
  flag finansial OFF, dua role writer NOLOGIN dan AR actor disabled.

## Bukti regression dan rilis

Fokus tes:
- Satu signed Owner/Super Admin approval dapat menerbitkan CST maupun Diva,
  meskipun keanggotaan/approval reviewer Portal Admin tidak ada.
- Admin tanpa owner kanonis, Super Admin nonaktif, dua akun owner aktif
  dengan email sama, Owner perusahaan berbeda, bukti OTP palsu atau hilang:
  ditolak sebelum update source Invoice atau jurnal.
- Replay wajib memverifikasi tanda tangan Owner lagi.
- Feature-OFF/legacy tetap sama; tidak ada outbound/dedup pada penolakan.
- RLS, original GL/11% PPN/AR/ledger/outbox, Finance/Fleet/Payroll role,
  signed BizPortal OTP dan deploy/rollback aman tetap digunakan.

Jangan merge/deploy PROD. Uji sumber + CI PASS dahulu, kemudian genuine Owner
OTP HTTPS E2E di DEV dengan data dan otorisasi sah tanpa mengaktifkan role
secara diam-diam; setelah E2E PASS pemilik baru menguji PROD.
