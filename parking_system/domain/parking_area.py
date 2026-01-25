from typing import Dict, List
from domain.parking_slot import ParkingSlot, ParkingSlotError


class ParkingAreaError(Exception):
    pass


class ParkingArea:
    def __init__(self, area_id: str, zone_id: str, slots: List[ParkingSlot]) -> None:
        if not area_id or not zone_id:
            raise ValueError("area_id and zone_id must be non-empty strings")

        if not slots:
            raise ValueError("ParkingArea must have at least one slot")

        # Ensure unique slot IDs
        slot_ids = {slot.slot_id for slot in slots}
        if len(slot_ids) != len(slots):
            raise ValueError("Duplicate slot IDs are not allowed in a ParkingArea")

        self._area_id: str = area_id
        self._zone_id: str = zone_id
        self._slots: Dict[str, ParkingSlot] = {slot.slot_id: slot for slot in slots}

    # ---------- Properties ----------
    @property
    def area_id(self) -> str:
        return self._area_id

    @property
    def zone_id(self) -> str:
        return self._zone_id

    @property
    def slots(self) -> List[ParkingSlot]:
        return list(self._slots.values())

    @property
    def available_slots(self) -> List[ParkingSlot]:
        return [slot for slot in self._slots.values() if slot.is_available]

    # ---------- Slot Access ----------
    def get_slot(self, slot_id: str) -> ParkingSlot:
        slot = self._slots.get(slot_id)
        if slot is None:
            raise ParkingAreaError(f"Slot ID '{slot_id}' does not exist in this area")
        return slot

    def is_full(self) -> bool:
        return len(self.available_slots) == 0

    def total_capacity(self) -> int:
        return len(self._slots)

    def available_count(self) -> int:
        return len(self.available_slots)
