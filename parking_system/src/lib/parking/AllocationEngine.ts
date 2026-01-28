/**
 * AllocationEngine Class
 * 
 * Core allocation logic with same-zone priority and cross-zone fallback.
 * 
 * Allocation Algorithm:
 * 1. Try to find available slot in preferred zone (same-zone priority)
 * 2. If not found, search adjacent zones first (lower penalty)
 * 3. If still not found, search remaining zones (higher penalty)
 * 4. Return allocation result with slot and penalty information
 * 
 * Time Complexity:
 *   - allocate: O(z * a * s) where z = zones, a = areas, s = slots
 * Space Complexity: O(1) additional
 */

import { Zone } from './Zone';
import { ParkingSlot } from './ParkingSlot';
import { ParkingRequest } from './ParkingRequest';
import { Vehicle } from './Vehicle';
import { 
  IAllocationOperation, 
  RequestStatus, 
  SlotStatus,
  generateId 
} from './types';

export interface AllocationResult {
  success: boolean;
  slot: ParkingSlot | null;
  zone: Zone | null;
  penalty: number;
  message: string;
  operation: IAllocationOperation | null;
}

export class AllocationEngine {
  private zones: Map<string, Zone>;
  private basePenalty: number;

  constructor(zones: Zone[], basePenalty: number = 10) {
    this.zones = new Map(zones.map(zone => [zone.id, zone]));
    this.basePenalty = basePenalty;
  }

  /**
   * Update zones reference
   */
  public updateZones(zones: Zone[]): void {
    this.zones = new Map(zones.map(zone => [zone.id, zone]));
  }

  /**
   * Main allocation method
   * Implements same-zone priority with cross-zone fallback
   */
  public allocate(
    request: ParkingRequest,
    vehicle: Vehicle
  ): AllocationResult {
    // Validate request is in REQUESTED state
    if (request.status !== RequestStatus.REQUESTED) {
      return {
        success: false,
        slot: null,
        zone: null,
        penalty: 0,
        message: `Cannot allocate: request is in ${request.status} state`,
        operation: null,
      };
    }

    const preferredZone = this.zones.get(request.preferredZoneId);
    if (!preferredZone) {
      return {
        success: false,
        slot: null,
        zone: null,
        penalty: 0,
        message: `Preferred zone ${request.preferredZoneId} not found`,
        operation: null,
      };
    }

    // Step 1: Try preferred zone first (same-zone priority)
    let slot = preferredZone.findAvailableSlot(vehicle.type);
    if (slot) {
      return this.completeAllocation(request, slot, preferredZone, 0);
    }

    // Step 2: Try adjacent zones (lower penalty)
    for (const adjZoneId of preferredZone.adjacentZoneIds) {
      const adjZone = this.zones.get(adjZoneId);
      if (adjZone) {
        slot = adjZone.findAvailableSlot(vehicle.type);
        if (slot) {
          const penalty = this.basePenalty * adjZone.penaltyMultiplier;
          return this.completeAllocation(request, slot, adjZone, penalty);
        }
      }
    }

    // Step 3: Try all other zones (highest penalty)
    for (const [zoneId, zone] of this.zones) {
      if (zoneId === request.preferredZoneId) continue;
      if (preferredZone.adjacentZoneIds.includes(zoneId)) continue;

      slot = zone.findAvailableSlot(vehicle.type);
      if (slot) {
        const penalty = this.basePenalty * zone.penaltyMultiplier * 2;
        return this.completeAllocation(request, slot, zone, penalty);
      }
    }

    // No slot available anywhere
    return {
      success: false,
      slot: null,
      zone: null,
      penalty: 0,
      message: 'No available slots in any zone',
      operation: null,
    };
  }

