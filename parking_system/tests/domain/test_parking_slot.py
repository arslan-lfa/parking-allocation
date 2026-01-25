import pytest
from domain.parking_slot import ParkingSlot, ParkingSlotError


def test_slot_initial_state():
    slot = ParkingSlot(slot_id="S1", area_id="A1")
    assert slot.is_available is True
    assert slot.current_vehicle_id is None


def test_allocate_slot_success():
    slot = ParkingSlot("S1", "A1")
    slot.allocate("V123")

    assert slot.is_available is False
    assert slot.current_vehicle_id == "V123"


def test_allocate_twice_fails():
    slot = ParkingSlot("S1", "A1")
    slot.allocate("V123")

    with pytest.raises(ParkingSlotError):
        slot.allocate("V999")


def test_release_slot_success():
    slot = ParkingSlot("S1", "A1")
    slot.allocate("V123")
    slot.release()

    assert slot.is_available is True
    assert slot.current_vehicle_id is None


def test_release_when_already_free_fails():
    slot = ParkingSlot("S1", "A1")

    with pytest.raises(ParkingSlotError):
        slot.release()


def test_invalid_constructor_inputs():
    with pytest.raises(ValueError):
        ParkingSlot("", "A1")

    with pytest.raises(ValueError):
        ParkingSlot("S1", "")


def test_invalid_vehicle_id_allocation():
    slot = ParkingSlot("S1", "A1")

    with pytest.raises(ValueError):
        slot.allocate("")
