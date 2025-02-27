import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { mercadolibre } from '../lib/mercadolibre';

export function MercadoLibreConnect() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user]);

  const checkConnection = async () => {
    try {
      const account = await mercadolibre.getUserAccount(user!.id);
      setIsConnected(!!account);
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    mercadolibre.redirectToAuth();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          MercadoLibre Connection
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            {isConnected
              ? 'Your account is connected to MercadoLibre.'
              : 'Connect your MercadoLibre account to start managing your store.'}
          </p>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnected}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isConnected
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isConnected ? 'Connected' : 'Connect MercadoLibre'}
          </button>
        </div>
      </div>
    </div>
  );
}
