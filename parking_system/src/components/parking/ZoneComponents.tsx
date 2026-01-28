import { useParkingSystem } from '@/contexts/ParkingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';

export function ZoneSelector({ 
  selectedZoneId, 
  onSelectZone 
}: { 
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
}) {
  const { zones } = useParkingSystem();

  return (
    <div className="space-y-3">
      <button
        onClick={() => onSelectZone(null)}
        className={`w-full p-3 rounded-xl text-left transition-all ${
          selectedZoneId === null 
            ? 'neu-pressed bg-primary/10' 
            : 'neu-button'
        }`}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium">All Zones</span>
        </div>
      </button>

      {zones.map((zone) => {
        const available = zone.getTotalAvailable();
        const total = zone.getTotalSlots();
        const utilization = zone.getUtilization();
        const isSelected = selectedZoneId === zone.id;

        return (
          <button
            key={zone.id}
            onClick={() => onSelectZone(zone.id)}
            className={`w-full p-3 rounded-xl text-left transition-all ${
              isSelected ? 'neu-pressed' : 'neu-button'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-medium">{zone.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {zone.code}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{available}/{total} available</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${utilization}%`,
                      backgroundColor: zone.color,
                    }}
                  />
                </div>
                <span>{Math.round(utilization)}%</span>
              </div>
            </div>

            {zone.adjacentZoneIds.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="w-3 h-3" />
                  <span>Adjacent:</span>
                  {zone.adjacentZoneIds.slice(0, 2).map((adjId) => {
                    const adjZone = zones.find(z => z.id === adjId);
                    return adjZone ? (
                      <span 
                        key={adjId}
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ 
                          backgroundColor: `${adjZone.color}20`,
                          color: adjZone.color,
                        }}
                      >
                        {adjZone.code}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ZoneStatsCards() {
  const { zones, system } = useParkingSystem();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {zones.map((zone) => {
        const stats = system.getZoneAnalytics(zone.id);
        if (!stats) return null;

        return (
          <Card key={zone.id} className="neu-flat border-0 neu-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.code}
                </div>
                <div>
                  <h3 className="font-semibold">{zone.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {zone.areas.length} parking areas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slot-available/20">
                  <div className="text-lg font-bold text-slot-available">{stats.available}</div>
                  <div className="text-[10px] text-muted-foreground">Available</div>
                </div>
                <div className="p-2 rounded-lg bg-slot-allocated/20">
                  <div className="text-lg font-bold text-slot-allocated">{stats.allocated}</div>
                  <div className="text-[10px] text-muted-foreground">Allocated</div>
                </div>
                <div className="p-2 rounded-lg bg-slot-occupied/20">
                  <div className="text-lg font-bold text-slot-occupied">{stats.occupied}</div>
                  <div className="text-[10px] text-muted-foreground">Occupied</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-medium">{stats.utilization}%</span>
                </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.utilization}%`,
                      backgroundColor: zone.color,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
