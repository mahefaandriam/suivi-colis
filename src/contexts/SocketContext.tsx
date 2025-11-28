// src/context/SocketContext.tsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      // Clean up socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // If socket already exists and is connected, don't create a new one
    if (socketRef.current?.connected) {
      return;
    }

    console.log(`🔌 Connecting socket for ${user.role}:`, user.id);

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
      
      // Emit role-specific connection after socket is connected
      if (user.role === "admin") {
        newSocket.emit("admin_connect", {
          adminId: user.id,
          username: user.firstName,
        });
        console.log("👑 Admin connected to socket");
      } else if (user.role === "user") {
        newSocket.emit("client_connect", { 
          clientId: user.id, 
          name: user.firstName 
        });
        console.log("👤 Client connected to socket");
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attempt) => {
      console.log(`🔁 Socket reconnected after ${attempt} attempts`);
      setIsConnected(true);
      
      // Re-emit connection event after reconnection
      if (user.role === "admin") {
        newSocket.emit("admin_connect", {
          adminId: user.id,
          username: user.firstName,
        });
      } else if (user.role === "user") {
        newSocket.emit("client_connect", { 
          clientId: user.id, 
          name: user.firstName 
        });
      }
    });

    newSocket.on("reconnect_error", (error) => {
      console.log("⚠️ Socket reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.log("💥 Socket reconnection failed");
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      // Don't disconnect on component unmount, only on user change
      // This keeps the socket alive during navigation
      console.log("🧹 Socket cleanup (user changed)");
      newSocket.disconnect();
    };
  }, [user?.id, user?.role]); // Only recreate when user ID or role changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Quick hook
export const useSocket = () => useContext(SocketContext);