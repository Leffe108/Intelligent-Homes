/*
 * GUI related stuff
 */

var TOOLBAR_BTN_PADDING = 4;
var ANIMATION_MAX_TIME = 2.0;

/**
 * Creates an animation.
 *
 * Animations for now is moving an image upwards while rotating it.
 */
function Animation(image, start_x, start_y) {
	this.x = start_x;
	this.y = start_y;
	this.angle = 0;
	this.image = image;
	this.timer = 0;
}

function UpdateAnimations(time) {
	for(var i = 0; i < g_animations.length; i++) {
		var animation = g_animations[i];
		animation.timer += time;
		if (animation.timer > ANIMATION_MAX_TIME) {
			g_animations.splice(i, 1);
			i--;
		} else {
			var N_ROTATIONS = 1;
			animation.y -= time * 15.0;
			animation.angle = animation.timer * N_ROTATIONS * Math.PI*2 / ANIMATION_MAX_TIME;
		}
	}
}

/**
 * Draws all Animations
 */
function DrawAnimations() {
	for(var i = 0; i < g_animations.length; i++) {
		var animation = g_animations[i];
		var start_alpha = 0.5;
		g_context.globalAlpha = start_alpha * (ANIMATION_MAX_TIME - animation.timer) / (ANIMATION_MAX_TIME);
		DrawImage(animation.image, animation.x, animation.y, animation.angle);
		g_context.globalAlpha = 1.0;
	}
}

/**
 * ImageButton class
 * @param name Unique name of the button used for logic binding and image name.
 * @param caption Text to display when button is hovered.
 * @param x,y center of the button. Button is assumed to be 32x32 and have the
 * image offset set to 16,16.
 */
function ImageButton(name, caption, x, y) {
	this.name = name;
	this.caption = caption;
	this.hoover = false;
}

/**
 * Initialize GUI-related stuff
 */
function InitGUI() {
	g_animations = [];
	g_toolbar = [
		new ImageButton("new_customer", "New Customer"),
		new ImageButton("new_equipment", "Buy new Equipment"),
	];
	g_open_windows = [];
	g_cursor_mode = "";
}

/**
 * Get x coordinate of toolbar btn with index i.
 */
function GetToolbarBtnX(i) {
	return TOOLBAR_BTN_PADDING + i * (32 + 2 * TOOLBAR_BTN_PADDING);
}

/**
 * Draw toolbar
 */
function DrawToolbar() {
	DrawRect('rgb(80,170,250)', '', 0, 0, g_toolbar.length * (32 + 2 * TOOLBAR_BTN_PADDING), 32 + 2 * TOOLBAR_BTN_PADDING);
	for(var i = 0; i < g_toolbar.length; i++) {
		var button = g_toolbar[i];
		var x = GetToolbarBtnX(i);
		DrawImage("gui_" + button.name, x + 16, TOOLBAR_BTN_PADDING + 16);
		if (button.hoover) {
			// get text width
			g_context.font = "14px Verdana";
			var metrics = g_context.measureText(button.caption);

			// draw background
			var label_y = 3*TOOLBAR_BTN_PADDING + 32;
			DrawRect('yellow', '', x, label_y, metrics.width, 14);

			// draw text
			g_context.textAlign = "left";
			g_context.textBaseline = "top";
			g_context.fillStyle = 'black';
			g_context.fillText(button.caption, x, label_y);
		}
	}
}

function UpdateToolbar(gui_time) {
	// Windows are modal
	if (g_open_windows.length > 0) return;

	// Toolbar button
	for(var i = 0; i < g_toolbar.length; i++) {
		g_toolbar[i].hoover = IsInBox(g_mouse_x, g_mouse_y, GetToolbarBtnX(i), TOOLBAR_BTN_PADDING, 32, 32);
		if (g_toolbar[i].hoover && 0 in g_mouse_down) {
			OnToolbarButton(g_toolbar[i]);
			delete g_mouse_down[0]; // handled click
		}
	}
}

/**
 * Called when user clicks a toolbar button
 * @param button The button object
 */
function OnToolbarButton(button) {
	switch(button.name) {
		case 'new_customer':
			g_cursor_mode = 'new_customer';
			break;

		case 'new_equipment':
			g_cursor_mode = 'new_equipment';
			break;
	}
}

/**
 * Is the current cursor mode allowed on given
 * building?
 */
function AllowCursorOnBuilding(building, mode) {
	return building.type != "hq" || mode != "new_customer";
}

/**
 * Cursor click on buildings
 */
function DrawCursor() {
	// No cursor tool active?
	if (g_cursor_mode == "") return;

	for(var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];
		if (building.hoover && AllowCursorOnBuilding(building, g_cursor_mode)) {
			DrawImage("gui_" + g_cursor_mode, building.x, building.y);
		}
	}
}

/**
 * Updates hoover status for buildings. Also checks if a building
 * is clicked while a cursor mode is active.
 */
function UpdateCursor() {
	if (g_open_windows.length > 0) return;

	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];
		building.hoover = IsInBox(g_mouse_x, g_mouse_y, building.x - 16, building.y - 16, 32, 32);

		if (g_cursor_mode != "" && building.hoover && 0 in g_mouse_down && AllowCursorOnBuilding(building, g_cursor_mode)) {
			g_animations.push(new Animation("gui_" + g_cursor_mode, building.x, building.y));
			delete g_mouse_down[0];
			var mode = g_cursor_mode;
			g_cursor_mode = "";
			OnCursorClick(building, mode);
		}
	}
}

function OnCursorClick(building, mode) {

	switch (mode) {
		case 'new_customer':
			NewCustomer(building);
			g_open_windows.push(new Window('Wow you got a new customer!'));
			break;

		case 'new_equipment':
			building.fridge.capacity += 10;
			g_open_windows.push(new Window('Fridge capacity increased by 10'));
			break;
	}
}

/**
 * Window constructor
 */
function Window(caption) {
	var margin = 64;
	this.x = margin;
	this.y = margin;
	this.width = g_canvas.width - margin * 2;
	this.height = g_canvas.height - margin * 2;
	this.caption = caption;
}

/**
 * Draw windows
 */
function DrawWindows() {
	for (var i = 0; i < g_open_windows.length; i++) {
		var w = g_open_windows[i];
		DrawRect('white', 'black', w.x, w.y, w.width, w.height);
		
		var text_size = 14;
		g_context.font = text_size + "px Verdana";
		g_context.textAlign = "center";
		g_context.textBaseline = "center";
		g_context.fillStyle = 'black';
		g_context.fillText(w.caption, w.x + w.width/2, w.y + w.height/2 - text_size/2);

		g_context.textBaseline = "bottom";
		g_context.fillText('Click to close', w.x + w.width/2, w.y + w.height - 8);
	}

}

function UpdateWindows(gui_time) {
	// Close window when user clicks
	if (g_open_windows.length > 0 && 0 in g_mouse_down) {
		g_open_windows.pop();
		delete g_mouse_down[0]; // handle click
	}
}
