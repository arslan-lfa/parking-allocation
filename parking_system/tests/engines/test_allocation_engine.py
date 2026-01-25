import pytest
from domain.zone import Zone
from domain.parking_area import ParkingArea
from domain.parking_slot import ParkingSlot
from domain.parking_request import ParkingRequest, ParkingRequestState
from engines.allocation_engine import AllocationEngine, AllocationError


def create_zone_with_areas(zone_id: str, area_counts: list[int]) -> Zone:
    """Helper: zone with multiple areas, each with N slots"""
    areas = []
    for idx, slot_count in enumerate(area_counts):
        slots = [ParkingSlot(f"S{idx}-{i}", f"A{idx}") for i in range(slot_count)]
        areas.append(ParkingArea(f"A{idx}", zone_id, slots))
    return Zone(zone_id, f"Zone {zone_id}", areas)


def test_same_zone_allocation():
    zone = create_zone_with_areas("Z1", [2])
    engine = AllocationEngine({"Z1": zone})
    req = ParkingRequest("R1", "V1", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)

    engine.allocate(req)
    assert req.state == ParkingRequestState.ALLOCATED
    assert req.allocated_slot_id is not None
    assert req.allocated_zone_id is not None
    assert zone.total_available() == 1


def test_cross_zone_fallback():
    z1 = create_zone_with_areas("Z1", [0])  # no available slots
    z2 = create_zone_with_areas("Z2", [1])
    engine = AllocationEngine({"Z1": z1, "Z2": z2})
    req = ParkingRequest("R2", "V2", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)

    engine.allocate(req)
    assert req.state == ParkingRequestState.ALLOCATED
    assert req.allocated_zone_id == "A0" or req.allocated_zone_id is not None
    assert req.allocated_slot_id is not None


def test_allocation_failure_when_full():
    zone = create_zone_with_areas("Z1", [0])
    engine = AllocationEngine({"Z1": zone})
    req = ParkingRequest("R3", "V3", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)

    with pytest.raises(AllocationError):
        engine.allocate(req)
    assert req.state == ParkingRequestState.FAILED


def test_release_success():
    zone = create_zone_with_areas("Z1", [1])
    engine = AllocationEngine({"Z1": zone})
    req = ParkingRequest("R4", "V4", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)
    engine.allocate(req)

    engine.release(req)
    assert req.state == ParkingRequestState.COMPLETED
    assert zone.total_available() == 1


def test_release_wrong_state_fails():
    zone = create_zone_with_areas("Z1", [1])
    engine = AllocationEngine({"Z1": zone})
    req = ParkingRequest("R5", "V5", "Z1")
    req.transition_to(ParkingRequestState.NEW)  # not validated

    with pytest.raises(AllocationError):
        engine.release(req)


def test_operation_record_stack_integrity():
    zone = create_zone_with_areas("Z1", [1])
    engine = AllocationEngine({"Z1": zone})
    req = ParkingRequest("R6", "V6", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)

    engine.allocate(req)
    engine.release(req)

    assert len(engine._operations) == 2
    op_allocate, op_release = engine._operations
    assert op_allocate.operation_type == "ALLOCATE"
    assert op_release.operation_type == "RELEASE"
def test_cross_zone_with_penalty():
    z1 = Zone("Z1", "Zone1", [ParkingArea("A0", "Z1", [])])
    z1.penalty = 10
    z2 = Zone("Z2", "Zone2", [ParkingArea("A1", "Z2", [ParkingSlot("S1", "A1")])])
    z2.penalty = 1

    engine = AllocationEngine({"Z1": z1, "Z2": z2})
    req = ParkingRequest("R7", "V7", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)

    engine.allocate(req)
    # Should pick Z2 (lower penalty)
    assert req.allocated_zone_id == "A1"
    assert req.state == ParkingRequestState.ALLOCATED


def test_allocate_already_allocated_request_fails():
    zone = create_zone_with_areas("Z1", [1])
    engine = AllocationEngine({"Z1": zone})
    req = ParkingRequest("R8", "V8", "Z1")
    req.transition_to(ParkingRequestState.VALIDATED)
    engine.allocate(req)

    with pytest.raises(AllocationError):
        engine.allocate(req)  # Already allocated
