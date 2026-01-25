import pytest
from domain.parking_area import ParkingArea, ParkingAreaError
from domain.parking_slot import ParkingSlot


def test_parking_area_creation_success():
    slots = [ParkingSlot(f"S{i}", "A1") for i in range(3)]
    area = ParkingArea("A1", "Z1", slots)

    assert area.area_id == "A1"
    assert area.zone_id == "Z1"
    assert area.total_capacity() == 3
    assert area.available_count() == 3


def test_duplicate_slot_ids_fails():
    slot1 = ParkingSlot("S1", "A1")
    slot2 = ParkingSlot("S1", "A1")
    with pytest.raises(ValueError):
        ParkingArea("A1", "Z1", [slot1, slot2])


def test_get_slot_success_and_failure():
    slots = [ParkingSlot(f"S{i}", "A1") for i in range(2)]
    area = ParkingArea("A1", "Z1", slots)

    slot = area.get_slot("S0")
    assert slot.slot_id == "S0"

    with pytest.raises(ParkingAreaError):
        area.get_slot("S999")


def test_available_slots_count():
    slots = [ParkingSlot(f"S{i}", "A1") for i in range(2)]
    area = ParkingArea("A1", "Z1", slots)

    slots[0].allocate("V1")
    available = area.available_slots
    assert len(available) == 1
    assert available[0].slot_id == "S1"

    assert not area.is_full()  # still has one available

    slots[1].allocate("V2")
    assert area.is_full()
