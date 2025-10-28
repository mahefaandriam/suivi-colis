import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { DeliveryTimeline } from '@/components/DeliveryTimeline';
import { toast } from '@/hooks/use-toast';
import { useDelivery, useUpdateDeliveryStatus } from '@/hooks/useDeliveries';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

const AdminDeliveryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: delivery, isLoading } = useDelivery(id!);
  const [isOnUpdate, setIsOnUpdate] = useState(false);
  const updateStatusMutation = useUpdateDeliveryStatus();
  const navigate = useNavigate();

  const [updateData, setUpdateData] = useState({
    status: '',
    location: '',
    description: ''
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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

  const handleStatusUpdate = async () => {
    setIsOnUpdate(true);
    if (updateData.status && updateData.location && updateData.description) {
      await updateStatusMutation.mutateAsync({
        id: delivery.id,
        updateData: {
          status: updateData.status as any,
          location: updateData.location,
          description: updateData.description
        }
      });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la livraison a été mis à jour avec succès.',
      });
      setUpdateData({ status: '', location: '', description: '' });
    }
    setIsOnUpdate(false)
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
              <DeliveryStatusBadge status={delivery.status} />
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            {!isOnUpdate ? (
              delivery.status !== "delivered" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Modifier le statut</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 ">
                    <div className="relative gap-3 pb-8">
                      <div className=''>
                        <div className='flex gap-2 mb-4'>
                          <select
                            value={updateData.status}
                            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                            className="block w-full h-10 md:w-auto px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                          >
                            <option value="pending">En attente</option>
                            <option value="in_transit">En transit</option>
                            <option value="status-asc">Status (A-Z)</option>
                            <option value="out_for_delivery">En cours de livraison</option>
                            <option value="delivered">Livré</option>
                            <option value="failed">Échec</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Location"
                            value={updateData.location}
                            onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                            className="block w-full h-10 md:w-auto px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          value={updateData.description}
                          onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                        />
                      </div>
                      <Button onClick={handleStatusUpdate} className='absolute right-0'>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary-500"></div>
              </div>
            )}

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
            {/* QR Code */}
            <QRCodeGenerator delivery={delivery} />

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
