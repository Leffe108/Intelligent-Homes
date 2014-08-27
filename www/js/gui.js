/*
 * GUI related stuff
 */

var ANIMATION_MAX_TIME = 2.0;

var SELL_25_COST = 100;
var SELL_50_COST = 200;
var SELL_100_COST = 4000;

var BOTTOM_WINDOW_Z = 10; ///< z-index of the window displayed at the bottom of the open window stack.

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
	for (var i = 0; i < g_animations.length; i++) {
		var animation = g_animations[i];
		animation.timer += time;
		if (animation.timer > ANIMATION_MAX_TIME) {
			g_animations.splice(i, 1);
			i--;
		} else {
			var N_ROTATIONS = 0.75;
			animation.y -= time * 15.0;
			animation.angle = animation.timer * N_ROTATIONS * Math.PI*2 / ANIMATION_MAX_TIME;
		}
	}
}

/**
 * Draws all Animations
 */
function DrawAnimations() {
	for (var i = 0; i < g_animations.length; i++) {
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
}

/**
 * Is the intro window open?
 */
function IsIntroWindowOpen() {
	return g_open_windows.length > 0 && g_open_windows[0].type == 'intro';
}

/**
 * Draw cursor
 */
function DrawCursor() {
}

/**
 * Handle cursor hoover + click on buildings.
 */
function UpdateCursor() {
	if (g_open_windows.length > 0) return;

	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];
		building.hoover = IsInBox(g_mouse_x, g_mouse_y, building.x - 16, building.y - 16, 32, 32);

		// Clicked on building?
		if (building.hoover && 0 in g_mouse_down) {
			ShowWindow(GetBuildingWindow(building));
			delete g_mouse_down[0];
		}
	}
}

/**
 * Window constructor
 */
function Window(caption) {
	this.type = 'window';
	this.widgets = [
		new WidLabel(caption, 'center'),
		new WidClose(),
	];
	this.dom_node = null; ///< Reference to DOM node object
}

/**
 * Get a window with a caption and then
 * lines of text. 
 * @param caption String with caption text
 * @param lines Array of strings. Lines with 0-length string will be rendered as WidSpacer.
 * @note Don't call with 'new'
 */
function GetMessageWindow(caption, lines) {
	var w = new Window();
	w.type = 'intro';
	w.widgets = [
		new WidLabel(caption, 'center'),
	];
	for (var i = 0; i < lines.length; i++) {
		if (lines[i] == '') {
			w.widgets.push(new WidSpacer());
		} else {
			w.widgets.push(new WidLabel(lines[i], 'left'));
		}
	}
	w.widgets.push(new WidClose());
	return w;
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
			w.widgets.push(new WidLabel('Head Quaters of Intelligent Homes', 'center'));
			w.widgets.push(new WidValue('Number of customers', GetNumberOfCustomers()));
			w.widgets.push(new WidValue('Total daily income', GetTotalDailyIncome()));
			w.widgets.push(new WidValue('Total fees so far today', GetTotalFeesToday()));
			w.widgets.push(new WidValue('Number of trucks', g_trucks.length));
			//w.widgets.push(new WidValue('Total daily running costs', '?'));
			w.widgets.push(new WidCostAction('Buy another truck', MoneyStr(BUY_TRUCK_COST), 'buy_truck'));
			w.widgets.push(new WidCostAction('Show game help', MoneyStr(0), 'show_intro'));
			break;

		case 'home':
		case 'work':
			w.widgets.push(new WidLabel(StrFirstToUpper(building.type), 'center')),
			w.widgets.push(new WidValue(building.type == 'home' ? 'Inhabitants' : 'Workers', GetNumberOfPeopleForBuilding(building)));
			w.widgets.push(new WidValue('Customer', building.customer ? 'Yes' : 'No'));
			if (building.customer) {
				w.widgets.push(new WidValue('Daily payment to us', MoneyStr(GetBuildingIncome(building))));
				w.widgets.push(new WidValue('Today missing food fees', MoneyStr(GetBuildingFee(building))));
				w.widgets.push(new WidValue('Fridge capacity', building.fridge.capacity));
				w.widgets.push(new WidSpacer());
				w.widgets.push(new WidCostAction('Buy another fridge', MoneyStr(1000), 'buy_fridge'));
				w.widgets.push(new WidCostAction('Abort customer contract', MoneyStr(0), 'abort_customer'));
				//w.widgets.push(new WidValueEdit('Min empty for order', '50 %', 'truck_fill'));
				//w.widgets.push(new WidValueEdit('Truck fill', '100 %', 'truck_fill'));
				w.widgets.push(new WidSpacer());
				w.widgets.push(new WidLabel('Yellow bar: pasta, potato and rice', 'left'));
				w.widgets.push(new WidLabel('Red bar: beans, fish, meatballs and sausages', 'left'));
				w.widgets.push(new WidLabel('Green bar: sallad', 'left'));
			} else {
				w.widgets.push(new WidSpacer());
				w.widgets.push(new WidLabel('Send out a seller', 'left'));
				w.widgets.push(new WidCostAction('25 % success', MoneyStr(SELL_25_COST), 'seller_25'));
				w.widgets.push(new WidCostAction('50 % success', MoneyStr(SELL_50_COST), 'seller_50'));
				w.widgets.push(new WidCostAction('100 % success', MoneyStr(SELL_100_COST), 'seller_100'));
				w.widgets.push(new WidSpacer());
				w.widgets.push(new WidLabel('If the seller succeeds you get:', 'left'));
				w.widgets.push(new WidValue('Daily income', MoneyStr(GetBuildingIncome(building))));
				w.widgets.push(new WidLabel('Minus fees if you fail to deliver', 'left'));
			}
			break;
	}
	w.widgets.push(new WidClose());
	return w;
}

