/**
 * Company related methods
 */

function CompanyInit() {
	g_bank_balance = 10000;
}

function GetBuildingIncome(building) {
	return building.type == "work" ? 300 : 100;
}

function GetNumberOfCustomers() {
	var count = 0;
	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];
		if (building.customer) count++;
	}
	return count;
}

function GetTotalDailyIncome() {
	var tot = 0;
	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];
		if (building.customer) tot += GetBuildingIncome(building);
	}
	return tot;
}

function UpdateCompany(time) {
	var last_time = g_simulation_time - time;
	if (Math.floor(time / (60 * 24)) != Math.floor(last_time / (60 * 24))) {
		// New day => give income from customers

		for (var i = 0; i < g_town_buildings.length; i++) {
			var building = g_town_buildings[i];

			if (building.customer) {
				g_bank_balance += GetBuildingIncome(building);
			}
		}
	}
}

function DrawCompany() {
}


