/**
 * Zone Class
 * 
 * Represents a city zone containing multiple parking areas.
 * Manages zone-level slot allocation and adjacency relationships.
 * 
 * Time Complexity:
 *   - findAvailableSlot: O(a * s) where a = areas, s = slots per area
 *   - getTotalAvailable: O(a * s)
 * Space Complexity: O(a * s)
 */

import { ParkingArea } from './ParkingArea';
import { ParkingSlot } from './ParkingSlot';
import { IZone, VehicleType, generateId } from './types';

export class Zone implements IZone {
  public readonly id: string;
  public readonly name: string;
  public readonly code: string;
  public adjacentZoneIds: string[];
  public readonly areas: ParkingArea[];
  public readonly penaltyMultiplier: number;
  public readonly color: string;

  constructor(params: {
    name: string;
    code: string;
    adjacentZoneIds?: string[];
    penaltyMultiplier?: number;
    color?: string;
    areaConfigs?: Array<{
      name: string;
      slotCount: number;
      location?: { x: number; y: number };
    }>;
  }) {
    this.id = generateId('zone');
    this.name = params.name;
    this.code = params.code;
    this.adjacentZoneIds = params.adjacentZoneIds ?? [];
    this.penaltyMultiplier = params.penaltyMultiplier ?? 1.5;
    this.color = params.color ?? '#8B5CF6';
    this.areas = this.initializeAreas(params.areaConfigs);
  }

  /**
   * Initialize parking areas in this zone
   */
  private initializeAreas(
    configs?: Array<{
      name: string;
      slotCount: number;
      location?: { x: number; y: number };
    }>
  ): ParkingArea[] {
    if (!configs || configs.length === 0) {
      // Default: create 2 areas with 20 slots each
      return [
        new ParkingArea({
          zoneId: this.id,
          name: `${this.name} - Area A`,
          slotCount: 20,
          location: { x: 0, y: 0 },
        }),
        new ParkingArea({
          zoneId: this.id,
          name: `${this.name} - Area B`,
          slotCount: 20,
          location: { x: 1, y: 0 },
        }),
      ];
    }

    return configs.map(config => new ParkingArea({
      zoneId: this.id,
      name: config.name,
      slotCount: config.slotCount,
      location: config.location,
    }));
  }

  /**
   * Add an adjacent zone ID
   */
  public addAdjacentZone(zoneId: string): void {
    if (!this.adjacentZoneIds.includes(zoneId)) {
      this.adjacentZoneIds.push(zoneId);
    }
  }

  /**
   * Check if a zone is adjacent
   */
  public isAdjacentTo(zoneId: string): boolean {
    return this.adjacentZoneIds.includes(zoneId);
  }

  /**
   * Find first available slot in this zone for a vehicle type
   * Searches areas in order (first-available strategy)
   */
  public findAvailableSlot(vehicleType: VehicleType): ParkingSlot | null {
    for (const area of this.areas) {
      const slot = area.findAvailableSlot(vehicleType);
      if (slot) {
        return slot;
      }
    }
    return null;
  }

  /**
   * Get total available slots in this zone
   */
  public getTotalAvailable(): number {
    return this.areas.reduce((sum, area) => sum + area.getAvailableCount(), 0);
  }

  /**
   * Get total slots in this zone
   */
  public getTotalSlots(): number {
    return this.areas.reduce((sum, area) => sum + area.totalSlots, 0);
  }

  /**
   * Get utilization percentage for this zone
   */
  public getUtilization(): number {
    const total = this.getTotalSlots();
    if (total === 0) return 0;
    const available = this.getTotalAvailable();
    return ((total - available) / total) * 100;
  }

  /**
   * Get area by ID
   */
  public getAreaById(areaId: string): ParkingArea | undefined {
    return this.areas.find(area => area.id === areaId);
  }

  /**
   * Get slot by ID (searches all areas)
   */
  public getSlotById(slotId: string): ParkingSlot | undefined {
    for (const area of this.areas) {
      const slot = area.getSlotById(slotId);
      if (slot) return slot;
    }
    return undefined;
  }

  /**
   * Get all slots in this zone
   */
  public getAllSlots(): ParkingSlot[] {
    return this.areas.flatMap(area => area.slots);
  }

  /**
   * Serialize to plain object
   */
  public toJSON(): IZone {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      adjacentZoneIds: this.adjacentZoneIds,
      areas: this.areas.map(area => area.toJSON()),
      penaltyMultiplier: this.penaltyMultiplier,
      color: this.color,
    };
  }
}
