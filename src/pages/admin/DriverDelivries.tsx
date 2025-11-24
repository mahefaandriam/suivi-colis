import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { mockDeliveries } from '@/data/mockData';
import { Download, Package, Plus, Search } from 'lucide-react';
import { useDeliveries, useUpdateDeliveryStatus } from '@/hooks/useDeliveries';
import { DeliveryStatus } from '@/types/delivery';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { deliveryApi } from '@/services/api';
import DriverTrackingMap from '@/components/admin/DriverTrackingMap';

const DriverDeliveries = () => {
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [driverId, setDriverId] = useState('');
  const [location, setLocation] = useState(null);
  const [deliveries, setDeliveries] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [customersLocation, setCustomersLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false);

  const [localisationError, setLocalisationError] = useState(null);
  const [driverConnectLoading, setDriverConnectLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'tracking'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


  const updateStatusMutation = useUpdateDeliveryStatus();

  const [updateData, setUpdateData] = useState({
    status: '',
    location: '',
    description: ''
  });

  const socketRef = useRef<Socket | null>(null);

  const { user } = useAuth();

  let watchId = null;
  let intervalId = null;

  const navigate = useNavigate();


  useEffect(() => {
    if (driverId && deliveries && socketRef.current) {
      console.log("data to send : ", driverId, deliveries[0].created_by, user.firstName)
      socketRef.current.emit('driver_connect', { driverId: driverId, adminId: deliveries[0].created_by, name: user.firstName })
    }
  }, [driverId, deliveries, socketRef.current]);

  useEffect(() => {
    setDriverConnectLoading(true);
    const initializeSocket = async () => {
      // get deliveries for driver
      if (user?.role === 'driver') {
        setDriverId(user.id);
      }
      const data = await deliveryApi.getDeliveriesByDriverId(user.id);

      console.log("the deliveries for a driver: ", data)

      setCustomersLocation(data.map(d => {
        const [lat, lng] = d.recipient_localisation
          .split(",")
          .map((v: string) => parseFloat(v.trim()))
        return { lat, lng, color: d.colis_theme };
      }))

      setDeliveries(data);

      const newSocket = io('http://localhost:3004');
      setSocket(newSocket);

      socketRef.current = newSocket;

      newSocket.on('driver_connected', () => {
        setIsConnected(true);
        startLocationTracking();
        setDriverConnectLoading(false);
      });

      setIsLoading(false)
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.close();
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  /*const connectAsDriver = () => {
    if (driverId && socket) {
      socket.emit('driver_connect', { driverId });
      setIsConnected(true);
      startLocationTracking();
    }
  };*/

  let lastSentLocation = null;
  let lastUpdateTime = 0;
  const MIN_DISTANCE_CHANGE = 10; // meters
  const MIN_TIME_INTERVAL = 5000; // 5 seconds
  const MIN_TIME_INTERVAL_BACKGROUND = 30000; // 30 seconds in background

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      setLocalisationError('Geolocation is not supported');
      return;
    }

    let isInBackground = false;

    document.addEventListener('visibilitychange', () => {
      isInBackground = document.hidden;
    });

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const currentCoords = position.coords;

        // Calculate minimum interval based on background state
        const minInterval = isInBackground ? MIN_TIME_INTERVAL_BACKGROUND : MIN_TIME_INTERVAL;

        // Check time threshold
        if (now - lastUpdateTime < minInterval) {
          return;
        }

        // Check distance threshold (if we have previous location)
        if (lastSentLocation) {
          const distance = calculateDistance(
            lastSentLocation.latitude,
            lastSentLocation.longitude,
            currentCoords.latitude,
            currentCoords.longitude
          );

          if (distance < MIN_DISTANCE_CHANGE) {
            return;
          }
        }

        sendLocation(position);
        lastSentLocation = {
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude
        };
        lastUpdateTime = now;

        console.log(`Location updated - Distance: ${lastSentLocation ? calculateDistance(
          lastSentLocation.latitude,
          lastSentLocation.longitude,
          currentCoords.latitude,
          currentCoords.longitude
        ).toFixed(2) : 'N/A'}m`);
      },
      (err) => {
        setLocalisationError('GPS Error: ' + err.message);
        console.error("GPS error", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      stopLocationTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  // Haversine formula to calculate distance between two coordinates
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const sendLocation = (position) => {
    console.log("Atempt to update location of driver...")
    const { latitude, longitude, speed, heading } = position.coords;

    const locationData = {
      latitude,
      longitude,
      speed: speed || 0,
      heading: heading || 0,
    };

    setLocation(locationData);

    setDriverLocation({
      lat: latitude,
      lng: longitude
    })

    if (socketRef.current) {
      console.log("sending curent location : ", latitude, longitude)
      socketRef.current.emit('driver_location_update', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: locationData.speed,
        heading: locationData.heading
      });
    }
  };

  const stopLocationTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (intervalId !== null) clearInterval(intervalId);
  };


  // Filter and search deliveries
  const filteredDeliveries = useMemo(() => {

    console.log("all deliveries from use memo : " + deliveries)
    return [];

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



  const handleStatusUpdate = async (delivyId: string, newStatus) => {
    if (newStatus) {
      await updateStatusMutation.mutateAsync({
        id: delivyId,
        updateData: {
          status: newStatus as any,
          location: '',
          description: ''
        }
      });
      setUpdateData({ status: '', location: '', description: '' });
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
        Loading...
      </div>
    );
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  function connectAsDriver() {
    if (user.role === 'driver' && socket) {
      setDriverId(user.id);
      socket.emit('driver_connect', { driverId: user.id });
      setIsConnected(true);
      startLocationTracking();
    }
  }

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
          </div>
        </div>

        {driverConnectLoading &&
          (
            <div className="min-h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
          )}


        {location && !localisationError && (
          <div>
            <h2>Driver: {driverId}</h2>
            <div className="status">
              <span className="connected text-green-400">● Connected</span>
            </div>
            <div className="location-info">
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
              <p>Speed: {(location.speed * 3.6).toFixed(1)} km/h</p>
            </div>
          </div>
        )}
        {localisationError && (
          <div>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {localisationError}
            </div>
            <Button
              type="submit" variant="hero" size="lg"
              className="hero-cta disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setLocalisationError(null)
              }}
            >
              <Download className="mr-2 h-5 w-5 " />
              <span className='hidden md:inline'>Retry</span>
            </Button>
          </div>
        )}

        <div>
          {deliveries && deliveries.length > 0 ? (
            <div>

              <h2>Deliveries for Driver {driverId}:</h2>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto text-sm">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">N° de suivi</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Destinataire</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Adresse</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Client email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Livraison prévue</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map((delivery) => (
                          <tr key={delivery.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{delivery.tracking_number}</td>
                            <td className="px-4 py-3">{delivery.recipient_name}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{delivery.recipient_address}</td>
                            <td className="px-4 py-3 text-sm">{delivery.recipient_email}</td>
                            <td className="px-4 py-3">
                              <DeliveryStatusBadge status={delivery.status} />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(delivery.estimated_delivery).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              <button>accpter</button> <button>Reffuser</button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'in_transit')}
                                  disabled={updateStatusMutation.isLoading}
                                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                                >
                                  {updateStatusMutation.isLoading ? 'Updating...' : 'Accpter'}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'failed')}
                                  disabled={updateStatusMutation.isLoading}
                                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                                >
                                  {updateStatusMutation.isLoading ? 'Updating...' : 'Refuser'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <h2>No deliveries assigned to Driver {driverId}.</h2>
          )}
        </div>

        <div>
          <DriverTrackingMap driver={driverLocation} customers={customersLocation} />
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

export default DriverDeliveries;
