import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { DeliveryTimeline } from '@/components/DeliveryTimeline';
import { getDeliveryById } from '@/data/mockData';
import { DeliveryStatus } from '@/types/delivery';
import { toast } from '@/hooks/use-toast';

const AdminDeliveryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const delivery = id ? getDeliveryById(id) : undefined;
  const [status, setStatus] = useState<DeliveryStatus>(delivery?.status || 'pending');

  if (!delivery) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Livraison non trouvée</h2>
              <Button onClick={() => navigate('/admin/deliveries')}>Retour à la liste</Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const handleSaveStatus = () => {
    toast({
      title: 'Statut mis à jour',
      description: 'Le statut de la livraison a été mis à jour avec succès.',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin/deliveries')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>

        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl">Détails de la livraison</CardTitle>
                <p className="text-muted-foreground mt-1">N° {delivery.trackingNumber}</p>
              </div>
              <DeliveryStatusBadge status={status} />
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Modifier le statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={status} onValueChange={(value) => setStatus(value as DeliveryStatus)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="in_transit">En transit</SelectItem>
                      <SelectItem value="out_for_delivery">En cours de livraison</SelectItem>
                      <SelectItem value="delivered">Livré</SelectItem>
                      <SelectItem value="failed">Échec</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSaveStatus}>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryTimeline timeline={delivery.timeline} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du colis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{delivery.package.description}</p>
                </div>
                <div>
                  <p className="font-medium">Poids</p>
                  <p className="text-muted-foreground">{delivery.package.weight} kg</p>
                </div>
                <div>
                  <p className="font-medium">Dimensions</p>
                  <p className="text-muted-foreground">{delivery.package.dimensions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Sender */}
            <Card>
              <CardHeader>
                <CardTitle>Expéditeur</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{delivery.sender.name}</p>
                <p className="text-muted-foreground">{delivery.sender.address}</p>
              </CardContent>
            </Card>

            {/* Recipient */}
            <Card>
              <CardHeader>
                <CardTitle>Destinataire</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{delivery.recipient.name}</p>
                <p className="text-muted-foreground">{delivery.recipient.address}</p>
                <p className="text-muted-foreground">{delivery.recipient.phone}</p>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle>Livraison prévue</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  {new Date(delivery.estimatedDelivery).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveryDetail;
