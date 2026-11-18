# Security Specification — Panel Admin PRIDA (SMK PGRI 2 Kedondong)

## 1. Data Invariants
1. **Identitas & Kepemilikan**: Setiap dokumen pada koleksi konten (`news`, `programs`, `articles`, `ptk_members`, `academic_events`, `faqs`, `ppdb_registrations`, `alumni_tracer`, `contact_messages`, `site_settings`, `analytics_daily`, `analytics_events`, `audit_logs`) wajib memiliki `ownerId` yang valid (`^[a-zA-Z0-9_\-]+$`) dan sama dengan `request.auth.uid` saat pembuatan (atau `public_visitor` dengan status awal terkunci), serta tidak dapat diubah (`immutable`) saat pembaruan.
2. **Pencegahan Eskalasi Hak Akses (RBAC)**: Pengguna baru yang mendaftarkan profilnya sendiri di `/users/{userId}` hanya boleh mengisi `role == 'viewer'` dan `status == 'pending'`, kecuali email terverifikasi `dbsmkpgri2kdd@gmail.com`. Pengguna non-admin dilarang keras mengubah field `role`, `status`, `uid`, `email`, atau `ownerId`.
3. **Integritas Temporal**: Semua field `createdAt` dan `updatedAt` wajib bernilai `request.time` pada saat pembuatan, `createdAt` bersifat immutable, dan `updatedAt == request.time` wajib terpenuhi pada setiap pembaruan.
4. **Isolasi PII & Query Safety**: Koleksi yang memuat PII (`users`, `ppdb_registrations`, `alumni_tracer`, `contact_messages`, `audit_logs`) dilarang dibaca secara massal oleh non-admin. Aturan `allow list` tidak menggunakan `get()` maupun `exists()` (O(1) cost guard), hanya mengizinkan `isBootstrappedAdmin()` atau pemilik (`resource.data.ownerId == request.auth.uid`).
5. **Batas Volumetrik & Validasi Schema**: Setiap string wajib memiliki batas `.size()`, setiap array dibatasi maksimal 10–20 elemen dan diperiksa tipe elemen pertamanya, serta setiap ID dokumen divalidasi dengan `isValidId()`.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Unverified Email Spoof**: Pengguna login dengan email admin tetapi `email_verified: false` mencoba menulis ke `/site_settings/profile`. -> **DITOLAK** (`PERMISSION_DENIED`).
2. **Self-Role Escalation**: Pengguna biasa membuat `/users/{uid}` dengan `role: "super_admin"` dan `status: "active"`. -> **DITOLAK** (`PERMISSION_DENIED`).
3. **Shadow Field Injection**: Admin atau user mengirim payload `news` dengan field liar `isFeaturedHack: true`. -> **DITOLAK** (`hasOnly` check).
4. **Path ID Poisoning**: Permintaan `create` pada `/news/../../etc/passwd` atau ID > 128 karakter. -> **DITOLAK** (`isValidId`).
5. **OwnerId Spoofing**: Pengguna A membuat berita dengan `ownerId: "userB"`. -> **DITOLAK** (`ownerId == request.auth.uid`).
6. **Client Timestamp Forgery**: Payload `create` berita menyertakan `createdAt` masa lalu alih-alih `request.time`. -> **DITOLAK**.
7. **Immutable Field Tampering**: Pembaruan berita mencoba mengganti `createdAt` atau `ownerId`. -> **DITOLAK**.
8. **Blanket List Scraping on PII**: Pengguna non-admin melakukan `list` seluruh `/ppdb_registrations` atau `/users` tanpa filter kepemilikan. -> **DITOLAK**.
9. **Terminal State Bypass (PPDB)**: Non-admin mencoba mengubah status pendaftar PPDB yang sudah `diterima` kembali ke `menunggu`. -> **DITOLAK**.
10. **Array Exhaustion**: Payload `programs` mengirim array `competencies` berisi > 15 item atau item non-string. -> **DITOLAK**.
11. **Type Poisoning on Update**: Pembaruan `site_settings` mengirim `ppdbOpen: "yes"` (string alih-alih boolean). -> **DITOLAK**.
12. **Direct Admin Grant Escalation**: Pengguna biasa menulis langsung ke `/admins/{uid}` untuk mengangkat dirinya sendiri menjadi admin. -> **DITOLAK**.
