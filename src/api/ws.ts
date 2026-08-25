import { API_BASE_URL } from './axios'

// Builds the Help Center WebSocket URL from the same base URL used for REST calls,
// swapping http(s) for ws(s). Token is passed as a query param because the browser
// WebSocket API cannot send a custom Authorization header.
export const getHelpCenterWsUrl = (token: string): string => {
  let base = API_BASE_URL

  if (base.startsWith('http://') || base.startsWith('https://')) {
    base = base.replace(/^http/, 'ws')
  } else {
    // Relative base (e.g. '/api') — resolve against the current page origin.
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const path = base.startsWith('/') ? base : `/${base}`
    base = `${protocol}//${window.location.host}${path}`
  }

  const separator = base.endsWith('/') ? '' : '/'
  return `${base}${separator}help/ws?token=${encodeURIComponent(token)}`
}
