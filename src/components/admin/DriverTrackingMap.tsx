import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";

// ICONS - Different colors for different drivers
const driverIcons = [
  new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Blue
    iconSize: [40, 40],
  }),
  new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Red
    iconSize: [40, 40],
    className: "driver-icon-red"
  }),
  new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Green
    iconSize: [40, 40],
    className: "driver-icon-green"
  }),
  new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Purple
    iconSize: [40, 40],
    className: "driver-icon-purple"
  })
];

// Add CSS for colored driver icons and focused styles
const style = document.createElement('style');
style.textContent = `
  .driver-icon-red { filter: hue-rotate(0deg) saturate(5) brightness(0.8); }
  .driver-icon-green { filter: hue-rotate(90deg) saturate(5) brightness(0.8); }
  .driver-icon-purple { filter: hue-rotate(270deg) saturate(5) brightness(0.8); }
  
  /* Focused driver styles */
  .focused-driver {
    filter: drop-shadow(0 0 12px #FFD700) !important; /* Gold glow */
    transform: scale(1.2);
    z-index: 1000;
    transition: all 0.3s ease;
  }
  
  /* Focused customer styles */
  .focused-customer {
    filter: drop-shadow(0 0 10px #FF6B35) !important; /* Orange glow */
    transform: scale(1.15);
    z-index: 999;
    transition: all 0.3s ease;
  }
  
  /* Specific colors for different focused states */
  .focused-driver-blue { border: 3px solid #2563EB !important; }
  .focused-driver-red { border: 3px solid #DC2626 !important; }
  .focused-driver-green { border: 3px solid #059669 !important; }
  .focused-driver-purple { border: 3px solid #7C3AED !important; }
  
  .focused-customer-primary { border: 3px solid #EA580C !important; }
  .focused-customer-secondary { border: 3px solid #F59E0B !important; }
`;
document.head.appendChild(style);

const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [40, 40],
});

// UTILITY: generate consistent color for each driver
const getDriverColor = (driverIndex: number) => {
  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Orange
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ];
  return colors[driverIndex % colors.length];
};

// UTILITY: generate focused color for drivers
const getFocusedDriverColorClass = (driverIndex: number) => {
  const colors = [
    'focused-driver-blue',
    'focused-driver-red', 
    'focused-driver-green',
    'focused-driver-purple'
  ];
  return colors[driverIndex % colors.length];
};

// UTILITY: generate focused color for customers
const getFocusedCustomerColorClass = (customerIndex: number) => {
  return customerIndex % 2 === 0 ? 'focused-customer-primary' : 'focused-customer-secondary';
};

interface Driver {
  id: string | number;
  lat: number;
  lng: number;
  name?: string;
  email?: string;
  isActive?: boolean;
}

interface Customer {
  id: string | number;
  lat: number;
  lng: number;
  name?: string;
  driverId?: string | number;
  color?: string;
}

interface TrackingMapProps {
  drivers: Driver[];
  customers: Customer[];
  focusedDriverId?: string | number;
  focusedCustomerIds?: (string | number)[];
}

