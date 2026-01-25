from enum import Enum
from datetime import datetime, timezone
from typing import Optional


class ParkingRequestError(Exception):
    pass


class ParkingRequestState(str, Enum):
    NEW = "NEW"
    VALIDATED = "VALIDATED"
    ALLOCATING = "ALLOCATING"
    ALLOCATED = "ALLOCATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"


_ALLOWED_TRANSITIONS = {
    ParkingRequestState.NEW: {ParkingRequestState.VALIDATED},
    ParkingRequestState.VALIDATED: {
        ParkingRequestState.ALLOCATING,
        ParkingRequestState.FAILED,
    },
    ParkingRequestState.ALLOCATING: {ParkingRequestState.ALLOCATED},
    ParkingRequestState.ALLOCATED: {
        ParkingRequestState.ACTIVE,
        ParkingRequestState.CANCELLED,
        ParkingRequestState.ROLLED_BACK,
    },
    ParkingRequestState.ACTIVE: {
        ParkingRequestState.COMPLETED,
        ParkingRequestState.ROLLED_BACK,
    },
}


class ParkingRequest:
    def __init__(
        self,
        request_id: str,
        vehicle_id: str,
        preferred_zone_id: str,
    ) -> None:
        if not request_id or not vehicle_id or not preferred_zone_id:
            raise ValueError("request_id, vehicle_id, and preferred_zone_id are required")

        self._request_id: str = request_id
        self._vehicle_id: str = vehicle_id
        self._preferred_zone_id: str = preferred_zone_id

        self._allocated_zone_id: Optional[str] = None
        self._allocated_area_id: Optional[str] = None
        self._allocated_slot_id: Optional[str] = None

        self._state: ParkingRequestState = ParkingRequestState.NEW
        self._created_at: datetime = datetime.now(timezone.utc)
        self._updated_at: datetime = self._created_at

    # ---------- Properties ----------

    @property
    def request_id(self) -> str:
        return self._request_id

    @property
    def vehicle_id(self) -> str:
        return self._vehicle_id

    @property
    def preferred_zone_id(self) -> str:
        return self._preferred_zone_id

    @property
    def allocated_zone_id(self) -> Optional[str]:
        return self._allocated_zone_id

    @property
    def allocated_area_id(self) -> Optional[str]:
        return self._allocated_area_id

    @property
    def allocated_slot_id(self) -> Optional[str]:
        return self._allocated_slot_id

    @property
    def state(self) -> ParkingRequestState:
        return self._state

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    # ---------- State Management ----------

    def transition_to(self, new_state: ParkingRequestState) -> None:
        allowed = _ALLOWED_TRANSITIONS.get(self._state, set())

        if new_state not in allowed:
            raise ParkingRequestError(
                f"Illegal transition: {self._state} → {new_state}"
            )

        self._state = new_state
        self._updated_at = datetime.now(timezone.utc)

    # ---------- Allocation Binding ----------

    def bind_allocation(self, zone_id: str, slot_id: str) -> None:
        if self._state != ParkingRequestState.ALLOCATING:
            raise ParkingRequestError(
                "Allocation can only be bound during ALLOCATING state"
            )

        if not zone_id or not slot_id:
            raise ValueError("zone_id and slot_id are required")

        self._allocated_zone_id = zone_id
        self._allocated_slot_id = slot_id
        self.transition_to(ParkingRequestState.ALLOCATED)
