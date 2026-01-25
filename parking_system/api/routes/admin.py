from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from ..schemas.request import RollbackSchema
from ..schemas.response import GenericResponse
from parking_system.orchestrator.parking_system import parking_system_instance

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/rollback", methods=["POST"])
def rollback():
    try:
        data = RollbackSchema(**request.json)
        parking_system_instance.rollback_last_k_operations(data.k)
        resp = GenericResponse(status="success", message=f"Rolled back last {data.k} operations", data=None)
        return jsonify(resp.dict()), 200
    except ValidationError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 409


@admin_bp.route("/metrics", methods=["GET"])
def metrics():
    try:
        metrics_data = parking_system_instance.get_metrics()
        resp = GenericResponse(status="success", message="Metrics fetched", data=metrics_data)
        return jsonify(resp.dict()), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
