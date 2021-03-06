
// Global variables
var g_canvas = null;
var g_context = null;
var g_logo_timer = null;
var g_images = null;
var g_town_buildings = null; // list of buildings, including HQ
var g_hq = null; // fast access to HQ
var g_people = null; // list of Person
var g_trucks = null; // list of Truck
var g_ingredients = null;
var g_animations = null;
var g_open_windows = null; // gui open windows
var g_simulation_time = null; // unit: minutes (total 24*60 a day)
var g_simulation_day = null; // day counter
var g_last_loop = null;
var g_game_speed = null;
var g_game_paused = null;
var g_bank_balance = null; // amount of money for our company

// Methods
requestAnimationFrame = null;

function InitCanvas() {
	g_canvas = document.createElement("canvas");
	g_context = g_canvas.getContext("2d"); 
	g_canvas.width = 512;
	g_canvas.height = 480;
	g_canvas.id = 'canvas';
	var game = document.getElementById('game');
	game.appendChild(g_canvas);
	//document.body.appendChild(g_canvas);
}

/**
 * @param name The name identifier of the image which is also the file name excluding '.png'.
 * @param base_x X offset to the point in the image that will be rendered as 0,0 of this image
 * @param base_y Y offset to the point in the image that will be rendered as 0,0 of this image
 */
function LoadImage(name, base_x, base_y) {
	var img = new Image();
	img.id = name;
	// custom members
	img.base_x = base_x;
	img.base_y = base_y;
	img.complete = false;

	img.onLoad = function (e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		target.complete = true;
	};
	img.src = "images/" + name + ".png";
	return img;
}

function LoadImages() {
	g_images = {
		background: LoadImage("background", 0, 0),
		logo_fridge: LoadImage("logo_fridge", 0, 0),
		game_over: LoadImage("game_over", 0, 0),
		house_home: LoadImage("house_home", 16, 16),
		house_work: LoadImage("house_work", 16, 16),
		house_hq: LoadImage("house_hq", 16, 16),
		customer_star: LoadImage("customer_star", 16, 16),
		customer_good: LoadImage("customer_good", 16, 16),
		customer_missing1: LoadImage("customer_missing1", 16, 16),
		customer_missing2: LoadImage("customer_missing2", 16, 16),
		customer_missing3: LoadImage("customer_missing3", 16, 16),
		person: LoadImage("person", 16, 32),
		truck: LoadImage("truck", 16, 32),

		// Food images:
		pasta: LoadImage("pasta", 16, 16),
		rice: LoadImage("rice", 16, 16),
		potato: LoadImage("potato", 16, 16),

		sausage: LoadImage("sausage", 16, 16),
		meatballs: LoadImage("meatballs", 16, 16),
		fish: LoadImage("fish", 16, 16),
		beans: LoadImage("beans", 16, 16),

		salad: LoadImage("salad", 16, 16),

		// GUI
		gui_new_customer: LoadImage("gui_new_customer", 16, 16),
		gui_new_equipment: LoadImage("gui_new_equipment", 16, 16),
	}
}

function InitGameState()
{
	g_simulation_time = 0;
	g_simulation_day = 0;
	g_game_speed = 30.0;
	g_game_paused = true;
	g_town_buildings = [];

	InitFood();
	GenerateBuildings();
	GeneratePeople();
	FillAllFridges();
	CompanyInit();
	TruckInit();
}

/**
 * @param time Seconds since last Update
 */
