import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Users } from 'lucide-react';
import { testConnection } from '../lib/supabase';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const result = await testConnection();
    if (result.status === 'error') {
      setStatus('error');
      setError(result.error);
    } else {
      setStatus('connected');
      setUserCount(result.userCount || 0);
    }
  };

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
        <span className="text-sm">Verificando conexión...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">
          Error de conexión: {error || 'Error desconocido'}
        </span>
        <button
          onClick={checkConnection}
          className="ml-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm">Conectado a Supabase</span>
      </div>
      <div className="flex items-center space-x-2 text-gray-600">
        <Users className="h-4 w-4" />
        <span className="text-sm">
          {userCount} {userCount === 1 ? 'usuario registrado' : 'usuarios registrados'}
        </span>
      </div>
    </div>
  );
}
