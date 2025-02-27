export interface User {
  id: string;
  email: string;
  role: 'client' | 'consultant';
  created_at: string;
}

export interface MercadoLibreAccount {
  id: string;
  user_id: string;
  account_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MercadoLibreConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}