/*
 * Factory for intro window
 * Don't call with 'new'
 */
function GetIntroWindow() {
	var w = new Window();
	w.type = 'intro';
	w.widgets = [
		new WidLabel('Welcome to Intelligent Homes', 'center'),
		new WidLabel('Objective: Become rich', 'left'),
		new WidLabel(
			'To earn money, get customers that pay you well. ' +
			'But watch out that you deliver them a good service, ' +
			'or your income may turn into loss due to fees for ' +
			'missing food.', 'left'
		),
		new WidSpacer(),
		new WidLabel('Food?', 'left'),
		new WidLabel(
			'Yes, we offer intelligent fridges for a daily fee. ' +
			'They call back to our HQ when someone take a meal ' +
			'so we can make sure the fridges never empties.', 'left'
		),
		new WidSpacer(),
		new WidLabel('Click on buildings to get started', 'left'),
		new WidClose(),
	];
	return w;
}

/**
 * Show a window
 */
function ShowWindow(w) {
	if (g_open_windows.length == 0) $('#gui-overlay').removeClass('hidden');
	RenderWindowHtml(w);
	g_open_windows.push(w);
}

/**
 * Close topmost window
 */
function CloseTopWindow() {
	if (g_open_windows.length == 0) return;
	$(g_open_windows[g_open_windows.length-1].dom_node).remove();
	g_open_windows.pop();
	if (g_open_windows.length == 0) $('#gui-overlay').addClass('hidden');
}

/**
 * Draw windows
 */
function DrawWindows() {
	// Windows are HTML dom nodes drawn by the browser
}

function UpdateWindows(gui_time) {
	// Windows use browser click handler
}

/**
 * Creates DOM html elements for window and its widgets. 
 * The window html element is saved in w.dom_node and inserted
 * into the gui overlay DOM node.
 * This function also attach event handlers to clickable widgets
 * to link them up with WidgetAction function.
 * @param w Window
 */
