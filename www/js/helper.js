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
