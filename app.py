from flask import Flask, render_template
from core.zone_manager import CityMap

app = Flask(__name__)

city = CityMap()

def initialize_city():
    city.add_zone("Z1", "North Sector")
    city.add_zone("Z2", "South Sector")
    city.add_zone("Z3", "Central Hub")
    
    z1 = city.find_zone("Z1")
    if z1: z1.add_area("A1", 5)
    
    z2 = city.find_zone("Z2")
    if z2: z2.add_area("A2", 3)
    
    z3 = city.find_zone("Z3")
    if z3: z3.add_area("A3", 10)
    
    city.set_adjacency("Z1", "Z3")
    city.set_adjacency("Z2", "Z3")

initialize_city()

@app.route('/')
def dashboard():
    display_data = []
    for zone in city.zones:
        total = sum(len(area.slots) for area in zone.areas)
        avail = sum(area.get_available_count() for area in zone.areas)
        display_data.append({
            "id": zone.zone_id,
            "name": zone.name,
            "total": total,
            "available": avail,
            "neighbors": ", ".join(zone.adjacent_zones)
        })
    return render_template('dashboard.html', zones=display_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)