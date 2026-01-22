class ParkingSlot:
    def __init__(self, slot_id, zone_id):
        self.slot_id = slot_id
        self.zone_id = zone_id
        self.is_available = True

class ParkingArea:
    def __init__(self, area_id, zone_id, slot_count):
        self.area_id = area_id
        self.zone_id = zone_id
        self.slots = [ParkingSlot(f"{area_id}-{i}", zone_id) for i in range(1, slot_count + 1)]

    def get_available_count(self):
        return sum(1 for slot in self.slots if slot.is_available)