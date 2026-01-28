/**
 * ParkingSystem Class
 * 
 * Main orchestrator for the Smart Parking Allocation System.
 * Encapsulates all core logic without global variables.
 * 
 * Responsibilities:
 * - Zone and slot management
 * - Vehicle registration
 * - Request lifecycle management
 * - Allocation orchestration
 * - Rollback coordination
 * - Analytics computation
 * 
 * This class serves as the single entry point for all parking operations.
 */

import { Zone } from './Zone';
import { Vehicle } from './Vehicle';
import { ParkingRequest } from './ParkingRequest';
import { AllocationEngine, AllocationResult } from './AllocationEngine';
import { RollbackManager, RollbackResult } from './RollbackManager';
import { AnalyticsEngine } from './AnalyticsEngine';
import { 
  IAnalytics, 
  ISystemState, 
  VehicleType,
  RequestStatus,
} from './types';

export interface CreateRequestResult {
  success: boolean;
  request: ParkingRequest | null;
  allocation: AllocationResult | null;
  message: string;
}

export class ParkingSystem {
  private zones: Zone[];
  private vehicles: Map<string, Vehicle>;
  private requests: Map<string, ParkingRequest>;
  private allocationEngine: AllocationEngine;
  private rollbackManager: RollbackManager;
  private analyticsEngine: AnalyticsEngine;
  private initialized: boolean;

  constructor() {
    this.zones = [];
    this.vehicles = new Map();
    this.requests = new Map();
    this.allocationEngine = new AllocationEngine([]);
    this.rollbackManager = new RollbackManager();
    this.analyticsEngine = new AnalyticsEngine();
    this.initialized = false;
  }

  /**
   * Initialize the system with default zones
   */
  public initialize(): void {
    if (this.initialized) return;

    // Create city zones with adjacency relationships
    const zoneConfigs = [
      { name: 'Johar Town', code: 'JT', color: '#8B5CF6', penalty: 1.0 },
      { name: 'Awan Town', code: 'AT', color: '#6366F1', penalty: 1.2 },
      { name: 'UMT', code: 'UMT', color: '#A855F7', penalty: 1.3 },
      { name: 'Gulburg', code: 'GB', color: '#7C3AED', penalty: 1.4 },
      { name: 'Township', code: 'TW', color: '#9333EA', penalty: 1.5 },
    ];

    this.zones = zoneConfigs.map((config, index) => new Zone({
      name: config.name,
      code: config.code,
      color: config.color,
      penaltyMultiplier: config.penalty,
      areaConfigs: [
        { name: `${config.name} - Lot A`, slotCount: 15, location: { x: index * 2, y: 0 } },
        { name: `${config.name} - Lot B`, slotCount: 12, location: { x: index * 2, y: 1 } },
        { name: `${config.name} - Garage`, slotCount: 20, location: { x: index * 2 + 1, y: 0 } },
      ],
    }));

    // Set up adjacency (Downtown ↔ Midtown ↔ Uptown, Eastside ↔ Downtown, Westside ↔ Midtown)
    if (this.zones.length >= 5) {
      const [downtown, midtown, uptown, eastside, westside] = this.zones;
      
      downtown.addAdjacentZone(midtown.id);
      downtown.addAdjacentZone(eastside.id);
      
      midtown.addAdjacentZone(downtown.id);
      midtown.addAdjacentZone(uptown.id);
      midtown.addAdjacentZone(westside.id);
      
      uptown.addAdjacentZone(midtown.id);
      
      eastside.addAdjacentZone(downtown.id);
      
      westside.addAdjacentZone(midtown.id);
    }

    this.allocationEngine.updateZones(this.zones);
    this.initialized = true;
  }

  /**
   * Register a new vehicle
   */
  public registerVehicle(
    licensePlate: string,
    ownerName: string,
    type: VehicleType = VehicleType.CAR
  ): Vehicle | null {
    if (!Vehicle.validateLicensePlate(licensePlate)) {
      return null;
    }

    // Check for duplicate license plate
    for (const v of this.vehicles.values()) {
      if (v.licensePlate === licensePlate.toUpperCase().trim()) {
        return v; // Return existing vehicle
      }
    }

    const vehicle = new Vehicle({ licensePlate, ownerName, type });
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  /**
   * Create a parking request and attempt allocation
   */
  public createRequest(
    vehicleId: string,
    preferredZoneId: string
  ): CreateRequestResult {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      return {
        success: false,
        request: null,
        allocation: null,
        message: 'Vehicle not found',
      };
    }

    const zone = this.zones.find(z => z.id === preferredZoneId);
    if (!zone) {
      return {
        success: false,
        request: null,
        allocation: null,
        message: 'Zone not found',
      };
    }

    const request = new ParkingRequest({ vehicleId, preferredZoneId });
    this.requests.set(request.id, request);

    // Attempt automatic allocation
    const allocation = this.allocationEngine.allocate(request, vehicle);
    
    if (allocation.success && allocation.operation) {
      this.rollbackManager.recordOperation(allocation.operation);
    }

    return {
      success: allocation.success,
      request,
      allocation,
      message: allocation.message,
    };
  }

  /**
   * Mark vehicle as arrived (ALLOCATED → OCCUPIED)
   */
  public occupySlot(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request) return false;

