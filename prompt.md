Buat sebuah personal website menggunakan React + TypeScript + Vite dan Supabase sebagai backend. Website harus terasa minimalist, editorial, eksperimental, dan out of the box—bukan seperti template portfolio developer pada umumnya.

## Tujuan Website

Website ini menjadi ruang personal digital untuk menampilkan:

- Profil singkat
- Perjalanan dan pengalaman
- Project yang pernah dibuat
- Tulisan atau catatan
- Eksperimen dan hal yang sedang dikerjakan
- Kontak dan media sosial

Website tidak perlu menggunakan konsep dashboard pada halaman publik. Pengunjung harus merasa seperti sedang menjelajahi ruang kerja atau jurnal digital seseorang.

## Teknologi

Gunakan:

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router
- Framer Motion
- Lucide React
- Fetch API atau Supabase Client
- Tanpa Axios
- Deploy-ready untuk Vercel

Gunakan arsitektur yang modular, reusable, dan mudah dikembangkan.

## Konsep Visual

Gunakan gaya:

- Minimalist editorial
- Typography-first
- Monochrome
- Banyak white space
- Tidak menggunakan gradient
- Tidak menggunakan glassmorphism
- Tidak menggunakan shadow berlebihan
- Border tipis sebagai pemisah
- Animasi halus dan fungsional
- Mobile-first dan sepenuhnya responsive

Palet warna:

- Background terang: `#F5F4F0`
- Teks utama: `#181818`
- Teks sekunder: `#737373`
- Border: `#D8D6D0`
- Accent: `#E8FF47`
- Dark mode background: `#111111`
- Dark mode text: `#ECEBE6`

Gunakan font sans-serif modern untuk interface dan serif editorial untuk judul atau kutipan. Pilih font dari Google Fonts yang cepat dimuat, misalnya Inter dan Instrument Serif.

## Konsep Utama

Buat homepage seperti “personal operating system” atau meja kerja digital.

Bagian hero tidak menggunakan kalimat generik seperti “Hi, I’m a Full Stack Developer”.

Gunakan copy seperti:

“Fajar builds useful things for the web, documents the process, and occasionally breaks things along the way.”

Tampilkan status dinamis:

- Available for collaboration
- Currently building
- Based in Indonesia
- Local time

Tambahkan elemen “Now” yang memperlihatkan apa yang sedang dikerjakan, dipelajari, dibaca, atau dipikirkan.

## Navigasi

Navbar harus sederhana dan sticky:

- Nama atau wordmark
- Index
- Work
- Notes
- About
- Tombol theme toggle

Pada mobile, gunakan menu fullscreen yang minimalis.

Tambahkan indikator halaman aktif berbentuk titik kecil atau garis, bukan background berbentuk pill.

## Halaman

### 1. Home `/`

Isi halaman:

- Hero dengan intro singkat
- Status saat ini
- Selected projects
- Latest notes
- Personal timeline
- Small facts atau random thoughts
- Contact section

Tambahkan elemen interaktif berupa floating index number atau koordinat halaman seperti:

`01 — INDEX`
`06°12′S / 106°49′E`

Koordinat hanya berfungsi sebagai elemen visual editorial.

### 2. Work `/work`

Tampilkan seluruh project dalam bentuk daftar editorial, bukan card grid biasa.

Setiap baris project berisi:

- Nomor urut
- Nama project
- Deskripsi singkat
- Tahun
- Kategori
- Tech stack
- Status
- Thumbnail yang muncul saat hover di desktop

Saat item disentuh pada mobile, thumbnail ditampilkan di bawah informasi project.

Sediakan filter:

- All
- Web
- System
- Experiment
- Research

### 3. Project Detail `/work/:slug`

Isi halaman:

- Nama project
- Tahun
- Role
- Tech stack
- Status
- Link live website
- Link GitHub jika tersedia
- Cover image
- Latar belakang
- Masalah yang diselesaikan
- Proses pembuatan
- Hasil
- Galeri
- Project berikutnya

Gunakan layout seperti artikel editorial atau case study.

### 4. Notes `/notes`

Tampilkan artikel dan catatan pendek.

Setiap catatan memiliki:

- Judul
- Slug
- Excerpt
- Isi
- Cover opsional
- Tags
- Status draft atau published
- Reading time
- Published date

Sediakan pencarian dan filter tag.

### 5. Note Detail `/notes/:slug`

Gunakan layout membaca yang bersih dengan:

- Reading progress
- Table of contents otomatis
- Syntax highlighting
- Copy button pada code block
- Share button
- Related notes

Lebar konten harus nyaman dibaca dan tidak terlalu lebar.

### 6. About `/about`

Jangan membuat halaman seperti CV formal.

Gunakan kombinasi:

- Cerita personal
- Prinsip bekerja
- Tools yang digunakan
- Pengalaman
- Timeline
- Fakta kecil
- Foto
- Daftar hal yang disukai dan tidak disukai

Tambahkan bagian:

“Things I believe”
“Things I’m still figuring out”
“Tools on my desk”

### 7. Admin `/admin`

