import uuid
import hashlib
from typing import Dict, Any
from engines.allocation_engine import AllocationEngine, AllocationError
from engines.rollback_manager import RollbackManager
from engines.analytics_engine import AnalyticsEngine
from domain.zone import Zone
from domain.parking_request import ParkingRequest, ParkingRequestState


class ParkingSystemError(Exception):
    pass


class ParkingSystem:
    def __init__(self, zones: Dict[str, Zone]):
        self.zones = zones
        self.requests_registry: Dict[str, ParkingRequest] = {}
        self.allocation_engine = AllocationEngine(zones)
        self.rollback_manager = RollbackManager(self.allocation_engine, self.requests_registry)
        self.analytics_engine = AnalyticsEngine(zones)
        self._request_counter = 0

    def _generate_request_id(self, vehicle_id: str, zone_id: str) -> str:
        """Generate a short 6-character request ID with zone and vehicle info"""
        self._request_counter += 1
        # Create hash from vehicle_id, zone_id, and counter
        combo = f"{zone_id}{vehicle_id}{self._request_counter}"
        hash_obj = hashlib.md5(combo.encode())
        hash_hex = hash_obj.hexdigest()
        # Get first char from zone, first 2 from vehicle, and 3 from hash = 6 chars
        zone_char = zone_id[0].upper() if zone_id else 'Z'
        vehicle_chars = vehicle_id[:2].upper() if vehicle_id else 'VH'
        hash_chars = hash_hex[:3].upper()
        return f"{zone_char}{vehicle_chars}{hash_chars}"

    # ---------- Submit Request ----------
    def submit_request(self, vehicle_id: str, preferred_zone_id: str) -> str:
        request_id = self._generate_request_id(vehicle_id, preferred_zone_id)
        req = ParkingRequest(request_id, vehicle_id, preferred_zone_id)
        req.transition_to(ParkingRequestState.VALIDATED)
        self.requests_registry[request_id] = req

        try:
            self.allocation_engine.allocate(req)
            self.analytics_engine.record_request(req)
        except AllocationError as e:
            self.analytics_engine.record_request(req)
            raise ParkingSystemError(f"Allocation failed: {str(e)}") from e

        return request_id

    # ---------- Release Request ----------
    def release_request(self, request_id: str) -> None:
        req = self.requests_registry.get(request_id)
        if not req:
            raise ParkingSystemError(f"Request {request_id} not found")

        try:
            self.allocation_engine.release(req)
            self.analytics_engine.record_request(req)
        except AllocationError as e:
            raise ParkingSystemError(f"Release failed: {str(e)}") from e

    # ---------- Rollback ----------
    def rollback_last_k_operations(self, k: int) -> None:
        self.rollback_manager.rollback(k)

    # ---------- Analytics ----------
    def get_metrics(self) -> Dict[str, Any]:
        return {
            "average_parking_duration": self.analytics_engine.average_parking_duration(),
            "zone_utilization": self.analytics_engine.zone_utilization(),
            "completed_vs_cancelled": self.analytics_engine.completed_vs_cancelled_ratio(),
            "peak_zones": self.analytics_engine.peak_zones(),
        }
