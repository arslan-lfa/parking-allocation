/**
 * AnalyticsEngine Class
 * 
 * Computes parking system metrics and statistics.
 * Analytics remain correct even after rollback operations.
 * 
 * Metrics:
 * - Average parking duration
 * - Slot utilization rate
 * - Peak zones by usage
 * - Cancellation ratio
 * - Cross-zone allocation count
 * - Request distribution by hour
 * 
 * Time Complexity:
 *   - computeAnalytics: O(r + z*a*s) where r=requests, z=zones, a=areas, s=slots
 * Space Complexity: O(z + h) for zone counts and hourly distribution
 */

import { Zone } from './Zone';
import { ParkingRequest } from './ParkingRequest';
import { IAnalytics, RequestStatus, SlotStatus } from './types';

export class AnalyticsEngine {
  /**
   * Compute comprehensive analytics from current system state
   */
  public computeAnalytics(
    zones: Zone[],
    requests: ParkingRequest[]
  ): IAnalytics {
    const totalRequests = requests.length;
    
    // Count by status
    const statusCounts = this.countByStatus(requests);
    const activeAllocations = statusCounts[RequestStatus.ALLOCATED] ?? 0;
    const occupiedSlots = statusCounts[RequestStatus.OCCUPIED] ?? 0;
    
    // Calculate average duration (from released requests only)
    const averageDuration = this.calculateAverageDuration(requests);
    
    // Calculate overall utilization
    const utilizationRate = this.calculateUtilization(zones);
    
    // Find peak zones
    const peakZones = this.findPeakZones(requests);
    
    // Calculate cancellation ratio
    const cancellationRatio = this.calculateCancellationRatio(requests);
    
    // Count cross-zone allocations
    const crossZoneAllocations = this.countCrossZoneAllocations(requests);
    
    // Sum total penalties
    const totalPenalties = this.sumPenalties(requests);
    
    // Distribution by hour
    const requestsByHour = this.getRequestsByHour(requests);
    
    // Slot status distribution
    const slotStatusDistribution = this.getSlotStatusDistribution(zones);

    return {
      totalRequests,
      activeAllocations,
      occupiedSlots,
      averageDuration,
      utilizationRate,
      peakZones,
      cancellationRatio,
      crossZoneAllocations,
      totalPenalties,
      requestsByHour,
      slotStatusDistribution,
    };
  }

  /**
   * Count requests by status
   */
  private countByStatus(requests: ParkingRequest[]): Record<RequestStatus, number> {
    const counts: Record<RequestStatus, number> = {
      [RequestStatus.REQUESTED]: 0,
      [RequestStatus.ALLOCATED]: 0,
      [RequestStatus.OCCUPIED]: 0,
      [RequestStatus.RELEASED]: 0,
      [RequestStatus.CANCELLED]: 0,
    };

    for (const req of requests) {
      counts[req.status]++;
    }

    return counts;
  }

  /**
   * Calculate average parking duration from completed requests
   */
  private calculateAverageDuration(requests: ParkingRequest[]): number {
    const completed = requests.filter(
      r => r.status === RequestStatus.RELEASED && r.duration !== null
    );

    if (completed.length === 0) return 0;

    const totalDuration = completed.reduce(
      (sum, r) => sum + (r.duration ?? 0),
      0
    );

    return Math.round(totalDuration / completed.length);
  }

  /**
   * Calculate overall slot utilization rate
   */
  private calculateUtilization(zones: Zone[]): number {
    let totalSlots = 0;
    let usedSlots = 0;

    for (const zone of zones) {
      for (const area of zone.areas) {
        for (const slot of area.slots) {
          totalSlots++;
          if (slot.status === SlotStatus.ALLOCATED || 
              slot.status === SlotStatus.OCCUPIED) {
            usedSlots++;
          }
        }
      }
    }

    if (totalSlots === 0) return 0;
    return Math.round((usedSlots / totalSlots) * 100);
  }

  /**
   * Find zones with most allocations
   */
  private findPeakZones(
    requests: ParkingRequest[]
  ): { zoneId: string; count: number }[] {
    const zoneCounts = new Map<string, number>();

    for (const req of requests) {
      if (req.allocatedZoneId) {
        const count = zoneCounts.get(req.allocatedZoneId) ?? 0;
        zoneCounts.set(req.allocatedZoneId, count + 1);
      }
    }

    return Array.from(zoneCounts.entries())
      .map(([zoneId, count]) => ({ zoneId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Calculate cancellation ratio
   */
  private calculateCancellationRatio(requests: ParkingRequest[]): number {
    if (requests.length === 0) return 0;

    const cancelled = requests.filter(
      r => r.status === RequestStatus.CANCELLED
    ).length;

    return Math.round((cancelled / requests.length) * 100);
  }

  /**
   * Count cross-zone allocations
   */
  private countCrossZoneAllocations(requests: ParkingRequest[]): number {
    return requests.filter(r => r.isCrossZone()).length;
  }

  /**
   * Sum all penalties
   */
  private sumPenalties(requests: ParkingRequest[]): number {
    return requests.reduce((sum, r) => sum + r.penalty, 0);
  }

  /**
   * Get request distribution by hour
   */
  private getRequestsByHour(
    requests: ParkingRequest[]
  ): { hour: number; count: number }[] {
    const hourCounts = new Array(24).fill(0);

    for (const req of requests) {
      const hour = req.createdAt.getHours();
      hourCounts[hour]++;
    }

    return hourCounts.map((count, hour) => ({ hour, count }));
  }

  /**
   * Get slot status distribution across all zones
   */
  private getSlotStatusDistribution(zones: Zone[]): Record<SlotStatus, number> {
    const distribution: Record<SlotStatus, number> = {
      [SlotStatus.AVAILABLE]: 0,
      [SlotStatus.ALLOCATED]: 0,
      [SlotStatus.OCCUPIED]: 0,
      [SlotStatus.RELEASED]: 0,
    };

    for (const zone of zones) {
      for (const area of zone.areas) {
        for (const slot of area.slots) {
          distribution[slot.status]++;
        }
      }
    }

    return distribution;
  }

  /**
   * Get zone-specific analytics
   */
  public getZoneAnalytics(
    zone: Zone,
    requests: ParkingRequest[]
  ): {
    totalSlots: number;
    available: number;
    allocated: number;
    occupied: number;
    utilization: number;
    totalRequests: number;
  } {
    const zoneRequests = requests.filter(r => r.allocatedZoneId === zone.id);
    
    let available = 0;
    let allocated = 0;
    let occupied = 0;

    for (const area of zone.areas) {
      for (const slot of area.slots) {
        switch (slot.status) {
          case SlotStatus.AVAILABLE:
          case SlotStatus.RELEASED:
            available++;
            break;
          case SlotStatus.ALLOCATED:
            allocated++;
            break;
          case SlotStatus.OCCUPIED:
            occupied++;
            break;
        }
      }
    }

    const totalSlots = zone.getTotalSlots();
    const utilization = totalSlots > 0 
      ? Math.round(((allocated + occupied) / totalSlots) * 100)
      : 0;

    return {
      totalSlots,
      available,
      allocated,
      occupied,
      utilization,
      totalRequests: zoneRequests.length,
    };
  }
}
