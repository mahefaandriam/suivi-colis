import { TimelineEvent } from '@/types/delivery';
import { Check, Package, Truck, MapPin, XCircle } from 'lucide-react';

interface DeliveryTimelineProps {
  timeline: TimelineEvent[];
}

export const DeliveryTimeline = ({ timeline }: DeliveryTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Check className="h-5 w-5" />;
      case 'in_transit':
        return <Truck className="h-5 w-5" />;
      case 'out_for_delivery':
        return <MapPin className="h-5 w-5" />;
      case 'pending':
        return <Package className="h-5 w-5" />;
      case 'failed':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'in_transit':
        return 'bg-info text-info-foreground';
      case 'out_for_delivery':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {timeline.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${getStatusColor(event.status)}`}>
              {getStatusIcon(event.status)}
            </div>
            {index < timeline.length - 1 && (
              <div className="w-0.5 flex-1 bg-border mt-2 min-h-[40px]" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-medium text-foreground">{event.description}</p>
            <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(event.timestamp).toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
