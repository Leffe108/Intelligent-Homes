
/**
 * Constructor of Building
 * @param type The type of building ("home", "work" or "hq")
 * @param loc An object with 'x' and 'y' coordinates
 * @note There should only be one HQ building.
 */
function Building(type, loc) {
	this.type = type;
	this.x = loc.x;
	this.y = loc.y;
	this.fridge = new Fridge();
	this.fridge.capacity = 10;
	this.customer = false; // Is customer of player company?
	this.past_customer = false; // Has this building been a customer in the past?
	this.new_customer_time = null; // The simulation time when we got this customer.
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
	for (var i = 0; i < g_town_buildings.length; i++) {
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
		for (var x = 2; x <= 12; x+= 2) {
			g_town_buildings.push(new Building("home", {
				x: 16 + x * 32,
				y: 16 + y * 32,
			}));
		}
	}
	var shift_work_left = 16; // avoid high fridge bars of work to run into a house building
	g_town_buildings.push(new Building("work", {
		x: 16 + 5 * 32 - shift_work_left,
		y: 16 + 10 * 32,
	}));
	g_town_buildings.push(new Building("work", {
		x: 16 + 8 * 32 - shift_work_left,
		y: 16 + 7 * 32,
	}));
	g_hq = new Building("hq", {
		x: 16 + 12 * 32,
		y: 16 + 12 * 32,
	});
	g_town_buildings.push(g_hq);

 	// Create a nav overlay for all buildings in the DOM
	for(var i = 0; i < g_town_buildings.length; i++) {
		AddNavOverlayBuilding(g_town_buildings[i]);
	}
}

/**
 * Update all buildings
 */
function UpdateBuildings(time) {

	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];

		if (!building.customer) {
			// Non-customers have magic fridges that refill themself.
			var last_time = g_simulation_time - time;
			if (Math.floor(time / (60 * 4)) != Math.floor(last_time / (60 * 4))) {
				// New 4 hour period => fill fridge
				FillFridge(building.fridge);
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
				return Math.max(0, stats[meal_part]);
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

/**
 * Make given building a new customer of the company.
 * @param building The building that will become customer.
 */
function NewCustomer(building) {
	building.customer = true;
	if (!building.past_customer) {
		building.fridge.capacity = 10; // Let old fridges remain if past customer
	}
	building.new_customer_time = g_simulation_time;
	g_animations.push(new Animation("gui_new_customer", building.x, building.y));
}

/**
 * Abort customer contract with given building. This building will
 * be changed to no longer be a customer of the company.
 * @param building The building that will no longer be a customer.
 */
function AbortCustomer(building) {
	// Take todays fees
	g_bank_balance -= GetBuildingFee(building);
	building.last_missing_count = -1;
	building.today_missing_count = 0;

	// Make no longer customer
	building.customer = false;
	building.past_customer = true;
}
