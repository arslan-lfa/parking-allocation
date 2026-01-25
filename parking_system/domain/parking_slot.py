from typing import Optional


class ParkingSlotError(Exception):
    pass


class ParkingSlot:
    def __init__(self, slot_id: str, area_id: str) -> None:
        if not slot_id or not area_id:
            raise ValueError("slot_id and area_id must be non-empty strings")

        self._slot_id: str = slot_id
        self._area_id: str = area_id
        self._is_available: bool = True
        self._current_vehicle_id: Optional[str] = None

    @property
    def slot_id(self) -> str:
        return self._slot_id

    @property
    def area_id(self) -> str:
        return self._area_id

    @property
    def is_available(self) -> bool:
        return self._is_available

    @property
    def current_vehicle_id(self) -> Optional[str]:
        return self._current_vehicle_id

    def allocate(self, vehicle_id: str) -> None:
        if not vehicle_id:
            raise ValueError("vehicle_id must be a non-empty string")

        if not self._is_available:
            raise ParkingSlotError("Parking slot is already occupied")

        self._is_available = False
        self._current_vehicle_id = vehicle_id

    def release(self) -> None:
        if self._is_available:
            raise ParkingSlotError("Parking slot is already available")

        self._is_available = True
        self._current_vehicle_id = None
