import pytest
from domain.parking_request import ParkingRequest, ParkingRequestState
from domain.parking_slot import ParkingSlot
from domain.parking_area import ParkingArea
from domain.zone import Zone
from engines.allocation_engine import AllocationEngine
from engines.rollback_manager import RollbackManager, RollbackError


def create_test_zone():
    slots = [ParkingSlot("S1", "A1")]
    area = ParkingArea("A1", "Z1", slots)
    zone = Zone("Z1", "Main", [area])
    return zone


def test_simple_allocate_and_rollback():
    zone = create_test_zone()
    engine = AllocationEngine({"Z1": zone})
    request = ParkingRequest("R1", "V1", "Z1")
    request.transition_to(ParkingRequestState.VALIDATED)

    engine.allocate(request)
    assert request.state == ParkingRequestState.ALLOCATED
    assert not zone.is_full() is False  # slot occupied

    rollback = RollbackManager(engine)
    rollback.rollback(1)
    assert request.state == ParkingRequestState.VALIDATED
    assert zone.total_available() == 1


def test_release_and_rollback():
    zone = create_test_zone()
    engine = AllocationEngine({"Z1": zone})
    request = ParkingRequest("R2", "V2", "Z1")
    request.transition_to(ParkingRequestState.VALIDATED)

    engine.allocate(request)
    engine.release(request)
    assert request.state == ParkingRequestState.COMPLETED
    assert zone.total_available() == 1

    rollback = RollbackManager(engine)
    rollback.rollback(1)  # rollback release
    assert request.state == ParkingRequestState.ALLOCATED
    assert zone.total_available() == 0


def test_rollback_more_than_operations_fails():
    zone = create_test_zone()
    engine = AllocationEngine({"Z1": zone})
    rollback = RollbackManager(engine)
    with pytest.raises(RollbackError):
        rollback.rollback(1)
