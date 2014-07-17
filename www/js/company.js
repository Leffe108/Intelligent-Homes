/**
 * Company related methods
 */

function CompanyInit() {
	g_bank_balance = 10000;
}

function GetBuildingIncome(building) {
	return (building.type == "work" ? 30 : 10) * GetNumberOfPeopleForBuilding(building);
}

/** Fee for missing meal parts */
function GetBuildingFee(building) {
	return building.today_missing_count * (building.type == "work" ? 100 : 50);
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

function GetTotalFeesToday() {
	var tot = 0;
	for (var i = 0; i < g_town_buildings.length; i++) {
		var building = g_town_buildings[i];
		if (building.customer) tot += GetBuildingFee(building);
	}
	return tot;
}

/**
 * Tries to reduce bank balance by <cost> amount.
 * Returns true if it succeeds. If not enough money
 * exist, it does nothing and return false.
 */
function TryBuy(cost) {
	if (cost <= g_bank_balance) {
		g_bank_balance -= cost;
		return true;
	}
	ShowWindow(new Window('You don\'t have ' + MoneyStr(cost) + ' :-('));
	return false;
}

/**
 * Return true if company bank balance is too low.
 */
function IsGameOver() {
	return g_bank_balance < -10000;
}

function UpdateCompany(time) {
	var last_time = g_simulation_time - time;
	if (Math.floor(time / (60 * 24)) != Math.floor(last_time / (60 * 24))) {
		// New day => give income from customers

		for (var i = 0; i < g_town_buildings.length; i++) {
			var building = g_town_buildings[i];

			if (building.customer) {
				var balance = - GetBuildingFee(building);
				if (building.new_customer_time || Math.floor(time / (60 * 24)) != Math.floor(building.new_customer_time / (60 * 24))) {
					// Don't give any income if customer contract was aborted (any time) and then signed again today. This is to prevent cheating.
					balance += GetBuildingIncome(building);
				}
				g_bank_balance += balance;
				building.today_missing_count = 0; // reset daily fee
			}
		}
	}

	// New hour => check if truck(s) should be sent out
	if (Math.floor(time / (60 * 1)) != Math.floor(last_time / (60 * 1))) {
		// Create a list over building indices with pending delivery
		var building_has_order = [];

		for (var i = 0; i < g_trucks.length; i++) {
			var truck = g_trucks[i];
			if (truck.current_order_list != null) {
				for (var iorder = truck.current_order; iorder < truck.current_order_list.length; iorder++) {
					AddToListUnique(building_has_order, truck.current_order_list[iorder].building_id);
				}
			}
		}

		for (var i = 0; i < g_trucks.length; i++) {
			var truck = g_trucks[i];
			// Free truck?
			if (truck.current_order_list == null && truck.x == g_hq.x && truck.y == g_hq.y) {
				truck.current_order_list = [];

				for (var i = 0; i < g_town_buildings.length; i++) {
					var building = g_town_buildings[i];
					if (building.customer &&
							!IsInList(building_has_order, i)) { // Don' send truck to buildings with pending delivery

						var order = new Order();
						order.building = building;
						order.building_id = i;
						order.food = GetFridgeIngredientSpace(building.fridge);
						// Add building to order list, only if there is a demand for
						// at least one item of one ingredient
						if (GetIngredientListSum(order.food) > 0) {
							truck.current_order_list.push(order);
						}
					}
				}

				if (truck.current_order_list.length > 0) {
					truck.current_order = 0;
					truck.target_x = truck.current_order_list[0].building.x;
					truck.target_y = truck.current_order_list[0].building.y;
				} else {
					// Don't send out truck if there is no house demand
					truck.current_order_list = null;
					break;
				}

				break; // At the moment only send out maximum one truck each hour
			}
		}
	}
}

function DrawCompany() {
}


