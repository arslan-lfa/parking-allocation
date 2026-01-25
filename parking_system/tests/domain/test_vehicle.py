import pytest
from domain.vehicle import Vehicle


def test_vehicle_creation_success():
    vehicle = Vehicle(vehicle_id="V1", license_plate="ABC-123")
    assert vehicle.vehicle_id == "V1"
    assert vehicle.license_plate == "ABC-123"


def test_vehicle_invalid_inputs():
    with pytest.raises(ValueError):
        Vehicle("", "ABC-123")

    with pytest.raises(ValueError):
        Vehicle("V1", "")


def test_vehicle_equality_by_id():
    v1 = Vehicle("V1", "ABC-123")
    v2 = Vehicle("V1", "XYZ-999")
    v3 = Vehicle("V2", "ABC-123")

    assert v1 == v2
    assert v1 != v3


def test_vehicle_hashing():
    v1 = Vehicle("V1", "ABC-123")
    v2 = Vehicle("V1", "XYZ-999")

    vehicle_set = {v1, v2}
    assert len(vehicle_set) == 1