    const operation = this.allocationEngine.occupy(request);
    if (operation) {
      this.rollbackManager.recordOperation(operation);
      return true;
    }
    return false;
  }

  /**
   * Release parking slot (OCCUPIED → RELEASED)
   */
  public releaseSlot(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request) return false;

    const operation = this.allocationEngine.release(request);
    if (operation) {
      this.rollbackManager.recordOperation(operation);
      return true;
    }
    return false;
  }

  /**
   * Cancel a request (REQUESTED/ALLOCATED → CANCELLED)
   */
  public cancelRequest(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request) return false;

    const operation = this.allocationEngine.cancel(request);
    if (operation) {
      this.rollbackManager.recordOperation(operation);
      return true;
    }
    return false;
  }

  /**
   * Rollback last k operations
   */
  public rollback(k: number): RollbackResult {
    return this.rollbackManager.rollback(k, this.zones, this.requests);
  }

  /**
   * Get analytics
   */
  public getAnalytics(): IAnalytics {
    return this.analyticsEngine.computeAnalytics(
      this.zones,
      Array.from(this.requests.values())
    );
  }

  /**
   * Get zone analytics
   */
  public getZoneAnalytics(zoneId: string) {
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return null;
    
    return this.analyticsEngine.getZoneAnalytics(
      zone,
      Array.from(this.requests.values())
    );
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getZones(): Zone[] {
    return this.zones;
  }

  public getZone(zoneId: string): Zone | undefined {
    return this.zones.find(z => z.id === zoneId);
  }

  public getVehicles(): Vehicle[] {
    return Array.from(this.vehicles.values());
  }

  public getVehicle(vehicleId: string): Vehicle | undefined {
    return this.vehicles.get(vehicleId);
  }

  public getRequests(): ParkingRequest[] {
    return Array.from(this.requests.values());
  }

  public getRequest(requestId: string): ParkingRequest | undefined {
    return this.requests.get(requestId);
  }

  public getActiveRequests(): ParkingRequest[] {
    return Array.from(this.requests.values()).filter(
      r => r.status === RequestStatus.ALLOCATED || r.status === RequestStatus.OCCUPIED
    );
  }

  public getPendingRequests(): ParkingRequest[] {
    return Array.from(this.requests.values()).filter(
      r => r.status === RequestStatus.REQUESTED
    );
  }

  public getRecentOperations(count: number = 10) {
    return this.rollbackManager.getRecentOperations(count);
  }

  public getRollbackCount(): number {
    return this.rollbackManager.getOperationCount();
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Export system state
   */
  public exportState(): ISystemState {
    return {
      zones: this.zones.map(z => z.toJSON()),
      vehicles: Array.from(this.vehicles.values()).map(v => v.toJSON()),
      requests: Array.from(this.requests.values()).map(r => r.toJSON()),
      operationHistory: this.rollbackManager.getHistory(),
      lastUpdated: new Date(),
    };
  }

  /**
   * Run test cases
   */
  public runTestCases(): { name: string; passed: boolean; message: string }[] {
    const results: { name: string; passed: boolean; message: string }[] = [];

    // Test 1: Vehicle Registration
    const testVehicle = this.registerVehicle('TEST123', 'Test Driver');
    results.push({
      name: 'Vehicle Registration',
      passed: testVehicle !== null,
      message: testVehicle ? 'Vehicle registered successfully' : 'Failed to register vehicle',
    });

    // Test 2: Request Creation and Allocation
    if (testVehicle && this.zones.length > 0) {
      const result = this.createRequest(testVehicle.id, this.zones[0].id);
      results.push({
        name: 'Request Creation & Allocation',
        passed: result.success,
        message: result.message,
      });

      // Test 3: Occupy Slot
      if (result.request) {
        const occupied = this.occupySlot(result.request.id);
        results.push({
          name: 'Slot Occupation',
          passed: occupied,
          message: occupied ? 'Slot occupied successfully' : 'Failed to occupy slot',
        });

        // Test 4: Release Slot
        const released = this.releaseSlot(result.request.id);
        results.push({
          name: 'Slot Release',
          passed: released,
          message: released ? 'Slot released successfully' : 'Failed to release slot',
        });
      }

      // Test 5: Rollback
      const rollbackResult = this.rollback(2);
      results.push({
        name: 'Rollback Operations',
        passed: rollbackResult.operationsRolledBack > 0,
        message: `Rolled back ${rollbackResult.operationsRolledBack} operations`,
      });
    }

    // Test 6: Analytics
    const analytics = this.getAnalytics();
    results.push({
      name: 'Analytics Computation',
      passed: analytics !== null,
      message: `Total requests: ${analytics.totalRequests}, Utilization: ${analytics.utilizationRate}%`,
    });

    return results;
  }
}

// Create singleton instance
let parkingSystemInstance: ParkingSystem | null = null;

export function getParkingSystem(): ParkingSystem {
  if (!parkingSystemInstance) {
    parkingSystemInstance = new ParkingSystem();
    parkingSystemInstance.initialize();
  }
  return parkingSystemInstance;
}

export function resetParkingSystem(): void {
  parkingSystemInstance = null;
}
