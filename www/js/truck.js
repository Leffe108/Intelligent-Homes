/*
 * Trucks
 */

var BUY_TRUCK_COST = 4000;

function Truck() {
	this.x = null;
	this.y = null;
	this.target_x = null;
	this.target_y = null;
	this.speed = null;
	this.stop_timer = null; // null when not active

	// List of buildings that it service
	// Editable by player
	this.service_buildings = null; 

	// A list of { 'building' => building, 'food' => { food_type => amount } }
	// this give drive orders and amount to deliver at each building
	// If truck is not driving, this one is null.
	this.current_order_list = null;
	this.current_order = null; // index in above array to current order.
}

/**
 * Order class used by current_order_list member of Truck.
 */
function Order() {
	this.building = null;
	this.building_id = null; // id in g_town_buildings
	this.food = null;
}

function TruckInit() {
	g_trucks = [];
	BuyTruck(true); // You get a free truck to start
}

/**
 * @param free Don't take any money for this truck. Defaults to false.
 * @return true if buying succeeded
 */
function BuyTruck(free) {
	if (free == null) free = false;
	if (!free) {
		if (!TryBuy(BUY_TRUCK_COST)) return false;
	}
	var truck = new Truck();
	truck.x = g_hq.x;
	truck.y = g_hq.y;
	truck.target_x = truck.x;
	truck.target_y = truck.y;
	truck.speed = 5;
	g_trucks.push(truck);
	return true;
}

function UpdateTrucks(time) {
	for (var i = 0; i < g_trucks.length; i++) {
		var truck = g_trucks[i];

		MovementUpdate(truck, time);

		if (truck.current_order_list != null) {
			// Reached current order?
			if (truck.x == truck.target_x && truck.y == truck.target_y) {
				if (this.stop_timer == null) {
					this.stop_timer = 0;
				} else if (this.stop_timer < 10.0) {
					this.stop_timer += time;
				} else {
					this.stop_timer = null;

					// Deliver
					var building = truck.current_order_list[truck.current_order].building;
					var delivery = truck.current_order_list[truck.current_order].food;
					for (var ingredient_name in delivery) {
						if (delivery.hasOwnProperty(ingredient_name)) {
							// Deliver ingredient

							// Calc space available in receiving fridge
							var max_unload = 
								Math.max(0, GetFridgeIngredientCapacity(building.fridge, ingredient_name) -
								building.fridge.storage[ingredient_name]);

							var unload = Math.min(max_unload, delivery[ingredient_name]);
							building.fridge.storage[ingredient_name] += unload;

							// For now don't keep track of not unloaded food. Later
							// this could be recorded so it can be sent back to HQ. Or
							// allow extra delivery to buildings later in the tour if
							// an early building didn't use all their food.
						}
					}

					// Next order
					truck.current_order++;

					// Reached end of order list?
					if (truck.current_order >= truck.current_order_list.length) {
						// Go back to HQ
						truck.current_order_list = null;
						truck.target_x = g_hq.x;
						truck.target_y = g_hq.y;
					} else {
						// Go to next building
						var building = truck.current_order_list[truck.current_order].building;
						truck.target_x = building.x;
						truck.target_y = building.y;
					}
				}

			}
		}

	}
}

function DrawTrucks() {
	for (var i = 0; i < g_trucks.length; i++) {
		var truck = g_trucks[i];

		DrawImage('truck', truck.x, truck.y);
	}
}
