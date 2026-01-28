import { useState } from 'react';
import { useParkingSystem } from '@/contexts/ParkingContext';
import { VehicleType } from '@/lib/parking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Car, Bike, Truck, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function CreateRequestDialog() {
  const { zones, vehicles, registerVehicle, createRequest } = useParkingSystem();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'vehicle' | 'request'>('vehicle');
  
  // Vehicle form
  const [licensePlate, setLicensePlate] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CAR);
  
  // Request form
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const handleRegisterVehicle = () => {
    if (!licensePlate.trim() || !ownerName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const vehicle = registerVehicle(licensePlate, ownerName, vehicleType);
    if (vehicle) {
      toast.success(`Vehicle ${vehicle.licensePlate} registered`);
      setSelectedVehicleId(vehicle.id);
      setStep('request');
    } else {
      toast.error('Invalid license plate format');
    }
  };

  const handleCreateRequest = () => {
    if (!selectedVehicleId || !selectedZoneId) {
      toast.error('Please select vehicle and zone');
      return;
    }

    const result = createRequest(selectedVehicleId, selectedZoneId);
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      resetForm();
    } else {
      toast.error(result.message);
    }
  };

  const resetForm = () => {
    setStep('vehicle');
    setLicensePlate('');
    setOwnerName('');
    setVehicleType(VehicleType.CAR);
    setSelectedVehicleId('');
    setSelectedZoneId('');
  };

  const vehicleTypeOptions = [
    { value: VehicleType.CAR, label: 'Car', icon: Car },
    { value: VehicleType.MOTORCYCLE, label: 'Motorcycle', icon: Bike },
    { value: VehicleType.TRUCK, label: 'Truck', icon: Truck },
    { value: VehicleType.ELECTRIC, label: 'Electric', icon: Zap },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="neu-button gap-2 text-black">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="neu-flat sm:max-w-md ">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">
            {step === 'vehicle' ? 'Register Vehicle' : 'Create Parking Request'}
          </DialogTitle>
          <DialogDescription>
            {step === 'vehicle' 
              ? 'Enter vehicle details to register a new vehicle'
              : 'Select a zone to request parking allocation'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'vehicle' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                placeholder="ABC 1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="neu-pressed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                placeholder="John Doe"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="neu-pressed"
              />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {vehicleTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = vehicleType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVehicleType(option.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'neu-button hover:scale-105'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {vehicles.length > 0 && (
              <div className="pt-4 border-t border-border">
                <Label>Or select existing vehicle</Label>
                <Select 
                  value={selectedVehicleId} 
                  onValueChange={(v) => { setSelectedVehicleId(v); setStep('request'); }}
                >
                  <SelectTrigger className="neu-pressed mt-2">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.licensePlate} - {v.ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selected Vehicle</Label>
              <div className="neu-pressed p-3 rounded-lg">
                {vehicles.find(v => v.id === selectedVehicleId)?.licensePlate || 'Unknown'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Zone</Label>
              <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                <SelectTrigger className="neu-pressed">
                  <SelectValue placeholder="Select preferred zone" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: zone.color }}
                        />
                        {zone.name} ({zone.getTotalAvailable()} available)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 'request' && (
            <Button variant="outline" onClick={() => setStep('vehicle')}>
              Back
            </Button>
          )}
          <Button
            onClick={step === 'vehicle' ? handleRegisterVehicle : handleCreateRequest}
            className="bg-primary hover:bg-primary/90"
          >
            {step === 'vehicle' ? 'Next' : 'Create Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
