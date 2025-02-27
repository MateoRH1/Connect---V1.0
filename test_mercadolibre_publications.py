import requests
import json
from urllib.parse import urlencode

def test_fetch_publications(access_token, user_id):
    base_url = "https://api.mercadolibre.com"import logging

# Create a logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a file handler and a stream handler
file_handler = logging.FileHandler('mercadolibre_api.log')
stream_handler = logging.StreamHandler()

# Create a formatter and set it for the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
stream_handler.setFormatter(formatter)

# Add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(stream_handler)

def test_fetch_publications(access_token, user_id):
    base_url = "https://api.mercadolibre.com"
    
    logger.info("=== Testing MercadoLibre Publications API ===")
    
    # First get user's items
    search_url = f"{base_url}/users/{user_id}/items/search"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Accept': 'application/json'
    }
    
    try:
        logger.info("1. Fetching user's items...")
        response = requests.get(search_url, headers=headers)
        
        logger.info(f"Search Response Status Code: {response.status_code}")
        logger.info("Search Response Headers:")
        for key, value in response.headers.items():
            logger.info(f"{key}: {value}")
            
        if response.status_code == 200:
            search_data = response.json()
            logger.info("Search Results:")
            logger.info(json.dumps(search_data, indent=2))
            
            if search_data.get('results'):
                # Get details for first item
                logger.info("2. Fetching details for first item...")
                first_item_id = search_data['results'][0]
                item_url = f"{base_url}/items/{first_item_id}"
                
                item_response = requests.get(item_url, headers=headers)
                logger.info(f"Item Response Status Code: {item_response.status_code}")
                
                if item_response.status_code == 200:
                    item_data = item_response.json()
                    logger.info("Item Details:")
                    logger.info(json.dumps(item_data, indent=2))
                else:
                    logger.error("Error fetching item details")
                    logger.error(item_response.text)
            else:
                logger.info("No items found for user")
        else:
            logger.error("Error fetching items")
            logger.error(response.text)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error making request: {e}")
    except json.JSONDecodeError:
        logger.error("Error: Could not parse JSON response")
        logger.error("Raw response:", response.text)

if __name__ == "__main__":
    access_token = input("Enter your MercadoLibre access token: ")
    user_id = input("Enter the MercadoLibre user ID: ")
    test_fetch_publications(access_token, user_id)
    
    print("\n=== Testing MercadoLibre Publications API ===\n")
    
    # First get user's items
    search_url = f"{base_url}/users/{user_id}/items/search"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Accept': 'application/json'
    }
    
    try:
        print("1. Fetching user's items...")
        response = requests.get(search_url, headers=headers)
        
        print(f"\nSearch Response Status Code: {response.status_code}")
        print("\nSearch Response Headers:")
        for key, value in response.headers.items():
            print(f"{key}: {value}")
            
        if response.status_code == 200:
            search_data = response.json()
            print("\nSearch Results:")
            print(json.dumps(search_data, indent=2))
            
            if search_data.get('results'):
                # Get details for first item
                print("\n2. Fetching details for first item...")
                first_item_id = search_data['results'][0]
                item_url = f"{base_url}/items/{first_item_id}"
                
                item_response = requests.get(item_url, headers=headers)
                print(f"\nItem Response Status Code: {item_response.status_code}")
                
                if item_response.status_code == 200:
                    item_data = item_response.json()
                    print("\nItem Details:")
                    print(json.dumps(item_data, indent=2))
                else:
                    print("\nError fetching item details")
                    print(item_response.text)
            else:
                print("\nNo items found for user")
        else:
            print("\nError fetching items")
            print(response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"\nError making request: {e}")
    except json.JSONDecodeError:
        print("\nError: Could not parse JSON response")
        print("Raw response:", response.text)

if __name__ == "__main__":
    access_token = input("Enter your MercadoLibre access token: ")
    user_id = input("Enter the MercadoLibre user ID: ")
    test_fetch_publications(access_token, user_id)
