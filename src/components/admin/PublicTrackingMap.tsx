import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect, useRef } from "react";

// ICONS
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
});

const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [40, 40],
});

type Customer = { id: string | number; lat: number; lng: number; color?: string };
type Driver = { lat: number; lng: number };

 const calculateCenter = (customers: Customer[]): [number, number] => {
    if (customers.length === 0) return [0, 0];
    
    const allPoints: [number, number][] = customers.map(c => [c.lat, c.lng]);
    
    const avgLat = allPoints.reduce((sum, point) => sum + point[0], 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, point) => sum + point[1], 0) / allPoints.length;
    
    return [avgLat, avgLng];
  };

// UTILITY: generate random color
const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
export default function PublicTrackingMap({ driver, customers }: { driver?: Driver | null; customers: Customer[] }) {

  console.log("PublicTrackingMap render", { driver, customers });

  const center: [number, number] = driver ? [driver.lat, driver.lng] : calculateCenter(customers);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "20vh", width: "100%" }}
      
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {driver && (
        <Marker position={[driver.lat, driver.lng]} icon={driverIcon}>
          <Popup>
            <strong>Driver</strong>
            <br />
            Position: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}

      {customers?.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]} icon={customerIcon}>
          <Popup>
            <strong>Customer {c.id}</strong>
            <br />
            Position: {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}

      {driver && customers?.length > 0 && (
        <RoutingRealtime driver={driver} customers={customers} />
      )}
    </MapContainer>
  );
}

/* ----------------------------------
   REAL-TIME ROUTING (MULTIPLE CUSTOMERS, RANDOM COLORS)
------------------------------------- */
function RoutingRealtime({ driver, customers }) {
  const map = useMap();
  const routingControlsRef = useRef<{ control: any; label?: L.Marker }[]>([]);

  useEffect(() => {
    if (!map) return;

    // Remove old routes and labels
    routingControlsRef.current.forEach((item) => {
      if (item.control) map.removeControl(item.control);
      if (item.label) map.removeLayer(item.label);
    });
    routingControlsRef.current = [];

    customers.forEach((customer) => {
      const color = customer.color;

      const control = L.Routing.control(({
        waypoints: [L.latLng(driver.lat, driver.lng), L.latLng(customer.lat, customer.lng)],
        lineOptions: { 
          styles: [{ color, weight: 5 }],
          addWaypoints: false,
          extendToWaypoints: false,
          missingRouteTolerance: 0
        },
        addWaypoints: false,
        show: false,
        routeWhileDragging: false,
        fitSelectedRoutes: false,
        createMarker: () => null, // This removes the default markers
        showAlternatives: false
      } as any)).addTo(map);

      // Add customer ID to the route line
      control.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          const coordinates = route.coordinates;
          
          // Add label at the midpoint of the route
          if (coordinates.length > 0) {
            const midIndex = Math.floor(coordinates.length / 2);
            const midPoint = coordinates[midIndex];
            
            // Create custom label with customer ID
            const label = L.marker(midPoint, {
              icon: L.divIcon({
                html: `<div style="
                  background: ${color};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: bold;
                  border: 2px solid white;
                ">Customer ${customer.id}</div>`,
                className: 'customer-route-label',
                iconSize: [60, 20],
              })
            }).addTo(map);
            
            // Store label for cleanup
            routingControlsRef.current.push({ control, label });
          }
        }
      });

      routingControlsRef.current.push({ control });
    });

    // Fit map to show all markers
    const group = new L.FeatureGroup([
      L.marker([driver.lat, driver.lng]),
      ...customers.map((c) => L.marker([c.lat, c.lng])),
    ]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    return () => {
      routingControlsRef.current.forEach((item) => {
        if (item.control) map.removeControl(item.control);
        if (item.label) map.removeLayer(item.label);
      });
      routingControlsRef.current = [];
    };
  }, [driver, customers, map]);

  return null;
}