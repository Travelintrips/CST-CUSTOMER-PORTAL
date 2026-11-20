# Customer Invoice CST-DEV — Staff penerbit berbeda dari Owner penyetuju

Status: kandidat sumber dan tes terisolasi saja; belum runtime aktif, belum E2E HTTP nyata.

## Kebijakan bisnis

Satu persetujuan **Owner / Super Admin via OTP email BizPortal** untuk satu
penerbitan Customer Invoice. Tidak ada reviewer Admin kedua. Admin Portal yang
menerbitkan Invoice harus cocok dengan satu **akun BizPortal aktif yang
memiliki company_id perusahaan Invoice** (CST=1 atau Diva=3); Owner dengan
cakupan global dapat menerbitkan untuk keduanya. Akun Admin tanpa perusahaan
tidak dapat menerbitkan hanya dengan memilih nama perusahaan lewat HTTP.

Owner penyetuju boleh berbeda identitas/email dengan Admin penerbit. Satu bukti
Ed25519 hanya diterima bila diproduksi oleh sesi OTP BizPortal Owner yang sah,
tertanda untuk satu Portal user, company ID, Invoice ID, challenge, nonce dan
kedaluwarsa. Setelah verifikasi kriptografis, identitas Owner hasil tanda tangan
harus dicocokkan dan dikunci lagi terhadap public.users (role dan system_role
super_admin, status dan is_active, company_scope) dalam transaksi asli.
Admin penerbit juga harus dicocokkan serta dikunci pada transaksi yang sama.

Penerbitan / replay hanya memakai writer khusus company dengan RLS aktif,
tanpa BYPASSRLS atau privileged pool fallback; jurnal GL/PPN/AR/audit/outbox
menggunakan mesin Accounting asli dan satu transaksi yang sudah ada.

## Perubahan server

- Customer Portal: issuer = current Portal Admin + canonical BizPortal
  active company-scoped admin (atau canonical global Owner).
- Approver = signed actorId/email dari Ed25519 BizPortal, diperiksa terhadap
  public.users sebelum mutasi Invoice. Tidak berasal dari JSON body atau
  email Portal issuer.
- Perubahan kebijakan RLS yang diperlukan hanya pada
  scripts/dev-invoice-separated-issuer-rls.sql. File tersebut BELUM
  dieksekusi pada Supabase, tidak mengubah grants/role login/secrets.
- BizPortal signer DEV [Draft PR #152](https://github.com/bizportal/bizportal-app/pull/152) mengizinkan identitas Owner berbeda dari
  portalEmail challenge, tetapi tetap mengambil identitas dari sesi OTP
  BizPortal yang ditandatangani, memeriksa company scope dan tidak memakai
  email HTTP yang tidak tepercaya.
- Browser popup lama hanya bekerja bila browser issuer mempunyai sesi Owner
  BizPortal. Untuk persetujuan dari perangkat berbeda, diperlukan handoff
  melalui alur persetujuan eksisting; belum diklaim PASS.

## Pengaman rilis

Jangan merger, deploy, menghidupkan flag, LOGIN writer, actor AR, notifikasi,
atau PROD hingga exact-head CI, real signer OTP, penugasan perusahaan yang
sah, PG/RLS, HTTP E2E GL/PPN/AR, rollback/replay, dan handoff lintas perangkat
(untuk use case tersebut) PASS. Tidak membuat entri perusahaan atau
approval palsu pada CST-DEV.
