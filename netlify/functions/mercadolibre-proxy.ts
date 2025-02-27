import { Handler } from '@netlify/functions';

const MERCADOLIBRE_API = 'https://api.mercadolibre.com';

const handler: Handler = async (event) => {
  // Log incoming request for debugging
  console.log('Incoming request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers
  });

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { path, method = 'GET', headers = {}, body } = JSON.parse(event.body || '{}');

    if (!path) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Path is required' })
      };
    }

    const url = `${MERCADOLIBRE_API}${path}`;
    
    console.log('Making request to MercadoLibre:', {
      url,
      method,
      headers
    });

    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      ...(body && { body: JSON.stringify(body) })
    });

    const data = await response.json();

    // Log response for debugging
    console.log('MercadoLibre response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      data
    });

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error: any) {
    console.error('Proxy error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack
      })
    };
  }
};

export { handler };
