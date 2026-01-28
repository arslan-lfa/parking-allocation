import { useState } from 'react';
import { ParkingProvider } from '@/contexts/ParkingContext';
import {
  CreateRequestDialog,
  ParkingGrid,
  RequestsTable,
  AnalyticsDashboard,
  RollbackPanel,
  TestRunner,
  ZoneSelector,
  ZoneStatsCards,
} from '@/components/parking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutGrid,
  ListTodo,
  BarChart3,
  Settings2,
  Car,
  Sparkles,
} from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';

function Dashboard() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('grid');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 neu-flat border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-700 text-primary-foreground">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-800">
                  Smart Parking System
                </h1>
                <p className="text-xs text-muted-foreground">
                  Zone Management & Allocation
                </p>
              </div>
            </div>
            <CreateRequestDialog />
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="container mx-auto px-4 py-6">
        <div className="neu-convex rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 items-start gap-4 justify-between">
            <div>
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-semibold mb-1">
                Smart Parking Allocation DSA Project
              </h2>
              <p className="text-sm text-muted-foreground">
                This system allows an admin to manage zones, allocate parking slots,
                visualize parking availability, execute rollbacks, and analyze usage
                metrics through a modern web interface.
                Developed by: Arslan Nazir & Noor Fatima
              </p>
            </div>
            <div>
              <Player
                autoplay
                loop
                src="/Searching.json.json"
                style={{ height: '130px', width: '330px' }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar - Zone Selector */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                Zones
              </h3>
              <ZoneSelector
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="neu-flat p-1 mb-6">
                <TabsTrigger
                  value="grid"
                  className="data-[state=active]:neu-pressed data-[state=active]:bg-primary/10"
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid Map
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="data-[state=active]:neu-pressed data-[state=active]:bg-primary/10"
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  Requests
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:neu-pressed data-[state=active]:bg-primary/10"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:neu-pressed data-[state=active]:bg-primary/10"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="mt-0">
                <ParkingGrid
                  selectedZoneId={selectedZoneId ?? undefined}
                />
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                <div className="space-y-6">
                  <ZoneStatsCards />
                  <RequestsTable />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="admin" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <RollbackPanel />
                  <TestRunner />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Legend */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="neu-flat rounded-full px-6 py-2 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full slot-available" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full slot-allocated" />
            <span className="text-muted-foreground">Allocated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full slot-occupied" />
            <span className="text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full slot-released" />
            <span className="text-muted-foreground">Released</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Index() {
  return (
    <ParkingProvider>
      <Dashboard />
    </ParkingProvider>
  );
}
