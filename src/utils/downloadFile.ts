/**
 * Memicu unduhan file di browser dari sebuah Blob (mis. hasil export CSV/PDF).
 * Membuat object URL sementara, mensimulasikan klik pada elemen <a>, lalu membersihkannya.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
