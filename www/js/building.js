
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
	this.last_missing_count = -1; // -1 when no customer eating has been done yet, otherwise 0-3.
	this.today_missing_count = 0;
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
	for (var y = 2; y <= 4; y+=2) {
		for (var x = 2; x <= 10; x+= 2) {
			g_town_buildings.push(new Building("home", {
				x: 16 + x * 32,
				y: 16 + y * 32,
			}));
		}
	}
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

	// Building income is in company.js
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
			var images = ['customer_good', 'customer_missing1', 'customer_missing2', 'customer_missing3'];
			var image = building.last_missing_count == -1 ? 'customer_star' : images[building.last_missing_count];
			DrawImage(image, building.x, building.y);

			// Draw fridge bars for customers
			var stats = GetFridgeMealPartSums(building.fridge);
			function BarHeight(meal_part) {
				return stats[meal_part];
			}
			function BarTop(meal_part) {
				return building.y + 16 - BarHeight(meal_part);
			}
			var BAR_WIDTH = 4;
			var x = building.x - 16;
			DrawRect('yellow', '', x, BarTop(MEAL_PART_1), BAR_WIDTH, BarHeight(MEAL_PART_1));
			x += BAR_WIDTH;
			DrawRect('#ff9999', '', x, BarTop(MEAL_PART_2), BAR_WIDTH, BarHeight(MEAL_PART_2));
			x += BAR_WIDTH;
			DrawRect('green', '', x, BarTop(MEAL_PART_SALAD), BAR_WIDTH, BarHeight(MEAL_PART_SALAD));
		}
	}
}

function NewCustomer(building) {
	building.customer = true;
	building.fridge.capacity = 10;
	g_animations.push(new Animation("gui_new_customer", building.x, building.y));
}

function AbortCustomer(building) {
	// Take todays fees
	g_bank_balance -= GetBuildingFee(building);

	// Make no longer customer
	building.customer = false;
	building.last_missing_count = -1;
	building.today_missing_count = 0;
}
