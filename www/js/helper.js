/*
 * Utility functions
 */

/**
 * Check if x,y is inside given boundary box
 */
function IsInBox(x, y, box_x, box_y, box_width, box_height) {
	return x >= box_x && x < box_x + box_width &&
		y >= box_y && y < box_y + box_height;
}

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

function StrFirstToUpper(string) {
	return string.substr(0, 1).toLocaleUpperCase() +
		string.substr(1);
}

function AddToListUnique(list, value) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] == value) return;
	}
	list.push(value);
}

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
