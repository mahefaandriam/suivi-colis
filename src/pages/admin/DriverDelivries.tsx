import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { Download, Package, Plus, Search } from 'lucide-react';
import { useDeliveries, useUpdateDeliveryStatus } from '@/hooks/useDeliveries';
import { DeliveryStatus } from '@/types/delivery';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { deliveryApi } from '@/services/api';
import DriverTrackingMap from '@/components/admin/DriverTrackingMap';
import { useSocket } from "@/contexts/SocketContext";

interface Driver {
  id: string | number;
  lat: number;
  lng: number;
  name?: string;
  email?: string;
  isActive?: boolean;
}


const DriverDeliveries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [driverId, setDriverId] = useState('');
  const [location, setLocation] = useState(null);
  const [deliveries, setDeliveries] = useState(null);
  const [driverLocation, setDriverLocation] = useState<Driver[]>([]);
  const [customersLocation, setCustomersLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true)

  
  const { socket, isConnected } = useSocket();

  const [localisationError, setLocalisationError] = useState(null);
  const [driverConnectLoading, setDriverConnectLoading] = useState(true);
  
  const [focusedCustomerIds, setFocusedCustomerIds] = useState<string[]>([]);


  const updateStatusMutation = useUpdateDeliveryStatus();

  const [updateData, setUpdateData] = useState({
    status: '',
    location: '',
    description: ''
  });

  const { user } = useAuth();

  let watchId = null;
  let intervalId = null;

  const navigate = useNavigate();


  useEffect(() => {
    if (driverId && deliveries && socket && isConnected) {
      console.log("data to send : ", driverId, deliveries[0].created_by, user.firstName)
      socket.emit('driver_connect', { driverId: driverId, adminId: deliveries[0].created_by, name: user.firstName })
    }
  }, [driverId, deliveries, socket, isConnected]);

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
        return { id: d.tracking_number, lat, lng, driverId: driverId, name: d.recipient_name, color: d.colis_theme };
      }))

      setDriverLocation(prev => [
        ...prev,
        {
          id:user.id,
          lat: data[0].lat,
          lng: data[0].lng,
          name: user.firstName,
          email: data[0].driver_email
        }
      ])

      setDeliveries(data);


      
    if (!socket || !isConnected) return;


      socket.on('driver_connected', () => {
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
      document.removeEventListener('visibilitychange', () => { });
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
    // Update the driver's location in state
    // Update the driver's location in state
    setDriverLocation(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === driverId
          ? { ...driver, lat: latitude, lng: longitude }
          : driver
      )
    );


    if (socket && isConnected) {
      console.log("sending curent location : ", latitude, longitude)
      socket.emit('driver_location_update', {
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


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className='flex justify-between'>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des livraisons</h2>
            <p className="text-muted-foreground">Gérez et suivez toutes vos livraisons</p>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 rounded-lg text-sm">
              {localisationError}
            </div>
            <Button
              type="submit" variant="hero" size="lg"
              className="hero-cta disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setLocalisationError(null)
                startLocationTracking()
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
                    <table className="w-full text-xs">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="px-4 text-left text-sm font-medium">N° de suivi</th>
                          <th className="px-4 text-left text-sm font-medium">Destinataire</th>
                          <th className="px-4 text-left text-sm font-medium">Adresse</th>
                          <th className="px-4 text-left text-sm font-medium">Client email</th>
                          <th className="px-4 text-left text-sm font-medium">Statut</th>
                          <th className="px-4 text-left text-sm font-medium">Livraison prévue</th>
                          <th className="px-4 text-left text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map((delivery) => (
                          <tr key={delivery.id} className="border-b hover:bg-muted/50" onClick={() => setFocusedCustomerIds([delivery.tracking_number])}  style={{ backgroundColor: delivery.colis_theme + "20" }}>
                            <td className="px-4 font-medium">{delivery.tracking_number}</td>
                            <td className="px-4">{delivery.recipient_name}</td>
                            <td className="px-4 text-sm text-muted-foreground">{delivery.recipient_address}</td>
                            <td className="px-4 text-sm">{delivery.recipient_email}</td>
                            <td className="px-4">
                              <DeliveryStatusBadge status={delivery.status} />
                            </td>
                            <td className="px-4 text-sm">
                              {new Date(delivery.estimated_delivery).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 text-sm text-muted-foreground">
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
                                  onClick={() => handleStatusUpdate(delivery.id, 'cancelled')}
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

        {isLoading || !driverLocation || !customersLocation ? (
          <div>
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
            Loading...
          </div>
        ) : (
          <div>
            <DriverTrackingMap drivers={driverLocation} customers={customersLocation} focusedCustomerIds={focusedCustomerIds}   />
          </div>
        )}

      </div>
    </AdminLayout >
  );
};

export default DriverDeliveries;
