/**
 * Sanitizes a phone number by removing non-numeric characters and 
 * formatting it based on country heuristics.
 * Supports: Indonesia (62), Russia (7), US (1), UK (44).
 */
export const sanitizePhoneNumber = (phone: string): string => {
  const trimmed = phone.trim()
  if (!trimmed) return ''

  // 1. Check if original input has '+' prefix (International trust)
  const hasPlus = trimmed.startsWith('+')

  // 2. Remove all non-numeric characters
  let cleaned = trimmed.replace(/\D/g, '')
  if (!cleaned) return ''

  // 3. If it had a '+', trust it as a complete international number
  if (hasPlus) return cleaned

  // 4. Handle Indonesian '0' prefix (08... -> 628...)
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }

  // 5. Heuristics for common countries
  const length = cleaned.length

  // Russian local prefix handling (89xx... -> 79xx...)
  if (length === 11 && cleaned.startsWith('89')) {
    return '7' + cleaned.slice(1)
  }

  // Russian (7) or US (1)
  if (length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    return cleaned
  }

  // UK (44)
  if ((length === 12 || length === 13) && cleaned.startsWith('44')) {
    return cleaned
  }

  // 6. Default fallback to Indonesia for local-style inputs
  if (length >= 9 && length <= 12 && !cleaned.startsWith('62')) {
    return '62' + cleaned
  }

  return cleaned
}
