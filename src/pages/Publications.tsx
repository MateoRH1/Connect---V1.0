import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { mercadolibre } from '../lib/mercadolibre';
import { 
  Search, 
  RefreshCw, 
  Package, 
  Filter, 
  ArrowUpDown,
  Grid,
  List,
  ExternalLink,
  Edit,
  Pause,
  Play,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Tag
} from 'lucide-react';

interface Publication {
  id: string;
  item_id: string;
  title: string;
  category_id: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  listing_type_id: string;
  status: string;
  permalink: string;
  thumbnail: string;
  last_updated: string;
}

export function Publications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState({
    status: 'all',
    listingType: 'all',
    priceRange: 'all'
  });
  const [sort, setSort] = useState({
    field: 'last_updated',
    direction: 'desc' as 'asc' | 'desc'
  });
  const [stats, setStats] = useState({
    totalPublications: 0,
    activePublications: 0,
    totalStock: 0,
    totalSales: 0
  });

  useEffect(() => {
    if (user) {
      loadPublications();
    }
  }, [user]);

  useEffect(() => {
    if (publications.length > 0) {
      updateStats();
    }
  }, [publications]);

  const updateStats = () => {
    setStats({
      totalPublications: publications.length,
      activePublications: publications.filter(p => p.status === 'active').length,
      totalStock: publications.reduce((sum, p) => sum + p.available_quantity, 0),
      totalSales: publications.reduce((sum, p) => sum + p.sold_quantity, 0)
    });
  };

  const loadPublications = async () => {
    setIsLoading(true);
    try {
      const data = await mercadolibre.fetchPublications(user!.id);
      setPublications(data);
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      await mercadolibre.syncPublications(user.id);
      await loadPublications();
    } catch (error) {
      console.error('Error syncing publications:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'gold_pro':
        return 'Premium';
      case 'gold_special':
        return 'Clásica';
      default:
        return type;
    }
  };

  const getPriceRange = (price: number) => {
    if (price < 1000) return 'low';
    if (price < 5000) return 'medium';
    return 'high';
  };

  const filteredPublications = publications
    .filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter.status === 'all' || pub.status === filter.status;
      const matchesListingType = filter.listingType === 'all' || pub.listing_type_id === filter.listingType;
      const matchesPriceRange = filter.priceRange === 'all' || getPriceRange(pub.price) === filter.priceRange;
      return matchesSearch && matchesStatus && matchesListingType && matchesPriceRange;
    })
    .sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;
      switch (sort.field) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'price':
          return direction * (a.price - b.price);
        case 'available_quantity':
          return direction * (a.available_quantity - b.available_quantity);
        case 'sold_quantity':
          return direction * (a.sold_quantity - b.sold_quantity);
        case 'last_updated':
          return direction * (new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime());
        default:
          return 0;
      }
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Publicaciones</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona tus publicaciones de MercadoLibre
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Tag className="h-10 w-10 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Publicaciones</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPublications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-10 w-10 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Publicaciones Activas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activePublications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-10 w-10 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stock Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-10 w-10 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título..."
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="closed">Cerrado</option>
              </select>
              <select
                value={filter.listingType}
                onChange={(e) => setFilter({ ...filter, listingType: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="gold_pro">Premium</option>
                <option value="gold_special">Clásica</option>
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : publications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">No hay publicaciones</h3>
              <p className="text-sm text-gray-400">
                Tus publicaciones de MercadoLibre aparecerán aquí
              </p>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPublications.map((pub) => (
                  <div key={pub.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative pb-[100%]">
                      <img
                        src={pub.thumbnail}
                        alt={pub.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {pub.status === 'paused' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Pausada
                          </span>
                        )}
                        {pub.listing_type_id === 'gold_pro' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-2">
                        {pub.title}
                      </h3>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          ${pub.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {pub.currency_id}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Stock: {pub.available_quantity}</span>
                        <span>Vendidos: {pub.sold_quantity}</span>
                      </div>
                      <div className="flex justify-between space-x-2">
                        <a
                          href={pub.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver publicación
                        </a>
                        <button
                          className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          title={pub.status === 'active' ? 'Pausar' : 'Activar'}
                        >
                          {pub.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => setSort({
                            field: 'title',
                            direction: sort.field === 'title' && sort.direction === 'asc' ? 'desc' : 'asc'
                          })}
                          className="flex items-center space-x-1"
                        >
                          <span>Título</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => setSort({
                            field: 'price',
                            direction: sort.field === 'price' && sort.direction === 'asc' ? 'desc' : 'asc'
                          })}
                          className="flex items-center space-x-1"
                        >
                          <span>Precio</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => setSort({
                            field: 'available_quantity',
                            direction: sort.field === 'available_quantity' && sort.direction === 'asc' ? 'desc' : 'asc'
                          })}
                          className="flex items-center space-x-1"
                        >
                          <span>Stock</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPublications.map((pub) => (
                      <tr key={pub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={pub.thumbnail}
                              alt={pub.title}
                              className="h-10 w-10 object-cover rounded"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{pub.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${pub.price.toLocaleString()} {pub.currency_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pub.available_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pub.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : pub.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pub.status === 'active' ? 'Activo' : pub.status === 'paused' ? 'Pausado' : 'Cerrado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getListingTypeLabel(pub.listing_type_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <a
                              href={pub.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              {pub.status === 'active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
