from flask import Flask, send_from_directory, render_template
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parking_system.orchestrator.parking_system import ParkingSystem
from parking_system.domain.zone import Zone
from parking_system.domain.parking_area import ParkingArea
from parking_system.domain.parking_slot import ParkingSlot
from parking_system.api.routes.user import user_bp
from parking_system.api.routes.admin import admin_bp, admin_api_bp

# ----- Sample Zones Setup -----
# Zone Z1 with 2 areas, each with 3 slots
slots_a1 = [ParkingSlot(f"S{i}", "A1") for i in range(1, 4)]
slots_a2 = [ParkingSlot(f"S{i}", "A2") for i in range(4, 7)]
area1 = ParkingArea("A1", "Z1", slots_a1)
area2 = ParkingArea("A2", "Z1", slots_a2)
zone1 = Zone("Z1", "Downtown", [area1, area2])

# Zone Z2 with 1 area, 2 slots
slots_b1 = [ParkingSlot(f"S{i}", "B1") for i in range(1, 3)]
area3 = ParkingArea("B1", "Z2", slots_b1)
zone2 = Zone("Z2", "Airport", [area3])

zones = {
    "Z1": zone1,
    "Z2": zone2
}

# ----- Flask App -----
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'), 
            static_url_path='/static',
            template_folder=os.path.join(os.path.dirname(__file__), 'templates'))

# ----- Initialize ParkingSystem -----
parking_system_instance = ParkingSystem(zones)

# Inject parking_system_instance into route modules
import parking_system.api.routes.user as user_module
import parking_system.api.routes.admin as admin_module
user_module.parking_system_instance = parking_system_instance
admin_module.parking_system_instance = parking_system_instance

app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(admin_api_bp)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/status", methods=["GET"])
def status():
    return {"status": "ok", "message": "Parking system is running"}

# ----- Run -----
if __name__ == "__main__":
    app.run(debug=True, port=5000)