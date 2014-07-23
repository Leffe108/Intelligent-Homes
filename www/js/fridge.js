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
	this.capacity = 0;

	// Add keys for all ingredients to storage.
	// Initiate as empty fridge.
	this.storage = new IngredientList(0);
}

function GetFridgeIngredientCapacity(fridge, ingredient_name) {

	var part = g_ingredients[ingredient_name].part;
	var part_capacity = fridge.capacity / 3;
	if ((part - MEAL_PART_1) <= fridge.capacity % 3) part_capacity++;

	var ingredient_count = GetMealPartIngredientCount(part);
	var ingredient_capacity = part_capacity / ingredient_count;
	var ingredient_i = 0;
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			if (g_ingredients[ingredient_name].part == part) {
				ingredient_i++;
			}
		}
	}
	if (ingredient_i <= ingredient_capacity % ingredient_count) ingredient_capacity++;

	return ingredient_capacity;
}

/**
 * Fill up fridge to its capacity.
 */
function FillFridge(fridge, minContent) {
	for (var ingredient_name in fridge.storage) {
		if (fridge.storage.hasOwnProperty(ingredient_name)) {
			fridge.storage[ingredient_name] = GetFridgeIngredientCapacity(fridge, ingredient_name);
		}
	}
}

/**
 * Fill up fridges of all buildings to their capacity
 */
function FillAllFridges(minContent) {
	for (var i = 0; i < g_town_buildings.length; i++) {
		FillFridge(g_town_buildings[i].fridge);
	}
}

/**
 * Make given person eat a meal using food from given
 * fridge. This method reduce the fridge content.
 *
 * @return number of missing meal parts (0 to 3)
 */
function EatFromFridge(fridge, person) {

	// List ingredients per meal part that are available
	var ingredients = {}
	ingredients[MEAL_PART_1] = [];
	ingredients[MEAL_PART_2] = [];
	ingredients[MEAL_PART_SALAD] = [];

	for (var ingredient_name in fridge.storage) {
		if (fridge.storage.hasOwnProperty(ingredient_name)) {
			if (fridge.storage[ingredient_name] > 0) {
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

	var result = 0;
	if (dish[MEAL_PART_1] == null) result++;
	if (dish[MEAL_PART_2] == null) result++;
	if (dish[MEAL_PART_SALAD] == null) result++;

	return result;
}

/**
 * Get amount of food missing in fridge
 * for it to be full.
 */
function GetFridgeIngredientSpace(fridge) {
	var result = new IngredientList(0);
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			result[ingredient_name] = GetFridgeIngredientCapacity(fridge, ingredient_name) - fridge.storage[ingredient_name];
		}
	}
	return result;
}

/**
 * Get total ingredient amount of a meal part in a given fridge.
 */
function GetFridgeMealPartSum(fridge, meal_part) {
	var sum = 0;
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			if (g_ingredients[ingredient_name].part == meal_part) {
				sum += fridge.storage[ingredient_name];
			}
		}
	}
	return sum;
}

/**
 * Get total amount of ingredients of each meal part (MEAL_PART_*).
 * @return an object with MEAL_PART_* enum value as keys.
 */
function GetFridgeMealPartSums(fridge) {
	var result = {};
	result[MEAL_PART_1] = GetFridgeMealPartSum(fridge, MEAL_PART_1);
	result[MEAL_PART_2] = GetFridgeMealPartSum(fridge, MEAL_PART_2);
	result[MEAL_PART_SALAD] = GetFridgeMealPartSum(fridge, MEAL_PART_SALAD);
	return result;
}
