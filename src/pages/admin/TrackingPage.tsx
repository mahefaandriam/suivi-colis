import { useEffect, useState } from "react";
import TrackingMap from "../../components/admin/DriverTrackingMap";

export default function TrackingPage() {
  const [driver, setDriver] = useState(null);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    // Fetch customer once
    setCustomer({ lat: -18.9102, lng: 47.5258 });

    // Fetch driver every 3 seconds
    const interval = setInterval(async () => {
      const res = await fetch("http://localhost:3004/api/deliveries/location/driver/4758f8a3-5426-4a42-b3c0-740133da28fb");
      const pos = await res.json();
      setDriver(pos);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!driver || !customer) return <p>Loading...</p>;

  return <TrackingMap driver={driver} customer={customer} />;
}
