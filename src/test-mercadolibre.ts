import { MERCADOLIBRE_CONFIG } from './config/mercadolibre';

async function testMercadoLibreAPI() {
  const accessToken = 'APP_USR-4683025741956879-022512-0ebab52012b7b0943f2cf8d9049728e3-1692497612';
  
  try {
    // First test: Get user info
    console.log('Testing user info...');
    const userResponse = await fetch(`${MERCADOLIBRE_CONFIG.apiUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    console.log('User data:', userData);

    // Second test: Get user's items
    console.log('\nTesting items search...');
    const itemsResponse = await fetch(
      `${MERCADOLIBRE_CONFIG.apiUrl}/users/${userData.id}/items/search`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!itemsResponse.ok) {
      throw new Error(`Failed to get items: ${itemsResponse.status}`);
    }

    const itemsData = await itemsResponse.json();
    console.log('Items data:', itemsData);

    // If we have items, get details for the first one
    if (itemsData.results && itemsData.results.length > 0) {
      console.log('\nTesting item details...');
      const itemId = itemsData.results[0];
      const itemResponse = await fetch(
        `${MERCADOLIBRE_CONFIG.apiUrl}/items/${itemId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!itemResponse.ok) {
        throw new Error(`Failed to get item details: ${itemResponse.status}`);
      }

      const itemData = await itemResponse.json();
      console.log('Item details:', itemData);
    }

  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testMercadoLibreAPI();
