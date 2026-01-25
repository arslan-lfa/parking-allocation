class Vehicle:
    def __init__(self, vehicle_id: str, license_plate: str) -> None:
        if not vehicle_id:
            raise ValueError("vehicle_id must be a non-empty string")

        if not license_plate:
            raise ValueError("license_plate must be a non-empty string")

        self._vehicle_id: str = vehicle_id
        self._license_plate: str = license_plate

    @property
    def vehicle_id(self) -> str:
        return self._vehicle_id

    @property
    def license_plate(self) -> str:
        return self._license_plate

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vehicle):
            return False
        return self.vehicle_id == other.vehicle_id

    def __hash__(self) -> int:
        return hash(self.vehicle_id)
