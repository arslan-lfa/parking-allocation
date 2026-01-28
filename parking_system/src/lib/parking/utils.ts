import { Car, Bike, Truck, Zap, LucideIcon } from 'lucide-react';
import { VehicleType, SlotStatus, RequestStatus } from '@/lib/parking';

export function getVehicleIcon(type: VehicleType): LucideIcon {
  switch (type) {
    case VehicleType.CAR:
      return Car;
    case VehicleType.MOTORCYCLE:
      return Bike;
    case VehicleType.TRUCK:
      return Truck;
    case VehicleType.ELECTRIC:
      return Zap;
    default:
      return Car;
  }
}

export function getVehicleTypeName(type: VehicleType): string {
  switch (type) {
    case VehicleType.CAR:
      return 'Car';
    case VehicleType.MOTORCYCLE:
      return 'Motorcycle';
    case VehicleType.TRUCK:
      return 'Truck';
    case VehicleType.ELECTRIC:
      return 'Electric Vehicle';
    default:
      return 'Unknown';
  }
}

export function getSlotStatusColor(status: SlotStatus): string {
  switch (status) {
    case SlotStatus.AVAILABLE:
      return 'bg-slot-available';
    case SlotStatus.ALLOCATED:
      return 'bg-slot-allocated';
    case SlotStatus.OCCUPIED:
      return 'bg-slot-occupied';
    case SlotStatus.RELEASED:
      return 'bg-slot-released';
    default:
      return 'bg-muted';
  }
}

export function getSlotStatusLabel(status: SlotStatus): string {
  switch (status) {
    case SlotStatus.AVAILABLE:
      return 'Available';
    case SlotStatus.ALLOCATED:
      return 'Allocated';
    case SlotStatus.OCCUPIED:
      return 'Occupied';
    case SlotStatus.RELEASED:
      return 'Released';
    default:
      return 'Unknown';
  }
}

export function getRequestStatusColor(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.REQUESTED:
      return 'bg-blue-500';
    case RequestStatus.ALLOCATED:
      return 'bg-slot-allocated';
    case RequestStatus.OCCUPIED:
      return 'bg-slot-occupied';
    case RequestStatus.RELEASED:
      return 'bg-slot-released';
    case RequestStatus.CANCELLED:
      return 'bg-muted';
    default:
      return 'bg-muted';
  }
}

export function getRequestStatusLabel(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.REQUESTED:
      return 'Pending';
    case RequestStatus.ALLOCATED:
      return 'Allocated';
    case RequestStatus.OCCUPIED:
      return 'In Use';
    case RequestStatus.RELEASED:
      return 'Completed';
    case RequestStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '-';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDateTime(date: Date | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}
