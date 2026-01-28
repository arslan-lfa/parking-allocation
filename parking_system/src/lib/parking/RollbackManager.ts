/**
 * RollbackManager Class
 * 
 * Manages operation history and provides k-step undo capability.
 * Rollback reverts both slot state and request state atomically.
 * 
 * Time Complexity:
 *   - recordOperation: O(1)
 *   - rollback(k): O(k)
 * Space Complexity: O(n) where n is number of stored operations
 */

import { Zone } from './Zone';
import { ParkingRequest } from './ParkingRequest';
import { IAllocationOperation, SlotStatus, RequestStatus } from './types';

export interface RollbackResult {
  success: boolean;
  operationsRolledBack: number;
  details: string[];
}

export class RollbackManager {
  private operationStack: IAllocationOperation[];
  private maxStackSize: number;

  constructor(maxStackSize: number = 1000) {
    this.operationStack = [];
    this.maxStackSize = maxStackSize;
  }

  /**
   * Record a new operation for potential rollback
   */
  public recordOperation(operation: IAllocationOperation): void {
    this.operationStack.push(operation);

    // Maintain max stack size
    if (this.operationStack.length > this.maxStackSize) {
      this.operationStack.shift();
    }
  }

  /**
   * Get count of operations available for rollback
   */
  public getOperationCount(): number {
    return this.operationStack.length;
  }

  /**
   * Get recent operations (for display)
   */
  public getRecentOperations(count: number = 10): IAllocationOperation[] {
    return this.operationStack.slice(-count).reverse();
  }

  /**
   * Rollback the last k operations
   * Reverts both slot and request states
   */
  public rollback(
    k: number,
    zones: Zone[],
    requests: Map<string, ParkingRequest>
  ): RollbackResult {
    if (k <= 0) {
      return {
        success: false,
        operationsRolledBack: 0,
        details: ['Invalid rollback count: must be > 0'],
      };
    }

    const actualK = Math.min(k, this.operationStack.length);
    if (actualK === 0) {
      return {
        success: false,
        operationsRolledBack: 0,
        details: ['No operations available to rollback'],
      };
    }

    const zoneMap = new Map(zones.map(z => [z.id, z]));
    const details: string[] = [];
    let rolledBack = 0;

    // Process operations in reverse order (LIFO)
    for (let i = 0; i < actualK; i++) {
      const operation = this.operationStack.pop();
      if (!operation) break;

      const result = this.rollbackSingleOperation(operation, zoneMap, requests);
      details.push(result.message);
      
      if (result.success) {
        rolledBack++;
      }
    }

    return {
      success: rolledBack > 0,
      operationsRolledBack: rolledBack,
      details,
    };
  }

  /**
   * Rollback a single operation
   */
  private rollbackSingleOperation(
    operation: IAllocationOperation,
    zones: Map<string, Zone>,
    requests: Map<string, ParkingRequest>
  ): { success: boolean; message: string } {
    const request = requests.get(operation.requestId);
    if (!request) {
      return {
        success: false,
        message: `Request ${operation.requestId} not found`,
      };
    }

    // Find and restore slot state
    if (operation.slotId) {
      for (const zone of zones.values()) {
        const slot = zone.getSlotById(operation.slotId);
        if (slot) {
          // Restore slot to previous state
          const prevRequestId = operation.previousSlotStatus === SlotStatus.AVAILABLE 
            ? null 
            : request.id;
          slot.restoreState(operation.previousSlotStatus, prevRequestId);
          break;
        }
      }
    }

    // Restore request state
    const prevSlotId = operation.previousRequestStatus === RequestStatus.REQUESTED
      ? null
      : request.allocatedSlotId;
    const prevZoneId = operation.previousRequestStatus === RequestStatus.REQUESTED
      ? null
      : request.allocatedZoneId;
    const prevPenalty = operation.previousRequestStatus === RequestStatus.REQUESTED
      ? 0
      : request.penalty;

    request.restoreState(
      operation.previousRequestStatus,
      prevSlotId,
      prevZoneId,
      prevPenalty
    );

    return {
      success: true,
      message: `Rolled back ${operation.operationType} for request ${operation.requestId}`,
    };
  }

  /**
   * Clear all operation history
   */
  public clear(): void {
    this.operationStack = [];
  }

  /**
   * Get operation history for display/export
   */
  public getHistory(): IAllocationOperation[] {
    return [...this.operationStack];
  }
}
