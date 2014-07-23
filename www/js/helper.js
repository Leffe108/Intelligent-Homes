/*
 * Utility functions
 */

/**
 * From: http://stackoverflow.com/a/15313435
 */
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

/**
 * Check if x,y is inside given boundary box
 */
function IsInBox(x, y, box_x, box_y, box_width, box_height) {
	return x >= box_x && x < box_x + box_width &&
		y >= box_y && y < box_y + box_height;
}

/**
 * Draws a rectangle to the canvas. Specify either fillStyle or strokeStyle
 * in order for something to be drawn. You can also specify both if you want
 * both fill and a border.
 * @param fillStyle String with the fill style to use for the rectangle. If an empty string is given, no fill is drawn.
 * @param strokeStyle String with the stroke/border style to use for the rectangle. If an empty string is given no border is drawn.
 * @param x The left border of the rectangle.
 * @param y The top border of the rectangle.
 * @param width The width of the rectangle
 * @param height The height of the rectangle.
 */
function DrawRect(fillStyle, strokeStyle, x, y, width, height) {
	g_context.beginPath();
	g_context.rect(x, y, width, height);
	if (fillStyle != "") {
		g_context.fillStyle = fillStyle;
		g_context.fill();
	}
	if (strokeStyle != "") {
		g_context.strokeStyle = strokeStyle;
		g_context.stroke();
	}
}

/**
 * The first character of given string will be 
 * converted to upper case and the result is
 * returned. (input string is not changed)
 * @param string The input string
 * @return The resulting string
 */
function StrFirstToUpper(string) {
	return string.substr(0, 1).toLocaleUpperCase() +
		string.substr(1);
}

/**
 * This method add value to list if value is not
 * equal to any existing element in the list.
 * @param list An array
 * @param value The value to add into the array
 */
function AddToListUnique(list, value) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] == value) return;
	}
	list.push(value);
}

/**
 * This method look for a value in a list.
 * @param list An array
 * @param value The value to look for in array
 * @return true if value exist in list, otherwise false.
 */
function IsInList(list, value) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] == value) return true;
	}
	return false;
}

/**
 * Helper for updating the position of an object that moves
 * in the world map.
 *
 * The object must have:
 *   .x
 *   .y
 *   .target_x
 *   .target_y
 *   .speed
 *
 * During movement object.x and object.y is float, but
 * is then changed back to integer when reaching destination.
 */
function MovementUpdate(object, time) {
	if (object.target_x != object.x) {
		if (Math.abs(object.x - object.target_x) < object.speed * time) {
			object.x = object.target_x;
		} else {
			var delta = object.target_x - object.x > 0 ? 1 : -1;
			object.x += delta * object.speed * time;
		}
	} if (object.target_y != object.y) {
		if (Math.abs(object.y - object.target_y) < object.speed * time) {
			object.y = object.target_y;
		} else {
			var delta = object.target_y - object.y > 0 ? 1 : -1;
			object.y += delta * object.speed * time;
		}
	}
}
