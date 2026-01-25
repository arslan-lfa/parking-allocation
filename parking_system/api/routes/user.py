from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from ..schemas.request import SubmitRequestSchema, ReleaseRequestSchema
from ..schemas.response import GenericResponse
from parking_system.orchestrator.parking_system import ParkingSystem, ParkingSystemError
from flask import Blueprint


user_bp = Blueprint("user", __name__, url_prefix="/api/user")
    def register_routes(app, parking_system_instance):
        @user_bp.route("/submit", methods=["POST"])
            def submit_request():
                from parking_system.app import parking_system_instance  # injected later
                return {"status": "ok"}
# assuming a global ParkingSystem instance



@user_bp.route("/submit_request", methods=["POST"])
def submit_request():
    try:
        data = SubmitRequestSchema(**request.json)
        req_id = parking_system_instance.submit_request(data.vehicle_id, data.preferred_zone_id)
        resp = GenericResponse(status="success", message="Request submitted", data={"request_id": req_id})
        return jsonify(resp.dict()), 200
    except ValidationError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except ParkingSystemError as e:
        return jsonify({"status": "error", "message": str(e)}), 409


@user_bp.route("/release_request", methods=["POST"])
def release_request():
    try:
        data = ReleaseRequestSchema(**request.json)
        parking_system_instance.release_request(data.request_id)
        resp = GenericResponse(status="success", message="Request released", data=None)
        return jsonify(resp.dict()), 200
    except ValidationError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except ParkingSystemError as e:
        return jsonify({"status": "error", "message": str(e)}), 409
