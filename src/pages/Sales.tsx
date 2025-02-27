import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { mercadolibre } from '../lib/mercadolibre';
import { Calendar, Download, Search, RefreshCw, CheckCircle, XCircle, PackageX } from 'lucide-react';

interface SaleData {
  id: string;
  sale_date: string;
  publication_title: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  buyer_nickname: string;
  shipping_status: string;
}

export function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadSalesData();
      checkLastSync();
    }
  }, [user]);

  const checkLastSync = () => {
    const lastSync = localStorage.getItem(`ml_last_sync_${user!.id}`);
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  };

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      const data = await mercadolibre.fetchSalesData(user!.id);
      setSales(data);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      await mercadolibre.syncSalesData(user.id);
      await loadSalesData();
      checkLastSync();
    } catch (error) {
      console.error('Error syncing sales data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const isSyncNeeded = () => {
    if (!lastSyncTime) return true;
    const hoursSinceLastSync = (new Date().getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync >= 24;
  };

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDate = saleDate >= startDate && saleDate <= endDate;
    
    const matchesSearch = searchTerm === '' || 
      sale.publication_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyer_nickname.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Fecha', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Comprador', 'Estado'];
    const csvData = filteredSales.map(sale => [
      new Date(sale.sale_date).toLocaleDateString(),
      sale.publication_title,
      sale.quantity,
      sale.unit_price,
      sale.total_amount,
      sale.buyer_nickname,
      sale.shipping_status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Ventas</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow">
              {isSyncNeeded() ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span className="text-sm text-gray-600">
                {lastSyncTime ? (
                  <>
                    Última sincronización: {lastSyncTime.toLocaleString()}
                  </>
                ) : (
                  'No sincronizado'
                )}
              </span>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`ml-2 p-1 rounded-full hover:bg-gray-100 ${isSyncing ? 'cursor-not-allowed opacity-50' : ''}`}
                title="Sincronizar manualmente"
              >
                <RefreshCw className={`h-5 w-5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {sales.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar a CSV
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {sales.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por producto o comprador..."
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <PackageX className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">No hay ventas registradas</h3>
              <p className="text-sm text-gray-400">
                Las ventas aparecerán aquí una vez que realices tu primera venta en MercadoLibre
              </p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Search className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">No se encontraron resultados</h3>
              <p className="text-sm text-gray-400">
                Intenta ajustar los filtros o el término de búsqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comprador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {sale.publication_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.buyer_nickname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.shipping_status === 'delivered' 
                            ? 'bg-green-100 text-green-800'
                            : sale.shipping_status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.shipping_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
