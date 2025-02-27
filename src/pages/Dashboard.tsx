import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { BarChart, Users, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { mercadolibre } from '../lib/mercadolibre';

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [accountStatus, setAccountStatus] = React.useState<'pending' | 'active' | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAccountStatus = async () => {
      if (user) {
        try {
          const account = await mercadolibre.getUserAccount(user.id);
          const { data: authCode } = await mercadolibre.getLatestAuthCode(user.id);
          
          if (account) {
            setAccountStatus('active');
          } else if (authCode) {
            setAccountStatus('pending');
            // Show activation message if we just connected
            setShowOverlay(location.state?.showActivationMessage);
          } else {
            setAccountStatus(null);
          }
        } catch (error) {
          console.error('Error checking account status:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAccountStatus();
  }, [user, location.state?.showActivationMessage]);

  const stats = user?.role === 'client' 
    ? [
        { label: 'Total Sales', value: '$12,345', icon: DollarSign, change: '+12%' },
        { label: 'Active Listings', value: '45', icon: TrendingUp, change: '+5%' },
        { label: 'Views', value: '1,234', icon: Users, change: '+25%' },
        { label: 'Conversion Rate', value: '3.2%', icon: BarChart, change: '+2%' },
      ]
    : [
        { label: 'Active Clients', value: '24', icon: Users, change: '+3%' },
        { label: 'Total Revenue', value: '$45,678', icon: DollarSign, change: '+15%' },
        { label: 'Success Rate', value: '92%', icon: TrendingUp, change: '+4%' },
        { label: 'Projects', value: '38', icon: BarChart, change: '+8%' },
      ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {showOverlay && accountStatus === 'pending' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 relative">
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">
              ¡Cuenta Conectada con Éxito!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Tu dashboard estará completamente habilitado en las próximas 4 horas hábiles mientras un operador procesa tu conexión con MercadoLibre.
            </p>
            <button
              onClick={() => setShowOverlay(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {accountStatus === 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Tu cuenta está pendiente de activación. Un operador está procesando tu conexión con MercadoLibre.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.email}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your {user?.role === 'client' ? 'store' : 'clients'} today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
