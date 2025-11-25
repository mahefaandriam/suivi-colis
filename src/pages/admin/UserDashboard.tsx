import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useDeliveryStats, useDeliveries } from "@/hooks/useDeliveries"

const UserDashboard = () => {
  const navigate = useNavigate();
  const { data: deliveries, isLoading: deliveriesLoading } = useDeliveries();
  const { data: stats, isLoading: statsLoading } = useDeliveryStats();
  
  if (statsLoading || deliveriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const recentDeliveries = deliveries?.slice(0, 5) || [];

  const chartData = [
    { status: 'Livrés', count: stats?.delivered || 0, fill: 'hsl(262, 83%, 58%)' },
    { status: 'En transit', count: stats?.inTransit || 0, fill: 'hsl(262, 70%, 65%)' },
    { status: 'En attente', count: stats?.pending || 0, fill: 'hsl(262, 60%, 72%)' },
    { status: 'Échecs', count: stats?.failed || 0, fill: 'hsl(262, 50%, 80%)' },
  ];

  const chartConfig = {
    count: {
      label: 'Nombre',
    },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard client</h2>
          <p className="text-muted-foreground">Vue d'ensemble de vos livraisons</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total"
            value={stats?.total}
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Livrés"
            value={stats?.delivered}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="En transit"
            value={stats?.inTransit}
            icon={Truck}
            variant="info"
          />
          <StatCard
            title="En attente"
            value={stats?.pending}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Échecs"
            value={stats?.failed}
            icon={XCircle}
            variant="destructive"
          />
        </div>

        {/* Statistics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des livraisons</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="status" 
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Livraisons récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/deliveries/${delivery.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{delivery.trackingNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.recipient.name} - {delivery.recipient.address}
                    </p>
                  </div>
                  <DeliveryStatusBadge status={delivery.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserDashboard;
