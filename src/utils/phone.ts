/**
 * Sanitizes a phone number by removing non-numeric characters and 
 * formatting it to start with the Indonesian country code '62'.
 * 
 * Examples:
 * - "085347029992" -> "6285347029992"
 * - "+62 812-3456-789" -> "628123456789"
 * - "62 (812) 216-13-004" -> "6281221613004"
 */
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return ''
  
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '')
  
  // Handle "6208..." -> "628..."
  if (cleaned.startsWith('620')) {
    cleaned = '62' + cleaned.slice(3)
  }
  
  // Handle leading '0' (Indonesian local format)
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  
  // If it starts with 8 (local format without 0), prepend 62
  if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  }
  
  return cleaned
}
