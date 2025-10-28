// src/components/StatusBadge.tsx
import { getStatusConfig } from '../utils/statusUtils';
import { DeliveryStatus } from '../types/delivery';
import { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = getStatusConfig(status);
  const Icon = config.icon as LucideIcon;

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border
        ${config.color} ${className}
      `}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};