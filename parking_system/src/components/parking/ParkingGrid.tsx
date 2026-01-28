import { useParkingSystem } from '@/contexts/ParkingContext';
import { Zone, SlotStatus } from '@/lib/parking';
import { getSlotStatusColor, getSlotStatusLabel } from '@/lib/parking/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Car, Zap, Accessibility, Truck } from 'lucide-react';

interface ParkingGridProps {
  selectedZoneId?: string;
  onSlotClick?: (slotId: string, zoneId: string) => void;
}

export function ParkingGrid({ selectedZoneId, onSlotClick }: ParkingGridProps) {
  const { zones } = useParkingSystem();

  const filteredZones = selectedZoneId 
    ? zones.filter(z => z.id === selectedZoneId)
    : zones;

  return (
    <div className="space-y-6">
      {filteredZones.map((zone) => (
        <ZoneGrid key={zone.id} zone={zone} onSlotClick={onSlotClick} />
      ))}
    </div>
  );
}

function ZoneGrid({ zone, onSlotClick }: { zone: Zone; onSlotClick?: (slotId: string, zoneId: string) => void }) {
  const available = zone.getTotalAvailable();
  const total = zone.getTotalSlots();
  const utilization = zone.getUtilization();

  return (
    <div className="neu-flat rounded-2xl p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full shadow-lg"
            style={{ backgroundColor: zone.color }}
          />
          <h3 className="text-lg font-semibold text-foreground">{zone.name}</h3>
          <span className="text-sm text-muted-foreground">({zone.code})</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {available}/{total} available
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${utilization}%` }}
              />
            </div>
            <span className="text-xs font-medium">{Math.round(utilization)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {zone.areas.map((area) => (
          <div key={area.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {area.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {area.getAvailableCount()}/{area.totalSlots} free
              </span>
            </div>
            
            <div className="grid grid-cols-10 gap-2">
              {area.slots.map((slot) => (
                <Tooltip key={slot.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSlotClick?.(slot.id, zone.id)}
                      className={`
                        relative aspect-square rounded-lg transition-all duration-200
                        hover:scale-110 hover:z-10 cursor-pointer
                        flex items-center justify-center
                        ${getSlotStatusColor(slot.status)}
                        ${slot.status === SlotStatus.OCCUPIED ? 'slot-pulse' : ''}
                      `}
                    >
                      <SlotIcon slot={slot} />
                      <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-white/80">
                        {slot.slotNumber}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-card text-card-foreground border-border shadow-lg"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold">Slot #{slot.slotNumber}</div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getSlotStatusColor(slot.status)}`} />
                        {getSlotStatusLabel(slot.status)}
                      </div>
                      {slot.isHandicapped && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Accessibility className="w-3 h-3" />
                          Handicapped
                        </div>
                      )}
                      {slot.isElectricCharging && (
                        <div className="flex items-center gap-1 text-green-500">
                          <Zap className="w-3 h-3" />
                          Electric Charging
                        </div>
                      )}
                      {slot.currentRequestId && (
                        <div className="text-muted-foreground">
                          Request: {slot.currentRequestId.slice(-8)}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlotIcon({ slot }: { slot: { isHandicapped: boolean; isElectricCharging: boolean; vehicleType: string } }) {
  const className = "w-3 h-3 text-white/90";
  
  if (slot.isHandicapped) {
    return <Accessibility className={className} />;
  }
  if (slot.isElectricCharging) {
    return <Zap className={className} />;
  }
  if (slot.vehicleType === 'TRUCK') {
    return <Truck className={className} />;
  }
  return <Car className={className} />;
}
