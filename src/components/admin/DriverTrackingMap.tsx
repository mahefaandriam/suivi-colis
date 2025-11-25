import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect, useMemo, useRef, useState } from "react";

// Remove default Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: null,
  iconUrl: null,
  shadowUrl: null,
});

// ICONS
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Calculate center with bounds checking
const calculateCenter = (customers: any[]): [number, number] => {
  if (customers.length === 0) return [-18.8792, 47.5079]; // Default to Madagascar center
  
  const validCustomers = customers.filter(c => 
    c.lat && c.lng && 
    !isNaN(c.lat) && !isNaN(c.lng) &&
    Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180
  );
  
  if (validCustomers.length === 0) return [-18.8792, 47.5079];
  
  const avgLat = validCustomers.reduce((sum, point) => sum + point.lat, 0) / validCustomers.length;
  const avgLng = validCustomers.reduce((sum, point) => sum + point.lng, 0) / validCustomers.length;
  
  return [avgLat, avgLng];
};

interface DriverTrackingMapProps {
  driver?: {
    lat: number;
    lng: number;
    id?: string | number;
    name?: string;
  };
  customers: Array<{
    id: string | number;
    lat: number;
    lng: number;
    name?: string;
    color?: string;
  }>;
}

export default function DriverTrackingMap({ driver, customers }: DriverTrackingMapProps) {
  // Memoize center calculation
  const center = useMemo<[number, number]>(() => {
    return driver ? [driver.lat, driver.lng] as [number, number] : calculateCenter(customers);
  }, [driver, customers]);

  // Memoize map key to force re-render when center changes significantly
  const mapKey = useMemo(() => {
    return `map-${center[0].toFixed(4)}-${center[1].toFixed(4)}`;
  }, [center]);

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
      zoomControl={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Auto-fit bounds to show all markers */}
      <MapBoundsFitter driver={driver} customers={customers} />

      {/* Driver Marker */}
      {driver && (
        <Marker 
          position={[driver.lat, driver.lng]} 
          icon={driverIcon}
        >
          <Popup>
            <div className="driver-popup">
              <strong>Driver {driver.name || ''}</strong>
              <br />
              Position: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
              <br />
              <small>Last updated: {new Date().toLocaleTimeString()}</small>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Customer Markers */}
      {customers?.map((customer) => (
        <Marker 
          key={`customer-${customer.id}`} 
          position={[customer.lat, customer.lng]} 
          icon={customerIcon}
        >
          <Popup>
            <div className="customer-popup">
              <strong>Customer {customer.name || customer.id}</strong>
              <br />
              Position: {customer.lat.toFixed(4)}, {customer.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Routing to each customer */}
      {driver && customers?.length > 0 && (
        <RoutingToCustomers driver={driver} customers={customers} />
      )}
    </MapContainer>
  );
}

/* ----------------------------------
   AUTO-FIT BOUNDS COMPONENT
------------------------------------- */
function MapBoundsFitter({ driver, customers }: DriverTrackingMapProps) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!map || fittedRef.current) return;

    const points: L.LatLng[] = [];

    // Add driver position
    if (driver) {
      points.push(L.latLng(driver.lat, driver.lng));
    }

    // Add customer positions
    customers.forEach(customer => {
      points.push(L.latLng(customer.lat, customer.lng));
    });

    if (points.length > 0) {
      const group = new L.FeatureGroup(points.map(point => L.marker(point)));
      
      // Use timeout to ensure map is fully initialized
      setTimeout(() => {
        try {
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { 
              padding: [30, 30],
              maxZoom: 16 
            });
            fittedRef.current = true;
          }
        } catch (error) {
          console.warn('Could not fit bounds:', error);
        }
      }, 100);
    }
  }, [map, driver, customers]);

  return null;
}

/* ----------------------------------
   ROUTING TO CUSTOMERS COMPONENT
------------------------------------- */
interface RoutingToCustomersProps {
  driver: {
    lat: number;
    lng: number;
    id?: string | number;
    name?: string;
  };
  customers: Array<{
    id: string | number;
    lat: number;
    lng: number;
    name?: string;
    color?: string;
  }>;
}

