import { Badge } from '@/components/ui/badge';
import { DeliveryStatus } from '@/types/delivery';

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
}

export const DeliveryStatusBadge = ({ status }: DeliveryStatusBadgeProps) => {
  const getStatusConfig = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return { variant: 'success' as const, label: 'Livré' };
      case 'in_transit':
        return { variant: 'info' as const, label: 'En transit' };
      case 'out_for_delivery':
        return { variant: 'warning' as const, label: 'En cours de livraison' };
      case 'pending':
        return { variant: 'secondary' as const, label: 'En attente' };
      case 'failed':
        return { variant: 'destructive' as const, label: 'Échec' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const config = getStatusConfig(status);

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
