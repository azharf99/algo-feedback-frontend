// Content for the in-app user guide ("Panduan Penggunaan").
// Kept separate from i18n.ts because the guide is long-form, structured
// content rather than short UI labels — this makes it much easier to keep
// up to date without bloating the global translation file.
//
// To update the guide: edit the relevant language block below. Each
// section maps 1:1 to a module of the app (Students, Groups, Sessions...).

export type GuideSubsection = {
  title: string
  steps?: string[]
  bullets?: string[]
}

export type GuideSection = {
  id: string
  icon: string
  title: string
  badge?: string
  intro: string
  bullets?: string[]
  steps?: string[]
  subsections?: GuideSubsection[]
  tip?: string
}

export type FaqItem = { q: string; a: string }

export type GuideUI = {
  pageTitle: string
  pageSubtitle: string
  searchPlaceholder: string
  noResults: string
  clearSearch: string
  tocTitle: string
  faqTitle: string
  faqSubtitle: string
  tipLabel: string
  stepsLabel: string
  featuresLabel: string
  roleAdmin: string
  contactTitle: string
  contactDesc: string
  backToTop: string
}

export type GuideLangContent = {
  ui: GuideUI
  sections: GuideSection[]
  faq: FaqItem[]
}

export const guideContent: Record<'id' | 'en' | 'ru', GuideLangContent> = {
  // ─────────────────────────────────────────────────────────── Indonesia ──
  id: {
    ui: {
      pageTitle: 'Panduan Penggunaan',
      pageSubtitle: 'Semua yang perlu Anda ketahui untuk menggunakan Algo Feedback, dari langkah pertama sampai fitur lanjutan.',
      searchPlaceholder: 'Cari topik, misal: "import CSV" atau "WhatsApp"...',
      noResults: 'Tidak ada topik yang cocok. Coba kata kunci lain.',
      clearSearch: 'Hapus pencarian',
      tocTitle: 'Daftar Isi',
      faqTitle: 'Pertanyaan yang Sering Diajukan',
      faqSubtitle: 'Jawaban cepat untuk masalah yang paling sering ditemui pemula.',
      tipLabel: 'Tips',
      stepsLabel: 'Langkah-langkah',
      featuresLabel: 'Yang bisa Anda lakukan',
      roleAdmin: 'Khusus Admin',
      contactTitle: 'Masih bingung?',
      contactDesc: 'Hubungi Admin sistem Anda, atau tanyakan langsung ke tim Algonova jika ada fitur yang belum jelas.',
      backToTop: 'Kembali ke atas',
    },
    sections: [
      {
        id: 'getting-started',
        icon: 'Rocket',
        title: 'Mulai Cepat',
        intro: 'Baru pertama kali memakai Algo Feedback? Ikuti urutan ini agar sistem langsung siap dipakai sehari-hari.',
        bullets: [
          'Ada 3 peran pengguna: Admin (akses penuh, termasuk kelola Pengguna), Tutor (kelola siswa, grup, kursus, pelajaran, sesi, dan feedback), dan Siswa.',
          'Login bisa dengan email & kata sandi, atau langsung dengan akun Google.',
          'Lupa kata sandi? Gunakan tautan "Lupa kata sandi?" di halaman login untuk menerima email reset.',
        ],
        steps: [
          'Daftar akun lewat halaman Register, atau minta Admin membuatkan akun untuk Anda.',
          'Masuk (Login), lalu buka menu Profil dan lengkapi nomor telepon serta kredensial WhatsApp API jika Anda akan mengirim feedback via WhatsApp.',
          'Tambahkan data Siswa (bisa satu per satu atau import massal via CSV).',
          'Buat Grup, lalu masukkan siswa ke dalamnya dan atur jadwal pertemuan pertama.',
          'Pastikan Kursus dan Pelajaran sudah tersedia (import CSV jika kurikulumnya panjang).',
          'Cek halaman Sesi setiap minggu untuk menandai kehadiran dan status sesi.',
          'Gunakan halaman Feedback untuk membuat, mengedit, lalu mengirim feedback ke siswa/orang tua.',
        ],
        tip: 'Kerjakan urutan di atas dari atas ke bawah — banyak fitur (misalnya Sesi dan Feedback) bergantung pada data Siswa, Grup, dan Pelajaran yang sudah dibuat lebih dulu.',
      },
      {
        id: 'dashboard',
        icon: 'LayoutDashboard',
        title: 'Dashboard',
        intro: 'Halaman pertama setelah login. Menampilkan ringkasan angka penting dan aktivitas terbaru sistem Anda.',
        bullets: [
          '4 kartu statistik: Total Siswa, Total Grup, Total Pelajaran, Total Feedback — klik kartunya untuk langsung berpindah ke halaman terkait.',
          'Daftar "Pelajaran Terbaru" dan "Feedback Terbaru", masing-masing punya kotak pencarian dan pengurutan (sort) sendiri.',
        ],
        tip: 'Dashboard adalah cara tercepat untuk memastikan data Anda sudah masuk sebelum mulai mengelola detail di halaman lain.',
      },
      {
        id: 'students',
        icon: 'Users',
        title: 'Siswa',
        intro: 'Kelola data seluruh siswa: identitas, kontak, info orang tua, dan status aktif/tidak aktif.',
        bullets: [
          'Kolom data: Nama Lengkap, Nama Belakang, Username, Telepon, Nama & Kontak Orang Tua, Status.',
          'Cari siswa lewat kotak pencarian, dan saring berdasarkan status (Aktif / Tidak Aktif / Semua Status).',
          'Pilih beberapa siswa sekaligus dengan checkbox untuk hapus massal ("Hapus Terpilih").',
        ],
        steps: [
          'Klik "Tambah Siswa" untuk membuka form tambah data, isi kolom wajib (kata sandi wajib diisi untuk siswa baru).',
          'Klik ikon edit pada baris siswa untuk mengubah data yang sudah ada.',
          'Untuk data banyak sekaligus: klik "Import CSV", tarik & lepas file CSV Anda (atau klik untuk memilih file), lalu sistem akan menampilkan header CSV yang terbaca sebelum diproses.',
          'Klik "Export CSV" kapan saja untuk mengunduh data siswa yang sedang tampil sebagai file CSV.',
        ],
        tip: 'Import CSV akan membuat data baru atau memperbarui data yang sudah ada (dikenali lewat ID), lalu menampilkan ringkasan: berapa baris dibuat, berapa diperbarui, dan berapa yang gagal.',
      },
      {
        id: 'groups',
        icon: 'UsersRound',
        title: 'Grup',
        intro: 'Grup adalah wadah untuk mengelompokkan siswa dalam satu kelas/kelas privat, lengkap dengan jadwal dan link pertemuan.',
        bullets: [
          'Tipe grup: "Grup" (kelas berisi banyak siswa) atau "Privat" (satu-ke-satu).',
          'Setiap grup punya: Kursus, Nama Grup, Telepon Grup, daftar Siswa, Bahasa, Deskripsi, Link Meeting, Link Rekaman, Tanggal & Waktu Pertemuan Pertama.',
          'Status Aktif/Tidak Aktif menentukan apakah grup masih dipakai untuk kegiatan berjalan.',
        ],
        steps: [
          'Klik "Tambah Grup", pilih Kursus, isi nama & jadwal, lalu pilih siswa yang tergabung.',
          'Isi Tanggal & Waktu Pertemuan Pertama dengan benar — data ini biasanya menjadi acuan pembuatan jadwal Sesi berikutnya.',
          'Gunakan pencarian dan filter status untuk menemukan grup tertentu dengan cepat.',
        ],
        tip: 'Selalu isi Link Meeting dan Link Rekaman jika kelas dilakukan online, supaya siswa dan orang tua bisa mengaksesnya lewat feedback yang dikirim nanti.',
      },
      {
        id: 'courses',
        icon: 'GraduationCap',
        title: 'Kursus',
        intro: 'Daftar kursus/program belajar yang tersedia (mis. "Fundamental Frontend Development"). Kursus menjadi acuan saat membuat Grup dan Pelajaran.',
        bullets: [
          'Tambah, edit, hapus kursus, dengan status Aktif/Tidak Aktif.',
          'Gunakan pencarian untuk menemukan kursus dari banyak daftar.',
        ],
        tip: 'Buat/aktifkan Kursus dulu sebelum menambahkan Pelajaran dan Grup, karena keduanya butuh memilih Kursus terkait.',
      },
      {
        id: 'lessons',
        icon: 'CalendarDays',
        title: 'Pelajaran',
        intro: 'Daftar materi/kurikulum per kursus — setiap Pelajaran punya nomor urut, modul, kategori, dan level.',
        bullets: [
          'Kolom data: Judul, Modul, Kategori, Level, Nomor Pelajaran, Kompetensi, dan penanda "Pelajaran Projek".',
          'Bisa tambah/edit satu per satu, atau import massal lewat CSV.',
        ],
        subsections: [
          {
            title: 'Import Pelajaran (CSV)',
            bullets: [
              'ID pada file CSV merujuk pada Course ID (kursus tujuan).',
              'Jumlah baris harus sama dengan jumlah Pelajaran pada kursus tersebut, dan harus terurut berdasarkan Nomor Pelajaran.',
            ],
          },
          {
            title: 'Import Kompetensi (CSV)',
            bullets: [
              'Dipakai khusus untuk memperbarui kolom Kompetensi pada Pelajaran yang sudah ada, tanpa mengubah data lain.',
            ],
          },
        ],
        tip: 'Kalau import CSV gagal atau ada baris yang ditolak, sistem tetap memproses baris yang valid dan memberi tahu jumlah baris yang gagal — cek kembali format CSV sesuai ketentuan sebelum mencoba lagi.',
      },
      {
        id: 'sessions',
        icon: 'CalendarDays',
        title: 'Sesi',
        intro: 'Sesi adalah satu pertemuan kelas terjadwal. Halaman ini dipakai setiap minggu untuk mencatat apa yang terjadi di kelas.',
        bullets: [
          'Tab bawaan: Sesi Minggu Lalu, Sesi Minggu Ini, Sesi Minggu Depan, dan Semua.',
          'Status sesi: Pending, Selesai (Done), atau Dibatalkan (Cancelled) — sesi yang sudah dibatalkan tidak bisa ditandai selesai.',
        ],
        steps: [
          'Buka tab minggu yang ingin dicek, lalu klik "Tandai Selesai" pada sesi yang sudah berlangsung.',
          'Klik "Update Kehadiran" untuk memilih siswa mana saja yang hadir pada sesi tersebut.',
          'Jika kelas dibatalkan, gunakan "Tandai Batal" (akan meminta konfirmasi) — bisa disertai opsi "Geser sesi berikutnya" agar jadwal setelahnya otomatis maju.',
          'Untuk banyak sesi sekaligus, gunakan aksi massal "Tandai Selesai Otomatis" atau "Isi Kehadiran Otomatis" dengan rentang tanggal (Dari Tanggal / Sampai Tanggal / Sebelum Tanggal).',
        ],
        tip: 'Rutin memperbarui status Sesi dan kehadiran setiap minggu — data ini yang dipakai untuk menghitung Skor Kehadiran saat Feedback dibuat.',
      },
      {
        id: 'feedbacks',
        icon: 'LineChart',
        title: 'Feedback',
        intro: 'Tempat membuat, mengedit, dan mengirim laporan perkembangan siswa — baik feedback rutin per beberapa pelajaran, maupun laporan kelulusan.',
        bullets: [
          'Tab bawaan sama seperti Sesi (Minggu Lalu/Ini/Depan/Semua), ditambah tab khusus "Feedback Kelulusan".',
          'Setiap feedback berisi: Skor Kehadiran, Skor Keaktifan, Skor Tugas, Link Projek, dan Komentar Tutor.',
          'Skor kehadiran memakai skala kualitatif (Tidak Ada → Jarang → Kadang-kadang → Sering → Selalu), skor keaktifan (Pasif → Sedikit Aktif → Aktif → Sangat Aktif → Super Aktif).',
        ],
        subsections: [
          {
            title: 'Membuat & mengirim feedback rutin',
            steps: [
              'Klik "Generate Feedback", pilih target: Grup Spesifik atau Semua Siswa. Sistem otomatis membuat catatan feedback untuk setiap 4 pelajaran yang sudah diselesaikan siswa.',
              'Buka tiap baris feedback untuk mengisi/mengedit skor, link projek, dan komentar tutor.',
              'Klik "Generate PDF" untuk membuat file PDF laporan (diproses di background, tunggu sebentar lalu refresh).',
              'Setelah PDF siap, gunakan "Lihat PDF" atau "Download PDF", lalu "Kirim WhatsApp" untuk mengirim langsung ke nomor terdaftar.',
            ],
            bullets: [
              '"Generate Semua PDF" membuat PDF untuk banyak feedback sekaligus di background — cek status lewat kolom PDF pada tabel.',
              '"Jadwalkan Semua WhatsApp" menjadwalkan pengiriman WhatsApp massal untuk feedback yang sudah punya PDF.',
              '"Seed Feedback" mengisi skor awal (semua bernilai 3) untuk sesi yang belum ada feedback-nya — cocok untuk data lama, gunakan dengan hati-hati karena ini aksi massal.',
              'Ada peringatan otomatis di atas tabel jika masih ada PDF yang belum dibuat, lengkap dengan jumlahnya.',
            ],
          },
          {
            title: 'Feedback Kelulusan (Graduation)',
            steps: [
              'Buka tab "Feedback Kelulusan", klik "Generate Graduation PDF".',
              'Pilih Siswa dan Kursus yang modulnya sudah diselesaikan siswa tersebut.',
              'Sistem membuat laporan kelulusan lengkap beserta Predikat (grade) di background.',
              'Setelah selesai, laporan bisa dilihat/diunduh sama seperti feedback biasa.',
            ],
          },
        ],
        tip: 'Pembuatan PDF dan penjadwalan WhatsApp berjalan di background — jangan panik kalau statusnya belum berubah dalam beberapa detik, cukup tunggu dan cek lagi.',
      },
      {
        id: 'users',
        icon: 'UserCog',
        title: 'Pengguna',
        badge: 'Khusus Admin',
        intro: 'Halaman untuk mengelola akun pengguna sistem (Admin, Tutor, Siswa). Menu ini hanya terlihat jika akun Anda berperan sebagai Admin.',
        bullets: [
          'Tambah, edit, atau hapus akun pengguna beserta perannya.',
          'Gunakan pencarian untuk menemukan pengguna tertentu dengan cepat.',
        ],
        tip: 'Berikan peran (role) sesuai kebutuhan: berikan akses Admin secukupnya saja, karena Admin bisa mengelola seluruh data termasuk akun pengguna lain.',
      },
      {
        id: 'profile',
        icon: 'UserCircle',
        title: 'Profil',
        intro: 'Kelola data akun Anda sendiri dan konfigurasi WhatsApp API yang dipakai untuk mengirim feedback otomatis.',
        bullets: [
          'Bisa mengubah Nama Lengkap, Nomor Telepon (dipakai untuk notifikasi WhatsApp langsung ke Anda), dan Kata Sandi (kosongkan jika tidak ingin mengubah).',
          'Email tidak bisa diubah lewat halaman ini.',
          'Isi WhatsApp API Key dan WhatsApp Device ID agar sistem bisa mengirim pesan feedback via WhatsApp Gateway Anda.',
        ],
        tip: 'Kredensial WhatsApp API Key & Device ID bisa Anda temukan di dashboard WA Gateway yang Anda gunakan. Tanpa mengisi ini, tombol "Kirim WhatsApp" di halaman Feedback tidak akan berfungsi.',
      },
      {
        id: 'general-tips',
        icon: 'Sparkles',
        title: 'Tips Umum & Navigasi',
        intro: 'Beberapa kebiasaan kecil yang membuat Anda lebih cepat terbiasa dengan tampilan Algo Feedback.',
        bullets: [
          'Ikon bulan/matahari di pojok kanan atas mengganti tampilan Mode Terang / Mode Gelap.',
          'Ikon globe (dunia) di sebelahnya mengganti bahasa antarmuka: Indonesia, English, atau Русский — tersimpan otomatis untuk kunjungan berikutnya.',
          'Di layar besar, klik ikon menu di header untuk melipat/membuka sidebar agar konten lebih lega.',
          'Di layar HP, gunakan ikon garis tiga (☰) untuk membuka menu navigasi.',
          'Hampir semua halaman daftar (Siswa, Grup, Kursus, Pelajaran, Sesi, Feedback, Pengguna) punya pola yang sama: kotak pencarian, filter status, pengurutan, checkbox untuk aksi massal, dan navigasi halaman (pagination) di bagian bawah.',
          'Notifikasi sukses/gagal (toast) selalu muncul di pojok kanan atas layar setelah Anda melakukan suatu aksi.',
          'Ikon profil bulat di pojok kanan atas menampilkan nama & peran Anda, serta akses cepat ke Profil dan tombol Keluar.',
        ],
      },
    ],
    faq: [
      {
        q: 'Kenapa menu "Pengguna" tidak muncul di sidebar saya?',
        a: 'Menu Pengguna hanya terlihat untuk akun dengan peran Admin. Jika Anda seorang Tutor atau Siswa, menu ini memang sengaja disembunyikan.',
      },
      {
        q: 'Saya sudah klik "Generate PDF" tapi PDF-nya belum ada, kenapa?',
        a: 'Pembuatan PDF berjalan sebagai proses di background dan butuh sedikit waktu. Tunggu beberapa saat lalu muat ulang halaman — kolom PDF pada tabel akan berubah begitu selesai.',
      },
      {
        q: 'Kenapa feedback tidak terkirim ke WhatsApp siswa?',
        a: 'Pastikan Anda sudah mengisi WhatsApp API Key dan WhatsApp Device ID di halaman Profil, PDF feedback sudah selesai dibuat, dan nomor telepon siswa/grup sudah benar formatnya.',
      },
      {
        q: 'Bagaimana cara reset kata sandi jika lupa?',
        a: 'Di halaman Login, klik "Lupa kata sandi?", masukkan email Anda, lalu cek email untuk tautan reset kata sandi.',
      },
      {
        q: 'Kenapa import CSV Siswa/Pelajaran saya gagal sebagian?',
        a: 'Cek kembali header CSV Anda sesuai format yang diminta sistem (ditampilkan saat proses import). Untuk import Pelajaran, jumlah baris harus sama dengan jumlah pelajaran di kursus tersebut dan terurut berdasarkan Nomor Pelajaran.',
      },
      {
        q: 'Kenapa sebuah Sesi tidak bisa saya tandai "Selesai"?',
        a: 'Sesi yang statusnya sudah "Dibatalkan" tidak bisa ditandai selesai. Jika ini salah, buat ulang sesi tersebut atau hubungi Admin.',
      },
      {
        q: 'Bagaimana cara ganti bahasa atau tema gelap/terang?',
        a: 'Gunakan ikon globe (bahasa) dan ikon bulan/matahari (tema) di pojok kanan atas header — tersedia di semua halaman setelah login.',
      },
      {
        q: 'Apa bedanya "Generate Feedback" dan "Seed Feedback"?',
        a: '"Generate Feedback" membuat catatan feedback baru berdasarkan progres pelajaran siswa (per kelipatan 4 pelajaran selesai). "Seed Feedback" hanya mengisi skor awal default (nilai 3) untuk sesi yang belum punya feedback sama sekali — biasanya dipakai sekali saat migrasi data lama.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────ish English ──
  en: {
    ui: {
      pageTitle: 'User Guide',
      pageSubtitle: 'Everything you need to know to use Algo Feedback, from your very first login to the advanced features.',
      searchPlaceholder: 'Search a topic, e.g. "CSV import" or "WhatsApp"...',
      noResults: 'No topics match your search. Try a different keyword.',
      clearSearch: 'Clear search',
      tocTitle: 'Table of Contents',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Quick answers to the most common beginner questions.',
      tipLabel: 'Tip',
      stepsLabel: 'Steps',
      featuresLabel: 'What you can do',
      roleAdmin: 'Admin only',
      contactTitle: 'Still stuck?',
      contactDesc: 'Reach out to your system Admin, or ask the Algonova team directly if something is still unclear.',
      backToTop: 'Back to top',
    },
    sections: [
      {
        id: 'getting-started',
        icon: 'Rocket',
        title: 'Getting Started',
        intro: 'New to Algo Feedback? Follow this order and the system will be ready for daily use in no time.',
        bullets: [
          'There are 3 user roles: Admin (full access, including managing Users), Tutor (manages students, groups, courses, lessons, sessions and feedback), and Student.',
          'You can log in with email & password, or directly with a Google account.',
          'Forgot your password? Use the "Forgot your password?" link on the login page to receive a reset email.',
        ],
        steps: [
          'Create an account on the Register page, or ask your Admin to create one for you.',
          'Log in, then open the Profile menu and fill in your phone number and WhatsApp API credentials if you plan to send feedback via WhatsApp.',
          'Add your Students (one by one, or bulk import via CSV).',
          'Create Groups, add the relevant students to them, and set the first lesson schedule.',
          'Make sure Courses and Lessons are set up (import via CSV if the curriculum is long).',
          'Check the Sessions page every week to mark attendance and session status.',
          'Use the Feedback page to generate, edit, and send feedback to students/parents.',
        ],
        tip: 'Follow the list above top to bottom — many features (like Sessions and Feedback) depend on Students, Groups and Lessons already existing.',
      },
      {
        id: 'dashboard',
        icon: 'LayoutDashboard',
        title: 'Dashboard',
        intro: 'The first page you see after logging in. It shows a summary of key numbers and your latest activity.',
        bullets: [
          '4 stat cards: Total Students, Total Groups, Total Lessons, Total Feedbacks — click a card to jump straight to that page.',
          '"Recent Lessons" and "Recent Feedbacks" lists, each with their own search box and sorting.',
        ],
        tip: 'The Dashboard is the fastest way to confirm your data is showing up correctly before diving into details on other pages.',
      },
      {
        id: 'students',
        icon: 'Users',
        title: 'Students',
        intro: 'Manage every student\'s record: identity, contact info, parent info, and active/inactive status.',
        bullets: [
          'Fields: Full Name, Surname, Username, Phone, Parent Name & Contact, Status.',
          'Search students, and filter by status (Active / Inactive / All Statuses).',
          'Select multiple students with checkboxes to bulk delete ("Delete Selected").',
        ],
        steps: [
          'Click "Add Student" to open the create form and fill in the required fields (password is required for new students).',
          'Click the edit icon on a student row to update existing data.',
          'For many students at once: click "Import CSV", drag & drop your CSV file (or click to browse), and the system shows the detected CSV headers before processing.',
          'Click "Export CSV" any time to download the currently shown student data as a CSV file.',
        ],
        tip: 'CSV import will create new rows or update existing ones (matched by ID), then show a summary of how many rows were created, updated, and how many failed.',
      },
      {
        id: 'groups',
        icon: 'UsersRound',
        title: 'Groups',
        intro: 'A Group is a container for a class or a private lesson — complete with schedule and meeting links.',
        bullets: [
          'Group type: "Group" (many students in one class) or "Private" (one-to-one).',
          'Each group has: Course, Group Name, Group Phone, a list of Students, Language, Description, Meeting Link, Recordings Link, First Lesson Date & Time.',
          'Active/Inactive status marks whether a group is still running.',
        ],
        steps: [
          'Click "Add Group", pick a Course, fill in the name & schedule, then select the students in it.',
          'Fill in the First Lesson Date & Time correctly — it\'s typically used as the reference when generating the following Session schedule.',
          'Use search and status filters to quickly find a specific group.',
        ],
        tip: 'Always fill in the Meeting Link and Recordings Link for online classes, so students and parents can access them through the feedback you send later.',
      },
      {
        id: 'courses',
        icon: 'GraduationCap',
        title: 'Courses',
        intro: 'The list of available courses/programs (e.g. "Fundamental Frontend Development"). Courses are referenced when creating Groups and Lessons.',
        bullets: [
          'Add, edit, delete courses, with Active/Inactive status.',
          'Use search to find a course among a long list.',
        ],
        tip: 'Create/activate a Course before adding its Lessons and Groups, since both require picking a related Course.',
      },
      {
        id: 'lessons',
        icon: 'CalendarDays',
        title: 'Lessons',
        intro: 'The curriculum/material list per course — every Lesson has an order number, module, category, and level.',
        bullets: [
          'Fields: Title, Module, Category, Level, Lesson Number, Competency, and a "Project Lesson" flag.',
          'Add/edit one at a time, or bulk import via CSV.',
        ],
        subsections: [
          {
            title: 'Import Lessons (CSV)',
            bullets: [
              'The ID in the CSV file refers to the target Course ID.',
              'Row count must match the number of Lessons in that course, sorted by Lesson Number.',
            ],
          },
          {
            title: 'Import Competencies (CSV)',
            bullets: [
              'Used specifically to update the Competency field on existing Lessons, without touching other fields.',
            ],
          },
        ],
        tip: 'If a CSV import partially fails, valid rows are still processed and the system reports how many rows failed — double-check the CSV format requirements before retrying.',
      },
      {
        id: 'sessions',
        icon: 'CalendarDays',
        title: 'Sessions',
        intro: 'A Session is a single scheduled class meeting. This page is where you log what happened in class, week by week.',
        bullets: [
          'Built-in tabs: Session Last Week, Session This Week, Session Next Week, and All.',
          'Session status: Pending, Done, or Cancelled — a cancelled session cannot be marked done.',
        ],
        steps: [
          'Open the week tab you want to review, then click "Mark as Done" on sessions that already happened.',
          'Click "Update Attendance" to select which students attended that session.',
          'If a class was cancelled, use "Mark Cancelled" (a confirmation is required) — you can also opt to "Shift subsequent sessions" so the following schedule moves forward automatically.',
          'For bulk changes, use "Auto Mark Done" or "Auto Fill Attendance" with a date range (From Date / Until Date / Before Date).',
        ],
        tip: 'Keep Session status and attendance up to date every week — this data feeds directly into the Attendance Score when Feedback is generated.',
      },
      {
        id: 'feedbacks',
        icon: 'LineChart',
        title: 'Feedbacks',
        intro: 'Where you generate, edit, and send student progress reports — both regular per-lesson feedback and graduation reports.',
        bullets: [
          'Same tabs as Sessions (Last/This/Next Week/All), plus a dedicated "Graduation Feedback" tab.',
          'Each feedback contains: Attendance Score, Activity Score, Task Score, Project Link, and Tutor Comments.',
          'Attendance score uses a qualitative scale (None → Rarely → Sometimes → Often → Always), activity score uses (Inactive → Slightly Active → Active → Very Active → Super Active).',
        ],
        subsections: [
          {
            title: 'Generating & sending regular feedback',
            steps: [
              'Click "Generate Feedbacks", choose a target: Specific Group or All Students. The system automatically creates feedback records for every 4 lessons a student has completed.',
              'Open each feedback row to fill in / edit scores, project link, and tutor comments.',
              'Click "Generate PDF" to create the report PDF (processed in the background — wait a moment, then refresh).',
              'Once the PDF is ready, use "View PDF" or "Download PDF", then "Send WhatsApp" to send it directly to the registered number.',
            ],
            bullets: [
              '"Generate All PDF" bulk-creates PDFs for many feedback records at once in the background — check progress via the PDF column in the table.',
              '"Schedule All WhatsApp" queues bulk WhatsApp delivery for feedback that already has a PDF.',
              '"Seed Feedbacks" fills in a default starting score (all 3s) for sessions that don\'t have feedback yet — handy for legacy data, use it carefully as it\'s a bulk action.',
              'An automatic banner appears above the table if there are still PDFs left to generate, showing the exact count.',
            ],
          },
          {
            title: 'Graduation Feedback',
            steps: [
              'Open the "Graduation Feedback" tab and click "Generate Graduation PDF".',
              'Select the Student and the Course whose module they have completed.',
              'The system generates a full graduation report, including the Grade, in the background.',
              'Once done, the report can be viewed/downloaded just like regular feedback.',
            ],
          },
        ],
        tip: 'PDF generation and WhatsApp scheduling both run in the background — don\'t worry if the status doesn\'t change within a few seconds, just wait and check again.',
      },
      {
        id: 'users',
        icon: 'UserCog',
        title: 'Users',
        badge: 'Admin only',
        intro: 'Manage system user accounts (Admin, Tutor, Student). This menu is only visible if your account has the Admin role.',
        bullets: [
          'Add, edit, or delete user accounts along with their role.',
          'Use search to quickly find a specific user.',
        ],
        tip: 'Grant roles carefully: only give the Admin role when truly needed, since Admins can manage all data including other users\' accounts.',
      },
      {
        id: 'profile',
        icon: 'UserCircle',
        title: 'Profile',
        intro: 'Manage your own account details and the WhatsApp API configuration used to send automated feedback.',
        bullets: [
          'You can change your Full Name, Phone Number (used for WhatsApp notifications sent directly to you), and Password (leave blank to keep it unchanged).',
          'Email cannot be changed from this page.',
          'Fill in your WhatsApp API Key and WhatsApp Device ID so the system can send feedback messages through your WhatsApp Gateway.',
        ],
        tip: 'You can find your WhatsApp API Key & Device ID in your WA Gateway dashboard. Without these, the "Send WhatsApp" button on the Feedback page will not work.',
      },
      {
        id: 'general-tips',
        icon: 'Sparkles',
        title: 'General Tips & Navigation',
        intro: 'A few small habits that will make you comfortable with the Algo Feedback interface much faster.',
        bullets: [
          'The moon/sun icon in the top-right corner switches between Light Mode and Dark Mode.',
          'The globe icon next to it switches the interface language: Indonesia, English, or Русский — your choice is saved automatically for next time.',
          'On larger screens, click the menu icon in the header to collapse/expand the sidebar for more room.',
          'On mobile, use the hamburger icon (☰) to open the navigation menu.',
          'Almost every list page (Students, Groups, Courses, Lessons, Sessions, Feedbacks, Users) follows the same pattern: a search box, status filter, sorting, checkboxes for bulk actions, and pagination at the bottom.',
          'Success/error toast notifications always appear in the top-right corner after you perform an action.',
          'The round profile icon in the top-right shows your name & role, plus quick access to Profile and the Logout button.',
        ],
      },
    ],
    faq: [
      {
        q: 'Why doesn\'t the "Users" menu show up in my sidebar?',
        a: 'The Users menu is only visible for accounts with the Admin role. If you\'re a Tutor or Student, it is intentionally hidden.',
      },
      {
        q: 'I clicked "Generate PDF" but the PDF isn\'t there yet, why?',
        a: 'PDF generation runs as a background process and takes a bit of time. Wait a few moments and reload the page — the PDF column in the table will update once it\'s done.',
      },
      {
        q: 'Why isn\'t feedback being sent to the student\'s WhatsApp?',
        a: 'Make sure you\'ve filled in your WhatsApp API Key and WhatsApp Device ID on the Profile page, that the feedback PDF has finished generating, and that the student/group\'s phone number is formatted correctly.',
      },
      {
        q: 'How do I reset my password if I forgot it?',
        a: 'On the Login page, click "Forgot your password?", enter your email, then check your inbox for the reset link.',
      },
      {
        q: 'Why did my Student/Lesson CSV import partially fail?',
        a: 'Double-check your CSV headers match the format the system expects (shown during import). For Lesson imports, the row count must match the number of lessons in that course, sorted by Lesson Number.',
      },
      {
        q: 'Why can\'t I mark a Session as "Done"?',
        a: 'A session whose status is already "Cancelled" cannot be marked done. If this is a mistake, recreate the session or contact your Admin.',
      },
      {
        q: 'How do I change the language or switch between light/dark theme?',
        a: 'Use the globe icon (language) and the moon/sun icon (theme) in the top-right of the header — available on every page after logging in.',
      },
      {
        q: 'What\'s the difference between "Generate Feedbacks" and "Seed Feedbacks"?',
        a: '"Generate Feedbacks" creates new feedback records based on a student\'s lesson progress (every 4 completed lessons). "Seed Feedbacks" only fills in a default starting score (all 3s) for sessions that don\'t have any feedback yet — typically used once when migrating old data.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── Russian ──
  ru: {
    ui: {
      pageTitle: 'Руководство пользователя',
      pageSubtitle: 'Всё, что нужно знать, чтобы пользоваться Algo Feedback — от первого входа до продвинутых функций.',
      searchPlaceholder: 'Поиск по теме, например «импорт CSV» или «WhatsApp»...',
      noResults: 'Ничего не найдено. Попробуйте другой запрос.',
      clearSearch: 'Очистить поиск',
      tocTitle: 'Содержание',
      faqTitle: 'Часто задаваемые вопросы',
      faqSubtitle: 'Быстрые ответы на самые частые вопросы новичков.',
      tipLabel: 'Совет',
      stepsLabel: 'Шаги',
      featuresLabel: 'Что можно сделать',
      roleAdmin: 'Только для админа',
      contactTitle: 'Остались вопросы?',
      contactDesc: 'Обратитесь к администратору вашей системы или напрямую к команде Algonova, если что-то осталось непонятным.',
      backToTop: 'Наверх',
    },
    sections: [
      {
        id: 'getting-started',
        icon: 'Rocket',
        title: 'Быстрый старт',
        intro: 'Впервые пользуетесь Algo Feedback? Следуйте этому порядку — и система будет готова к ежедневной работе.',
        bullets: [
          'Есть 3 роли пользователей: Админ (полный доступ, включая управление Пользователями), Тьютор (управляет учениками, группами, курсами, уроками, сессиями и отзывами) и Ученик.',
          'Войти можно по email и паролю или сразу через аккаунт Google.',
          'Забыли пароль? Используйте ссылку «Забыли пароль?» на странице входа, чтобы получить письмо для сброса пароля.',
        ],
        steps: [
          'Зарегистрируйтесь на странице Register или попросите Админа создать аккаунт для вас.',
          'Войдите в систему, откройте раздел Профиль и заполните номер телефона и данные WhatsApp API, если планируете отправлять отзывы через WhatsApp.',
          'Добавьте Учеников (по одному или массово через импорт CSV).',
          'Создайте Группы, добавьте в них нужных учеников и укажите дату первого занятия.',
          'Убедитесь, что Курсы и Уроки уже настроены (при большой программе — импортируйте через CSV).',
          'Каждую неделю проверяйте страницу Сессии, чтобы отмечать посещаемость и статус занятий.',
          'Используйте страницу Отзывы, чтобы создавать, редактировать и отправлять отзывы ученикам/родителям.',
        ],
        tip: 'Следуйте списку сверху вниз — многие функции (например, Сессии и Отзывы) зависят от уже созданных Учеников, Групп и Уроков.',
      },
      {
        id: 'dashboard',
        icon: 'LayoutDashboard',
        title: 'Панель управления',
        intro: 'Первая страница после входа. Показывает сводку ключевых показателей и последнюю активность.',
        bullets: [
          '4 карточки статистики: Всего учеников, Всего групп, Всего уроков, Всего отзывов — нажмите на карточку, чтобы перейти на нужную страницу.',
          'Списки «Последние уроки» и «Последние отзывы», у каждого своё поле поиска и сортировка.',
        ],
        tip: 'Панель управления — самый быстрый способ убедиться, что ваши данные отображаются корректно, прежде чем углубляться в детали на других страницах.',
      },
      {
        id: 'students',
        icon: 'Users',
        title: 'Ученики',
        intro: 'Управление данными всех учеников: имя, контакты, информация о родителях, статус активности.',
        bullets: [
          'Поля: Полное имя, Фамилия, Имя пользователя, Телефон, Имя и контакт родителя, Статус.',
          'Поиск учеников и фильтр по статусу (Активен / Неактивен / Все статусы).',
          'Выбор нескольких учеников чекбоксами для массового удаления («Удалить выбранное»).',
        ],
        steps: [
          'Нажмите «Добавить ученика», чтобы открыть форму создания, и заполните обязательные поля (пароль обязателен для новых учеников).',
          'Нажмите иконку редактирования в строке ученика, чтобы изменить существующие данные.',
          'Для массового добавления: нажмите «Импорт CSV», перетащите файл CSV (или нажмите, чтобы выбрать), система покажет распознанные заголовки CSV перед обработкой.',
          'Нажмите «Экспорт CSV» в любой момент, чтобы скачать отображаемые данные учеников в виде файла CSV.',
        ],
        tip: 'Импорт CSV создаёт новые записи или обновляет существующие (по ID), а затем показывает сводку: сколько строк создано, обновлено и сколько не удалось загрузить.',
      },
      {
        id: 'groups',
        icon: 'UsersRound',
        title: 'Группы',
        intro: 'Группа — это контейнер для класса или индивидуального занятия, вместе с расписанием и ссылками на встречи.',
        bullets: [
          'Тип группы: «Группа» (много учеников в одном классе) или «Индивидуально» (один на один).',
          'У каждой группы есть: Курс, Название группы, Телефон группы, список Учеников, Язык, Описание, Ссылка на встречу, Ссылка на записи, Дата и время первого урока.',
          'Статус Активна/Неактивна определяет, продолжается ли работа группы.',
        ],
        steps: [
          'Нажмите «Добавить группу», выберите Курс, заполните название и расписание, затем выберите учеников.',
          'Правильно укажите Дату и время первого урока — обычно это ориентир для создания последующего расписания Сессий.',
          'Используйте поиск и фильтр по статусу, чтобы быстро найти нужную группу.',
        ],
        tip: 'Всегда заполняйте Ссылку на встречу и Ссылку на записи для онлайн-занятий, чтобы ученики и родители могли получить к ним доступ через отправленный позже отзыв.',
      },
      {
        id: 'courses',
        icon: 'GraduationCap',
        title: 'Курсы',
        intro: 'Список доступных курсов/программ (например, «Fundamental Frontend Development»). Курсы используются при создании Групп и Уроков.',
        bullets: [
          'Добавление, редактирование, удаление курсов со статусом Активен/Неактивен.',
          'Используйте поиск, чтобы найти курс в длинном списке.',
        ],
        tip: 'Создайте/активируйте Курс прежде, чем добавлять его Уроки и Группы — оба требуют выбора связанного Курса.',
      },
      {
        id: 'lessons',
        icon: 'CalendarDays',
        title: 'Уроки',
        intro: 'Список программы/материалов по курсу — у каждого Урока есть порядковый номер, модуль, категория и уровень.',
        bullets: [
          'Поля: Название, Модуль, Категория, Уровень, Номер урока, Компетенция, отметка «Проектный урок».',
          'Можно добавлять/редактировать по одному или массово через импорт CSV.',
        ],
        subsections: [
          {
            title: 'Импорт уроков (CSV)',
            bullets: [
              'ID в файле CSV — это ID целевого курса.',
              'Количество строк должно совпадать с количеством уроков в этом курсе и быть отсортировано по Номеру урока.',
            ],
          },
          {
            title: 'Импорт компетенций (CSV)',
            bullets: [
              'Используется специально для обновления поля Компетенция у существующих уроков, без изменения остальных данных.',
            ],
          },
        ],
        tip: 'Если импорт CSV частично не удался, корректные строки всё равно будут обработаны, а система покажет число строк с ошибкой — перед повторной попыткой проверьте требования к формату CSV.',
      },
      {
        id: 'sessions',
        icon: 'CalendarDays',
        title: 'Сессии',
        intro: 'Сессия — это одно запланированное занятие. На этой странице вы фиксируете, что произошло на занятии, неделя за неделей.',
        bullets: [
          'Встроенные вкладки: Сессии на прошлой неделе, на этой неделе, на следующей неделе и Все.',
          'Статус сессии: В ожидании, Завершено или Отменено — отменённую сессию нельзя отметить как завершённую.',
        ],
        steps: [
          'Откройте нужную недельную вкладку и нажмите «Отметить как завершенное» на прошедших сессиях.',
          'Нажмите «Обновить посещаемость», чтобы выбрать, какие ученики присутствовали на занятии.',
          'Если занятие отменено, используйте «Отметить отмененными» (потребуется подтверждение) — можно также включить опцию «Сдвинуть последующие сессии», чтобы дальнейшее расписание сдвинулось автоматически.',
          'Для массовых изменений используйте «Авто-завершение» или «Авто-посещаемость» с диапазоном дат (С даты / До даты / До даты (исключая)).',
        ],
        tip: 'Регулярно обновляйте статус сессий и посещаемость каждую неделю — эти данные напрямую влияют на Оценку посещаемости при создании отзыва.',
      },
      {
        id: 'feedbacks',
        icon: 'LineChart',
        title: 'Отзывы',
        intro: 'Здесь вы создаёте, редактируете и отправляете отчёты об успеваемости — как обычные отзывы за несколько уроков, так и выпускные отчёты.',
        bullets: [
          'Те же вкладки, что и в Сессиях (Прошлая/Эта/Следующая неделя/Все), плюс отдельная вкладка «Отзывы о выпуске».',
          'Каждый отзыв содержит: Оценку посещаемости, Оценку активности, Оценку задач, Ссылку на проект и Комментарии тьютора.',
          'Оценка посещаемости использует качественную шкалу (Нет → Редко → Иногда → Часто → Всегда), оценка активности — (Пассивен → Мало активен → Активен → Очень активен → Супер активен).',
        ],
        subsections: [
          {
            title: 'Создание и отправка обычных отзывов',
            steps: [
              'Нажмите «Создать отзывы», выберите цель: Конкретную группу или Всех учеников. Система автоматически создаёт записи отзывов за каждые 4 пройденных урока.',
              'Откройте каждую строку отзыва, чтобы заполнить/изменить оценки, ссылку на проект и комментарии тьютора.',
              'Нажмите «Создать PDF», чтобы сформировать отчёт в формате PDF (обрабатывается в фоне — подождите немного и обновите страницу).',
              'Когда PDF готов, используйте «Просмотреть PDF» или «Скачать PDF», затем «Отправить WhatsApp», чтобы отправить его на зарегистрированный номер.',
            ],
            bullets: [
              '«Создать все PDF» массово создаёт PDF для множества отзывов сразу в фоновом режиме — следите за статусом в колонке PDF в таблице.',
              '«Запланировать все WhatsApp» ставит в очередь массовую отправку WhatsApp для отзывов, у которых уже есть PDF.',
              '«Наполнить отзывы» проставляет базовую начальную оценку (везде значение 3) для сессий, у которых ещё нет отзыва — удобно для старых данных, используйте осторожно, это массовое действие.',
              'Над таблицей автоматически появляется баннер, если ещё остались несозданные PDF, с точным их количеством.',
            ],
          },
          {
            title: 'Отзывы о выпуске (Graduation)',
            steps: [
              'Откройте вкладку «Отзывы о выпуске» и нажмите «Создать выпускной PDF».',
              'Выберите Ученика и Курс, модуль которого он завершил.',
              'Система в фоновом режиме создаёт полный выпускной отчёт, включая Оценку (grade).',
              'После готовности отчёт можно просмотреть/скачать так же, как обычный отзыв.',
            ],
          },
        ],
        tip: 'Создание PDF и планирование WhatsApp выполняются в фоновом режиме — не переживайте, если статус не меняется в течение нескольких секунд, просто подождите и проверьте снова.',
      },
      {
        id: 'users',
        icon: 'UserCog',
        title: 'Пользователи',
        badge: 'Только для админа',
        intro: 'Управление учётными записями пользователей системы (Админ, Тьютор, Ученик). Этот раздел виден только аккаунтам с ролью Админ.',
        bullets: [
          'Добавление, редактирование или удаление учётных записей вместе с их ролью.',
          'Используйте поиск, чтобы быстро найти нужного пользователя.',
        ],
        tip: 'Назначайте роли осторожно: давайте роль Админа только при реальной необходимости, так как Админ может управлять всеми данными, включая аккаунты других пользователей.',
      },
      {
        id: 'profile',
        icon: 'UserCircle',
        title: 'Профиль',
        intro: 'Управление данными собственного аккаунта и настройкой WhatsApp API, используемой для отправки автоматических отзывов.',
        bullets: [
          'Можно изменить Полное имя, Номер телефона (используется для WhatsApp-уведомлений лично вам) и Пароль (оставьте пустым, чтобы не менять).',
          'Email нельзя изменить на этой странице.',
          'Заполните WhatsApp API Key и WhatsApp Device ID, чтобы система могла отправлять сообщения с отзывами через ваш WhatsApp Gateway.',
        ],
        tip: 'WhatsApp API Key и Device ID можно найти в панели вашего WA Gateway. Без них кнопка «Отправить WhatsApp» на странице Отзывов работать не будет.',
      },
      {
        id: 'general-tips',
        icon: 'Sparkles',
        title: 'Общие советы и навигация',
        intro: 'Несколько небольших привычек, которые помогут быстрее освоиться с интерфейсом Algo Feedback.',
        bullets: [
          'Иконка луны/солнца в правом верхнем углу переключает Светлую / Тёмную тему.',
          'Иконка глобуса рядом переключает язык интерфейса: Indonesia, English или Русский — выбор автоматически сохраняется для следующего визита.',
          'На больших экранах нажмите иконку меню в шапке, чтобы свернуть/развернуть боковую панель и освободить место.',
          'На мобильном используйте иконку «гамбургер» (☰), чтобы открыть меню навигации.',
          'Почти все страницы со списками (Ученики, Группы, Курсы, Уроки, Сессии, Отзывы, Пользователи) устроены одинаково: поле поиска, фильтр по статусу, сортировка, чекбоксы для массовых действий и постраничная навигация внизу.',
          'Уведомления об успехе/ошибке (toast) всегда появляются в правом верхнем углу экрана после выполнения действия.',
          'Круглая иконка профиля в правом верхнем углу показывает ваше имя и роль, а также быстрый доступ к Профилю и кнопке выхода.',
        ],
      },
    ],
    faq: [
      {
        q: 'Почему в моём меню нет раздела «Пользователи»?',
        a: 'Раздел «Пользователи» виден только аккаунтам с ролью Админ. Если вы Тьютор или Ученик, он скрыт намеренно.',
      },
      {
        q: 'Я нажал «Создать PDF», но PDF ещё нет — почему?',
        a: 'Создание PDF выполняется в фоновом режиме и занимает немного времени. Подождите немного и обновите страницу — колонка PDF в таблице обновится, когда всё будет готово.',
      },
      {
        q: 'Почему отзыв не отправляется ученику в WhatsApp?',
        a: 'Убедитесь, что в Профиле заполнены WhatsApp API Key и WhatsApp Device ID, что PDF отзыва уже сформирован, и что номер телефона ученика/группы указан в правильном формате.',
      },
      {
        q: 'Как сбросить пароль, если я его забыл?',
        a: 'На странице входа нажмите «Забыли пароль?», введите email, а затем проверьте почту — там будет ссылка для сброса пароля.',
      },
      {
        q: 'Почему часть моего CSV-импорта учеников/уроков не загрузилась?',
        a: 'Проверьте, соответствуют ли заголовки CSV требуемому формату (он показывается во время импорта). Для импорта уроков количество строк должно совпадать с количеством уроков в курсе и быть отсортировано по Номеру урока.',
      },
      {
        q: 'Почему я не могу отметить Сессию как «Завершено»?',
        a: 'Сессию со статусом «Отменено» нельзя отметить как завершённую. Если это ошибка, создайте сессию заново или обратитесь к Админу.',
      },
      {
        q: 'Как поменять язык или переключить светлую/тёмную тему?',
        a: 'Используйте иконку глобуса (язык) и иконку луны/солнца (тема) в правом верхнем углу шапки — доступны на каждой странице после входа.',
      },
      {
        q: 'В чём разница между «Создать отзывы» и «Наполнить отзывы»?',
        a: '«Создать отзывы» создаёт новые записи отзывов на основе прогресса ученика по урокам (за каждые 4 пройденных урока). «Наполнить отзывы» лишь проставляет базовую начальную оценку (везде 3) для сессий, у которых ещё вообще нет отзыва — обычно используется один раз при переносе старых данных.',
      },
    ],
  },
}
