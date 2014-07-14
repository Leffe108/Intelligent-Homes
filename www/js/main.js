
// Global variables
var g_canvas = null;
var g_context = null;
var g_images = null;
var g_town_buildings = null; // list of buildings
var g_people = null; // list of Person
var g_ingredients = null;
var g_animations = null;
var g_simulation_time = null; // unit: minutes (total 24*60 a day)
var g_simulation_day = null; // day counter
var g_last_loop = null;
var g_game_speed = null;

// Methods
requestAnimationFrame = null;

function InitCanvas() {
	g_canvas = document.createElement("canvas");
	g_context = g_canvas.getContext("2d"); 
	g_canvas.width = 512;
	g_canvas.height = 480;
	document.body.appendChild(g_canvas);
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
		house_home: LoadImage("house_home", 16, 16),
		house_work: LoadImage("house_work", 16, 16),
		person: LoadImage("person", 16, 32),
		van: LoadImage("van", 16, 32),

		// Food images:
		pasta: LoadImage("pasta", 16, 16),
		rice: LoadImage("rice", 16, 16),
		potato: LoadImage("potato", 16, 16),

		sausage: LoadImage("sausage", 16, 16),
		meatballs: LoadImage("meatballs", 16, 16),
		fish: LoadImage("fish", 16, 16),
		beans: LoadImage("beans", 16, 16),

		salad: LoadImage("salad", 16, 16),
	}
}

function InitGameState()
{
	g_simulation_time = 0;
	g_simulation_day = 0;
	g_game_speed = 300.0;
	g_town_buildings = [];

	InitFood();
	GenerateBuildings();
	GeneratePeople();
	FillAllFridges(10);
}

/**
 * @param time Seconds since last Update
 */
function Update(time) {
	var gui_time = time; // GUI time is not affected by speed modifier
	time *= g_game_speed; // Apply speed modifier

	g_simulation_time += time; // one second = one in-game minute
	while (g_simulation_time > 24 * 60) {
		g_simulation_time -= 24 * 60;
		g_simulation_day++;
	}

	UpdateBuildings(time);
	UpdatePeople(time);
	UpdateAnimations(gui_time);
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
	if(img.complete && img.width > 0) { // .complete is always true in FF
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
function Render() {
	DrawImage("background", 0, 0);

	// Draw town buildings
	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];

		var image_name = null;
		if (building.type == "home") {
			image_name = "house_home";
		} else if (building.type == "work") {
			image_name = "house_work";
		} else {
			throw new Exception("Bad house type");
		}
		DrawImage(image_name, building.x, building.y);
	}

	// Draw people
	for (var i = 0; i < g_people.length; i++) {
		var person = g_people[i];
		if (person.at == "") { // only draw people outdoors
			DrawImage("person", person.x, person.y);
		}
	}

	// Draw animations
	for(var i = 0; i < g_animations.length; i++) {
		var animation = g_animations[i];
		DrawImage(animation.image, animation.x, animation.y, animation.angle);
	}

	// Current time & speed
	g_context.fillStyle = "rgb(255, 255, 255)";
	g_context.font = "14px Verdana";
	g_context.textAlign = "left";
	g_context.textBaseline = "bottom";
	g_context.fillText("day: " + g_simulation_day + "  time: " + TimeStr(g_simulation_time) + "  speed: " + g_game_speed, 4, g_canvas.height - 4);
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
