import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mercadolibre } from '../lib/mercadolibre';
import { ShoppingBag } from 'lucide-react';

export function MercadoLibreCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const processAuth = async () => {
      if (!user) {
        setError('No se encontró usuario autenticado');
        return;
      }

      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          setError('No se recibió código de autorización');
          return;
        }

        // Verify state parameter to prevent CSRF attacks
        const savedState = sessionStorage.getItem('ml_auth_state');
        if (state !== savedState) {
          setError('Error de validación de estado');
          return;
        }

        await mercadolibre.exchangeCodeForToken(code, user.id);
        
        // Update connection status in session storage
        sessionStorage.setItem('ml_connection_status', 'connected');
        
        // Clear state after successful processing
        sessionStorage.removeItem('ml_auth_state');

        setTimeout(() => {
          navigate('/dashboard', { 
            replace: true,
            state: { showActivationMessage: true }
          });
        }, 1500);
      } catch (error) {
        console.error('Error processing auth:', error);
        setError('Error al procesar la autorización');
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [user, searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error de Conexión
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/connect-mercadolibre', { replace: true })}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <ShoppingBag className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Conexión Exitosa!
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Tu cuenta de MercadoLibre ha sido conectada correctamente.
            </p>
            {isProcessing && (
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                <span>Redirigiendo al dashboard...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
