export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
} as const;

export default CONFIG;
