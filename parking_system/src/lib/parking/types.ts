/**
 * Smart Parking System - Core Type Definitions
 * 
 * This module defines all enums, interfaces, and types used throughout
 * the parking allocation system. These types enforce the strict state
 * machine and data structures required by the specification.
 */

// ============================================================================
// ENUMS - State Machine & Status Definitions
// ============================================================================

/**
 * Request Lifecycle State Machine
 * Valid transitions:
 *   REQUESTED → ALLOCATED → OCCUPIED → RELEASED
 *   REQUESTED → CANCELLED
 *   ALLOCATED → CANCELLED
 */
export enum RequestStatus {
  REQUESTED = 'REQUESTED',
  ALLOCATED = 'ALLOCATED',
  OCCUPIED = 'OCCUPIED',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
}

/**
 * Parking Slot Status
 * Derived from request state and slot availability
 */
export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  OCCUPIED = 'OCCUPIED',
  RELEASED = 'RELEASED', // Previously used, now available
}

/**
 * Vehicle Types for different slot requirements
 */
export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRUCK = 'TRUCK',
  ELECTRIC = 'ELECTRIC',
}

// ============================================================================
// INTERFACES - Core Data Structures
// ============================================================================

/**
 * Represents a single parking slot within a parking area
 */
export interface IParkingSlot {
  id: string;
  areaId: string;
  zoneId: string;
  slotNumber: number;
  status: SlotStatus;
  vehicleType: VehicleType;
  isHandicapped: boolean;
  isElectricCharging: boolean;
  currentRequestId: string | null;
  lastUpdated: Date;
}

/**
 * Represents a parking area containing multiple slots
 */
export interface IParkingArea {
  id: string;
  zoneId: string;
  name: string;
  totalSlots: number;
  slots: IParkingSlot[];
  location: { x: number; y: number };
}

/**
 * Represents a zone in the city containing multiple parking areas
 */
export interface IZone {
  id: string;
  name: string;
  code: string;
  adjacentZoneIds: string[];
  areas: IParkingArea[];
  penaltyMultiplier: number; // For cross-zone allocation
  color: string; // For visualization
}

/**
 * Represents a vehicle requesting parking
 */
export interface IVehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
  ownerName: string;
  registeredAt: Date;
}

/**
 * Represents a parking request with full lifecycle tracking
 */
export interface IParkingRequest {
  id: string;
  vehicleId: string;
  preferredZoneId: string;
  allocatedSlotId: string | null;
  allocatedZoneId: string | null;
  status: RequestStatus;
  penalty: number; // Cross-zone penalty if applicable
  createdAt: Date;
  allocatedAt: Date | null;
  occupiedAt: Date | null;
  releasedAt: Date | null;
  cancelledAt: Date | null;
  duration: number | null; // In minutes, calculated on release
}

/**
 * Operation record for rollback capability
 */
export interface IAllocationOperation {
  id: string;
  requestId: string;
  slotId: string;
  previousSlotStatus: SlotStatus;
  previousRequestStatus: RequestStatus;
  operationType: 'ALLOCATE' | 'OCCUPY' | 'RELEASE' | 'CANCEL';
  timestamp: Date;
}

/**
 * Analytics data structure
 */
export interface IAnalytics {
  totalRequests: number;
  activeAllocations: number;
  occupiedSlots: number;
  averageDuration: number; // Minutes
  utilizationRate: number; // Percentage
  peakZones: { zoneId: string; count: number }[];
  cancellationRatio: number; // Percentage
  crossZoneAllocations: number;
  totalPenalties: number;
  requestsByHour: { hour: number; count: number }[];
  slotStatusDistribution: Record<SlotStatus, number>;
}

/**
 * System state snapshot for persistence/debugging
 */
export interface ISystemState {
  zones: IZone[];
  vehicles: IVehicle[];
  requests: IParkingRequest[];
  operationHistory: IAllocationOperation[];
  lastUpdated: Date;
}

// ============================================================================
// TYPE GUARDS & VALIDATION HELPERS
// ============================================================================

/**
 * Valid state transitions map
 */
export const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.REQUESTED]: [RequestStatus.ALLOCATED, RequestStatus.CANCELLED],
  [RequestStatus.ALLOCATED]: [RequestStatus.OCCUPIED, RequestStatus.CANCELLED],
  [RequestStatus.OCCUPIED]: [RequestStatus.RELEASED],
  [RequestStatus.RELEASED]: [],
  [RequestStatus.CANCELLED]: [],
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: RequestStatus, to: RequestStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Get CSS class for slot status visualization
 */
export function getSlotStatusClass(status: SlotStatus): string {
  switch (status) {
    case SlotStatus.AVAILABLE:
      return 'slot-available';
    case SlotStatus.ALLOCATED:
      return 'slot-allocated';
    case SlotStatus.OCCUPIED:
      return 'slot-occupied';
    case SlotStatus.RELEASED:
      return 'slot-released';
    default:
      return '';
  }
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
