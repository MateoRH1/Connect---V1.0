import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { mercadolibre } from '../lib/mercadolibre';

export function ConnectMercadoLibre() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user]);

  const checkConnection = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // First check if user already has a MercadoLibre account
      const account = await mercadolibre.getUserAccount(user.id);
      if (account) {
        setIsConnected(true);
        setIsLoading(false);
        return;
      }

      // If no account, check if they have a pending auth code
      const authCode = await mercadolibre.getLatestAuthCode(user.id);
      setIsConnected(!!authCode);
    } catch (error) {
      console.error('Error checking connection:', error);
      // Even if there's an error, we assume not connected
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isConnected) {
    return <Navigate to="/dashboard" state={{ showActivationMessage: true }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShoppingBag className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Conecta tu cuenta de MercadoLibre
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Para comenzar a gestionar tu tienda, necesitas conectar tu cuenta de vendedor de MercadoLibre
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <button
                onClick={() => mercadolibre.redirectToAuth()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Conectar con MercadoLibre
              </button>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Lo que obtendrás
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-500">
                    Gestión de inventario y publicaciones
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-500">
                    Seguimiento de ventas y métricas de rendimiento
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-500">
                    Insights y recomendaciones personalizadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
