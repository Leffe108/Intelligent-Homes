
// The meals of a day:
var MEAL_BREAKFAST = 1;
var MEAL_LUNCH = 2;
var MEAL_DINNER = 3;
var MEAL_NONE = 4; // Has eaten all meals during the day

// A meal in composed of one ingredient from
// each of these 3 categories:
var MEAL_PART_1 = 1; // pasta, rice, potato
var MEAL_PART_2 = 2; // meat, fish etc.
var MEAL_PART_SALAD = 3; // salad

/**
 * Constructor for Ingredient
 * @param name The name of the Ingredient
 * @param part One of MEAL_PART_* constants that give the meal part.
 */
function Ingredient(name, part) {
	this.name = name;
	this.part = part;
}

function InitFood() {

	g_ingredients = {
		pasta: new Ingredient("pasta", MEAL_PART_1),
		potato: new Ingredient("potato", MEAL_PART_1),
		rice: new Ingredient("rice", MEAL_PART_1),

		beans: new Ingredient("beans", MEAL_PART_2),
		fish: new Ingredient("fish", MEAL_PART_2),
		meatballs: new Ingredient("meatballs", MEAL_PART_2),
		sausage: new Ingredient("sausage", MEAL_PART_2),

		salad: new Ingredient("salad", MEAL_PART_SALAD),
	};
}

/**
 * Get number of ingredients in the game
 */
function GetIngredientCount() {
	var count = 0;
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			count++;
		}
	}
	return count;
}

/**
 * Get number of ingredients in the game for a meal part
 */
function GetMealPartIngredientCount(meal_part) {
	var count = 0;
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			if (g_ingredients[ingredient_name].part == meal_part) {
				count++;
			}
		}
	}
	return count;
}

/**
 * Call new IngredientList() to create a new key=>value list over ingredients
 * @param initial_value Initial value assigned to each key.
 */
function IngredientList(initial_value) {
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			this[ingredient_name] = initial_value;
		}
	}
}

function GetIngredientListSum(list) {
	var sum = 0;
	for (var ingredient_name in g_ingredients) {
		if (g_ingredients.hasOwnProperty(ingredient_name)) {
			sum += list[ingredient_name];
		}
	}
	return sum;
}