function Update(time) {
	var gui_time = time; // GUI time is not affected by speed modifier
	time *= g_game_speed; // Apply speed modifier

	// Still showing the logo?
	if (g_logo_timer >= 0) {
		g_logo_timer += gui_time;
		if (g_logo_timer > 2.5) {
			g_logo_timer = -1;
			ShowWindow(GetIntroWindow());
		} else {
			return; // continue to show logo - don't update game state
		}
	}

	// If game was just lost, enable click detection on game over
	// screen to reload game.
	if (IsGameOver() && !IsGameOverOverlayActive()) {
		while (HasOpenWindows()) CloseTopWindow();
		SwitchOverlay(OVERLAY_GAME_OVER);
	}

	// Progress game time unless paused
	g_game_paused = IsIntroWindowOpen() || IsGameOver();
	if (!g_game_paused) {
		g_simulation_time += time; // one second = one in-game minute
		while (g_simulation_time > 24 * 60) {
			g_simulation_time -= 24 * 60;
			g_simulation_day++;
		}

		UpdateBuildings(time);
		UpdatePeople(time);
		UpdateTrucks(time);
		UpdateCompany(time);
	}

	// Always update GUI
	UpdateAnimations(gui_time);
	UpdateWindows(gui_time);
}

/**
 * Draws an image at x,y.
 * x and y will be floored to integers if they are not
 * already integers.
 * @param angle Rotation angle. Defaults to 0
 */
function DrawImage(image, x, y, angle) {
	if (angle == null) angle = 0;
	var img = g_images[image];
	if (img.complete && img.width > 0) { // .complete is always true in FF
		g_context.save();
		g_context.translate(Math.floor(x), Math.floor(y));
		g_context.rotate(angle);
		g_context.drawImage(img, -img.base_x, -img.base_y);
		g_context.restore();
	}
}
function TimeStr(time) {
	var h = "" + Math.floor(time / 60);
	var m = "" + Math.floor(time - h * 60);
	if (h.length < 2) h = "0" + h;
	if (m.length < 2) m = "0" + m;
	return h + ":" + m;
}
function MoneyStr(amount) {
	return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' bucks';
}
function Render() {
	// Should logo be displayed?
	if (g_logo_timer >= 0) {
		DrawImage("logo_fridge", 0, 0);
		return;
	} else if (IsGameOver()) {
		DrawImage("game_over", 0, 0);
		return;
	}

	// Draw background
	for (var y = 0; y < g_canvas.width; y += 32) {
		for (var x = 0; x < g_canvas.width; x += 32) {
			DrawImage("background", x, y);
		}
	}

	DrawBuildings();
	DrawPeople();
	DrawTrucks();
	DrawCompany();

	// Draw animations
	DrawAnimations();

	// Current time & speed
	g_context.fillStyle = "rgb(255, 255, 255)";
	g_context.font = "14px Verdana";
	g_context.textAlign = "left";
	g_context.textBaseline = "bottom";
	g_context.fillText("day: " + g_simulation_day + "  time: " + TimeStr(g_simulation_time) + "  speed: " + (g_game_paused ? 'paused' : g_game_speed), 4, g_canvas.height - 4);

	// Bank balance
	g_context.textAlign = "right";
	g_context.fillText(MoneyStr(g_bank_balance), g_canvas.width - 4, g_canvas.height - 4);

	// Draw GUI
	DrawWindows();

	if (IsIntroWindowOpen()) {
		var x = g_canvas.width / 2 - GetIngredientCount() * 32 / 2;
		for (var ingredient_name in g_ingredients) {
			if (g_ingredients.hasOwnProperty(ingredient_name)) {
				DrawImage(ingredient_name, x, 32);
				x += 32;
			}
		}
	}

}

// Main game loop
function Main() {
	var now = Date.now();
	var delta = now - g_last_loop;

	Update(delta / 1000);
	Render();

	g_last_loop = now;

	// Request to do this again ASAP
	if (requestAnimationFrame) {
		requestAnimationFrame(Main);
	} else {
		window.setTimeout(Main, 1);
	}
}


function Init() {
	g_logo_timer = 0;
	InitCanvas();
	LoadImages();
	InitGUI();
	InitGameState();

	// Cross-browser support for requestAnimationFrame
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
	
	// Start main loop
	g_last_loop = Date.now();
	Main();
}

// Call Init
Init();
