from typing import List, Dict
from ..domain.parking_request import ParkingRequest, ParkingRequestState
from ..domain.parking_slot import ParkingSlot, ParkingSlotError
from .allocation_engine import AllocationEngine, OperationRecord


class RollbackError(Exception):
    pass


class RollbackManager:
    def __init__(self, engine: AllocationEngine, requests_registry: Dict[str, ParkingRequest] = None):
        self._engine = engine
        self._requests_registry = requests_registry or {}

    def set_requests_registry(self, registry: Dict[str, ParkingRequest]) -> None:
        """Set the requests registry after initialization"""
        self._requests_registry = registry

    def rollback(self, k: int) -> None:
        if k <= 0:
            return

        if k > len(self._engine._operations):
            raise RollbackError("Cannot rollback more operations than exist")

        for _ in range(k):
            op = self._engine._operations.pop()  # LIFO
            self._restore_operation(op)

    def _restore_operation(self, op: OperationRecord) -> None:
        # Find the request from registry
        request: ParkingRequest = self._requests_registry.get(op.request_id)
        if not request:
            raise RollbackError(f"Request {op.request_id} not found in registry")
        
        # Find the slot
        slot: ParkingSlot = self._find_slot(op.slot_id)

        if op.operation_type == "ALLOCATE":
            if not slot.is_available:  # only release if allocated
                slot.release()
            request._state = op.prev_request_state
            request._allocated_slot_id = None
            request._allocated_zone_id = None
            request._allocated_area_id = None

        elif op.operation_type == "RELEASE":
            if slot.is_available:  # only allocate if free
                slot.allocate(request.vehicle_id)
            request._state = op.prev_request_state
            request._allocated_slot_id = slot.slot_id
            request._allocated_zone_id = slot.area_id  # This will be fixed with proper area tracking
            request._allocated_area_id = slot.area_id

    def _find_slot(self, slot_id: str) -> ParkingSlot:
        for zone in self._engine._zones.values():
            for area in zone.areas:
                for slot in area.slots:
                    if slot.slot_id == slot_id:
                        return slot
        raise RollbackError(f"Slot {slot_id} not found")