export default function AdminTrackingMap({
  drivers,
  customers,
  focusedDriverId,
  focusedCustomerIds = []
}: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const customerMarkerRefs = useRef<Map<string | number, L.Marker>>(new Map());

  const calculateCenter = (): [number, number] => {
    if (drivers.length === 0 && customers.length === 0) return [0, 0];

    const allPoints = [
      ...drivers.map(d => [d.lat, d.lng]),
      ...customers.map(c => [c.lat, c.lng])
    ];

    const avgLat = allPoints.reduce((sum, point) => sum + point[0], 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, point) => sum + point[1], 0) / allPoints.length;

    return [avgLat, avgLng];
  };

  return (
    <MapContainer
      center={calculateCenter()}
      zoom={12}
      style={{ height: "60vh", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FocusController
        drivers={drivers}
        customers={customers}
        focusedDriverId={focusedDriverId}
        focusedCustomerIds={focusedCustomerIds}
        customerMarkerRefs={customerMarkerRefs}
      />

      {/* Render drivers */}
      {drivers?.map((driver, index) => {
        const isFocused = focusedDriverId === driver.id;
        const driverColorClass = getFocusedDriverColorClass(index);
        
        return (
          <Marker
            key={`driver-${driver.id}`}
            position={[driver.lat, driver.lng]}
            icon={driverIcons[index % driverIcons.length]}
            eventHandlers={{
              add: (e) => {
                const markerElement = e.target.getElement();
                if (markerElement && isFocused) {
                  markerElement.classList.add('focused-driver');
                  markerElement.classList.add(driverColorClass);
                }
              }
            }}
          >
            <Popup>
              <div className={isFocused ? "focused-popup" : ""}>
                <strong style={{ 
                  color: isFocused ? getDriverColor(index) : 'inherit',
                  fontSize: isFocused ? '1.1em' : '1em'
                }}>
                  Livreur {driver.name || `#${driver.id}`}
                  {isFocused && " 🎯"}
                </strong>
                <br />
                Position: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                <br />
                {driver.email && `Email: ${driver.email}`}
                <br />
                Status: {driver.isActive ? 'Active' : 'Inactive'}
                <br />
                Nombre de colis: {customers.filter(c => c.driverId === driver.id).length}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Render customers */}
      {customers?.map((customer, index) => {
        const isFocused = focusedCustomerIds.includes(customer.id);
        const customerColorClass = getFocusedCustomerColorClass(index);
        
        return (
          <Marker
            key={`customer-${customer.id}`}
            position={[customer.lat, customer.lng]}
            icon={customerIcon}
            ref={(ref) => {
              if (ref) {
                customerMarkerRefs.current.set(customer.id, ref);
              } else {
                customerMarkerRefs.current.delete(customer.id);
              }
            }}
            eventHandlers={{
              add: (e) => {
                const markerElement = e.target.getElement();
                if (markerElement && isFocused) {
                  markerElement.classList.add('focused-customer');
                  markerElement.classList.add(customerColorClass);
                }
              }
            }}
          >
            <Popup>
              <div className={isFocused ? "focused-popup" : ""}>
                <strong style={{ 
                  color: isFocused ? '#EA580C' : 'inherit',
                  fontSize: isFocused ? '1.1em' : '1em'
                }}>
                  Pour {customer.name || `#${customer.id}`}
                  {isFocused && " 🔥"}
                </strong>
                <br />
                Position: {customer.lat.toFixed(4)}, {customer.lng.toFixed(4)}
                <br />
                {customer.driverId && `Assigné à: Livreur ${customer.driverId}`}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Render routes for each driver with their assigned customers */}
      {drivers.map((driver, index) => {
        const driverCustomers = customers.filter(customer => customer.driverId === driver.id);
        if (driverCustomers.length === 0) return null;

        const isDriverFocused = focusedDriverId === driver.id;
        
        return (
          <MemoizedRouting
            key={`routes-${driver.id}`}
            driver={driver}
            customers={driverCustomers}
            driverIndex={index}
            isFocused={isDriverFocused}
            focusedCustomerIds={focusedCustomerIds}
          />
        );
      })}
    </MapContainer>
  );
}

/* ----------------------------------
   FOCUS CONTROLLER COMPONENT
------------------------------------- */
interface FocusControllerProps {
  drivers: Driver[];
  customers: Customer[];
  focusedDriverId?: string | number;
  focusedCustomerIds: (string | number)[];
  customerMarkerRefs: React.MutableRefObject<Map<string | number, L.Marker>>;
}

function FocusController({
  drivers,
  customers,
  focusedDriverId,
  focusedCustomerIds,
  customerMarkerRefs
}: FocusControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!focusedDriverId && focusedCustomerIds.length === 0) return;

    let pointsToFocus: L.LatLng[] = [];

    if (focusedDriverId) {
      const driver = drivers.find(d => d.id === focusedDriverId);
      if (driver) {
        pointsToFocus.push(L.latLng(driver.lat, driver.lng));
        const driverCustomers = customers.filter(c => c.driverId === focusedDriverId);
        driverCustomers.forEach(customer => {
          pointsToFocus.push(L.latLng(customer.lat, customer.lng));
        });
      }
    }

    if (focusedCustomerIds.length > 0) {
      focusedCustomerIds.forEach(customerId => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          pointsToFocus.push(L.latLng(customer.lat, customer.lng));
          if (customer.driverId) {
            const driver = drivers.find(d => d.id === customer.driverId);
            if (driver) {
              pointsToFocus.push(L.latLng(driver.lat, driver.lng));
            }
          }
        }
      });
    }

    pointsToFocus = pointsToFocus.filter((point, index, self) =>
      index === self.findIndex(p =>
        p.lat === point.lat && p.lng === point.lng
      )
    );

    if (pointsToFocus.length > 0) {
      const group = new L.FeatureGroup(pointsToFocus.map(point =>
        L.marker(point)
      ));

      map.fitBounds(group.getBounds(), {
        padding: [20, 20],
        maxZoom: 15
      });
    }
  }, [focusedDriverId, focusedCustomerIds, drivers, customers, map]);

  // Auto-open popups for focused customers
  useEffect(() => {
    if (focusedCustomerIds.length === 0) return;

    // Small delay to ensure markers are rendered and bounds are adjusted
    const timer = setTimeout(() => {
      focusedCustomerIds.forEach(customerId => {
        const marker = customerMarkerRefs.current.get(customerId);
        if (marker) {
          // Close any other open popups first
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer !== marker) {
              layer.closePopup();
            }
          });
          
          // Open the focused customer's popup
          marker.openPopup();
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [focusedCustomerIds, customerMarkerRefs, map]);

  return null;
}

/* ----------------------------------
   REAL-TIME ROUTING (PER DRIVER WITH THEIR CUSTOMERS)
------------------------------------- */
interface RoutingRealtimeProps {
  driver: Driver;
  customers: Customer[];
  driverIndex: number;
  isFocused: boolean;
  focusedCustomerIds: (string | number)[];
}

function RoutingRealtime({ 
  driver, 
  customers, 
  driverIndex, 
  isFocused,
  focusedCustomerIds 
}: RoutingRealtimeProps) {
  const map = useMap();
  const routingControlsRef = useRef<Array<{ control: L.Routing.Control, label?: L.Marker }>>([]);

  const customerIds = useMemo(() =>
    customers.map(c => c.id).sort().join(','),
    [customers]
  );

  const driverPosition = useMemo(() =>
    `${driver.lat.toFixed(6)},${driver.lng.toFixed(6)}`,
    [driver.lat, driver.lng]
  );

  const createRoute = useCallback((customer: Customer, routeColor: string) => {
    if (!map) return null;

    // Check if this specific customer is focused
    const isCustomerFocused = focusedCustomerIds.includes(customer.id);
    const routeWeight = isFocused || isCustomerFocused ? 8 : 6;
    const routeOpacity = isFocused || isCustomerFocused ? 0.9 : 0.8;

    const control = (L.Routing as any).control({
      waypoints: [
        L.latLng(driver.lat, driver.lng),
        L.latLng(customer.lat, customer.lng)
      ],
      lineOptions: {
        styles: [{
          color: routeColor,
          weight: routeWeight,
          opacity: routeOpacity,
          dashArray: isFocused || isCustomerFocused ? '10, 5' : undefined
        }],
        addWaypoints: false,
        extendToWaypoints: false,
        missingRouteTolerance: 0
      },
      addWaypoints: false,
      show: false,
      routeWhileDragging: false,
      fitSelectedRoutes: false,
      createMarker: () => null,
      draggableWaypoints: false,
      showAlternatives: false
    }).addTo(map);

    // Add customer ID label to the route line ONLY if customer is focused
    control.on('routesfound', function (e) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const coordinates = route.coordinates;

        // Only create label if this customer is focused
        if (coordinates.length > 0 && isCustomerFocused) {
          const midIndex = Math.floor(coordinates.length / 2);
          const midPoint = coordinates[midIndex];

          // Create custom label with customer info
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
                ${isFocused ? 'border: 3px solid #FFD700;' : ''}
              ">Pour ${customer.name || customer.id}${isCustomerFocused ? ' 🔥' : ''}</div>`,
              className: 'customer-route-label',
              iconSize: [80, 24],
            })
          }).addTo(map);

          routingControlsRef.current.push({ control, label });
        }
      }
    });

    return { control };
  }, [map, driver.lat, driver.lng, isFocused, focusedCustomerIds]);

  useEffect(() => {
    if (!map || customers.length === 0) return;

    const shouldRecreateRoutes =
      routingControlsRef.current.length === 0 ||
      routingControlsRef.current.length !== customers.length ||
      !routingControlsRef.current.every((item, index) =>
        item.control &&
        item.control.getWaypoints().some(wp =>
          wp.latLng.equals(L.latLng(customers[index].lat, customers[index].lng))
        )
      );

    if (!shouldRecreateRoutes) return;

    // Remove old routes for this specific driver
    routingControlsRef.current.forEach((item) => {
      if (item.control) map.removeControl(item.control);
      if (item.label) map.removeLayer(item.label);
    });
    routingControlsRef.current = [];

    // Create new routes
    customers.forEach((customer) => {
      const routeColor = customer?.color || getDriverColor(driverIndex);
      const routeItem = createRoute(customer, routeColor);
      if (routeItem) {
        routingControlsRef.current.push(routeItem);
      }
    });

  }, [customerIds, driverPosition, map, customers, createRoute, driverIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) {
        routingControlsRef.current.forEach((item) => {
          if (item.control) map.removeControl(item.control);
          if (item.label) map.removeLayer(item.label);
        });
        routingControlsRef.current = [];
      }
    };
  }, [map]);

  return null;
}

// Create a memoized version that only updates when absolutely necessary
const MemoizedRouting = React.memo(RoutingRealtime, (prevProps, nextProps) => {
  const driverMovedSignificantly =
    Math.abs(prevProps.driver.lat - nextProps.driver.lat) > 0.0001 ||
    Math.abs(prevProps.driver.lng - nextProps.driver.lng) > 0.0001;

  const customersChanged =
    prevProps.customers.length !== nextProps.customers.length ||
    prevProps.customers.some((cust, index) =>
      cust.id !== nextProps.customers[index]?.id ||
      cust.lat !== nextProps.customers[index]?.lat ||
      cust.lng !== nextProps.customers[index]?.lng
    );

  const focusChanged = prevProps.isFocused !== nextProps.isFocused;
  
  const focusedCustomersChanged = 
    prevProps.focusedCustomerIds.length !== nextProps.focusedCustomerIds.length ||
    prevProps.focusedCustomerIds.some((id, index) => id !== nextProps.focusedCustomerIds[index]);

  return !driverMovedSignificantly && !customersChanged && !focusChanged && !focusedCustomersChanged;
});