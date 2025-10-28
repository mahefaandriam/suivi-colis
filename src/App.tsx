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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tracking/:id" element={<TrackingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/deliveries" element={<AdminDeliveries />} />
            <Route path="/admin/deliveries2" element={<DeliveryList />} />
            <Route path="/admin/deliveries/:id" element={<AdminDeliveryDetail />} />
            <Route path="/admin/deliveries2/:id" element={<AdminDeliveryDetail2 />} />
            <Route path="*" element={<NotFound />} />
          </Routes>          
          <QuickScanButton />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
