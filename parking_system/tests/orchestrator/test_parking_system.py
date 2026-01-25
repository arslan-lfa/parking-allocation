import pytest
from domain.parking_area import ParkingArea
from domain.parking_slot import ParkingSlot
from domain.zone import Zone
from orchestrator.parking_system import ParkingSystem, ParkingSystemError

def create_zone():
    slot = ParkingSlot("S1", "A1")
    area = ParkingArea("A1", "Z1", [slot])
    return Zone("Z1", "Main", [area])

def test_submit_and_release_request():
    zone = create_zone()
    system = ParkingSystem({"Z1": zone})

    req_id = system.submit_request("V1", "Z1")
    metrics = system.get_metrics()
    assert metrics["zone_utilization"]["Z1"] == 1.0

    system.release_request(req_id)
    metrics = system.get_metrics()
    assert metrics["zone_utilization"]["Z1"] == 0.0

def test_allocation_failure():
    zone = create_zone()
    system = ParkingSystem({"Z1": zone})

    system.submit_request("V1", "Z1")
    # second request should fail (only one slot)
    with pytest.raises(ParkingSystemError):
        system.submit_request("V2", "Z1")

def test_rollback_integration():
    zone = create_zone()
    system = ParkingSystem({"Z1": zone})

    req_id = system.submit_request("V1", "Z1")
    system.rollback_last_k_operations(1)
    metrics = system.get_metrics()
    assert metrics["zone_utilization"]["Z1"] == 0.0
