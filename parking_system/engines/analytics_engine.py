from typing import List, Dict
from datetime import datetime

from domain.parking_request import ParkingRequest, ParkingRequestState
from domain.zone import Zone


class AnalyticsEngine:
    def __init__(self, zones: Dict[str, Zone]):
        self._zones = zones
        self._history: List[ParkingRequest] = []

    def record_request(self, request: ParkingRequest):
        # keep a shallow snapshot
        self._history.append(request)

    def average_parking_duration(self) -> float:
        completed = [
            r for r in self._history if r.state == ParkingRequestState.COMPLETED
        ]
        if not completed:
            return 0.0
        total_duration = 0.0
        for r in completed:
            if r.created_at and r.updated_at:
                total_duration += (r.updated_at - r.created_at).total_seconds()
        return total_duration / len(completed)

    def zone_utilization(self) -> Dict[str, float]:
        utilization = {}
        for zone in self._zones.values():
            total = zone.total_capacity()
            used = total - zone.total_available()
            utilization[zone.zone_id] = used / total if total > 0 else 0.0
        return utilization

    def completed_vs_cancelled_ratio(self) -> Dict[str, int]:
        completed = sum(1 for r in self._history if r.state == ParkingRequestState.COMPLETED)
        cancelled = sum(1 for r in self._history if r.state == ParkingRequestState.CANCELLED)
        return {"completed": completed, "cancelled": cancelled}

    def peak_zones(self) -> List[str]:
        # zones with most allocations (including active + completed)
        usage = {zone.zone_id: 0 for zone in self._zones.values()}
        for r in self._history:
            if r.state in {ParkingRequestState.ALLOCATED, ParkingRequestState.ACTIVE, ParkingRequestState.COMPLETED}:
                if r.allocated_zone_id:  # check if zone_id is not None
                    usage[r.allocated_zone_id] = usage.get(r.allocated_zone_id, 0) + 1
        max_usage = max(usage.values(), default=0)
        return [zone_id for zone_id, u in usage.items() if u == max_usage]
