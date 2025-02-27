import { supabase } from '../supabase';
import { MERCADOLIBRE_CONFIG } from '../../config/mercadolibre';
import type { MercadoLibreAccount } from './types';

export class MercadoLibreAuth {
  private connectionStatusKey = 'ml_connection_status';
  private authStateKey = 'ml_auth_state';
  private tokenRefreshPromise: Promise<string | null> | null = null;

  redirectToAuth(): void {
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem(this.authStateKey, state);
    
    const authUrl = `${MERCADOLIBRE_CONFIG.authUrl}?response_type=code&client_id=${MERCADOLIBRE_CONFIG.clientId}&redirect_uri=${MERCADOLIBRE_CONFIG.redirectUri}&state=${state}`;
    window.location.href = authUrl;
  }

  async exchangeCodeForToken(code: string, userId: string): Promise<void> {
    try {
      // Exchange code for token
      const response = await fetch(MERCADOLIBRE_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: MERCADOLIBRE_CONFIG.clientId,
          client_secret: MERCADOLIBRE_CONFIG.clientSecret,
          code: code,
          redirect_uri: MERCADOLIBRE_CONFIG.redirectUri
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
      }

      const data = await response.json();

      // Store account data
      const { error: accountError } = await supabase
        .from('mercadolibre_accounts')
        .upsert({
          user_id: userId,
          account_id: data.user_id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (accountError) {
        throw accountError;
      }

      // Store auth code for reference
      const { error: authCodeError } = await supabase
        .from('mercadolibre_auth_codes')
        .insert({
          user_id: userId,
          code: code,
          created_at: new Date().toISOString()
        });

      if (authCodeError) {
        throw authCodeError;
      }

      // Update connection status
      this.setConnectionStatus('connected');
      
      // Clear auth state
      sessionStorage.removeItem(this.authStateKey);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  async getAccessToken(userId: string): Promise<string | null> {
    try {
      // Return existing refresh promise if one is in progress
      if (this.tokenRefreshPromise) {
        return this.tokenRefreshPromise;
      }

      const account = await this.getUserAccount(userId);
      if (!account) {
        return null;
      }

      // Check if token needs refresh
      if (new Date(account.expires_at) <= new Date()) {
        this.tokenRefreshPromise = this.refreshToken(account);
        const newToken = await this.tokenRefreshPromise;
        this.tokenRefreshPromise = null;
        return newToken;
      }

      return account.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      this.tokenRefreshPromise = null;
      return null;
    }
  }

  private async refreshToken(account: MercadoLibreAccount): Promise<string | null> {
    try {
      const response = await fetch(MERCADOLIBRE_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: MERCADOLIBRE_CONFIG.clientId,
          client_secret: MERCADOLIBRE_CONFIG.clientSecret,
          refresh_token: account.refresh_token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      // Update account data
      const { error: updateError } = await supabase
        .from('mercadolibre_accounts')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
        })
        .eq('id', account.id);

      if (updateError) {
        throw updateError;
      }

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  async getLatestAuthCode(userId: string) {
    try {
      const { data, error } = await supabase
        .from('mercadolibre_auth_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting latest auth code:', error);
      return null;
    }
  }

  async getUserAccount(userId: string): Promise<MercadoLibreAccount | null> {
    try {
      const { data, error } = await supabase
        .from('mercadolibre_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user account:', error);
      return null;
    }
  }

  getConnectionStatus(): boolean {
    return sessionStorage.getItem(this.connectionStatusKey) === 'connected';
  }

  setConnectionStatus(status: 'connected' | 'disconnected'): void {
    sessionStorage.setItem(this.connectionStatusKey, status);
  }

  clearConnectionStatus(): void {
    sessionStorage.removeItem(this.connectionStatusKey);
  }

  getAuthState(): string | null {
    return sessionStorage.getItem(this.authStateKey);
  }

  clearAuthState(): void {
    sessionStorage.removeItem(this.authStateKey);
  }
}
