import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import TrackingPage from "./pages/TrackingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminDeliveryDetail from "./pages/admin/AdminDeliveryDetail";
import NotFound from "./pages/NotFound";
import { DeliveryList } from "./pages/admin/DeliveryList";
import AdminDeliveryDetail2 from "./pages/admin/AdminDeliveryDetail2";
import { QuickScanButton } from "./components/QuickScanButton";
import { CreateDelivery } from "./pages/admin/CreateDelivery";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { Register } from "./pages/Register";
import DriverDeliveries from "./pages/admin/DriverDelivries";
import UserDashboard from "./pages/admin/UserDashboard";
import { SocketProvider } from "./contexts/AdminSocketContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Protected routes */}
                <Route path="/admin" element={
                  <ProtectedRoute  >
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin-client" element={
                  <ProtectedRoute  >
                    <UserDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/user/tracking/:id" element={
                  <ProtectedRoute requiredRole={["user"]}>
                    <TrackingPage />
                  </ProtectedRoute>
                } />

                <Route path="/admin/deliveries" element={
                  <ProtectedRoute requiredRole={["admin"]}>
                    <AdminDeliveries />
                  </ProtectedRoute>
                } />
                <Route path="/admin/driver/deliveries" element={
                  <ProtectedRoute requiredRole={["driver"]}>
                    <DriverDeliveries />
                  </ProtectedRoute>
                } />
                <Route path="/admin/deliveries/new" element={
                  <ProtectedRoute requiredRole={["admin"]}>
                    <CreateDelivery />
                  </ProtectedRoute>
                } />
                <Route path="/admin/deliveries/:id" element={
                  <ProtectedRoute>
                    <AdminDeliveryDetail />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <QuickScanButton />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
