/*
 * GUI related stuff
 */

var TOOLBAR_BTN_PADDING = 4;
var ANIMATION_MAX_TIME = 2.0;
var GUI_FONT_SIZE = 14;
var DO_IT_OFFSET = 320;

var SELL_25_COST = 1000;
var SELL_50_COST = 2000;
var SELL_75_COST = 4000;

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

		if (building.hoover && 0 in g_mouse_down) {
			if (g_cursor_mode != "" && AllowCursorOnBuilding(building, g_cursor_mode)) {
				g_animations.push(new Animation("gui_" + g_cursor_mode, building.x, building.y));
				delete g_mouse_down[0];
				var mode = g_cursor_mode;
				g_cursor_mode = "";
				OnCursorClick(building, mode);
			} else  if(g_cursor_mode == "") {
				ShowWindow(GetBuildingWindow(building));
				delete g_mouse_down[0];
			}
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
			g_bank_balance -= 1000;
			g_open_windows.push(new Window('Fridge capacity increased by 10'));
			break;
	}
}

/**
 * Window constructor
 */
function Window(caption) {
	var margin = 64;
	this.type = 'window';
	this.x = margin;
	this.y = margin;
	this.width = g_canvas.width - margin * 2;
	this.height = g_canvas.height - margin * 2;
	this.widgets = [
		new WidLabel(caption, 'center'),
		new WidClose(),
	];
}

/*
 * Factory for building window
 * Don't call with 'new'
 */
function GetBuildingWindow(building) {
	var w = new Window();
	w.type = 'building';
	w.building = building;
	w.widgets = [];
	switch (building.type) {
		case 'hq':
			w.widgets.push(new WidLabel('Head Quaters of Intelligent Home', 'center'));
			w.widgets.push(new WidValue('Number of customers', '?'));
			w.widgets.push(new WidValue('Total daily income', '?'));
			w.widgets.push(new WidValue('Number of trucks', '?'));
			w.widgets.push(new WidValue('Total daily running costs', '?'));
			break;

		case 'home':
		case 'work':
			w.widgets.push(new WidLabel(StrFirstToUpper(building.type), 'center')),
			w.widgets.push(new WidValue(building.type == 'home' ? 'Inhabitants' : 'Workers', '?'));
			w.widgets.push(new WidValue('Customer', building.customer ? 'Yes' : 'No'));
			if (building.customer) {
				w.widgets.push(new WidValue('Daily payment to us', GetBuildingIncome(building)));
				w.widgets.push(new WidValue('Fridge capacity', building.fridge.capacity));
				w.widgets.push(new WidLabel('', 'left')); // spacer
				w.widgets.push(new WidCostAction('Buy another fridge', MoneyStr(1000), 'buy_fridge'));
				w.widgets.push(new WidValueEdit('Truck fill', '100 %', 'truck_fill'));
			} else {
				w.widgets.push(new WidLabel('', 'left')); // spacer
				w.widgets.push(new WidLabel('Send out a seller', 'left'));
				w.widgets.push(new WidCostAction('25 % success', MoneyStr(SELL_25_COST), 'seller_25'));
				w.widgets.push(new WidCostAction('50 % success', MoneyStr(SELL_50_COST), 'seller_50'));
				w.widgets.push(new WidCostAction('75 % success', MoneyStr(SELL_75_COST), 'seller_75'));
			}
			break;
	}
	w.widgets.push(new WidClose());
	return w;
}

/**
 * Show a window
 */
function ShowWindow(w) {
	LayoutWidgets(w);
	g_open_windows.push(w);
}

/**
 * Draw windows
 */
function DrawWindows() {
	for (var i = 0; i < g_open_windows.length; i++) {
		var w = g_open_windows[i];
		DrawRect('rgb(234,234,234)', 'black', w.x, w.y, w.width, w.height);

		for (var iwid = 0; iwid < w.widgets.length; iwid++) {
			DrawWidget(w, w.widgets[iwid]);
		}
	}

}

function UpdateWindows(gui_time) {
	for (var i = g_open_windows.length - 1; i >= 0; i--) {
		var w = g_open_windows[i];
		for (var iwid = 0; iwid < w.widgets.length; iwid++) {
			UpdateWidget(w, w.widgets[iwid]);
		}
	}
}

/**
 * @param w Window
 */
function LayoutWidgets(w) {
	var MARGIN = 8;
	var y = w.y;
	for (var i = 0; i < w.widgets.length; i++) {
		var widget = w.widgets[i];
		var widget_height = GetWidgetHeight(widget);
		y += MARGIN;

		// Put close widget at bottom
		if (i == w.widgets.length -1 && widget.type == 'close') {
			y = Math.max(y, w.y + w.height - widget_height - MARGIN);
		}

		widget.y = y;
		widget.x = w.x + MARGIN;
		widget.width = w.width - 2 * MARGIN;
		y += widget_height + MARGIN;
	}
}

/**
 * Widgets
 */
function Widget() {
	this.type = 'widget';
	// x/y/width is managed by the window. Widget can read it.
	this.x = null;
	this.y = null;
	this.width = null;
}

/** 
 * Just a label:
 * <label>
 * @param align 'center' or 'left'
 */
