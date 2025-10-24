import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { mockDeliveries } from '@/data/mockData';
import { Search } from 'lucide-react';

const AdminDeliveries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredDeliveries = mockDeliveries.filter(
    (delivery) =>
      delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des livraisons</h2>
          <p className="text-muted-foreground">Gérez et suivez toutes vos livraisons</p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Rechercher une livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro de suivi ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deliveries List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">N° de suivi</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Destinataire</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Adresse</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Livraison prévue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/deliveries/${delivery.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{delivery.trackingNumber}</td>
                      <td className="px-4 py-3">{delivery.recipient.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {delivery.recipient.address}
                      </td>
                      <td className="px-4 py-3">
                        <DeliveryStatusBadge status={delivery.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(delivery.estimatedDelivery).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveries;
