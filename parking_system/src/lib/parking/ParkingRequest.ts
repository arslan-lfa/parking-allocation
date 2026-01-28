/**
 * ParkingRequest Class
 * 
 * Represents a parking request with full lifecycle tracking.
 * Enforces the state machine:
 *   REQUESTED → ALLOCATED → OCCUPIED → RELEASED
 *   REQUESTED → CANCELLED
 *   ALLOCATED → CANCELLED
 * 
 * Invalid transitions are blocked with explicit validation.
 * 
 * Time Complexity: All operations O(1)
 * Space Complexity: O(1)
 */

import { 
  IParkingRequest, 
  RequestStatus, 
  isValidTransition,
  generateId 
} from './types';

export class ParkingRequest implements IParkingRequest {
  public readonly id: string;
  public readonly vehicleId: string;
  public readonly preferredZoneId: string;
  public allocatedSlotId: string | null;
  public allocatedZoneId: string | null;
  public status: RequestStatus;
  public penalty: number;
  public readonly createdAt: Date;
  public allocatedAt: Date | null;
  public occupiedAt: Date | null;
  public releasedAt: Date | null;
  public cancelledAt: Date | null;
  public duration: number | null;

  constructor(params: {
    vehicleId: string;
    preferredZoneId: string;
  }) {
    this.id = generateId('req');
    this.vehicleId = params.vehicleId;
    this.preferredZoneId = params.preferredZoneId;
    this.allocatedSlotId = null;
    this.allocatedZoneId = null;
    this.status = RequestStatus.REQUESTED;
    this.penalty = 0;
    this.createdAt = new Date();
    this.allocatedAt = null;
    this.occupiedAt = null;
    this.releasedAt = null;
    this.cancelledAt = null;
    this.duration = null;
  }

  /**
   * Transition to ALLOCATED state
   * Valid from: REQUESTED
   */
  public allocate(slotId: string, zoneId: string, penalty: number = 0): boolean {
    if (!this.canTransitionTo(RequestStatus.ALLOCATED)) {
      console.error(
        `Invalid transition: Cannot allocate request in ${this.status} state`
      );
      return false;
    }

    this.status = RequestStatus.ALLOCATED;
    this.allocatedSlotId = slotId;
    this.allocatedZoneId = zoneId;
    this.penalty = penalty;
    this.allocatedAt = new Date();
    return true;
  }

  /**
   * Transition to OCCUPIED state
   * Valid from: ALLOCATED
   */
  public occupy(): boolean {
    if (!this.canTransitionTo(RequestStatus.OCCUPIED)) {
      console.error(
        `Invalid transition: Cannot occupy request in ${this.status} state`
      );
      return false;
    }

    this.status = RequestStatus.OCCUPIED;
    this.occupiedAt = new Date();
    return true;
  }

  /**
   * Transition to RELEASED state
   * Valid from: OCCUPIED
   */
  public release(): boolean {
    if (!this.canTransitionTo(RequestStatus.RELEASED)) {
      console.error(
        `Invalid transition: Cannot release request in ${this.status} state`
      );
      return false;
    }

    this.status = RequestStatus.RELEASED;
    this.releasedAt = new Date();
    
    // Calculate duration in minutes
    if (this.occupiedAt) {
      this.duration = Math.round(
        (this.releasedAt.getTime() - this.occupiedAt.getTime()) / 60000
      );
    }
    
    return true;
  }

  /**
   * Transition to CANCELLED state
   * Valid from: REQUESTED, ALLOCATED
   */
  public cancel(): boolean {
    if (!this.canTransitionTo(RequestStatus.CANCELLED)) {
      console.error(
        `Invalid transition: Cannot cancel request in ${this.status} state`
      );
      return false;
    }

    this.status = RequestStatus.CANCELLED;
    this.cancelledAt = new Date();
    return true;
  }

  /**
   * Check if transition to a target state is valid
   */
  public canTransitionTo(targetStatus: RequestStatus): boolean {
    return isValidTransition(this.status, targetStatus);
  }

  /**
   * Check if this is a cross-zone allocation
   */
  public isCrossZone(): boolean {
    return this.allocatedZoneId !== null && 
           this.allocatedZoneId !== this.preferredZoneId;
  }

  /**
   * Restore request state (used by rollback)
   */
  public restoreState(
    status: RequestStatus,
    slotId: string | null,
    zoneId: string | null,
    penalty: number
  ): void {
    this.status = status;
    this.allocatedSlotId = slotId;
    this.allocatedZoneId = zoneId;
    this.penalty = penalty;
    
    // Reset timestamps based on status
    if (status === RequestStatus.REQUESTED) {
      this.allocatedAt = null;
      this.occupiedAt = null;
      this.releasedAt = null;
      this.cancelledAt = null;
    }
  }

  /**
   * Get human-readable status
   */
  public getStatusDisplayName(): string {
    switch (this.status) {
      case RequestStatus.REQUESTED:
        return 'Pending';
      case RequestStatus.ALLOCATED:
        return 'Allocated';
      case RequestStatus.OCCUPIED:
        return 'In Use';
      case RequestStatus.RELEASED:
        return 'Completed';
      case RequestStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get status color class
   */
  public getStatusColorClass(): string {
    switch (this.status) {
      case RequestStatus.REQUESTED:
        return 'text-blue-600';
      case RequestStatus.ALLOCATED:
        return 'text-yellow-600';
      case RequestStatus.OCCUPIED:
        return 'text-red-600';
      case RequestStatus.RELEASED:
        return 'text-gray-600';
      case RequestStatus.CANCELLED:
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Serialize to plain object
   */
  public toJSON(): IParkingRequest {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      preferredZoneId: this.preferredZoneId,
      allocatedSlotId: this.allocatedSlotId,
      allocatedZoneId: this.allocatedZoneId,
      status: this.status,
      penalty: this.penalty,
      createdAt: this.createdAt,
      allocatedAt: this.allocatedAt,
      occupiedAt: this.occupiedAt,
      releasedAt: this.releasedAt,
      cancelledAt: this.cancelledAt,
      duration: this.duration,
    };
  }
}