  /**
   * Complete the allocation by updating slot and request states
   */
  private completeAllocation(
    request: ParkingRequest,
    slot: ParkingSlot,
    zone: Zone,
    penalty: number
  ): AllocationResult {
    // Save previous states for rollback
    const prevSlotStatus = slot.status;
    const prevRequestStatus = request.status;

    // Update slot state
    if (!slot.allocate(request.id)) {
      return {
        success: false,
        slot: null,
        zone: null,
        penalty: 0,
        message: 'Failed to allocate slot',
        operation: null,
      };
    }

    // Update request state
    if (!request.allocate(slot.id, zone.id, penalty)) {
      // Rollback slot on request failure
      slot.restoreState(prevSlotStatus, null);
      return {
        success: false,
        slot: null,
        zone: null,
        penalty: 0,
        message: 'Failed to update request state',
        operation: null,
      };
    }

    // Create operation record
    const operation: IAllocationOperation = {
      id: generateId('op'),
      requestId: request.id,
      slotId: slot.id,
      previousSlotStatus: prevSlotStatus,
      previousRequestStatus: prevRequestStatus,
      operationType: 'ALLOCATE',
      timestamp: new Date(),
    };

    const isCrossZone = request.isCrossZone();
    const message = isCrossZone
      ? `Allocated to ${zone.name} (cross-zone, penalty: ${penalty})`
      : `Allocated to ${zone.name}`;

    return {
      success: true,
      slot,
      zone,
      penalty,
      message,
      operation,
    };
  }

  /**
   * Mark a request as occupied (vehicle arrived)
   */
  public occupy(request: ParkingRequest): IAllocationOperation | null {
    if (request.status !== RequestStatus.ALLOCATED || !request.allocatedSlotId) {
      return null;
    }

    const slot = this.findSlotById(request.allocatedSlotId);
    if (!slot) return null;

    const prevSlotStatus = slot.status;
    const prevRequestStatus = request.status;

    if (!slot.occupy() || !request.occupy()) {
      return null;
    }

    return {
      id: generateId('op'),
      requestId: request.id,
      slotId: slot.id,
      previousSlotStatus: prevSlotStatus,
      previousRequestStatus: prevRequestStatus,
      operationType: 'OCCUPY',
      timestamp: new Date(),
    };
  }

  /**
   * Release a parking slot (vehicle departed)
   */
  public release(request: ParkingRequest): IAllocationOperation | null {
    if (request.status !== RequestStatus.OCCUPIED || !request.allocatedSlotId) {
      return null;
    }

    const slot = this.findSlotById(request.allocatedSlotId);
    if (!slot) return null;

    const prevSlotStatus = slot.status;
    const prevRequestStatus = request.status;

    if (!slot.release() || !request.release()) {
      return null;
    }

    return {
      id: generateId('op'),
      requestId: request.id,
      slotId: slot.id,
      previousSlotStatus: prevSlotStatus,
      previousRequestStatus: prevRequestStatus,
      operationType: 'RELEASE',
      timestamp: new Date(),
    };
  }

  /**
   * Cancel a request (from REQUESTED or ALLOCATED state)
   */
  public cancel(request: ParkingRequest): IAllocationOperation | null {
    if (!request.canTransitionTo(RequestStatus.CANCELLED)) {
      return null;
    }

    const slotId = request.allocatedSlotId;
    let slot: ParkingSlot | undefined;
    let prevSlotStatus = SlotStatus.AVAILABLE;

    if (slotId) {
      slot = this.findSlotById(slotId);
      if (slot) {
        prevSlotStatus = slot.status;
        slot.cancelAllocation();
      }
    }

    const prevRequestStatus = request.status;
    request.cancel();

    return {
      id: generateId('op'),
      requestId: request.id,
      slotId: slotId ?? '',
      previousSlotStatus: prevSlotStatus,
      previousRequestStatus: prevRequestStatus,
      operationType: 'CANCEL',
      timestamp: new Date(),
    };
  }

  /**
   * Find slot by ID across all zones
   */
  private findSlotById(slotId: string): ParkingSlot | undefined {
    for (const zone of this.zones.values()) {
      const slot = zone.getSlotById(slotId);
      if (slot) return slot;
    }
    return undefined;
  }

  /**
   * Get zone by ID
   */
  public getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  /**
   * Get all zones
   */
  public getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }
}