function WidLabel(label, align) {
	this.type = 'label';
	this.label = label;
	this.align = align
}
WidLabel.prototype = new Widget();

/** 
 * Value display:
 * <label>:    <value>
 */
function WidValue(label, value) {
	this.type = 'value';
	this.label = label;
	this.value = value;
}
WidValue.prototype = new Widget();

/** 
 * Value edit:
 * <label>:    <value> <up/down buttons>
 *
 * @param name Logic name
 */
function WidValueEdit(label, value, name) {
	this.type = 'value_edit';
	this.label = label;
	this.value = value;
	this.name = name;
}
WidValueEdit.prototype = new Widget();

/** 
 * Cost Action
 * <label>   <cost>    <Do it! button>
 *
 * @param name Logic name
 */
function WidCostAction(label, cost, name) {
	this.type = 'cost_action';
	this.label = label;
	this.cost = cost;
	this.name = name;
}
WidCostAction.prototype = new Widget();

/** 
 * Close window
 *            Click to close
 */
function WidClose() {
	this.type = 'close';
}
WidClose.prototype = new Widget();

/*** Widget functions ***/

function GetWidgetHeight(widget) {
	return GUI_FONT_SIZE;
}

function DrawWidget(w, widget) {
	g_context.font = GUI_FONT_SIZE + "px Verdana";
	g_context.textAlign = "left";
	g_context.textBaseline = "top";
	g_context.fillStyle = 'black';

	switch(widget.type) {
		case 'label':
			if (widget.align == 'center') {
				g_context.textAlign = "center";
				g_context.fillText(widget.label, widget.x + widget.width/2, widget.y);
			} else {
				g_context.fillText(widget.label, widget.x, widget.y);
			}
			break;
		case 'value':
			g_context.fillText(widget.label + ':', widget.x, widget.y);
			g_context.fillText(widget.value, widget.x + 200, widget.y);
			break;
		case 'value_edit':
			break;
		case 'cost_action':
			g_context.fillText(widget.label, widget.x, widget.y);
			g_context.fillText(widget.cost, widget.x + 200, widget.y);
			var do_it_x = widget.x + DO_IT_OFFSET;
			var do_it_width = widget.x + widget.width - do_it_x;
			if (widget.hoover) DrawRect('blue', '', do_it_x, widget.y, do_it_width, GetWidgetHeight(widget));
			g_context.fillStyle = widget.hoover? 'white' : 'blue';
			g_context.fillText('Do it!', widget.x + DO_IT_OFFSET, widget.y);
			break;
		case 'close':
			if (widget.hoover) DrawRect('blue', '', widget.x, widget.y, widget.width, GetWidgetHeight(widget));
			g_context.textAlign = "center";
			g_context.fillStyle = widget.hoover? 'white' : 'blue';
			g_context.fillText('Click to close', widget.x + widget.width/2, widget.y);
	}
}

/**
 * Update widget
 * @param w Window instance
 * @param widget Widget instance
 */
function UpdateWidget(w, widget) {
	var hoover_widget = IsInBox(g_mouse_x, g_mouse_y, widget.x, widget.y, widget.width, GetWidgetHeight(widget));

	switch(widget.type) {
		case 'label':
			// Has no action
			break;
		case 'value':
			// Has no action
			break;
		case 'value_edit':
			break;
		case 'cost_action':
			//var do_it_x = widget.x + DO_IT_OFFSET;
			//var do_it_width = widget.x + widget.width - do_it_x;
			//widget.hoover = IsInBox(g_mouse_x, g_mouse_x, do_it_x, widget.y, do_it_width, GetWidgetHeight(widget));
			widget.hoover = hoover_widget;
			if (widget.hoover && 0 in g_mouse_down) {
				WidgetAction(w, widget);
				delete g_mouse_down[0];
			}
			break;
		case 'close':
			widget.hoover = hoover_widget;
			if (widget.hoover && 0 in g_mouse_down) {
				WidgetAction(w, widget);
				delete g_mouse_down[0];
			}
			break;
	}
}

/**
 * Called when a click on a widget (with action) is detected.
 */
function WidgetAction(w, widget) {
	// Close window?
	if (widget.type == 'close') {
		g_open_windows.pop();
		return;
	}

	// Window specific action
	switch (w.type) {
		case 'building':
			switch (widget.name) {
				case 'buy_fridge':
					w.building.fridge.capacity += 10;
					g_bank_balance -= 1000;
					g_open_windows.pop();
					ShowWindow(new Window('Fridge capacity increased by 10'));
					break;
				case 'truck_fill':
					break;
				case 'seller_25':
					g_bank_balance -= SELL_25_COST;
					if (Math.random() <= 0.25) NewCustomer(w.building);
					g_open_windows.pop();
					break;
				case 'seller_50':
					g_bank_balance -= SELL_50_COST;
					if (Math.random() <= 0.50) NewCustomer(w.building);
					g_open_windows.pop();
					break;
				case 'seller_75':
					g_bank_balance -= SELL_75_COST;
					if (Math.random() <= 0.75) NewCustomer(w.building);
					g_open_windows.pop();
					break;
			}
			break;
	}
}
