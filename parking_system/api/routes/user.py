from flask import Blueprint, request, jsonify, render_template
from pydantic import ValidationError
from ..schemas.request import SubmitRequestSchema, ReleaseRequestSchema
from ..schemas.response import GenericResponse
from orchestrator.parking_system import ParkingSystem, ParkingSystemError

# Will be injected by app.py
parking_system_instance = None

user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.route("/submit_request_page")
def submit_request_page():
    return render_template("user/submit.html")


@user_bp.route("/status_page")
def status_page():
    return render_template("user/status.html")


@user_bp.route("/submit_request", methods=["POST"])
def submit_request():
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 400
        
        data = SubmitRequestSchema(**request.json)
        
        # Validate input
        if not data.vehicle_id or not data.preferred_zone_id:
            return jsonify({"status": "error", "message": "vehicle_id and preferred_zone_id are required"}), 400
        
        req_id = parking_system_instance.submit_request(data.vehicle_id, data.preferred_zone_id)
        resp = GenericResponse(status="success", message="Request submitted", data={"request_id": req_id})
        return jsonify(resp.dict()), 200
    except ValidationError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except ParkingSystemError as e:
        return jsonify({"status": "error", "message": str(e)}), 409
    except Exception as e:
        return jsonify({"status": "error", "message": f"Internal error: {str(e)}"}), 500


@user_bp.route("/status/<request_id>", methods=["GET"])
def get_status(request_id):
    try:
        if not request_id or not request_id.strip():
            return jsonify({"status": "error", "message": "request_id is required"}), 400
        
        req = parking_system_instance.requests_registry.get(request_id)
        if not req:
            return jsonify({"status": "error", "message": "Request not found"}), 404
        
        resp = GenericResponse(
            status="success",
            message="Status retrieved",
            data={
                "request_id": req.request_id,
                "vehicle_id": req.vehicle_id,
                "state": req.state.value,
                "allocated_zone_id": req.allocated_zone_id,
                "allocated_area_id": req.allocated_area_id,
                "allocated_slot_id": req.allocated_slot_id,
                "created_at": req.created_at.isoformat(),
                "updated_at": req.updated_at.isoformat(),
            }
        )
        return jsonify(resp.dict()), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@user_bp.route("/release_request", methods=["POST"])
def release_request():
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 400
        
        data = ReleaseRequestSchema(**request.json)
        
        if not data.request_id:
            return jsonify({"status": "error", "message": "request_id is required"}), 400
        
        parking_system_instance.release_request(data.request_id)
        resp = GenericResponse(status="success", message="Request released", data=None)
        return jsonify(resp.dict()), 200
    except ValidationError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except ParkingSystemError as e:
        return jsonify({"status": "error", "message": str(e)}), 409
    except Exception as e:
        return jsonify({"status": "error", "message": f"Internal error: {str(e)}"}), 500
