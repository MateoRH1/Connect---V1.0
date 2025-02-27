export const MERCADOLIBRE_CONFIG = {
  clientId: import.meta.env.VITE_MERCADOLIBRE_CLIENT_ID || '4683025741956879',
  clientSecret: import.meta.env.VITE_MERCADOLIBRE_CLIENT_SECRET || '1ie3G4fiCyrzZWb0CYJy7cfYIfdzWDXS',
  redirectUri: import.meta.env.VITE_MERCADOLIBRE_REDIRECT_URI || 'https://incredible-profiterole-5d1cb4.netlify.app/mercadolibre/callback',
  authUrl: 'https://auth.mercadolibre.com.ar/authorization',
  tokenUrl: 'https://api.mercadolibre.com/oauth/token',
  apiUrl: 'https://api.mercadolibre.com',
} as const;
