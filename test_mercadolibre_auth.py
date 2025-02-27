import requests
import json
from urllib.parse import urlencode

def test_token_exchange(code):
    url = "https://api.mercadolibre.com/oauth/token"
    
    # Prepare the payload
    payload = {
        'grant_type': 'authorization_code',
        'client_id': '4683025741956879',
        'client_secret': '1ie3G4fiCyrzZWb0CYJy7cfYIfdzWDXS',
        'code': 'TG-67bca9d9d404510001b0d032-143465437',
        'redirect_uri': 'https://incredible-profiterole-5d1cb4.netlify.app/mercadolibre/callback'
    }
    
    headers = {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
    }

    try:
        # Make the request
        response = requests.post(url, headers=headers, data=urlencode(payload))
        
        # Pretty print the response
        print("\nResponse Status Code:", response.status_code)
        print("\nResponse Headers:")
        for key, value in response.headers.items():
            print(f"{key}: {value}")
            
        print("\nResponse Body:")
        response_data = response.json()
        print(json.dumps(response_data, indent=2))
        
        if response.status_code == 200:
            print("\nSuccess! Token details:")
            print(f"Access Token: {response_data.get('access_token')}")
            print(f"Refresh Token: {response_data.get('refresh_token')}")
            print(f"Expires in: {response_data.get('expires_in')} seconds")
            print(f"User ID: {response_data.get('user_id')}")
        else:
            print("\nError! Could not obtain tokens")
            
    except requests.exceptions.RequestException as e:
        print(f"\nError making request: {e}")
    except json.JSONDecodeError:
        print("\nError: Could not parse JSON response")
        print("Raw response:", response.text)

if __name__ == "__main__":
    code = input("Enter the authorization code from the callback URL: ")
    test_token_exchange(code)
