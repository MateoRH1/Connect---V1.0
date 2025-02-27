import { supabase } from './supabase';
import { MERCADOLIBRE_CONFIG } from '../config/mercadolibre';
import type { MercadoLibreAccount } from '../types';

class MercadoLibreService {
  private connectionStatusKey = 'ml_connection_status';
  private authStateKey = 'ml_auth_state';
  private baseUrl = 'https://api.mercadolibre.com';

  redirectToAuth(): void {
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem(this.authStateKey, state);
    
    const authUrl = `${MERCADOLIBRE_CONFIG.authUrl}?response_type=code&client_id=${MERCADOLIBRE_CONFIG.clientId}&redirect_uri=${MERCADOLIBRE_CONFIG.redirectUri}&state=${state}`;
    window.location.href = authUrl;
  }

  async exchangeCodeForToken(code: string, userId: string): Promise<void> {
    try {
      // Store auth code
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

  private async getAccessToken(userId: string): Promise<string | null> {
    try {
      const account = await this.getUserAccount(userId);
      if (!account) {
        const authCode = await this.getLatestAuthCode(userId);
        if (!authCode) return null;

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
            code: authCode.code,
            redirect_uri: MERCADOLIBRE_CONFIG.redirectUri
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get access token');
        }

        const data = await response.json();
        
        // Store account data
        await supabase.from('mercadolibre_accounts').insert({
          user_id: userId,
          account_id: data.user_id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
        });

        return data.access_token;
      }

      // Check if token needs refresh
      if (new Date(account.expires_at) <= new Date()) {
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
        await supabase.from('mercadolibre_accounts')
          .update({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
          })
          .eq('id', account.id);

        return data.access_token;
      }

      return account.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
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

  async fetchPublications(userId: string) {
    try {
      // First try to sync with MercadoLibre
      await this.syncPublications(userId);

      // Then get from database
      const { data, error } = await supabase
        .from('mercadolibre_products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching publications:', error);
      return [];
    }
  }

  async fetchSalesData(userId: string) {
    try {
      // First try to sync with MercadoLibre
      await this.syncSalesData(userId);

      // Then get from database
      const { data, error } = await supabase
        .from('mercadolibre_sales_data')
        .select('*')
        .eq('user_id', userId)
        .order('sale_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return [];
    }
  }

  async syncPublications(userId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(userId);
      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      const account = await this.getUserAccount(userId);
      if (!account) {
        console.error('No MercadoLibre account found');
        return;
      }

      let offset = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${this.baseUrl}/users/${account.account_id}/items/search?limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch items. Status: ${response.status}. Body: ${errorText}`);
          return;
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Get detailed information for each item
          const itemDetails = await Promise.all(
            data.results.map(async (itemId: string) => {
              const itemResponse = await fetch(`${this.baseUrl}/items/${itemId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });
              if (!itemResponse.ok) {
                const errText = await itemResponse.text();
                console.error(`Failed to fetch item ${itemId}. Status: ${itemResponse.status}. Body: ${errText}`);
                return null;
              }
              return itemResponse.json();
            })
          );
          // Filtrar los items nulos (que fallaron al obtener)
          const validItems = itemDetails.filter(item => item !== null);
          // Actualizar la base de datos con cada item obtenido
          for (const item of validItems) {
            const { error: upsertError } = await supabase.from('mercadolibre_products').upsert({
              user_id: userId,
              item_id: item.id,
              title: item.title,
              category_id: item.category_id,
              price: item.price,
              currency_id: item.currency_id,
              available_quantity: item.available_quantity,
              sold_quantity: item.sold_quantity,
              listing_type_id: item.listing_type_id,
              status: item.status,
              permalink: item.permalink,
              thumbnail: item.thumbnail,
              last_updated: new Date().toISOString()
            }, {
              onConflict: 'user_id,item_id'
            });
            if (upsertError) {
              console.error(`Error upserting item ${item.id}:`, upsertError);
            }
          }

          offset += limit;
          if (data.results.length < limit) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      localStorage.setItem(`ml_publications_last_sync_${userId}`, new Date().toISOString());
    } catch (error) {
      // Registro extendido del error para ver detalles
      console.error('Error syncing publications:', error, JSON.stringify(error));
      // No se propaga la excepción para "limpiar" el flujo
    }
  }

  async syncSalesData(userId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(userId);
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const account = await this.getUserAccount(userId);
      if (!account) {
        throw new Error('No MercadoLibre account found');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 60);
      
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${this.baseUrl}/orders/search?seller=${account.account_id}&order.date_created.from=${startDate.toISOString()}&limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          for (const order of data.results) {
            await supabase.from('mercadolibre_sales_data').upsert({
              user_id: userId,
              sale_id: order.id,
              sale_date: order.date_created,
              shipping_status: order.shipping?.status,
              quantity: order.order_items.reduce((total: number, item: any) => total + item.quantity, 0),
              total_amount: order.total_amount,
              publication_id: order.order_items[0]?.item.id,
              publication_title: order.order_items[0]?.item.title,
              unit_price: order.order_items[0]?.unit_price,
              buyer_nickname: order.buyer.nickname,
              shipping_address: order.shipping?.receiver_address?.address_line,
              shipping_city: order.shipping?.receiver_address?.city?.name,
              shipping_state: order.shipping?.receiver_address?.state?.name,
              shipping_country: order.shipping?.receiver_address?.country?.name,
              shipping_zip: order.shipping?.receiver_address?.zip_code,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,sale_id'
            });
          }

          offset += limit;
          hasMore = data.paging.total > offset;
        } else {
          hasMore = false;
        }
      }

      localStorage.setItem(`ml_sales_last_sync_${userId}`, new Date().toISOString());
    } catch (error) {
      console.error('Error syncing sales data:', error);
      throw error;
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

export const mercadolibre = new MercadoLibreService();
