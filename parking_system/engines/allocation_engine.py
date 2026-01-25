from typing import Dict, List, Optional
from datetime import datetime
import uuid

from ..domain.zone import Zone
from ..domain.parking_request import ParkingRequest, ParkingRequestState, ParkingRequestError
from ..domain.parking_slot import ParkingSlot, ParkingSlotError


class AllocationError(Exception):
    pass


class OperationRecord:
    def __init__(
        self,
        operation_type: str,
        request_id: str,
        slot_id: str,
        prev_slot_state: bool,
        prev_request_state: ParkingRequestState,
    ):
        self.operation_id: str = str(uuid.uuid4())
        self.operation_type: str = operation_type
        self.request_id: str = request_id
        self.slot_id: str = slot_id
        self.prev_slot_state: bool = prev_slot_state
        self.prev_request_state: ParkingRequestState = prev_request_state
        self.timestamp: datetime = datetime.utcnow()


class AllocationEngine:
    def __init__(self, zones: Dict[str, Zone]):
        self._zones: Dict[str, Zone] = zones
        self._operations: List[OperationRecord] = []

    # ---------- Allocation ----------
    def allocate(self, request: ParkingRequest) -> None:
        if request.state != ParkingRequestState.VALIDATED:
            raise AllocationError("Request must be VALIDATED to allocate")

        # Step 1: try same-zone allocation
        zone = self._zones.get(request.preferred_zone_id)
        slot = self._find_available_slot(zone) if zone else None

        # Step 2: fallback to other zones
        if not slot:
            for z in self._zones.values():
                if z.zone_id == request.preferred_zone_id:
                    continue
                slot = self._find_available_slot(z)
                if slot:
                    break

        if not slot:
            request.transition_to(ParkingRequestState.FAILED)
            raise AllocationError("No slots available in any zone")

        # Step 3: record previous state
        op = OperationRecord(
            operation_type="ALLOCATE",
            request_id=request.request_id,
            slot_id=slot.slot_id,
            prev_slot_state=slot.is_available,
            prev_request_state=request.state,
        )
        self._operations.append(op)

        # Step 4: perform allocation
        slot.allocate(request.vehicle_id)
        request.transition_to(ParkingRequestState.ALLOCATED)
        request._allocated_zone_id = slot.area_id  # temporary direct binding
        request._allocated_slot_id = slot.slot_id

    def _find_available_slot(self, zone: Zone) -> Optional[ParkingSlot]:
        for area in zone.areas:
            for slot in area.available_slots:
                return slot
        return None

    # ---------- Release ----------
    def release(self, request: ParkingRequest) -> None:
        if request.state not in {ParkingRequestState.ALLOCATED, ParkingRequestState.ACTIVE}:
            raise AllocationError("Request must be ALLOCATED or ACTIVE to release")

        zone = self._zones.get(request.allocated_zone_id)
        if not zone:
            raise AllocationError("Zone not found for allocated request")

        area = zone.get_area(request.allocated_zone_id)
        slot = area.get_slot(request.allocated_slot_id)

        # record previous state
        op = OperationRecord(
            operation_type="RELEASE",
            request_id=request.request_id,
            slot_id=slot.slot_id,
            prev_slot_state=slot.is_available,
            prev_request_state=request.state,
        )
        self._operations.append(op)

        # perform release
        slot.release()
        request.transition_to(ParkingRequestState.COMPLETED)
    def allocate(self, request: ParkingRequest) -> None:
            if request.state != ParkingRequestState.VALIDATED:
                raise AllocationError("Request must be VALIDATED to allocate")

            # Step 1: preferred zone first
            preferred_zone = self._zones.get(request.preferred_zone_id)
            slot = self._find_available_slot(preferred_zone) if preferred_zone else None

            # Step 2: cross-zone fallback with penalty scoring
            if not slot:
                sorted_zones = sorted(
                    (z for z in self._zones.values() if z.zone_id != request.preferred_zone_id),
                    key=lambda z: getattr(z, "penalty", 1),  # default penalty=1
                )
                for z in sorted_zones:
                    slot = self._find_available_slot(z)
                    if slot:
                        break

            # Step 3: no slots anywhere → FAILED
            if not slot:
                request.transition_to(ParkingRequestState.FAILED)
                raise AllocationError("No slots available in any zone")

            # Step 4: record operation
            op = OperationRecord(
                operation_type="ALLOCATE",
                request_id=request.request_id,
                slot_id=slot.slot_id,
                prev_slot_state=slot.is_available,
                prev_request_state=request.state,
            )
            self._operations.append(op)

            # Step 5: perform allocation
            slot.allocate(request.vehicle_id)
            request.transition_to(ParkingRequestState.ALLOCATED)
            request._allocated_zone_id = slot.area_id
            request._allocated_slot_id = slot.slot_id