import pytest
from datetime import datetime, timedelta
from domain.parking_request import ParkingRequest, ParkingRequestState
from domain.parking_area import ParkingArea
from domain.parking_slot import ParkingSlot
from domain.zone import Zone
from engines.analytics_engine import AnalyticsEngine


def create_zone_with_one_slot(zone_id: str) -> Zone:
    slot = ParkingSlot("S1", "A1")
    area = ParkingArea("A1", zone_id, [slot])
    return Zone(zone_id, f"Zone {zone_id}", [area])


def test_average_parking_duration():
    zone = create_zone_with_one_slot("Z1")
    analytics = AnalyticsEngine({"Z1": zone})

    req = ParkingRequest("R1", "V1", "Z1")
    req.transition_to(ParkingRequestState.COMPLETED)
    req._created_at = datetime.utcnow() - timedelta(minutes=30)
    req._updated_at = datetime.utcnow()
    analytics.record_request(req)

    avg = analytics.average_parking_duration()
    assert 1790 <= avg <= 1810  # approx 30 minutes in seconds


def test_zone_utilization():
    zone = create_zone_with_one_slot("Z1")
    analytics = AnalyticsEngine({"Z1": zone})
    slot = zone.areas[0].slots[0]

    # simulate allocation
    slot.allocate("V1")
    util = analytics.zone_utilization()
    assert util["Z1"] == 1.0

    # release
    slot.release()
    util = analytics.zone_utilization()
    assert util["Z1"] == 0.0


def test_completed_vs_cancelled_ratio():
    zone = create_zone_with_one_slot("Z1")
    analytics = AnalyticsEngine({"Z1": zone})

    r1 = ParkingRequest("R1", "V1", "Z1")
    r1.transition_to(ParkingRequestState.COMPLETED)
    r2 = ParkingRequest("R2", "V2", "Z1")
    r2.transition_to(ParkingRequestState.CANCELLED)

    analytics.record_request(r1)
    analytics.record_request(r2)

    ratio = analytics.completed_vs_cancelled_ratio()
    assert ratio["completed"] == 1
    assert ratio["cancelled"] == 1


def test_peak_zones():
    z1 = create_zone_with_one_slot("Z1")
    z2 = create_zone_with_one_slot("Z2")
    analytics = AnalyticsEngine({"Z1": z1, "Z2": z2})

    r1 = ParkingRequest("R1", "V1", "Z1")
    r1._allocated_zone_id = "Z1"
    r1.transition_to(ParkingRequestState.COMPLETED)
    r2 = ParkingRequest("R2", "V2", "Z2")
    r2._allocated_zone_id = "Z2"
    r2.transition_to(ParkingRequestState.COMPLETED)
    r3 = ParkingRequest("R3", "V3", "Z2")
    r3._allocated_zone_id = "Z2"
    r3.transition_to(ParkingRequestState.COMPLETED)

    analytics.record_request(r1)
    analytics.record_request(r2)
    analytics.record_request(r3)

    peaks = analytics.peak_zones()
    assert peaks == ["Z2"]
