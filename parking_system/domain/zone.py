from typing import Dict, List
from .parking_area import ParkingArea, ParkingAreaError



class ZoneError(Exception):
    pass


class Zone:
    def __init__(self, zone_id: str, name: str, areas: List[ParkingArea]) -> None:
        if not zone_id or not name:
            raise ValueError("zone_id and name must be non-empty strings")

        if not areas:
            raise ValueError("Zone must contain at least one ParkingArea")

        area_ids = {area.area_id for area in areas}
        if len(area_ids) != len(areas):
            raise ValueError("Duplicate area IDs are not allowed in a Zone")

        self._zone_id: str = zone_id
        self._name: str = name
        self._areas: Dict[str, ParkingArea] = {area.area_id: area for area in areas}

    # ---------- Properties ----------
    @property
    def zone_id(self) -> str:
        return self._zone_id

    @property
    def name(self) -> str:
        return self._name

    @property
    def areas(self) -> List[ParkingArea]:
        return list(self._areas.values())

    # ---------- Queries ----------
    def get_area(self, area_id: str) -> ParkingArea:
        area = self._areas.get(area_id)
        if area is None:
            raise ZoneError(f"Area ID '{area_id}' does not exist in this zone")
        return area

    def total_capacity(self) -> int:
        return sum(area.total_capacity() for area in self._areas.values())

    def total_available(self) -> int:
        return sum(area.available_count() for area in self._areas.values())

    def is_full(self) -> bool:
        return all(area.is_full() for area in self._areas.values())
