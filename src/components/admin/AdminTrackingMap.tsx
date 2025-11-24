import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useCallback, useEffect, useMemo, useRef } from "react";
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

// Add CSS for colored driver icons
const style = document.createElement('style');
style.textContent = `
  .driver-icon-red { filter: hue-rotate(0deg) saturate(5) brightness(0.8); }
  .driver-icon-green { filter: hue-rotate(90deg) saturate(5) brightness(0.8); }
  .driver-icon-purple { filter: hue-rotate(270deg) saturate(5) brightness(0.8); }
`;
document.head.appendChild(style);

const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
  .focused-driver {
    filter: drop-shadow(0 0 8px yellow);
    z-index: 1000;
  }
  .focused-customer {
    filter: drop-shadow(0 0 6px orange);
    z-index: 999;
  }
`;
document.head.appendChild(highlightStyle);

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

// UTILITY: generate random color for individual routes
const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

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
  driverId?: string | number; // Link customer to specific driver  
  color?: string;
}

interface TrackingMapProps {
  drivers: Driver[];
  customers: Customer[];
}

interface TrackingMapProps {
  drivers: Driver[];
  customers: Customer[];
  focusedDriverId?: string | number; // Driver to focus on
  focusedCustomerIds?: (string | number)[]; // Specific customers to focus on
}

export default function AdminTrackingMap({
  drivers,
  customers,
  focusedDriverId,
  focusedCustomerIds = []
}: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate center point based on all drivers and customers
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

      {/* Focus Controller - Handles zooming to focused elements */}
      <FocusController
        drivers={drivers}
        customers={customers}
        focusedDriverId={focusedDriverId}
        focusedCustomerIds={focusedCustomerIds}
      />

      {/* Render drivers */}
      {drivers?.map((driver, index) => (
        <Marker
          key={`driver-${driver.id}`}
          position={[driver.lat, driver.lng]}
          icon={driverIcons[index % driverIcons.length]}
          eventHandlers={{
            add: (e) => {
              // Apply focus style when marker is added to map
              const markerElement = e.target.getElement();
              if (markerElement && focusedDriverId === driver.id) {
                markerElement.classList.add('focused-driver');
              }
            }
          }}
        >

          <Popup>
            <strong>Driver {driver.name || `#${driver.id}`}</strong>
            <br />
            Position: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
            <br />
            {driver.email && `Email: ${driver.email}`}
            <br />
            Status: {driver.isActive ? 'Active' : 'Inactive'}
            <br />
            Assigned customers: {customers.filter(c => c.driverId === driver.id).length}
          </Popup>
        </Marker>
      ))}

      {/* Render customers */}
      {customers?.map((customer) => (
        <Marker
          key={`customer-${customer.id}`}
          position={[customer.lat, customer.lng]}
          icon={customerIcon}
          eventHandlers={{
            add: (e) => {
              // Apply focus style when marker is added to map
              const markerElement = e.target.getElement();
              if (markerElement && focusedCustomerIds.includes(customer.id)) {
                markerElement.classList.add('focused-customer');
              }
            }
          }}
        >
          <Popup>
            <strong>Customer {customer.name || `#${customer.id}`}</strong>
            <br />
            Position: {customer.lat.toFixed(4)}, {customer.lng.toFixed(4)}
            <br />
            {customer.driverId && `Assigned to Driver: ${customer.driverId}`}
          </Popup>
        </Marker>
      ))}

      {/* Render routes for each driver with their assigned customers */}
     // Use in your main component:
      {drivers.map((driver, index) => {
        const driverCustomers = customers.filter(customer => customer.driverId === driver.id);
        if (driverCustomers.length === 0) return null;

        return (
          <MemoizedRouting
            key={`routes-${driver.id}`}
            driver={driver}
            customers={driverCustomers}
            driverIndex={index}
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
}

function FocusController({
  drivers,
  customers,
  focusedDriverId,
  focusedCustomerIds
}: FocusControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!focusedDriverId && focusedCustomerIds.length === 0) return;

    let pointsToFocus: L.LatLng[] = [];

    // If focusing on a specific driver
    if (focusedDriverId) {
      const driver = drivers.find(d => d.id === focusedDriverId);
      if (driver) {
        pointsToFocus.push(L.latLng(driver.lat, driver.lng));

        // Add all customers assigned to this driver
        const driverCustomers = customers.filter(c => c.driverId === focusedDriverId);
        driverCustomers.forEach(customer => {
          pointsToFocus.push(L.latLng(customer.lat, customer.lng));
        });
      }
    }

    // If focusing on specific customer IDs
    if (focusedCustomerIds.length > 0) {
      focusedCustomerIds.forEach(customerId => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          pointsToFocus.push(L.latLng(customer.lat, customer.lng));

          // Also include the driver if this customer has one assigned
          if (customer.driverId) {
            const driver = drivers.find(d => d.id === customer.driverId);
            if (driver) {
              pointsToFocus.push(L.latLng(driver.lat, driver.lng));
            }
          }
        }
      });
    }

    // Remove duplicates (in case same point was added multiple times)
    pointsToFocus = pointsToFocus.filter((point, index, self) =>
      index === self.findIndex(p =>
        p.lat === point.lat && p.lng === point.lng
      )
    );

    // If we have points to focus on, fit the map bounds to show them
    if (pointsToFocus.length > 0) {
      const group = new L.FeatureGroup(pointsToFocus.map(point =>
        L.marker(point)
      ));

      map.fitBounds(group.getBounds(), {
        padding: [20, 20], // Add some padding around the bounds
        maxZoom: 15 // Optional: prevent zooming in too close
      });
    }
  }, [focusedDriverId, focusedCustomerIds, drivers, customers, map]);

  return null;
}


