/*
 * A person live in a home and go to work. It eats three meals a day:
 * 1) Breakfast  at home
 * 2) Lunch      at work
 * 3) Dinner     at home
 */

/**
 * Constructor of Person
 */
function Person() {
	this.home = null;
	this.work = null;
	this.at = null; // "home", "work" or ""
	this.x = null;
	this.y = null;
	this.target_x = null;
	this.target_y = null;
	this.speed = null;
	// when to go to work/home
	this.time_go_to_work = null;
	this.time_go_home = null;
	this.next_meal_of_day = MEAL_BREAKFAST;
}

// Generates people and store them in g_people
function GeneratePeople() {
	g_people = [];

	var num = 35;
	var gen = 0;
	while (gen < num) {
		var person = new Person();
		person.home = GetRandomBuilding("home");
		person.work = GetRandomBuilding("work");

		// person starts at home
		person.x = person.home.x;
		person.y = person.home.y;
		person.target_x = person.x;
		person.target_y = person.y;
		person.at = "home";
		person.speed = 5;

		person.time_go_to_work = 6 * 60 + Math.floor(Math.random()*8) * 15;
		person.time_go_home = person.time_go_to_work + 6 * 60 + Math.floor(Math.random()*4) * 60;

		g_people.push(person);
		gen++;
	}
}

/**
 * Set the target building for given person.
 * @param person The person that should walk
 * @param building The building where the person should go
 */
function SetPersonTargetBuilding(person, building) {
	person.target_x = building.x;
	person.target_y = building.y;
	person.at = ""; // leave current building
}

/**
 * Updates Person objects in g_people 
 * @param time Seconds since last Update
 */
function UpdatePeople(time) {
	for (var i = 0; i < g_people.length; i++) {
		var person = g_people[i];

		if (person.at == "home" &&
			   g_simulation_time >= person.time_go_to_work &&
			   g_simulation_time < person.time_go_home) {
			SetPersonTargetBuilding(person, person.work);
		} else if (person.at == "work" &&
			   g_simulation_time >= person.time_go_home) {
			SetPersonTargetBuilding(person, person.home);
		}

		// Movement
		//
		// During movement person.x and person.y is float, but
		// is then changed back to integer when reaching destination.
		MovementUpdate(person, time);

		// Has just reached the target?
		if (person.target_x == person.x &&
				person.target_y == person.y &&
				person.at == "") {
			if (person.x == person.home.x && person.y == person.home.y) {
				person.at = "home";
			} else if (person.x == person.work.x && person.y == person.work.y) {
				person.at = "work";
			} else {
				throw new Exception("Unknown target location");
			}
		}

		// Time to eat?
		var dinner_time = Math.max(person.time_go_home, 17 + Math.floor(Math.random() * 3) * 60);
		var n_missing = -1;
		switch (person.next_meal_of_day) {
			case MEAL_BREAKFAST:
				if (g_simulation_time >= person.time_go_to_work - 45 && person.at == "home") {
					n_missing = EatFromFridge(person.home.fridge, person);
					person.next_meal_of_day = MEAL_LUNCH;
				}
				break;
			case MEAL_LUNCH:
				if (g_simulation_time < Math.min(12 * 60, person.time_go_home - 30) && person.at == "work") {
					n_missing = EatFromFridge(person.work.fridge, person);
					person.next_meal_of_day = MEAL_DINNER;
				}
				break;
			case MEAL_DINNER:
				if (g_simulation_time >= dinner_time && person.at == "home") {
					n_missing = EatFromFridge(person.home.fridge, person);
					person.next_meal_of_day = MEAL_NONE;
				}
				break;
			case MEAL_NONE:
				// Next day, during night, reset next meal to MEAL_BREAKFAST
				// It is actually safe to do so all way up to the time dinner is eaten.
				if (g_simulation_time < dinner_time) {
					person.next_meal_of_day = MEAL_BREAKFAST;
				}
				break;
		}
		// Update building with last missing meal parts
		if (n_missing != -1) {
			var building = person.at == "home"? person.home : person.work;
			assert(person.at == "home" || person.at == "work");
			building.last_missing_count = n_missing;
			building.today_missing_count += n_missing;
		}

	}
}

/**
 * Draw people
 */
function DrawPeople() {
	for (var i = 0; i < g_people.length; i++) {
		var person = g_people[i];
		if (person.at == "") { // only draw people outdoors
			DrawImage("person", person.x, person.y);
		}
	}
}
