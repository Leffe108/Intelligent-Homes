
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
 * How many people live/work in given building?
 */
function GetNumberOfPeopleForBuilding(building) {
	var count = 0;
	for (var i = 0; i < g_people.length; i++) {
		var person = g_people[i];
		if (person.home == building || person.work == building) {
			count++;
		}
	}
	return count;
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
	g_hq = new Building("hq", {
		x: 16 + 12 * 32,
		y: 16 + 12 * 32,
	});
	g_town_buildings.push(g_hq);
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

/**
 * Draw all buildings
 */
function DrawBuildings() {
	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];

		var image_name = null;
		if (building.type == "home") {
			image_name = "house_home";
		} else if (building.type == "work") {
			image_name = "house_work";
		} else if (building.type == "hq") {
			image_name = "house_hq";
		} else {
			throw new Exception("Bad house type");
		}
		DrawImage(image_name, building.x, building.y);
		if (building.customer) {
			DrawImage('customer_star', building.x, building.y);
		}
	}
}

function NewCustomer(building) {
	building.customer = true;
	building.fridge.capacity = 10;
	g_animations.push(new Animation("gui_new_customer", building.x, building.y));
}