Buat halaman admin sederhana untuk mengelola konten.

Gunakan Supabase Authentication dengan email dan password. Hanya akun yang memiliki role `admin` yang dapat mengakses halaman ini.

Fitur admin:

- Login
- Ringkasan jumlah project dan tulisan
- CRUD project
- CRUD notes
- CRUD timeline
- Mengubah status “currently building”
- Upload gambar
- Publish dan unpublish konten
- Preview sebelum publish

Admin harus memiliki sidebar sederhana dan responsive.

## Supabase

Buat struktur database berikut:

### Table `profiles`

- id
- full_name
- username
- headline
- bio
- avatar_url
- location
- availability_status
- current_activity
- email
- role
- created_at
- updated_at

### Table `projects`

- id
- title
- slug
- short_description
- content
- category
- year
- role
- tech_stack
- cover_url
- live_url
- repository_url
- status
- featured
- sort_order
- created_at
- updated_at

### Table `project_images`

- id
- project_id
- image_url
- caption
- sort_order
- created_at

### Table `notes`

- id
- title
- slug
- excerpt
- content
- cover_url
- reading_time
- status
- published_at
- created_at
- updated_at

### Table `tags`

- id
- name
- slug

### Table `note_tags`

- note_id
- tag_id

### Table `timeline`

- id
- title
- organization
- description
- start_date
- end_date
- is_current
- sort_order

### Table `now_items`

- id
- type
- title
- description
- url
- is_active
- updated_at

Gunakan Supabase Storage untuk:

- Avatar
- Project cover
- Project gallery
- Note cover

Buat Row Level Security yang aman:

- Konten published bisa dibaca publik
- Draft hanya dapat dibaca admin
- Operasi create, update, dan delete hanya dapat dilakukan admin
- Jangan hanya melindungi halaman admin dari frontend
- Pastikan authorization tetap diperiksa melalui Supabase RLS

Sertakan SQL migration atau schema lengkap untuk membuat tabel, index, foreign key, trigger `updated_at`, storage policy, dan RLS policy.

## Interaksi Unik

Tambahkan beberapa detail yang memberikan karakter:

- Custom cursor berbentuk titik kecil hanya pada perangkat pointer desktop
- Thumbnail project mengikuti cursor ketika item di-hover
- Teks kecil di footer menampilkan waktu lokal Indonesia secara realtime
- Command palette dengan shortcut `⌘K` atau `Ctrl+K`
- Command palette dapat mencari project, notes, dan halaman
- Transisi halaman yang singkat
- Reading progress
- Animasi teks yang subtle
- Easter egg kecil ketika pengguna mengetik kata tertentu
- Tombol “Random note”
- Tampilan bisa berganti antara list dan compact index
- Respect `prefers-reduced-motion`

Jangan membuat animasi yang mengganggu pembacaan atau memperlambat website.

## Empty State dan Loading

Buat:

- Skeleton loading minimal
- Error state
- Empty state
- Halaman 404 yang unik
- Toast notification
- Konfirmasi sebelum menghapus data dari admin

404 page dapat menggunakan copy:

“You’ve reached a part of the internet I haven’t built yet.”

## Performa dan SEO

Pastikan:

- Lazy loading gambar
- Route-based code splitting
- Optimasi ukuran gambar
- Semantic HTML
- Accessible keyboard navigation
- Focus state yang jelas
- Kontras warna yang baik
- Meta title dan description dinamis
- Open Graph tags
- Sitemap
- robots.txt
- Structured data
- Canonical URL
- Loading cepat pada mobile
- Tidak terjadi layout shift
- Tidak ada error TypeScript
- Tidak ada warning React pada console

## Struktur Project

Gunakan struktur kurang lebih:

```text
src/
├── components/
│   ├── common/
│   ├── layout/
│   ├── navigation/
│   ├── project/
│   ├── notes/
│   └── admin/
├── pages/
│   ├── public/
│   └── admin/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
├── constants/
└── styles/
```

Pisahkan:

- Komponen UI
- Query Supabase
- Types
- Data transformation
- Authentication
- Route protection
- Form validation

## Ketentuan Implementasi

- Gunakan strict TypeScript
- Hindari penggunaan `any`
- Jangan isi halaman dengan lorem ipsum
- Buat contoh konten yang realistis
- Buat komponen reusable
- Gunakan React Hook Form dan Zod untuk form admin
- Simpan konfigurasi Supabase di environment variables
- Sediakan `.env.example`
- Sediakan README berisi setup lokal, konfigurasi Supabase, menjalankan migration, dan deploy ke Vercel
- Jangan berhenti pada mockup
- Implementasikan website hingga seluruh halaman, database integration, authentication, CRUD, responsive layout, dark mode, loading state, dan error handling berfungsi

Mulai dengan membuat fondasi project dan design system. Setelah itu buat halaman publik, integrasi Supabase, lalu halaman admin. Pastikan hasil akhirnya memiliki identitas visual yang kuat, tetap sederhana, cepat, dan tidak terlihat seperti template portfolio generik.
