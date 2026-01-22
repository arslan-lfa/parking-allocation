from core.entities import ParkingArea

class Zone:
    def __init__(self, zone_id, name):
        self.zone_id = zone_id
        self.name = name
        self.areas = []
        self.adjacent_zones = []

    def add_area(self, area_id, slot_count):
        self.areas.append(ParkingArea(area_id, self.zone_id, slot_count))

class CityMap:
    def __init__(self):
        self.zones = []

    def add_zone(self, zone_id, name):
        new_zone = Zone(zone_id, name)
        self.zones.append(new_zone)

    def find_zone(self, zone_id):
        for zone in self.zones:
            if zone.zone_id == zone_id:
                return zone
        return None

    def set_adjacency(self, id1, id2):
        z1 = self.find_zone(id1)
        z2 = self.find_zone(id2)
        if z1 and z2:
            if id2 not in z1.adjacent_zones: z1.adjacent_zones.append(id2)
            if id1 not in z2.adjacent_zones: z2.adjacent_zones.append(id1)