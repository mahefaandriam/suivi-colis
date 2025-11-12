import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const deliveryIcons = {
  pending: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  assigned: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  picked_up: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  in_transit: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  delivered: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapUpdater({ center, selectedDelivery }) {
  const map = useMap();

  useEffect(() => {
    if (selectedDelivery) {
      const bounds = L.latLngBounds([
        selectedDelivery.pickup,
        selectedDelivery.destination
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [map, center, selectedDelivery]);

  return null;
}

function Map({ deliveries, drivers, selectedDelivery, userLocation, isDriverMode, currentDriver }) {
  const mapRef = useRef();
  
  const center = userLocation || [48.8566, 2.3522]; // Default to Paris

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} selectedDelivery={selectedDelivery} />

        {/* Delivery Markers */}
        {deliveries.map((delivery) => (
          <React.Fragment key={delivery.id}>
            <Marker
              position={delivery.pickup}
              icon={deliveryIcons[delivery.status]}
            >
              <Popup>
                <div>
                  <h3>Pickup: {delivery.id}</h3>
                  <p>Status: {delivery.status}</p>
                  <p>Recipient: {delivery.recipient}</p>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={delivery.destination}>
              <Popup>
                <div>
                  <h3>Destination: {delivery.id}</h3>
                  <p>Address: {delivery.destinationAddress}</p>
                </div>
              </Popup>
            </Marker>

            {/* Delivery Route */}
            <Polyline
              positions={[delivery.pickup, delivery.destination]}
              color={delivery.status === 'delivered' ? 'green' : 'blue'}
              weight={4}
              opacity={0.7}
            />
          </React.Fragment>
        ))}

        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={driver.location}
            icon={driverIcon}
          >
            <Popup>
              <div>
                <h3>Driver: {driver.name}</h3>
                <p>Vehicle: {driver.vehicle}</p>
                <p>Last Update: {driver.lastUpdate?.toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current User Location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div>Your Location</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Map;