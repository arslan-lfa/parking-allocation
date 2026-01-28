import { useParkingSystem } from '@/contexts/ParkingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { 
  Car, 
  TrendingUp, 
  Clock, 
  XCircle, 
  MapPin,
  DollarSign,
  Activity,
  Target,
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { analytics, zones } = useParkingSystem();

  if (!analytics) {
    return (
      <div className="neu-flat rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const slotDistributionData = [
    { name: 'Available', value: analytics.slotStatusDistribution.AVAILABLE + analytics.slotStatusDistribution.RELEASED, color: 'hsl(142, 70%, 45%)' },
    { name: 'Allocated', value: analytics.slotStatusDistribution.ALLOCATED, color: 'hsl(45, 90%, 50%)' },
    { name: 'Occupied', value: analytics.slotStatusDistribution.OCCUPIED, color: 'hsl(0, 75%, 55%)' },
  ].filter(d => d.value > 0);

  const peakZonesData = analytics.peakZones.slice(0, 5).map(pz => {
    const zone = zones.find(z => z.id === pz.zoneId);
    return {
      name: zone?.code || pz.zoneId.slice(-4),
      requests: pz.count,
      color: zone?.color || '#8B5CF6',
    };
  });

  const hourlyData = analytics.requestsByHour
    .filter(h => h.count > 0)
    .slice(6, 22); // Show 6 AM to 10 PM

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Requests"
          value={analytics.totalRequests}
          icon={Car}
          color="text-primary"
        />
        <StatCard
          title="Utilization"
          value={`${analytics.utilizationRate}%`}
          icon={TrendingUp}
          color="text-green-500"
        />
        <StatCard
          title="Avg Duration"
          value={analytics.averageDuration > 0 ? `${analytics.averageDuration}m` : '-'}
          icon={Clock}
          color="text-blue-500"
        />
        <StatCard
          title="Cancellation"
          value={`${analytics.cancellationRatio}%`}
          icon={XCircle}
          color="text-orange-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Cross-Zone"
          value={analytics.crossZoneAllocations}
          icon={MapPin}
          color="text-purple-500"
        />
        <StatCard
          title="Total Penalties"
          value={`$${analytics.totalPenalties}`}
          icon={DollarSign}
          color="text-amber-500"
        />
        <StatCard
          title="Active"
          value={analytics.activeAllocations}
          icon={Activity}
          color="text-cyan-500"
        />
        <StatCard
          title="Occupied"
          value={analytics.occupiedSlots}
          icon={Target}
          color="text-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Slot Distribution Pie Chart */}
        <Card className="neu-flat border-0">
          <CardHeader>
            <CardTitle className="text-base font-medium">Slot Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slotDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {slotDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {slotDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Zones Bar Chart */}
        <Card className="neu-flat border-0">
          <CardHeader>
            <CardTitle className="text-base font-medium">Peak Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {peakZonesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakZonesData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={40}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="requests" 
                      radius={[0, 8, 8, 0]}
                    >
                      {peakZonesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No zone data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      {hourlyData.length > 0 && (
        <Card className="neu-flat border-0">
          <CardHeader>
            <CardTitle className="text-base font-medium">Requests by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(h) => `${h}:00`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
}) {
  return (
    <Card className="neu-flat border-0 neu-card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-xl neu-pressed ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
