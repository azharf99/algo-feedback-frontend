/**
 * Generator file contoh (template) CSV untuk fitur Import Data.
 *
 * Struktur kolom di bawah ini WAJIB sinkron dengan parser masing-masing
 * `ImportCSV` di backend (`internal/usecase/*_usecase.go`). Jika backend
 * mengubah/menambah kolom yang dibaca saat import, perbarui juga file ini
 * supaya contoh yang diunduh user tidak membuat data rusak saat diimport.
 *
 * Catatan penting yang direfleksikan di data contoh:
 * - Nama header CSV bersifat case-sensitive & harus persis sama (huruf kecil,
 *   snake_case) kecuali untuk import kompetensi lesson yang case-insensitive.
 * - Kolom `id` WAJIB diisi angka > 0. Isi dengan ID yang sudah ada di sistem
 *   untuk MENGUBAH data tsb, atau ID yang belum dipakai untuk MEMBUAT data baru
 *   (backend melakukan upsert berdasarkan `id`, bukan auto-increment).
 * - Kolom boolean (`is_active`, dst.) menerima TRUE/FALSE (tidak case-sensitive,
 *   selain "false" dianggap true).
 * - Tanggal pada Group (`first_lesson_date`) memakai format DD/MM/YYYY dan
 *   waktu (`first_lesson_time`) memakai format 24 jam HH:MM.
 * - Kolom `password` pada Student akan SELALU di-hash ulang & menimpa password
 *   lama setiap kali baris tsb diimport (termasuk saat update) — kosongkan
 *   dengan hati-hati atau isi password yang diinginkan.
 */

const utf8BOM = '﻿'

function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (value: string | number): string => {
    const str = String(value ?? '')
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','))
  }
  return utf8BOM + lines.join('\r\n') + '\r\n'
}

export type CsvTemplateType = 'course' | 'group' | 'lesson' | 'lessonCompetencies' | 'student'

const templates: Record<CsvTemplateType, { filename: string; content: string }> = {
  course: {
    filename: 'contoh_import_courses.csv',
    content: buildCsv(
      ['id', 'title', 'module', 'description', 'is_active'],
      [
        [9001, 'Fundamental Web Development', 'Web Development', 'Kursus dasar pengembangan web', 'TRUE'],
        [9002, 'Artificial Intelligence Basic', 'Artificial Intelligence', 'Pengantar AI & Machine Learning', 'TRUE'],
      ]
    ),
  },
  group: {
    filename: 'contoh_import_groups.csv',
    content: buildCsv(
      [
        'id', 'course_id', 'name', 'type', 'description', 'group_phone',
        'meeting_link', 'recordings_link', 'first_lesson_date', 'first_lesson_time',
        'is_active', 'language', 'students',
      ],
      [
        [
          9101, 9001, 'WEB-0126', 'Group', 'Kelas reguler sore',
          '081234567890', 'https://meet.google.com/xxx-yyyy-zzz', '',
          '25/12/2026', '19:30', 'TRUE', 'Indonesia', '100369658,100369659',
        ],
        [
          9102, 9001, 'WEB-0226', 'Private', 'Kelas privat',
          '', 'https://meet.google.com/aaa-bbbb-ccc', '',
          '02/01/2027', '09:00', 'TRUE', 'English', '100369660',
        ],
      ]
    ),
  },
  lesson: {
    filename: 'contoh_import_lessons.csv',
    content: buildCsv(
      [
        'id', 'course_id', 'title', 'category', 'module', 'level', 'number',
        'description', 'competency', 'is_active', 'is_project_lesson',
      ],
      [
        [
          9201, 9001, 'Pengenalan HTML & CSS', 'Web Development', 'Web Development',
          'M1L1', 1, '', 'Memahami struktur dasar HTML;Memahami dasar CSS', 'TRUE', 'FALSE',
        ],
        [
          9202, 9001, 'Dasar JavaScript', 'Web Development', 'Web Development',
          'M1L2', 2, '', 'Memahami tipe data & variabel;Memahami function dasar', 'TRUE', 'FALSE',
        ],
      ]
    ),
  },
  lessonCompetencies: {
    filename: 'contoh_import_kompetensi_lesson.csv',
    content: buildCsv(
      ['ID', 'competencies'],
      [
        [9001, 'Memahami struktur dasar HTML;Memahami dasar CSS'],
        [9001, 'Memahami tipe data & variabel;Memahami function dasar'],
      ]
    ),
  },
  student: {
    filename: 'contoh_import_students.csv',
    content: buildCsv(
      ['id', 'fullname', 'surname', 'username', 'password', 'phone_number', 'parent_name', 'parent_contact', 'is_active'],
      [
        [9301, 'Budi Santoso', 'Santoso', 'budi.santoso', 'gantiPassword123', '081234567890', 'Agus Santoso', '081298765432', 'TRUE'],
        [9302, 'Siti Aminah', 'Aminah', 'siti.aminah', 'gantiPassword456', '081211112222', 'Wati Aminah', '081233334444', 'TRUE'],
      ]
    ),
  },
}

/** Mengembalikan konten teks CSV contoh untuk jenis data tertentu. */
export function getCsvTemplate(type: CsvTemplateType): { filename: string; content: string } {
  return templates[type]
}

/** Memicu unduhan file contoh CSV di browser. */
export function downloadCsvTemplate(type: CsvTemplateType): void {
  const { filename, content } = getCsvTemplate(type)
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
