import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useDriverLocations() {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const socket = io("http://localhost:3004");

    socket.on("driver_location_update", data => {
      setLocations(prev => ({
        ...prev,
        [data.driver_id]: { lat: data.lat, lng: data.lng }
      }));
    });

    return () => socket.disconnect();
  }, []);

  return locations;
}
