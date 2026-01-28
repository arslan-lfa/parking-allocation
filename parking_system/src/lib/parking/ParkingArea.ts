/**
 * ParkingArea Class
 * 
 * Represents a parking area containing multiple slots.
 * Implements first-available slot allocation strategy within the area.
 * 
 * Time Complexity:
 *   - findAvailableSlot: O(n) where n is number of slots
 *   - getAvailableCount: O(n)
 * Space Complexity: O(n) for slots storage
 */

import { ParkingSlot } from './ParkingSlot';
import { IParkingArea, VehicleType, generateId } from './types';

export class ParkingArea implements IParkingArea {
  public readonly id: string;
  public readonly zoneId: string;
  public readonly name: string;
  public readonly totalSlots: number;
  public readonly slots: ParkingSlot[];
  public readonly location: { x: number; y: number };

  constructor(params: {
    zoneId: string;
    name: string;
    slotCount: number;
    location?: { x: number; y: number };
    slotConfig?: {
      handicappedSlots?: number;
      electricSlots?: number;
      truckSlots?: number;
      motorcycleSlots?: number;
    };
  }) {
    this.id = generateId('area');
    this.zoneId = params.zoneId;
    this.name = params.name;
    this.totalSlots = params.slotCount;
    this.location = params.location ?? { x: 0, y: 0 };
    this.slots = this.initializeSlots(params.slotCount, params.slotConfig);
  }

  /**
   * Initialize slots with various configurations
   */
  private initializeSlots(
    count: number,
    config?: {
      handicappedSlots?: number;
      electricSlots?: number;
      truckSlots?: number;
      motorcycleSlots?: number;
    }
  ): ParkingSlot[] {
    const slots: ParkingSlot[] = [];
    const handicapped = config?.handicappedSlots ?? Math.floor(count * 0.05);
    const electric = config?.electricSlots ?? Math.floor(count * 0.1);
    const truck = config?.truckSlots ?? Math.floor(count * 0.1);
    const motorcycle = config?.motorcycleSlots ?? Math.floor(count * 0.1);

    let slotNumber = 1;

    // Create handicapped slots
    for (let i = 0; i < handicapped && slotNumber <= count; i++, slotNumber++) {
      slots.push(new ParkingSlot({
        areaId: this.id,
        zoneId: this.zoneId,
        slotNumber,
        vehicleType: VehicleType.CAR,
        isHandicapped: true,
      }));
    }

    // Create electric charging slots
    for (let i = 0; i < electric && slotNumber <= count; i++, slotNumber++) {
      slots.push(new ParkingSlot({
        areaId: this.id,
        zoneId: this.zoneId,
        slotNumber,
        vehicleType: VehicleType.ELECTRIC,
        isElectricCharging: true,
      }));
    }

    // Create truck slots
    for (let i = 0; i < truck && slotNumber <= count; i++, slotNumber++) {
      slots.push(new ParkingSlot({
        areaId: this.id,
        zoneId: this.zoneId,
        slotNumber,
        vehicleType: VehicleType.TRUCK,
      }));
    }

    // Create motorcycle slots
    for (let i = 0; i < motorcycle && slotNumber <= count; i++, slotNumber++) {
      slots.push(new ParkingSlot({
        areaId: this.id,
        zoneId: this.zoneId,
        slotNumber,
        vehicleType: VehicleType.MOTORCYCLE,
      }));
    }

    // Create remaining regular car slots
    while (slotNumber <= count) {
      slots.push(new ParkingSlot({
        areaId: this.id,
        zoneId: this.zoneId,
        slotNumber,
        vehicleType: VehicleType.CAR,
      }));
      slotNumber++;
    }

    return slots;
  }

  /**
   * Find first available slot for a vehicle type
   * Implements first-available strategy
   */
  public findAvailableSlot(vehicleType: VehicleType): ParkingSlot | null {
    for (const slot of this.slots) {
      if (slot.isAvailable() && slot.canAccommodate(vehicleType)) {
        return slot;
      }
    }
    return null;
  }

  /**
   * Get count of available slots
   */
  public getAvailableCount(): number {
    return this.slots.filter(slot => slot.isAvailable()).length;
  }

  /**
   * Get count of available slots for a specific vehicle type
   */
  public getAvailableCountByType(vehicleType: VehicleType): number {
    return this.slots.filter(
      slot => slot.isAvailable() && slot.canAccommodate(vehicleType)
    ).length;
  }

  /**
   * Get slot by ID
   */
  public getSlotById(slotId: string): ParkingSlot | undefined {
    return this.slots.find(slot => slot.id === slotId);
  }

  /**
   * Get utilization percentage
   */
  public getUtilization(): number {
    if (this.totalSlots === 0) return 0;
    const occupied = this.slots.filter(
      slot => slot.status !== 'AVAILABLE' && slot.status !== 'RELEASED'
    ).length;
    return (occupied / this.totalSlots) * 100;
  }

  /**
   * Serialize to plain object
   */
  public toJSON(): IParkingArea {
    return {
      id: this.id,
      zoneId: this.zoneId,
      name: this.name,
      totalSlots: this.totalSlots,
      slots: this.slots.map(slot => slot.toJSON()),
      location: this.location,
    };
  }
}
