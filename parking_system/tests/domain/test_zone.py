import pytest
from domain.zone import Zone, ZoneError
from domain.parking_area import ParkingArea
from domain.parking_slot import ParkingSlot


def create_sample_area(area_id: str, num_slots: int) -> ParkingArea:
    slots = [ParkingSlot(f"S{i}", area_id) for i in range(num_slots)]
    return ParkingArea(area_id, "Z1", slots)


def test_zone_creation_success():
    area1 = create_sample_area("A1", 2)
    area2 = create_sample_area("A2", 3)
    zone = Zone("Z1", "Main Zone", [area1, area2])

    assert zone.zone_id == "Z1"
    assert zone.name == "Main Zone"
    assert zone.total_capacity() == 5
    assert zone.total_available() == 5
    assert not zone.is_full()


def test_duplicate_area_ids_fails():
    area1 = create_sample_area("A1", 2)
    area2 = create_sample_area("A1", 3)
    with pytest.raises(ValueError):
        Zone("Z1", "Main Zone", [area1, area2])


def test_get_area_success_and_failure():
    area1 = create_sample_area("A1", 2)
    area2 = create_sample_area("A2", 3)
    zone = Zone("Z1", "Main Zone", [area1, area2])

    assert zone.get_area("A1").area_id == "A1"
    with pytest.raises(ZoneError):
        zone.get_area("A999")


def test_total_available_and_is_full():
    area1 = create_sample_area("A1", 2)
    area2 = create_sample_area("A2", 2)
    zone = Zone("Z1", "Main Zone", [area1, area2])

    # Allocate all slots
    for area in zone.areas:
        for slot in area.slots:
            slot.allocate(f"V-{slot.slot_id}")

    assert zone.total_available() == 0
    assert zone.is_full()