function RoutingToCustomers({ driver, customers }: RoutingToCustomersProps) {
  const map = useMap();
  const routingControlsRef = useRef<L.Routing.Control[]>([]);

  // Memoize customer IDs for dependency checking
  const customerIds = useMemo(() => 
    customers.map(c => c.id).sort().join(','), 
    [customers]
  );

  // Memoize driver position for dependency checking
  const driverPositionKey = useMemo(() => 
    `${driver.lat.toFixed(6)},${driver.lng.toFixed(6)}`, 
    [driver.lat, driver.lng]
  );

  // Generate consistent colors based on customer ID
  const getCustomerColor = useMemo(() => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    
    return (customerId: string | number, index: number) => {
      return colors[Number(customerId) % colors.length] || colors[index % colors.length];
    };
  }, []);

  useEffect(() => {
    if (!map || customers.length === 0) return;

    // Remove old routing controls
    routingControlsRef.current.forEach(control => {
      if (control && (control as any)._map) {
        map.removeControl(control);
      }
    });
    routingControlsRef.current = [];

    // Create routing to each customer
    customers.forEach((customer, index) => {
      const routeColor = customer?.color || getCustomerColor(customer.id, index);
      
      // Create routing control
            const routingControl = L.Routing.control({
              waypoints: [
                L.latLng(driver.lat, driver.lng),
                L.latLng(customer.lat, customer.lng)
              ],
              lineOptions: {
                styles: [{
                  color: routeColor,
                  weight: 6,
                  opacity: 0.8
                }],
                extendToWaypoints: false,
                missingRouteTolerance: 0
              },
              show: false, // Hide the default control panel
              routeWhileDragging: false,
              fitSelectedRoutes: false,
              showAlternatives: false,
              createMarker: (i: number, waypoint: any, n: number) => {
                // Return null to prevent default markers
                return null;
              }
            } as any).addTo(map);

      // Store the control for cleanup
      routingControlsRef.current.push(routingControl);

      // Add custom route label
      routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          const coordinates = route.coordinates;
          
          // Add label at the midpoint of the route
          if (coordinates.length > 0) {
            const midIndex = Math.floor(coordinates.length / 2);
            const midPoint = coordinates[midIndex];
            
            // Create custom label
            const label = L.marker(midPoint, {
              icon: L.divIcon({
                html: `<div style="
                  background: ${routeColor};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: bold;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  white-space: nowrap;
                ">To ${customer.name || `Customer ${customer.id}`}</div>`,
                className: 'route-label',
                iconSize: [80, 24],
              })
            }).addTo(map);

            // Store label with control for cleanup (optional)
          }
        }
      });
    });

  }, [map, customerIds, driverPositionKey, getCustomerColor]);

  // Update routes when driver position changes
  useEffect(() => {
    if (routingControlsRef.current.length === 0) return;

    routingControlsRef.current.forEach((control, index) => {
      const customer = customers[index];
      if (customer && control) {
        // Update waypoints with new driver position
        control.setWaypoints([
          L.latLng(driver.lat, driver.lng),
          L.latLng(customer.lat, customer.lng)
        ]);
      }
    });
  }, [driver.lat, driver.lng, customers]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map) {
        routingControlsRef.current.forEach(control => {
          if (control && (control as any)._map) {
            map.removeControl(control);
          }
        });
        routingControlsRef.current = [];
      }
    };
  }, [map]);

  return null;
}

/* ----------------------------------
   SINGLE ROUTE VERSION (To closest customer)
------------------------------------- */
function SingleRouteToClosestCustomer({ driver, customers }: RoutingToCustomersProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  // Find closest customer
  const closestCustomer = useMemo(() => {
    if (!driver || customers.length === 0) return null;

    let closest = customers[0];
    let minDistance = Infinity;

    customers.forEach(customer => {
      const distance = Math.sqrt(
        Math.pow(driver.lat - customer.lat, 2) + 
        Math.pow(driver.lng - customer.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = customer;
      }
    });

    return closest;
  }, [driver, customers]);

  useEffect(() => {
    if (!map || !closestCustomer) return;

    // Remove old routing control
    if (routingControlRef.current && (routingControlRef.current as any)._map) {
      map.removeControl(routingControlRef.current);
    }

    // Create routing to closest customer
        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(driver.lat, driver.lng),
            L.latLng(closestCustomer.lat, closestCustomer.lng)
          ],
          lineOptions: {
            styles: [{
              color: '#3b82f6',
              weight: 6,
              opacity: 0.8
            }],
            extendToWaypoints: false,
            missingRouteTolerance: 0
          },
          show: true, // Show control panel for single route
          routeWhileDragging: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          createMarker: (i: number, waypoint: any, n: number) => {
            // Return null to use our custom markers
            return null;
          }
        } as any).addTo(map);

  }, [map, driver, closestCustomer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map && routingControlRef.current && (routingControlRef.current as any)._map) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map]);

  return null;
}

/* ----------------------------------
   ROUTING WITH INSTRUCTIONS PANEL
------------------------------------- */
function RoutingWithInstructions({ driver, customers }: RoutingToCustomersProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(0);

  useEffect(() => {
    if (!map || customers.length === 0) return;

    // Remove old routing control
    if (routingControlRef.current && (routingControlRef.current as any)._map) {
      map.removeControl(routingControlRef.current);
    }

    const customer = customers[selectedCustomer];
    
    // Create routing with instructions panel
        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(driver.lat, driver.lng),
            L.latLng(customer.lat, customer.lng)
          ],
          lineOptions: {
            styles: [{
              color: '#3b82f6',
              weight: 6,
              opacity: 0.8
            }]
          },
          show: true, // Show the instructions panel
          routeWhileDragging: false,
          fitSelectedRoutes: true,
          showAlternatives: true,
          altLineOptions: {
            styles: [{
              color: '#6b7280',
              weight: 4,
              opacity: 0.6
            }]
          },
          createMarker: (i: number, waypoint: any, n: number) => {
            // Use custom markers for start and end points
            return null;
          }
        } as any).addTo(map);

  }, [map, driver, customers, selectedCustomer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map && routingControlRef.current && (routingControlRef.current as any)._map) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map]);

  return (
    <div className="route-selector">
      <select 
        value={selectedCustomer} 
        onChange={(e) => setSelectedCustomer(Number(e.target.value))}
      >
        {customers.map((customer, index) => (
          <option key={customer.id} value={index}>
            Route to {customer.name || `Customer ${customer.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}