/* ----------------------------------
   REAL-TIME ROUTING (PER DRIVER WITH THEIR CUSTOMERS)
------------------------------------- */
interface RoutingRealtimeProps {
  driver: Driver;
  customers: Customer[];
  driverIndex: number;
}

function RoutingRealtime({ driver, customers, driverIndex }: RoutingRealtimeProps) {
  const map = useMap();
  const routingControlsRef = useRef<Array<{ control: L.Routing.Control, label?: L.Marker }>>([]);

  // Memoize the customers array to prevent unnecessary re-renders
  const customerIds = useMemo(() =>
    customers.map(c => c.id).sort().join(','),
    [customers]
  );

  // Memoize driver position
  const driverPosition = useMemo(() =>
    `${driver.lat.toFixed(6)},${driver.lng.toFixed(6)}`,
    [driver.lat, driver.lng]
  );

  const createRoute = useCallback((customer: Customer, routeColor: string) => {
    if (!map) return null;

    const control = L.Routing.control({
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
        addWaypoints: false,
        extendToWaypoints: false,
        missingRouteTolerance: 0
      },
      addWaypoints: false,
      show: false,
      routeWhileDragging: false,
      fitSelectedRoutes: false,
      //createMarker: () => null,
      //draggableWaypoints: false,
      showAlternatives: false
    }).addTo(map);

    // Add customer ID label to the route line
    control.on('routesfound', function (e) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const coordinates = route.coordinates;

        // Add label at the midpoint of the route
        if (coordinates.length > 0) {
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
              ">Customer ${customer.name || customer.id}</div>`,
              className: 'customer-route-label',
              iconSize: [80, 24],
            })
          }).addTo(map);

          routingControlsRef.current.push({ control, label });
        }
      }
    });

    return { control };
  }, [map, driver.lat, driver.lng]);

  useEffect(() => {
    if (!map || customers.length === 0) return;

    // Only recreate routes if driver position or customers actually changed
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
      const routeColor = customer?.color; // Use driver color directly
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
  // Only re-render if driver moved significantly or customers changed
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

  return !driverMovedSignificantly && !customersChanged;
});

