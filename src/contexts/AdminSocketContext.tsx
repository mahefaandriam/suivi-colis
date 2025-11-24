// src/context/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const SocketProvider = ({ children }) => {
  const { user } = useAuth(); // get role & id
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return; // ⛔ no socket if not admin


    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
    });

    if (user.role === "admin") {
      console.log("Admin connected to socket:", user.id);

      newSocket.emit("admin_connect", {
        adminId: user.id,
        username: user.firstName,
      });
    };

    if (user.role === "user") {
      console.log("Client connected to socket:", user.id);

      newSocket.emit('client_connect', { clientId: user.id, name: user.firstName });
    };

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Quick hook
export const useSocket = () => useContext(SocketContext);
