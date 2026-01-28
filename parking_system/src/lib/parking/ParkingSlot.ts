/**
 * ParkingSlot Class
 * 
 * Represents a single parking slot within a parking area.
 * Handles slot state management and validation.
 * 
 * Time Complexity:
 *   - All operations: O(1)
 * Space Complexity: O(1)
 */

import { 
  IParkingSlot, 
  SlotStatus, 
  VehicleType, 
  generateId 
} from './types';

export class ParkingSlot implements IParkingSlot {
  public readonly id: string;
  public readonly areaId: string;
  public readonly zoneId: string;
  public readonly slotNumber: number;
  public status: SlotStatus;
  public readonly vehicleType: VehicleType;
  public readonly isHandicapped: boolean;
  public readonly isElectricCharging: boolean;
  public currentRequestId: string | null;
  public lastUpdated: Date;

  constructor(params: {
    areaId: string;
    zoneId: string;
    slotNumber: number;
    vehicleType?: VehicleType;
    isHandicapped?: boolean;
    isElectricCharging?: boolean;
  }) {
    this.id = generateId('slot');
    this.areaId = params.areaId;
    this.zoneId = params.zoneId;
    this.slotNumber = params.slotNumber;
    this.status = SlotStatus.AVAILABLE;
    this.vehicleType = params.vehicleType ?? VehicleType.CAR;
    this.isHandicapped = params.isHandicapped ?? false;
    this.isElectricCharging = params.isElectricCharging ?? false;
    this.currentRequestId = null;
    this.lastUpdated = new Date();
  }

  /**
   * Check if slot is available for allocation
   */
  public isAvailable(): boolean {
    return this.status === SlotStatus.AVAILABLE || this.status === SlotStatus.RELEASED;
  }

  /**
   * Check if slot can accommodate a specific vehicle type
   */
  public canAccommodate(vehicleType: VehicleType): boolean {
    // Electric vehicles need charging stations
    if (vehicleType === VehicleType.ELECTRIC && !this.isElectricCharging) {
      return false;
    }
    
    // Trucks need truck-designated slots
    if (vehicleType === VehicleType.TRUCK && this.vehicleType !== VehicleType.TRUCK) {
      return false;
    }
    
    // Motorcycles can fit anywhere
    if (vehicleType === VehicleType.MOTORCYCLE) {
      return true;
    }
    
    // Cars can fit in car or truck slots
    if (vehicleType === VehicleType.CAR) {
      return this.vehicleType === VehicleType.CAR || this.vehicleType === VehicleType.TRUCK;
    }
    
    return this.vehicleType === vehicleType;
  }

  /**
   * Allocate this slot to a request
   */
  public allocate(requestId: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }
    
    this.status = SlotStatus.ALLOCATED;
    this.currentRequestId = requestId;
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Mark slot as occupied
   */
  public occupy(): boolean {
    if (this.status !== SlotStatus.ALLOCATED) {
      return false;
    }
    
    this.status = SlotStatus.OCCUPIED;
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Release the slot
   */
  public release(): boolean {
    if (this.status !== SlotStatus.OCCUPIED) {
      return false;
    }
    
    this.status = SlotStatus.RELEASED;
    this.currentRequestId = null;
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Cancel allocation and restore availability
   */
  public cancelAllocation(): boolean {
    if (this.status !== SlotStatus.ALLOCATED) {
      return false;
    }
    
    this.status = SlotStatus.AVAILABLE;
    this.currentRequestId = null;
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Force restore to a specific state (used by rollback)
   */
  public restoreState(status: SlotStatus, requestId: string | null): void {
    this.status = status;
    this.currentRequestId = requestId;
    this.lastUpdated = new Date();
  }

  /**
   * Get slot display name
   */
  public getDisplayName(): string {
    return `Slot ${this.slotNumber}`;
  }

  /**
   * Serialize to plain object
   */
  public toJSON(): IParkingSlot {
    return {
      id: this.id,
      areaId: this.areaId,
      zoneId: this.zoneId,
      slotNumber: this.slotNumber,
      status: this.status,
      vehicleType: this.vehicleType,
      isHandicapped: this.isHandicapped,
      isElectricCharging: this.isElectricCharging,
      currentRequestId: this.currentRequestId,
      lastUpdated: this.lastUpdated,
    };
  }
}
