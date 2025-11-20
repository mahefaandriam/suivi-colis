// src/pages/DeliveryList.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDeliveries, useDeleteDelivery } from '@/hooks/useDeliveries';
import { DeliveryCard } from '@/components/DeliveryCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Delivery, DeliveryStatus } from '@/types/delivery';
import {
  Search,
  Filter,
  Plus,
  Package,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDriverLocationSender } from "@/hooks/useDriverLocationSender";
import { useAuth } from '@/contexts/AuthContext';

export const DeliveryList = () => {
  const { data: deliveries, isLoading } = useDeliveries();
  const deleteDeliveryMutation = useDeleteDelivery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'tracking'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const { user } = useAuth();

  // Send driver location if user is a driver
  useDriverLocationSender(user?.role === 'driver' ? user.id : '');

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

  const handleDeleteDelivery = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      await deleteDeliveryMutation.mutateAsync(id);
      setSelectedDelivery(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

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
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Deliveries</h1>
              <p className="text-gray-600 mt-2">
                {filteredDeliveries.length} delivery{filteredDeliveries.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                disabled={!filteredDeliveries.length}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>
              <Link
                to="/deliveries/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus size={16} className="mr-2" />
                New Delivery
              </Link>
            </div>
          </div>
        </div>

        {user?.role === 'driver' &&(
          <div>
          <h1>Driver App</h1>
          <p>Sending GPS...</p>
        </div>
        )}

        {user?.role}dhhhhhhhhhhhhhhhhhhhhhhhh

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Deliveries
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by tracking number, recipient, sender, or package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | 'all')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 rounded-md"
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
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy as 'date' | 'status' | 'tracking');
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 rounded-md"
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:bg-blue-200 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:bg-green-200 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredDeliveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="relative">
                ddddddddd
                <DeliveryCard delivery={delivery} />
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setSelectedDelivery(
                        selectedDelivery === delivery.id ? null : delivery.id
                      )}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>

                    {selectedDelivery === delivery.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                        <Link
                          to={`/deliveries/${delivery.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setSelectedDelivery(null)}
                        >
                          <Edit size={14} className="mr-2" />
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDeleteDelivery(delivery.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete Delivery
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {hasActiveFilters ? 'No deliveries found' : 'No deliveries yet'}
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by creating your first delivery.'
              }
            </p>
            <div className="mt-6">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/deliveries/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus size={16} className="mr-2" />
                  Create Delivery
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Load More (for pagination) */}
        {filteredDeliveries.length > 0 && (
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Load More Deliveries
            </button>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {selectedDelivery && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedDelivery(null)}
        />
      )}
    </div>
  );
};