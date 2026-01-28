import { useParkingSystem } from '@/contexts/ParkingContext';
import { RequestStatus } from '@/lib/parking';
import { getRequestStatusColor, getRequestStatusLabel, formatDateTime, getVehicleIcon } from '@/lib/parking/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LogIn, LogOut, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function RequestsTable() {
  const { requests, vehicles, zones, occupySlot, releaseSlot, cancelRequest } = useParkingSystem();

  const activeRequests = requests.filter(
    r => r.status !== RequestStatus.RELEASED && r.status !== RequestStatus.CANCELLED
  );

  const handleOccupy = (requestId: string) => {
    if (occupySlot(requestId)) {
      toast.success('Vehicle arrived - slot occupied');
    } else {
      toast.error('Cannot occupy slot');
    }
  };

  const handleRelease = (requestId: string) => {
    if (releaseSlot(requestId)) {
      toast.success('Slot released successfully');
    } else {
      toast.error('Cannot release slot');
    }
  };

  const handleCancel = (requestId: string) => {
    if (cancelRequest(requestId)) {
      toast.success('Request cancelled');
    } else {
      toast.error('Cannot cancel request');
    }
  };

  if (activeRequests.length === 0) {
    return (
      <div className="neu-flat rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">No active parking requests</p>
      </div>
    );
  }

  return (
    <div className="neu-flat rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Vehicle</TableHead>
            <TableHead className="text-muted-foreground">Zone</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Created</TableHead>
            <TableHead className="text-muted-foreground">Penalty</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeRequests.map((request) => {
            const vehicle = vehicles.find(v => v.id === request.vehicleId);
            const zone = zones.find(z => z.id === request.allocatedZoneId);
            const preferredZone = zones.find(z => z.id === request.preferredZoneId);
            const Icon = vehicle ? getVehicleIcon(vehicle.type) : null;

            return (
              <TableRow key={request.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <div className="font-medium">{vehicle?.licensePlate || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{vehicle?.ownerName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {zone && (
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      />
                    )}
                    <div>
                      <div className="text-sm">{zone?.name || preferredZone?.name || 'Pending'}</div>
                      {request.isCrossZone() && (
                        <div className="text-xs text-orange-500">Cross-zone</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${getRequestStatusColor(request.status)} text-white border-0`}
                  >
                    {getRequestStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(request.createdAt)}
                </TableCell>
                <TableCell>
                  {request.penalty > 0 && (
                    <span className="text-orange-500 font-medium">${request.penalty.toFixed(0)}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {request.status === RequestStatus.ALLOCATED && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOccupy(request.id)}
                        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    )}
                    {request.status === RequestStatus.OCCUPIED && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRelease(request.id)}
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    )}
                    {(request.status === RequestStatus.REQUESTED || 
                      request.status === RequestStatus.ALLOCATED) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancel(request.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