function RenderWindowHtml(w) {
	var window_div = document.createElement('div');
	window_div.className = 'window';
	var spacer = false; // was previous widget a spacer?
	for (var i = 0; i < w.widgets.length; i++) {
		var widget = w.widgets[i];
		var widget_div = document.createElement('div');
		widget_div.className = 'widget wid-' + widget.type.replace('_', '-');
		$(widget_div).attr('data-wid-name', widget.name);
		$(widget_div).attr('data-wid-type', widget.type);
		switch (widget.type) {
			case 'spacer':
				spacer = true;
				continue;
			case 'label':
				$(widget_div).append('<p class="label" style="text-align:' + widget.align + '">' + widget.label + '</p>');
				break;
			case 'value':
				$(widget_div).append('<p class="label">' + widget.label + '</p>');
				$(widget_div).append('<p class="value">' + widget.value + '</p>');
				break;
			case 'value_edit':
				$(widget_div).append('<p class="label">' + widget.label + '</p>');
				$(widget_div).append('<input class="value" type="number" value="' + widget.value + '">');
				break;
			case 'cost_action':
				$(widget_div).append('<p class="label">' + widget.label + '</p>');
				$(widget_div).append('<p class="cost">' + widget.cost + '</p>');
				$(widget_div).append('<a class="do-it">Do it!</a>');
				break;
			case 'close':
				$(widget_div).append('<a class="close">Click to close</a>');
		}
		if (spacer) {
			widget_div.className += ' extra-top-margin';
			spacer = false;
		}
		
		window_div.appendChild(widget_div);
	}

	$(window_div).children('.wid-close').children('.close').on('click', function() {
		$(this).parent().parent().remove();
		g_open_windows.pop();
		if (g_open_windows.length == 0) $('#gui-overlay').addClass('hidden');
	});
	$(window_div).children('.wid-cost-action').children('.do-it').on('click', function() {
		var widget_name = $(this).parent().attr('data-wid-name');
		var widget_type = $(this).parent().attr('data-wid-type');
		WidgetAction(w, widget_name, widget_type);
	});

	// Make new window appear ontop of any existing window
	// on screen.
	$(window_div).css('z-index', BOTTOM_WINDOW_Z + g_open_windows.length);
	
	var overlay = document.getElementById('gui-overlay');
	overlay.appendChild(window_div);
	w.dom_node = window_div;
}

/**
 * Widgets
 */
function Widget() {
	this.type = 'widget';
	this.name = '';
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

/** 
 * Spacer
 */
function WidSpacer() {
	this.type = 'spacer';
}
WidSpacer.prototype = new Widget();

/*** Widget functions ***/

/**
 * Called when a click on a widget (with action) is detected.
 */
function WidgetAction(w, widget_name, widget_type) {
	// Close window?
	if (widget_type == 'close') {
		CloseTopWindow();
		return;
	}

	// Window specific action
	switch (w.type) {
		case 'building':
			switch (widget_name) {
				case 'buy_fridge':
					if (TryBuy(1000)) {
						w.building.fridge.capacity += 10;
						CloseTopWindow();
						ShowWindow(new Window('Fridge capacity increased by 10'));
					}
					break;
				case 'buy_truck':
					if (BuyTruck()) {
						CloseTopWindow();
						ShowWindow(new Window('A new shiny truck is now available at your HQ.'));
					}
					break;
				case 'abort_customer':
					AbortCustomer(w.building);
					CloseTopWindow();
					ShowWindow(GetMessageWindow('Customer contract aborted', [
						'If you get this customer back again, it will',
						'not pay you anything the first day. This is',
						'to prevent cheating.',
						'',
						'Any charges for people who didn\'t get food',
						'today has been taken from your bank account.',
						'But apart from that, this building will not',
						'cost you anything from now on.',
					]));
					break;
				case 'show_intro':
					CloseTopWindow();
					ShowWindow(GetIntroWindow());
					break;
				case 'truck_fill':
					break;
				case 'seller_25':
					if (TryBuy(SELL_25_COST)) {
						if (Math.random() <= 0.25) NewCustomer(w.building);
						CloseTopWindow();
					}
					break;
				case 'seller_50':
					if (TryBuy(SELL_50_COST)) {
						if (Math.random() <= 0.50) NewCustomer(w.building);
						CloseTopWindow();
					}
					break;
				case 'seller_100':
					if (TryBuy(SELL_100_COST)) {
						NewCustomer(w.building);
						CloseTopWindow();
					}
					break;
			}
			break;
	}
}
