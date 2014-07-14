
/**
 * Constructor of Building
 * @param type The type of building ("home" or "work")
 * @param loc An object with 'x' and 'y' coordinates
 */
function Building(type, loc) {
	this.type = type;
	this.x = loc.x;
	this.y = loc.y;
	this.fridge = new Fridge();
	this.fridge.capacity = 10;
	this.customer = false; // Is customer of player company?
	this.hoover = false; // is mouse hovering over building?
}

/**
 * Get a random building of given type from g_town_buildings.
 */
function GetRandomBuilding(type) {
	var n = 0;
	var candidates = [];
	for(var i = 0; i < g_town_buildings.length; i++) {
		if (g_town_buildings[i].type == type) {
			n++;
			candidates.push(i);
		}
	}

	var index = Math.floor(Math.random() * n);
	return g_town_buildings[candidates[index]];
}

/**
 * Create buildings and store in g_town_buildings
 */
function GenerateBuildings() {
	g_town_buildings.push(new Building("home", {
		x: 16 + 2 * 32,
		y: 16 + 2 * 32,
	}));
	g_town_buildings.push(new Building("home", {
		x: 16 + 4 * 32,
		y: 16 + 2 * 32,
	}));
	g_town_buildings.push(new Building("home", {
		x: 16 + 6 * 32,
		y: 16 + 2 * 32,
	}));
	g_town_buildings.push(new Building("home", {
		x: 16 + 8 * 32,
		y: 16 + 2 * 32,
	}));
	g_town_buildings.push(new Building("home", {
		x: 16 + 10 * 32,
		y: 16 + 2 * 32,
	}));
	g_town_buildings.push(new Building("work", {
		x: 16 + 5 * 32,
		y: 16 + 10 * 32,
	}));
	g_town_buildings.push(new Building("work", {
		x: 16 + 8 * 32,
		y: 16 + 7 * 32,
	}));
	g_town_buildings.push(new Building("hq", {
		x: 16 + 12 * 32,
		y: 16 + 12 * 32,
	}));
}

/**
 * Update all buildings
 */
function UpdateBuildings(time) {

	for(var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];

		if (!building.customer) {
			// Non-customers have magic fridges that refill themself.
			var last_time = g_simulation_time - time;
			if (Math.floor(time / (60 * 4)) != Math.floor(last_time / (60 * 4))) {
				// New 4 hour period => fill fridge
				FillFridge(building.fridge, building.fridge.capacity);
			}
		}
	}
}

function NewCustomer(building) {
	building.customer = true;
	building.fridge.capacity = 10;
}
