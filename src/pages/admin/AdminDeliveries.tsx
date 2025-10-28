import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { mockDeliveries } from '@/data/mockData';
import { Download, Package, Plus, Search } from 'lucide-react';
import { useDeliveries } from '@/hooks/useDeliveries';
import { DeliveryStatus } from '@/types/delivery';
import { Button } from '@/components/ui/button';

const AdminDeliveries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: deliveries, isLoading } = useDeliveries();

  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'tracking'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const navigate = useNavigate();

  // Filter and search deliveries
  const filteredDeliveries = useMemo(() => {
    if (!deliveries) return [];

    let filtered = deliveries.filter((delivery) => {
      const matchesSearch =
        delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.package.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort deliveries
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.timeline[0]?.timestamp || a.estimatedDelivery);
          bValue = new Date(b.timeline[0]?.timestamp || b.estimatedDelivery);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'tracking':
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [deliveries, searchTerm, statusFilter, sortBy, sortOrder]);

  const exportToCSV = () => {
    if (!filteredDeliveries.length) return;

    const headers = [
      'Tracking Number',
      'Status',
      'Sender',
      'Recipient',
      'Package Description',
      'Weight',
      'Dimensions',
      'Estimated Delivery',
      'Current Location'
    ];

    const csvData = filteredDeliveries.map(delivery => [
      delivery.trackingNumber,
      delivery.status,
      delivery.sender.name,
      delivery.recipient.name,
      delivery.package.description,
      delivery.package.weight,
      delivery.package.dimensions,
      new Date(delivery.estimatedDelivery).toLocaleDateString(),
      delivery.currentLocation || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deliveries-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className='flex justify-between'>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des livraisons</h2>
            <p className="text-muted-foreground">Gérez et suivez toutes vos livraisons</p>
          </div>
          <div className='flex gap-3'>
            <button disabled={!filteredDeliveries.length} className='disabled:cursor-not-allowed'>
              <Button
                type="submit" variant="hero" size="lg"
                className="hero-cta disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={exportToCSV}
                disabled={!filteredDeliveries.length}
              >
                <Download className="mr-2 h-5 w-5 " />
                <span className='hidden md:inline'>Exporter CSV</span>
              </Button>
            </button>
            <button >
              <Button
                type="submit" variant="hero" size="lg"
                className="hero-cta"
                onClick={() => navigate(`/admin/deliveries/new`)}
              >
                <Plus className="mr-2 h-5 w-5 " />
                <span className='hidden md:inline'>Nouvelle livraison </span>
              </Button>
            </button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Rechercher une livraison</CardTitle>
          </CardHeader>
          <CardContent className='md:flex justify-between gap-4 '>
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro de suivi ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className='md:flex gap-3 relative md:-top-6'>
              {/* Status Filter */}
              <div >
                <label htmlFor="status" className="block text-muted-foreground">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | 'all')}
                  className="block w-full md:w-auto px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="sort" className="block text-muted-foreground">
                  Trier par
                </label>
                <select
                  id="sort"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'date' | 'status' | 'tracking');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="block w-full md:w-auto px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="status-asc">Status (A-Z)</option>
                  <option value="status-desc">Status (Z-A)</option>
                  <option value="tracking-asc">Tracking # (A-Z)</option>
                  <option value="tracking-desc">Tracking # (Z-A)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries List */}
        {filteredDeliveries.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">N° de suivi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Destinataire</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Adresse</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Livraison prévue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map((delivery) => (
                      <tr
                        key={delivery.id}
                        className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/deliveries/${delivery.id}`)}
                      >
                        <td className="px-4 py-3 font-medium">{delivery.trackingNumber}</td>
                        <td className="px-4 py-3">{delivery.recipient.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {delivery.recipient.address}
                        </td>
                        <td className="px-4 py-3">
                          <DeliveryStatusBadge status={delivery.status} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(delivery.estimatedDelivery).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-forground rounded-lg shadow-sm border border-froground p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-200">
              {hasActiveFilters ? 'No deliveries found' : 'No deliveries yet'}
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by creating your first delivery.'
              }
            </p>
            <div className="mt-6">
              <Link
                to="/deliveries/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus size={16} className="mr-2" />
                Create Delivery
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminLayout >
  );
};

export default AdminDeliveries;
