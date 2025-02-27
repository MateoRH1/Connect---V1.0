import { MercadoLibreAuth } from './auth';
import { supabase } from '../supabase';

class MercadoLibreService {
  private auth: MercadoLibreAuth;
  private baseUrl = import.meta.env.DEV ? '/ml-api' : 'https://api.mercadolibre.com';

  constructor() {
    this.auth = new MercadoLibreAuth();
  }

  // Auth methods
  redirectToAuth = () => this.auth.redirectToAuth();
  exchangeCodeForToken = (code: string, userId: string) => this.auth.exchangeCodeForToken(code, userId);
  getLatestAuthCode = (userId: string) => this.auth.getLatestAuthCode(userId);
  getUserAccount = (userId: string) => this.auth.getUserAccount(userId);
  getConnectionStatus = () => this.auth.getConnectionStatus();
  setConnectionStatus = (status: 'connected' | 'disconnected') => this.auth.setConnectionStatus(status);
  clearConnectionStatus = () => this.auth.clearConnectionStatus();

  private async validateConnection(userId: string): Promise<boolean> {
    try {
      // First check cached status
      if (this.getConnectionStatus()) {
        return true;
      }

      // Then check for active account
      const account = await this.auth.getUserAccount(userId);
      if (account) {
        this.setConnectionStatus('connected');
        return true;
      }

      // Finally check for pending auth code
      const authCode = await this.auth.getLatestAuthCode(userId);
      if (authCode) {
        this.setConnectionStatus('connected');
        return true;
      }

      this.setConnectionStatus('disconnected');
      return false;
    } catch (error: any) {
      console.error('Error validating connection:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      this.setConnectionStatus('disconnected');
      return false;
    }
  }
}

export const mercadolibre = new MercadoLibreService();
