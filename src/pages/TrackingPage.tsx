import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, Weight, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { DeliveryTimeline } from '@/components/DeliveryTimeline';
import { getDeliveryById } from '@/data/mockData';
import { useDelivery } from '@/hooks/useDeliveries';
import { usePublicDelivery } from '@/hooks/usePublicDeliveries';

const TrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: delivery, isLoading } = usePublicDelivery(id!);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Colis non trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Le numéro de suivi que vous avez entré n'existe pas.
            </p>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Status Overview */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Suivi de livraison</CardTitle>
                <p className="text-muted-foreground">N° {delivery.trackingNumber}</p>
              </div>
              <DeliveryStatusBadge status={delivery.status} />
            </div>
          </CardHeader>
          <CardContent>
            {delivery.currentLocation && (
              <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
                <MapPin className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <p className="font-medium">Position actuelle</p>
                  <p className="text-sm text-muted-foreground">{delivery.currentLocation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Historique de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryTimeline timeline={delivery.timeline} />
              </CardContent>
            </Card>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Livraison prévue</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(delivery.estimatedDelivery).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Détails du colis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{delivery.package.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Weight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Poids</p>
                    <p className="text-sm text-muted-foreground">{delivery.package.weight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dimensions</p>
                    <p className="text-sm text-muted-foreground">{delivery.package.dimensions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Expéditeur</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{delivery.sender.name}</p>
                <p className="text-sm text-muted-foreground">{delivery.sender.address}</p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Destinataire</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{delivery.recipient.name}</p>
                <p className="text-sm text-muted-foreground">{delivery.recipient.address}</p>
                <p className="text-sm text-muted-foreground mt-1">{delivery.recipient.phone}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
