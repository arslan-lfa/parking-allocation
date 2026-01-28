/**
 * Smart Parking Allocation System
 * 
 * Core module exports for the parking management system.
 * All classes, types, and utilities are exposed through this barrel file.
 */

// Core Types
export * from './types';

// Domain Classes
export { ParkingSlot } from './ParkingSlot';
export { ParkingArea } from './ParkingArea';
export { Zone } from './Zone';
export { Vehicle } from './Vehicle';
export { ParkingRequest } from './ParkingRequest';

// Engine Classes
export { AllocationEngine, type AllocationResult } from './AllocationEngine';
export { RollbackManager, type RollbackResult } from './RollbackManager';
export { AnalyticsEngine } from './AnalyticsEngine';

// Main System
export { 
  ParkingSystem, 
  getParkingSystem, 
  resetParkingSystem,
  type CreateRequestResult 
} from './ParkingSystem';
