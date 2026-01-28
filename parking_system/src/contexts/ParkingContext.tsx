import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  getParkingSystem, 
  ParkingSystem,
  Zone,
  Vehicle,
  ParkingRequest,
  IAnalytics,
  VehicleType,
  CreateRequestResult,
  RollbackResult,
  IAllocationOperation,
} from '@/lib/parking';

interface ParkingContextType {
  system: ParkingSystem;
  zones: Zone[];
  vehicles: Vehicle[];
  requests: ParkingRequest[];
  analytics: IAnalytics | null;
  recentOperations: IAllocationOperation[];
  rollbackCount: number;
  
  // Actions
  registerVehicle: (licensePlate: string, ownerName: string, type?: VehicleType) => Vehicle | null;
  createRequest: (vehicleId: string, zoneId: string) => CreateRequestResult;
  occupySlot: (requestId: string) => boolean;
  releaseSlot: (requestId: string) => boolean;
  cancelRequest: (requestId: string) => boolean;
  rollback: (k: number) => RollbackResult;
  runTests: () => { name: string; passed: boolean; message: string }[];
  refreshData: () => void;
}

const ParkingContext = createContext<ParkingContextType | null>(null);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [system] = useState(() => getParkingSystem());
  const [zones, setZones] = useState<Zone[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<ParkingRequest[]>([]);
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null);
  const [recentOperations, setRecentOperations] = useState<IAllocationOperation[]>([]);
  const [rollbackCount, setRollbackCount] = useState(0);

  const refreshData = useCallback(() => {
    setZones([...system.getZones()]);
    setVehicles([...system.getVehicles()]);
    setRequests([...system.getRequests()]);
    setAnalytics(system.getAnalytics());
    setRecentOperations(system.getRecentOperations());
    setRollbackCount(system.getRollbackCount());
  }, [system]);

  useEffect(() => {
    if (!system.isInitialized()) {
      system.initialize();
    }
    refreshData();
  }, [system, refreshData]);

  const registerVehicle = useCallback((
    licensePlate: string, 
    ownerName: string, 
    type: VehicleType = VehicleType.CAR
  ) => {
    const vehicle = system.registerVehicle(licensePlate, ownerName, type);
    refreshData();
    return vehicle;
  }, [system, refreshData]);

  const createRequest = useCallback((vehicleId: string, zoneId: string) => {
    const result = system.createRequest(vehicleId, zoneId);
    refreshData();
    return result;
  }, [system, refreshData]);

  const occupySlot = useCallback((requestId: string) => {
    const result = system.occupySlot(requestId);
    refreshData();
    return result;
  }, [system, refreshData]);

  const releaseSlot = useCallback((requestId: string) => {
    const result = system.releaseSlot(requestId);
    refreshData();
    return result;
  }, [system, refreshData]);

  const cancelRequest = useCallback((requestId: string) => {
    const result = system.cancelRequest(requestId);
    refreshData();
    return result;
  }, [system, refreshData]);

  const rollback = useCallback((k: number) => {
    const result = system.rollback(k);
    refreshData();
    return result;
  }, [system, refreshData]);

  const runTests = useCallback(() => {
    const results = system.runTestCases();
    refreshData();
    return results;
  }, [system, refreshData]);

  return (
    <ParkingContext.Provider value={{
      system,
      zones,
      vehicles,
      requests,
      analytics,
      recentOperations,
      rollbackCount,
      registerVehicle,
      createRequest,
      occupySlot,
      releaseSlot,
      cancelRequest,
      rollback,
      runTests,
      refreshData,
    }}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParkingSystem() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParkingSystem must be used within a ParkingProvider');
  }
  return context;
}
