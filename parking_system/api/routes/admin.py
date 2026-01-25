from flask import Blueprint, request, jsonify, render_template
from pydantic import ValidationError
from ..schemas.request import RollbackSchema
from ..schemas.response import GenericResponse

# Will be injected by app.py
parking_system_instance = None

# Routes for rendering pages
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# Routes for API endpoints
admin_api_bp = Blueprint("admin_api", __name__, url_prefix="/api/admin")


@admin_bp.route("/dashboard")
def dashboard():
    zones = parking_system_instance.zones
    return render_template("admin/dashboard.html", zones=zones.values())


@admin_bp.route("/analytics")
def analytics():
    return render_template("admin/analytics.html")


@admin_bp.route("/system")
def system():
    return render_template("admin/rollback.html")


# ----- API Endpoints -----

@admin_api_bp.route("/rollback", methods=["POST"])
def rollback():
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 400
        
        data = RollbackSchema(**request.json)
        
        if data.k <= 0:
            return jsonify({"status": "error", "message": "k must be a positive integer"}), 400
        
        parking_system_instance.rollback_last_k_operations(data.k)
        resp = GenericResponse(status="success", message=f"Rolled back last {data.k} operations", data=None)
        return jsonify(resp.dict()), 200
    except ValidationError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 409


@admin_api_bp.route("/zones", methods=["GET"])
def zones():
    try:
        zones_data = []
        for zone_id, zone in parking_system_instance.zones.items():
            total_slots = sum(len(area.slots) for area in zone.areas)
            occupied_slots = sum(len([s for s in area.slots if s.is_occupied]) for area in zone.areas)
            zones_data.append({
                "zone_id": zone_id,
                "zone_name": zone.zone_name,
                "total_slots": total_slots,
                "occupied_slots": occupied_slots,
                "available_slots": total_slots - occupied_slots
            })
        resp = GenericResponse(status="success", message="Zones fetched", data=zones_data)
        return jsonify(resp.dict()), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to fetch zones: {str(e)}"}), 500


@admin_api_bp.route("/metrics", methods=["GET"])
def metrics():
    try:
        metrics_data = parking_system_instance.get_metrics()
        resp = GenericResponse(status="success", message="Metrics fetched", data=metrics_data)
        return jsonify(resp.dict()), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to fetch metrics: {str(e)}"}), 500


@admin_api_bp.route("/recent_operations", methods=["GET"])
def recent_operations():
    try:
        # Get the rollback history from operations_registry
        ops_list = []
        
        # Try to get operations from the parking system's operations registry
        if hasattr(parking_system_instance, 'operations_registry'):
            ops_list = list(parking_system_instance.operations_registry.values())[-10:]
        
        # Format operations
        formatted_ops = []
        for op in ops_list:
            formatted_ops.append({
                "id": str(getattr(op, 'id', 'unknown')),
                "type": getattr(op, 'type', 'unknown'),
                "description": getattr(op, 'description', 'Operation'),
                "timestamp": getattr(op, 'timestamp', '')
            })
        
        resp = GenericResponse(status="success", message="Recent operations fetched", data=formatted_ops)
        return jsonify(resp.dict()), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to fetch operations: {str(e)}"}), 500

