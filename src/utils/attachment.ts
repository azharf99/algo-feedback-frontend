// Client-side attachment helpers for the Help Center chat. These checks are for UX only
// (fast feedback before an upload even starts) — the backend re-validates everything from
// the actual file bytes (see pkg/attachment.Validate on the Go side) and is the real
// security boundary. Keep MAX_ATTACHMENT_SIZE in sync with pkg/attachment.MaxSize.

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10 MB

// Extensions accepted by the backend whitelist (pkg/attachment). SVG is intentionally
// excluded — it can embed <script> and is a classic stored-XSS vector for user uploads.
export const ACCEPTED_ATTACHMENT_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
]

export const ACCEPTED_ATTACHMENT_ACCEPT = ACCEPTED_ATTACHMENT_EXTENSIONS.join(',')

/** Returns an error message if the file fails a quick client-side sanity check, else null. */
export function validateAttachmentClientSide(file: File): string | null {
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return `File is too large (max ${formatBytes(MAX_ATTACHMENT_SIZE)})`
  }
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
  if (!ACCEPTED_ATTACHMENT_EXTENSIONS.includes(ext)) {
    return 'File type not supported'
  }
  return null
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`
}
