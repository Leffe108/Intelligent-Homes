/*
 * Fridge 
 * - is a container of ingredients.
 * - a fridge live inside of a building.
 * - people consume food from it.
 */

/**
 * Fridge constructor
 */
function Fridge() {
	this.storage = {};

	// Add keys for all ingredients to storage.
	// Initiate as empty fridge.
	for(var ingredient_name in g_ingredients) {
		if(g_ingredients.hasOwnProperty(ingredient_name)) {
			this.storage[ingredient_name] = 0;
		}
	}
}


/**
 * Fill up fridge to at least minContent of each ingredient.
 */
function FillFridge(fridge, minContent) {
	for(var ingredient_name in fridge.storage) {
		if(fridge.storage.hasOwnProperty(ingredient_name)) {
			fridge.storage[ingredient_name] = Math.max(fridge.storage[ingredient_name], minContent);
		}
	}
}

/**
 * Fill up fridges of all buildings to at least minContent
 * of each ingredient.
 */
function FillAllFridges(minContent) {
	for(var i = 0; i < g_town_buildings.length; i++) {
		FillFridge(g_town_buildings[i].fridge, minContent);
	}
}

/**
 * Make given person eat a meal using food from given
 * fridge. This method reduce the fridge content.
 *
 * @return void
 */
function EatFromFridge(fridge, person) {

	// List ingredients per meal part that are available
	var ingredients = {}
	ingredients[MEAL_PART_1] = [];
	ingredients[MEAL_PART_2] = [];
	ingredients[MEAL_PART_SALAD] = [];

	for(var ingredient_name in fridge.storage) {
		if(fridge.storage.hasOwnProperty(ingredient_name)) {
			if(fridge.storage[ingredient_name] > 0) {
				var part = g_ingredients[ingredient_name].part;
				ingredients[part].push(ingredient_name);
			}
		}
	}

	// TODO: discard ingredients that has been eaten too often recently

	function PickIngredient(part) {
		if (ingredients[part].length == 0) return null;
		var index = Math.floor(Math.random() * ingredients[part].length);
		var ingredient_name = ingredients[part][index];
		fridge.storage[ingredient_name]--; // take from fridge
		// If ingredient has an image, animate it over the person
		if (ingredient_name in g_images) {
			x_offset = 0;
			if (part == MEAL_PART_1) x_offset = -8;
			if (part == MEAL_PART_SALAD) x_offset = 8;
			g_animations.push(new Animation(ingredient_name, person.x + x_offset, person.y));
		}
		return ingredient_name;
	}

	dish = {};
	dish[MEAL_PART_1] = PickIngredient(MEAL_PART_1);
	dish[MEAL_PART_2] = PickIngredient(MEAL_PART_2);
	dish[MEAL_PART_SALAD] = PickIngredient(MEAL_PART_SALAD);

	// TODO: make person less satisfied if the dish is missing out 1-3 of the parts.
	// Especially if all is missing.
}


