import { MERCADOLIBRE_CONFIG } from '../../config/mercadolibre';

interface ApiRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export async function makeApiRequest<T>({ path, method = 'GET', headers = {}, body }: ApiRequestOptions): Promise<T> {
  try {
    if (import.meta.env.DEV) {
      // In development, use Vite's proxy
      const response = await fetch(`/ml-api${path}`, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...headers
        },
        ...(body && { body: JSON.stringify(body) })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return response.json();
    } else {
      // In production, use Netlify function
      const response = await fetch('/.netlify/functions/mercadolibre-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path,
          method,
          headers,
          body
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return response.json();
    }
  } catch (error: any) {
    console.error('API request error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }
}
