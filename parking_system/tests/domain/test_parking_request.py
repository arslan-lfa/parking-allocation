import pytest
from domain.parking_request import (
    ParkingRequest,
    ParkingRequestState,
    ParkingRequestError,
)


def test_initial_state():
    req = ParkingRequest("R1", "V1", "Z1")
    assert req.state == ParkingRequestState.NEW


def test_valid_state_transitions():
    req = ParkingRequest("R1", "V1", "Z1")

    req.transition_to(ParkingRequestState.VALIDATED)
    req.transition_to(ParkingRequestState.ALLOCATING)
    req.bind_allocation("Z1", "S1")
    req.transition_to(ParkingRequestState.ACTIVE)
    req.transition_to(ParkingRequestState.COMPLETED)

    assert req.state == ParkingRequestState.COMPLETED


def test_illegal_transition_fails():
    req = ParkingRequest("R1", "V1", "Z1")

    with pytest.raises(ParkingRequestError):
        req.transition_to(ParkingRequestState.ALLOCATED)


def test_bind_allocation_wrong_state_fails():
    req = ParkingRequest("R1", "V1", "Z1")

    with pytest.raises(ParkingRequestError):
        req.bind_allocation("Z1", "S1")


def test_cancel_from_allocated():
    req = ParkingRequest("R1", "V1", "Z1")

    req.transition_to(ParkingRequestState.VALIDATED)
    req.transition_to(ParkingRequestState.ALLOCATING)
    req.bind_allocation("Z1", "S1")
    req.transition_to(ParkingRequestState.CANCELLED)

    assert req.state == ParkingRequestState.CANCELLED


def test_rollback_from_active():
    req = ParkingRequest("R1", "V1", "Z1")

    req.transition_to(ParkingRequestState.VALIDATED)
    req.transition_to(ParkingRequestState.ALLOCATING)
    req.bind_allocation("Z1", "S1")
    req.transition_to(ParkingRequestState.ACTIVE)
    req.transition_to(ParkingRequestState.ROLLED_BACK)

    assert req.state == ParkingRequestState.ROLLED_BACK
