// src/hooks/useDriverLocationSender.ts
import { driverApi } from "@/services/api";
import { useEffect, useRef } from "react";

export function useDriverLocationSender(driverId: string, intervalMs = 5000) {
    const timer = useRef<number | null>(null);

    useEffect(() => {
        if (!driverId) return;

        // Send location repeatedly
        timer.current = window.setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;

                    console.log(`Driver ${driverId} location:`, { latitude, longitude });

                    await driverApi.updateDriverLocation(driverId, latitude, longitude);
                },
                (err) => {
                    console.log("GPS sssError:", err);
                }
            );
        }, intervalMs);

        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [driverId, intervalMs]);
}
