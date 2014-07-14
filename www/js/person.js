

function Person() {
	this.home = null;
	this.work = null;
	this.at = null; // "home", "work" or ""
	this.x = null;
	this.y = null;
	this.target_x = null;
	this.target_y = null;
	// when to go to work/home
	this.time_go_to_work = null;
	this.time_go_home = null;
	this.next_meal_of_day = MEAL_BREAKFAST;
}


//Person.prototype.

// Generates people and store them in g_people
function GeneratePeople() {
	g_people = [];

	var num = 10;
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

		person.time_go_to_work = 6 * 60 + Math.floor(Math.random()*8) * 15;
		person.time_go_home = person.time_go_to_work + 6 * 60 + Math.floor(Math.random()*4) * 60;

		g_people.push(person);
		gen++;
	}
}

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
		var speed = 5;
		if (person.target_x != person.x) {
			if (Math.abs(person.x - person.target_x) < speed * time) {
				person.x = person.target_x;
			} else {
				var delta = person.target_x - person.x > 0 ? 1 : -1;
				person.x += delta * speed * time;
			}
		} if (person.target_y != person.y) {
			if (Math.abs(person.y - person.target_y) < speed * time) {
				person.y = person.target_y;
			} else {
				var delta = person.target_y - person.y > 0 ? 1 : -1;
				person.y += delta * speed * time;
			}
		}

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
		switch (person.next_meal_of_day) {
			case MEAL_BREAKFAST:
				if (g_simulation_time >= person.time_go_to_work - 45 && person.at == "home") {
					EatFromFridge(person.home.fridge, person);
					person.next_meal_of_day = MEAL_LUNCH;
				}
				break;
			case MEAL_LUNCH:
				if (g_simulation_time < Math.min(12 * 60, person.time_go_home - 30) && person.at == "work") {
					EatFromFridge(person.work.fridge, person);
					person.next_meal_of_day = MEAL_DINNER;
				}
				break;
			case MEAL_DINNER:
				if (g_simulation_time >= dinner_time && person.at == "home") {
					EatFromFridge(person.home.fridge, person);
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
	}
}
