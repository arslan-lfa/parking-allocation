from flask import Flask
from parking_system.orchestrator.parking_system import ParkingSystem
from parking_system.domain.zone import Zone
from parking_system.domain.parking_area import ParkingArea
from parking_system.domain.parking_slot import ParkingSlot
from parking_system.api.routes.user import user_bp
from parking_system.api.routes.admin import admin_bp
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

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

# ----- Initialize ParkingSystem -----
parking_system_instance = ParkingSystem(zones)

# ----- Flask App -----
app = Flask(__name__)
app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)

@app.route("/")
def index():
    return app.send_static_file("index.html")  # or render_template("index.html")

# ----- Run -----
if __name__ == "__main__":
    app.run(debug=True, port=5000)
