/**
 * Vehicle Class
 * 
 * Represents a vehicle in the parking system.
 * Stores vehicle information for request association.
 * 
 * Time Complexity: All operations O(1)
 * Space Complexity: O(1)
 */

import { IVehicle, VehicleType, generateId } from './types';

export class Vehicle implements IVehicle {
  public readonly id: string;
  public readonly licensePlate: string;
  public readonly type: VehicleType;
  public readonly ownerName: string;
  public readonly registeredAt: Date;

  constructor(params: {
    licensePlate: string;
    type?: VehicleType;
    ownerName: string;
  }) {
    this.id = generateId('veh');
    this.licensePlate = params.licensePlate.toUpperCase().trim();
    this.type = params.type ?? VehicleType.CAR;
    this.ownerName = params.ownerName.trim();
    this.registeredAt = new Date();
  }

  /**
   * Validate license plate format (basic validation)
   */
  public static validateLicensePlate(plate: string): boolean {
    // Allow alphanumeric with optional spaces/dashes, 2-10 characters
    const cleaned = plate.replace(/[\s-]/g, '');
    return /^[A-Za-z0-9]{2,10}$/.test(cleaned);
  }

  /**
   * Get vehicle type display name
   */
  public getTypeDisplayName(): string {
    switch (this.type) {
      case VehicleType.CAR:
        return 'Car';
      case VehicleType.MOTORCYCLE:
        return 'Motorcycle';
      case VehicleType.TRUCK:
        return 'Truck';
      case VehicleType.ELECTRIC:
        return 'Electric Vehicle';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get vehicle icon name for UI
   */
  public getIconName(): string {
    switch (this.type) {
      case VehicleType.CAR:
        return 'car';
      case VehicleType.MOTORCYCLE:
        return 'bike';
      case VehicleType.TRUCK:
        return 'truck';
      case VehicleType.ELECTRIC:
        return 'zap';
      default:
        return 'car';
    }
  }

  /**
   * Serialize to plain object
   */
  public toJSON(): IVehicle {
    return {
      id: this.id,
      licensePlate: this.licensePlate,
      type: this.type,
      ownerName: this.ownerName,
      registeredAt: this.registeredAt,
    };
  }
}
