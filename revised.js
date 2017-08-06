jQuery(function ($) {
    // set min value of 0 for all numeric inputs
    $("input[type='number']").attr('min',0);
    
    function extendDOM_removeGlobalCurrentMaintenance() {
        $("#maintCurrent").remove();
    }
    extendDOM_removeGlobalCurrentMaintenance();

    function extendDOM_removeGlobalReduceMaintenance() {
        $("#maintReduce").remove();
        $("#revVehicle1 > tbody > tr:first").remove();
    }
    extendDOM_removeGlobalReduceMaintenance();

    function extendDOM_addElectricVehiclePrompt() {

        /* Add a new table row for asking whether each vehicle is electric or
           not. This will be the first prompt for each vehicle. */
        for (var vehicleNum = 1; vehicleNum <= 5; vehicleNum++) {
            elecQuestion = $(
                '<tr>\
                   <td></td>\
                   <td><label> Is this an electric vehicle? </label></td>\
                   <td>\
                       <select id="vehicle1ElecSelect">\
                            <option>No</option>\
                            <option>Yes</option>\
                       </select>\
                       <span class="info-iselectric info-asset"></span>\
                    </td>\
                    <td></td><td></td>\
                 </tr>'
            );
            $('#vehicle' + vehicleNum + ' > tbody > tr').eq(1).after(elecQuestion);
        }

        /* Add dialogue for what it means to be an electric vehicle */
        $("#dialog-miles").after(
            "<div id='dialog-iselectric' class='dialog'>\
               <p>Select \"Yes\" if your vehicle is classified as a Battery Electric Vehicle (BEV). <a href='https://en.wikipedia.org/wiki/Battery_electric_vehicle'>More info</a></p>\
             </div>"
        );
    }
    extendDOM_addElectricVehiclePrompt();
    

    //   development notes at the bottom of the page


    window.onbeforeunload = function () {
        // This fucntion does nothing.  It won't spawn a confirmation dialog
        // But it will ensure that the page is not cached by the browser.
        return 'You seem to still be working on the calculator.';

        $('.dialog').dialog('close');
    };
    
    var numPeople = 0;
    var zip_code;
	var zipChecker;
    var g_eFactorValue = 0;
	var numVehicles = 1;
    var grandEmissionsTotal = 0;
	var grandReductionTotal = 0;
    var homeEmissionTotal=0;
	var totalAlreadyCorrection = 0;
	var usAvgTotals=[0,0,0,0];           // home, transportation, waste, total
	var userRevisedChartNums=[];
	var progressBarTotals = [0,0,0];           // home, transportation, waste, 
    
    var vehicleData = [[],[],[],[],[]];
    var revisedVehicleData = [[],[],[],[],[]];
    var userTotalEmissions = [0,0,0,0,0,0];            //  Natural Gas, Electricity, Fuel Oil, Propane, Transportation, Waste
    var userRevisedTotalEmissions  = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[],[0,0,0],[0,0,0]];         //  maintenance is always at position [10]
	userRevisedTotalEmissions[23] = [0,0,0];                //  instantiated here in the event the user skips the "% Green Electricity"
    var emissionsSaved = 0;
    var usAvg = [0,0,0,0,0,0];    //  0-3 utilities, 4 transportation, 5 Waste
    var heatSource = "";
	var maintCurrentSelect = "";
    var userRecycling  = [[0,"newspapers"],[0,"glass"],[0,"plastic"],[0,"aluminum and steel cans"],[0,"magazines"]];      // 1 = Already Done, 2 = Will Do, 0 = Won't Do
    var wasteProgress = [0,0,0,0,0];
    var homeProgress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var vehicleProgress = [,[]];         //  maintenance is always at position [0]
	var totalExhaustAlreadySaved = 0;
	var totalDollarsAlreadySaved = 0;
	var totalExhaustWillSave = 0;
	var totalDollarsWillSave = 0;

    // Household Vehicles
    var g_CO2_EMITTED_PER_GALLON_OF_GASOLINE = 19.6;
    var g_NONCO2_EMITTED_PER_GALLON_OF_GASOLINE = 1.013684744044602;
    var g_AVG_EMISSIONS_PER_VEHICLE = 10484;
    
    // HOME ENERGY
    //  -- NAT GAS
    var g_AVG_NAT_GAS_PRICE_PER_THOUSAND_CUBIC_FEET = 10.68;
    var g_AVG_NAT_GAS_PRICE_PER_THERM = 1.04;
    var g_NAT_GAS_THERMS_EMISSIONS_FACTOR = 11.7;
    var g_NAT_GAS_CUBIC_FEET_EMISSIONS_FACTOR = 119.58;
    var g_NAT_GAS_AVG_EMISSIONS_PER_PERSON = 3071;    
    
    //  -- ELECTRICITY
    var g_AVG_ELEC_PRICE_PER_KILOWATT = 0.1188;
    var g_ELEC_AVG_EMISSIONS_PER_PERSON = 5455;
    var g_ELEC_AVG_COST_PER_PERSON = 43.61;
    
    //  -- FUEL OIL
    var g_AVG_FUEL_OIL_PRICE_PER_GALLON = 4.02;
    var g_FUEL_OIL_EMISSIONS_FACTOR = 22.61;
    var g_FUEL_OIL_AVG_EMISSIONS_PER_PERSON = 4848;    
    
    //  -- Propane
    var g_AVG_PROPANE_PRICE_PER_GALLON = 2.47;
    var g_PROPANE_EMISSIONS_FACTOR = 12.43;
    var g_PROPANE_AVG_EMISSIONS_PER_PERSON = 2243;    
    
    
    // WASTE
    var g_WASTE_AVG_PER_PERSON = 691.5;
    var g_METAL_REDUCTION = -89.38;
    var g_PLASTIC_REDUCTION = -35.56;
    var g_GLASS_REDUCTION = -25.39;
    var g_NEWSPAPER_REDUCTION = -113.14;
    var g_MAGAZINE_REDUCTION = -27.46;
    var g_TOTAL_EMISSIONS_AVG_PER_PERSON = 19702;
    
    
    // ON THE ROAD
    var g_AVG_COST_PER_MILE = 0.1964;
    var g_VEHICLE_EFFICIENCY_IMPROVEMENTS = 0.07;
    var g_AVG_GAS_PRICE_PER_GALLON = 3.68;
    
    // AT HOME
    var g_HEATING_SAVINGS_PER_DEGREE_OF_SETBACK = 0.03;
    var g_PERCENT_NAT_GAS_TO_HEATING = 0.63;
    var g_PERCENT_ELEC_TO_HEATING = 0.09;
    var g_PERCENT_FUEL_OIL_TO_HEATING = 0.87;
    var g_PERCENT_PROPANE_TO_HEATING = 0.70;
    var g_PERCENT_ELEC_TO_COOLING = 0.14;
    var g_COOLING_SAVINGS_PER_DEGREE_OF_SETBACK = 0.06;
    var g_COMPUTER_SLEEP_SAVINGS = 107.1;
    var g_KWH_PER_LOAD_LAUNDRY = 0.96;
    var g_DRYER_SAVINGS = 769;
    var g_LAMP_KWH_SAVINGS = 33;
    var g_LAMP_DOLLAR_SAVINGS = 4;
    var g_FRIDGE_REPLACE_KWH_SAVINGS = 322;
    var g_BOILER_REPLACE_SAVINGS_NAT_GAS = 728;
    var g_BOILER_REPLACE_SAVINGS_FUEL_OIL = 1056;
    var g_BOILER_REPLACE_COST_SAVINGS = 78.34;
    var g_SWITCH_WINDOWS_SAVINGS = 25210000;
    var g_WINDOW_REPLACE_COST_SAVINGS = 150;
    
    
    // CONVERSION FACTORS/CONSTANTS
    var g_BTU_PER_1000CF_NAT_GAS = 1023000;
    var g_BTU_PER_KWH = 3412;
    var g_BTU_PER_GALLON_FUEL_OIL =  138691.09;
    var g_BTU_PER_GALLON_PROPANE =  91335.94;
    var g_NUM_WEEKS_PER_YEAR = 52;
    var g_NUM_MONTHS_PER_YEAR = 12;
	
	// EVENT TRACKING
	var endTime = 0, startTime = 0, timeSpent = 0;

	
    var browserWidth = $(window).width();

    $(window).resize(function () {
        browserWidth = $(window).width();

        var houseImagesWidth = $('#house-image').css('width');
        var heightval = parseInt(houseImagesWidth) / 1.35;
        if (heightval > 298) {
            $('#intro-explanation, #house-image').css('height', parseInt(heightval) + 'px');
        }
        else {
            $('#intro-explanation').css('height', 'auto');
            $('#house-image').css({ 'height': '240px', 'max-width': '80%' });
        }
 	});

    $(window).scroll(function () {
        if (browserWidth > 803) {
            var scrollPos = $(this).scrollTop();
            if (scrollPos > 200) {
                //$('aside').addClass('fixedPos');
            } else {
                //$('aside').removeClass('fixedPos');
            }
        }
    });
	
	function closeDialogs(){
		if ($('.dialog').dialog('isOpen')) {
			$('.dialog').dialog('close');
		}
	}

	function stripCommas(num) {
		var patt = /[^0-9\.]/g;
        var b = num.toString().replace(patt, "");
        return parseFloat(b);
    }
	function scrubInputText(num){
		var patt1 = /[^0-9\,\.]/g; 
		var str = num.toString().replace(patt1, "");
		return str;
	}
	function scrubZipCode(num){
		var patt2 = /[^0-9]/g;
		var str = num.toString().replace(patt2, "");
		return str;
	}
    function insertCommas(a) {
        if ((a >= 1000) || (a <= -1000)) {
            var b;
            var c;
            var d = 0;
            a = String(a);
            
            if ((d = a.indexOf(".", 0)) != -1) {
                b = a.substring(0, d);
                c = "." + a.substring(d + 1, a.length);
            } else {
                b = a;
                c = "";
            }
            
            if ((b.length > 3)) {
                var e = b.length % 3;
                var f = (e > 0 ? b.substring(0, e) : '');
                for (var i = 0; i < Math.floor(b.length / 3); i++) {
                    if ((e === 0) && (i === 0)) {
                            f += b.substring(e + 3 * i, e + 3 * i + 3);
                    } else {
                            f += ',' + b.substring(e + 3 * i, e + 3 * i + 3);
                    }
                }
                return f + c;
            } else {
                return a;
            }
        } else {
            return a;
        }
    }
	function calcMilesPerYear(milesPerWeek){
		return milesPerWeek * 52;
	}
	$('.hidden-content').slideUp({ duration: 250 });
	function displayZipError(a) {
        var b = $('calculator').zip;
        var c = $('zipError');
        if (!c) {
                b.insert({
                        after: '<span id="zipError" class="error"></span>'
                });
                c = $('zipError');
        }
        c.update(a);
        c.show();
    }
	
	function getterUsAvg(factor){
		var val = 0;
		
		switch (factor) {
			case 0:                     
				val = g_NAT_GAS_AVG_EMISSIONS_PER_PERSON * numPeople;
				break;
			case 1:                    
				val = g_ELEC_AVG_EMISSIONS_PER_PERSON * numPeople;
				break;
			case 2:       
				val = g_FUEL_OIL_AVG_EMISSIONS_PER_PERSON * numPeople;
				break;
			case 3:              
				val = g_PROPANE_AVG_EMISSIONS_PER_PERSON * numPeople;
				break;
			case 4:              
				val = g_AVG_EMISSIONS_PER_VEHICLE * numVehicles;
				break;
			case 5:
				val = g_WASTE_AVG_PER_PERSON * numPeople;
				break;
			default:
				break;
		}
		return val;
    }
	function displayUsAvg(){
		$("#good-work").addClass("displayNone");
		
		var totalAvg=0;
		usAvgTotals[0]=0;
		
		for (var idx=0; idx<usAvg.length;idx++){
			if (usAvg[idx] == 1) {
				totalAvg += getterUsAvg(idx);             //  calculate/recalculate the average
				
				if (idx==4) {                              //  transportation
					usAvgTotals[1] = getterUsAvg(idx);
				}
				else if (idx==5) {                         //  waste
					usAvgTotals[2] = getterUsAvg(idx);
				}
			}
			if (idx==3) {
				usAvgTotals[0]=totalAvg;                        //  0-3 are the Utilities
			}
		}
		usAvgTotals[4] = totalAvg;
		 
		//  Show on Report
		$("#us-avg .rowChart .rowItems .homeEnergyCharItem").attr("title",insertCommas(Math.round(usAvgTotals[0]))+" lbs.");
		$("#us-avg .rowChart .rowItems .transportationCharItem").attr("title",insertCommas(Math.round(usAvgTotals[1]))+" lbs.");
		$("#us-avg .rowChart .rowItems .wasteCharItem").attr("title",insertCommas(Math.round(usAvgTotals[2]))+" lbs.");
	
		$('.uS_avg').html(insertCommas(Math.round(usAvgTotals[4])));  // display
		
		if (grandEmissionsTotal < usAvgTotals[4]) {
			$("#good-work").removeClass("displayNone");
		}
	}

	function displayErrorMessages(){
            var hasAnError = false;
            $("#errorMessageBox").addClass("displayNone");

            $("#errorMessageBox ul li").each(function(idx) {
                if (!$(this).hasClass("displayNone")) {
                    $("#errorMessageBox").removeClass("displayNone");
                    hasAnError = true;
                }
            });
            if ( hasAnError ) $("#errorMessageBox").dialog("open");
	}

	function reportButtonDisplay(){
		var w = 0;
		
		while (progressBarTotals[w] > 0){
			w++;
			if (w==3) {
				$("#view-full-report").removeClass("secondary-btn").addClass("primary-btn");
				$("#to-report").removeClass("secondary-btn").addClass("primary-btn");
			}
		}
	}
	function displayHomeProgressBar(){             //  keep track of what factors the User has considered
		var segment = 100 / homeProgress.length;
		var theTotal = 0;

		for (var x = 0; x<homeProgress.length;x++) {
			if (homeProgress[x] == 1) {
				theTotal += segment;
			}
		}
		progressBarTotals[0] = theTotal;
		
		reportButtonDisplay();

		$('#homeEnergyProgressBar').attr('value', theTotal);
	    $("#homeEnergyProgressBar_IE").css("width",theTotal+"%");
	}
	function setterHeatSource(){
	    var current = heatSource.toString();
	    heatSource = $('#primaryHeatingSource').val().toString();

	    if (current === "") {
	        homeProgress[0] = 1;
			displayHomeProgressBar();
	    }
		else if (heatSource != current){
			if (heatSource == "Electricity") {
				calcElectric();
			}
			else if (heatSource == "Natural Gas") {
				calcNaturalGas();
			}
			else if (heatSource == "Fuel Oil") {
				calcFuelOil();
			}
			else if (heatSource == "Propane") {
				calcPropane();
			}
			
			if (userRevisedTotalEmissions[7][0] !== 0) {
				calcFurnace();
			}
			if (userRevisedTotalEmissions[8][0] !== 0) {
				calcWindows();
			}
	    }
	}
	function getterHeatSource(){
	    if (heatSource !== ""){
			$("#error-primary-heat").removeClass("errorMsg").addClass("displayNone");
			displayErrorMessages();
			return true;
	    }
	    else{
			$("#error-primary-heat").removeClass("displayNone").addClass("errorMsg");
			displayErrorMessages();
			return false;
	    }
	}
	function calcNaturalGas() {
		if (getterHeatSource()) {      //  Must enter a Heat Source first
			var gasInput = stripCommas($('#naturalGasTextInput').val());
			var gasSelect = $('#naturalGasSelectInput').val();
			var natGas = 0;
			
			if (gasSelect == "Dollars") {
				natGas = (gasInput / g_AVG_NAT_GAS_PRICE_PER_THOUSAND_CUBIC_FEET) * g_NAT_GAS_CUBIC_FEET_EMISSIONS_FACTOR * g_NUM_MONTHS_PER_YEAR;
			}
			else if (gasSelect == "Thousand Cubic Feet") {
				natGas = g_NAT_GAS_CUBIC_FEET_EMISSIONS_FACTOR * gasInput * g_NUM_MONTHS_PER_YEAR;
			}
			else if (gasSelect == "Therms") {
				natGas = g_NAT_GAS_THERMS_EMISSIONS_FACTOR * gasInput * g_NUM_MONTHS_PER_YEAR;
			}

			if (natGas >= 0) {
				homeProgress[1] = 1;         
				
				if (natGas > 0) {
					usAvg[0] = 1;   //  1 essentially means True for the function to add the US Avg for comparison and update page
				}
			}
			else {
				natGas = 0;     //  Catches NaN, "", and other non-numbers
				usAvg[0] = 0;   //  remove the US Avg and update page
				homeProgress[1] = 0;
			}
			
			$('.naturalGas .green-lb-total span').html(insertCommas(Math.round(natGas)));
			
			userTotalEmissions[0] = natGas;
			setterTotalEmissions();
			displayHomeProgressBar();
			displayUsAvg();
			
			if (grandReductionTotal > 0){
				if (userRevisedTotalEmissions[0][0] !== 0 && heatSource == "Natural Gas") {      //  this can only be reached when the user changes an initial entry
					calcWinterHeating();
				}
			}
		}
		else{
			document.getElementById("naturalGasTextInput").value = "";
		}
	}
	function calcElectric() {
		if (getterHeatSource()) {                                                //  Must enter a Heat Source first
			var electricInput = stripCommas($('#electricityTextInput').val());
			var elecSelect = $('#electricitySelectInput').val();
			var green_elec = stripCommas($('#electricityGreenTextInput').val());
			var elec;
			userTotalEmissions[1] = 0;
			
			
			if (isNaN(electricInput)) {
				document.getElementById("electricityTextInput").value = "";
				elec = 0;
				homeProgress[2] = 0;
				usAvg[1] = 0;
			}
			else{
				if (elecSelect == "Dollars") {
					elec = (electricInput / g_AVG_ELEC_PRICE_PER_KILOWATT) * g_eFactorValue * g_NUM_MONTHS_PER_YEAR;
				}
				else if (elecSelect == "kWh") {
					elec = electricInput * g_eFactorValue * g_NUM_MONTHS_PER_YEAR;
				}
				
				homeProgress[2] = 1;
				if (elec > 0) {
					usAvg[1] = 1;   //  1 essentially means True for the function to add the US Avg for comparison and update page
				}
			}

			userTotalEmissions[1] = elec;
			
			$('.electricity .green-lb-total span').html(insertCommas(Math.round(userTotalEmissions[1])));
				
											//  this can only be reached when the user changes an initial entry
			if (userRevisedTotalEmissions[0][0] !== 0 && heatSource == "Electricity") {    //  these need to be updated if electricity changes.
				calcWinterHeating();
			}
			if (userRevisedTotalEmissions[1][0] !== 0){
				calcSummerCooling();
			}
			if (userRevisedTotalEmissions[9][0] !== 0){
				calcGreenPower();
			}
			if (green_elec >= 0) {
				calcAlreadyGreenElec();
			}
			
			setterTotalEmissions();
			displayHomeProgressBar();
			displayUsAvg();
		}

		else{
			document.getElementById("electricityTextInput").value = "";
		}
	}
	
	function calcAlreadyGreenElec() {
		if (getterHeatSource()) {                                                //  Must enter a Heat Source first
			userRevisedTotalEmissions[23]=[0,0,0];
			var electricInput = stripCommas($('#electricityTextInput').val());
			$("#error-monthly-utility").removeClass("errorMsg").addClass("displayNone");
			var green_electricity = stripCommas($('#electricityGreenTextInput').val());
			var elec = userTotalEmissions[1];
			
			$("#error-monthly-electrical").removeClass("errorMsg").addClass("displayNone");
			
			if ( isNaN(green_electricity) || isNaN(electricInput) || (electricInput == undefined)){
				green_electricity = 0;
				
				if ((isNaN(electricInput) && electricInput == undefined)) {
					$("#error-monthly-electrical").removeClass("displayNone").addClass("errorMsg");
				}
				document.getElementById("electricityGreenTextInput").value = "";
			}
			
			var temp = elec;
			$('.currentGreenPwr').html(green_electricity);      // output in Report
			elec = elec * (1 - (green_electricity / 100));      // not considered for the Progress bar for really no good reason
			var eElec = Math.round(temp - elec);
			
			$('.currentGreenPwrCo2Saved').html(insertCommas(eElec));      // output in Report -- There are no $ savings - actually costs more.
			$('.electricity .green-lb-total span').html(insertCommas(Math.round(userTotalEmissions[1] - eElec)));
			
			if (green_electricity > 0) {
				userRevisedTotalEmissions[23]=[1,Math.abs(eElec),0];
			}
			
			if (userRevisedTotalEmissions[9][1] !== 0) {                 //  these need to be updated if green electricity changes.
				if (userRevisedTotalEmissions[9][1] < userRevisedTotalEmissions[23][1]){
					document.getElementById("increaseGreenInput").value = "";
				}
				calcGreenPower();
			}
		}
		else{
			document.getElementById("electricityGreenTextInput").value = "";
		}	

		setterTotalEmissions();
		displayErrorMessages();
	}

	function calcFuelOil() {
		if (getterHeatSource()) {
			var fuelOilInput = stripCommas($('#fuelTextInput').val());
			var fuelOilSelect = $('#fuelSelectInput').val();
			var fuelOil = 0;
			
			if (fuelOilSelect == "Dollars") {
			  fuelOil = (fuelOilInput / g_AVG_FUEL_OIL_PRICE_PER_GALLON) * g_FUEL_OIL_EMISSIONS_FACTOR * g_NUM_MONTHS_PER_YEAR;
			}
			else if (fuelOilSelect == "Gallons") {
			  fuelOil = g_FUEL_OIL_EMISSIONS_FACTOR * fuelOilInput * g_NUM_MONTHS_PER_YEAR;
			}
			
			if (fuelOil >= 0) {
				homeProgress[3] = 1;
				
				if (fuelOil > 0) {
					usAvg[2] = 1;   //  1 essentially means True for the function to add the US Avg for comparison and update page
				}
			}
			else {
				fuelOil = 0;
				usAvg[2] = 0;
				homeProgress[3] = 0;
			}
			
			$('.fuel .green-lb-total span').html(insertCommas(Math.round(fuelOil)));
			
			userTotalEmissions[2] = fuelOil;
			setterTotalEmissions();
			
			displayHomeProgressBar();
			displayUsAvg();
			
			if (grandReductionTotal > 0){                                                      //  this can only be reached when the user changes an initial entry
				if (userRevisedTotalEmissions[0][0] !== 0 && heatSource == "Fuel Oil") {
					calcWinterHeating();
				}
			}
		}
		else{
			$('#fuelTextInput').value = "";
		}
	}
	function calcPropane() {
		if (getterHeatSource()) {
			var propaneInput = stripCommas($('#propaneTextInput').val());
			var propaneSelect = $('#propaneSelectInput').val();
			var prop = 0;
			if (propaneSelect == "Dollars") {
				prop = (propaneInput / g_AVG_PROPANE_PRICE_PER_GALLON) * g_PROPANE_EMISSIONS_FACTOR * g_NUM_MONTHS_PER_YEAR;
			}
			else if (propaneSelect == "Gallons") {
				prop = g_PROPANE_EMISSIONS_FACTOR * propaneInput * g_NUM_MONTHS_PER_YEAR;
			}
			
			if (prop >= 0) {
				homeProgress[4] = 1;
				
				if (prop > 0) {
					usAvg[3] = 1;              //  1 essentially means True for the function to add the US Avg for comparison and update page
				}
			}
			else {
				prop = 0;
				usAvg[3] = 0;
				homeProgress[4] = 0;
			}
			
			$('.propane .green-lb-total span').html(insertCommas(Math.round(prop)));
			
			userTotalEmissions[3] = prop;
			setterTotalEmissions();
			
			displayHomeProgressBar();
			displayUsAvg();
			
			if (grandReductionTotal > 0){                                                      //  this can only be reached when the user changes an initial entry
				if (userRevisedTotalEmissions[0][0] !== 0 && heatSource == "Propane") {
					calcWinterHeating();
				}
			}
		}
		else{
			$('#propaneTextInput').value = "";
		}
	}
	
	function calcWinterHeating() {
		if (getterHeatSource()) {
			$("#error-monthly-utility").removeClass("errorMsg").addClass("displayNone");
			
			var utilityInput;
			var utilityUnit;
			var greenTotal;
			var utilityFactor;
			var utilityFactorPrice = 1;
			userRevisedTotalEmissions[0]=[0,0,0];
			homeProgress[5] = 0;
			
			if (heatSource == "Electricity") {
				utilityInput = stripCommas($('#electricityTextInput').val());
			}
			else if (heatSource == "Natural Gas") {
				utilityInput = stripCommas($('#naturalGasTextInput').val());
			}
			else if (heatSource == "Fuel Oil") {
				utilityInput = stripCommas($('#fuelTextInput').val());
			}
			else if (heatSource == "Propane") {
				utilityInput = stripCommas($('#propaneTextInput').val());
			}
			
			if (utilityInput > 0) {
				var winterHeat = stripCommas($('#energyHeat').val());
			
				if (winterHeat > 0) {
					// Get user input data from Utility for calculations
					if (heatSource == "Electricity") {
						greenTotal = userTotalEmissions[1];
						utilityUnit = $('#electricitySelectInput').val();
						utilityFactor = g_PERCENT_ELEC_TO_HEATING;
						
						if (utilityUnit == 'kWh') {
							utilityFactorPrice = g_AVG_ELEC_PRICE_PER_KILOWATT;
						}
					}
					else if (heatSource == "Natural Gas") {
						greenTotal = userTotalEmissions[0];
						utilityUnit = $('#naturalGasSelectInput').val();
						utilityFactor = g_PERCENT_NAT_GAS_TO_HEATING;
						
						if (utilityUnit == 'Therms') {
							utilityFactorPrice = g_AVG_NAT_GAS_PRICE_PER_THERM;
						} else if (utilityUnit != 'Dollars' && utilityUnit != 'Therms'){
							utilityFactorPrice = g_AVG_NAT_GAS_PRICE_PER_THOUSAND_CUBIC_FEET;
						}
					}
					else if (heatSource == "Fuel Oil") {
						greenTotal = userTotalEmissions[2];
						utilityUnit = $('#fuelSelectInput').val();
						utilityFactor = g_PERCENT_FUEL_OIL_TO_HEATING;
						  
						if (utilityUnit == 'Gallons') {
							utilityFactorPrice = g_AVG_FUEL_OIL_PRICE_PER_GALLON;
						}
					}
					else if (heatSource == "Propane") {
						greenTotal = userTotalEmissions[3];
						utilityUnit = $('#propaneSelectInput').val();
						utilityFactor = g_PERCENT_PROPANE_TO_HEATING;
						
						if (utilityUnit == 'Gallons') {
							utilityFactorPrice = g_AVG_PROPANE_PRICE_PER_GALLON;
						}
					}
							
					var dollarsSavedWinter = utilityInput * utilityFactor * utilityFactorPrice * g_HEATING_SAVINGS_PER_DEGREE_OF_SETBACK * winterHeat * g_NUM_MONTHS_PER_YEAR;
					var amountSavedWinter = greenTotal  * utilityFactor  * g_HEATING_SAVINGS_PER_DEGREE_OF_SETBACK * winterHeat;
					
					if (amountSavedWinter > 0) {
						homeProgress[5] = 1;
					}
					userRevisedTotalEmissions[0]=[2,amountSavedWinter,dollarsSavedWinter];
				}
				else{
					document.getElementById("energyHeat").value = "";
				}
			}
			else{
				$("#error-monthly-utility").html("You must have an entry for Monthly "+heatSource+" bill.");
				$("#error-monthly-utility").removeClass("displayNone").addClass("errorMsg");
				
				document.getElementById("energyHeat").value = "";
			}
				
			$('.heat-energy-dollars-saved').html(insertCommas(Math.round(userRevisedTotalEmissions[0][2])));
			$('.heat-energy-co2-saved').html(insertCommas(Math.round(userRevisedTotalEmissions[0][1])));
			$('.heat-temp').html(insertCommas(Math.round(winterHeat)));                //  shows on the report page
			
			setterRevisedEmissions();
			displayHomeProgressBar();
		}
		else{                             //  need an entry for Heat Source
			document.getElementById("energyHeat").value = "";
		}
		displayErrorMessages();
    }
	function calcSummerCooling() {
		var utilityInput;
		var utilityUnit;
		var utilityFactor;
		var utilityFactorPrice = 1;
		userRevisedTotalEmissions[1] = [0,0,0];
		homeProgress[6] = 0;
		
		var elecTotal = stripCommas(userTotalEmissions[1]);  //  $('.electricity .green-lb-total span').val()
		
		if (elecTotal > 0) {
			$("#error-monthly-electrical").removeClass("errorMsg").addClass("displayNone");
			
			var summerAC = stripCommas($('#energyAC').val());
			
			if (isNaN(summerAC)) {
				document.getElementById("energyAC").value = "";
			}
			else {
				utilityInput = stripCommas($('#electricityTextInput').val());
				utilityUnit = $('#electricitySelectInput').val();
				utilityFactor = g_PERCENT_ELEC_TO_COOLING;
				
				if (utilityUnit == 'kWh') {
					utilityFactorPrice = g_AVG_ELEC_PRICE_PER_KILOWATT;
				}
				
				var amountSavedSummer = elecTotal * utilityFactor * g_COOLING_SAVINGS_PER_DEGREE_OF_SETBACK * summerAC;
				var dollarsSavedSummer = utilityInput * utilityFactor * utilityFactorPrice * g_COOLING_SAVINGS_PER_DEGREE_OF_SETBACK * summerAC * g_NUM_MONTHS_PER_YEAR;
				
				homeProgress[6] = 1;
				userRevisedTotalEmissions[1]=[2,amountSavedSummer,dollarsSavedSummer];
				
				$('.ac-temp').html(insertCommas(Math.round(summerAC)));      //  shows on the report page
			}
		}
		else{
			$("#error-monthly-electrical").removeClass("displayNone").addClass("errorMsg");
			document.getElementById("energyAC").value = "";
		}
		$('.ac-energy-dollars-saved').html(insertCommas(Math.round(userRevisedTotalEmissions[1][2])));
		$('.ac-energy-co2-saved').html(insertCommas(Math.round(userRevisedTotalEmissions[1][1])));
		
		displayErrorMessages();
		setterRevisedEmissions();
		displayHomeProgressBar();
    }
	function calcReplaceBulbs() {
		var elecTotal = userTotalEmissions[1];
		homeProgress[7] = 0;
		userRevisedTotalEmissions[2] = [0,0,0];
		
		var bulbInput = parseInt($('#lightsToReplace').val());

		if (isNaN(bulbInput)) {
			document.getElementById("lightsToReplace").value = "";
		}
		else{
			var co2Saved = bulbInput * g_LAMP_KWH_SAVINGS * g_eFactorValue;
			var dollarsSaved = bulbInput * g_LAMP_DOLLAR_SAVINGS;

			homeProgress[7] = 1;
			userRevisedTotalEmissions[2]=[2,co2Saved,dollarsSaved];
		
			$('.numBulb').html(insertCommas(Math.round(bulbInput)));
		}

		$('.lightEnergyDollarsSaved').html(Math.round(userRevisedTotalEmissions[2][2]));
		$('.lightEnergyCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[2][1])));
		
		setterRevisedEmissions();
		displayHomeProgressBar();
	}
	function calcComputerPower() {
		homeProgress[8] = 1;
		$('#pwrMgmtSelect').parent().next('.mobile-hook').children('div').css('color','#333').parent().next('.mobile-hook').children('div').css('color','#333');
		
		var userSelect = $('#pwrMgmtSelect').val();
		
		if (userSelect != 'Will Not Do') {
			var co2Saved = g_COMPUTER_SLEEP_SAVINGS * g_eFactorValue;
			var dollarsSaved = g_COMPUTER_SLEEP_SAVINGS * g_AVG_ELEC_PRICE_PER_KILOWATT;
			
			userRevisedTotalEmissions[3]=[2,co2Saved,dollarsSaved];
			
			if (userSelect == 'Already Done') {
				userRevisedTotalEmissions[3][0]=1;
				$('#pwrMgmtSelect').parent().next('.mobile-hook').children('div').css('color','#aaa').parent().next('.mobile-hook').children('div').css('color','#aaa');
			}
		}
		else if (userSelect == 'Will Not Do') {
			userRevisedTotalEmissions[3] = [0,0,0];
		}

		$('.computerPwrDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[3][2])));
		$('.computerPwrCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[3][1])));
		
		setterRevisedEmissions();	
		displayHomeProgressBar();
	}
	function calcGreenPower(){
		$("#error-monthly-electrical").removeClass("errorMsg").addClass("displayNone");
		
		userRevisedTotalEmissions[9] = [0,0,0];                                                        // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		homeProgress[9] = 0;
		
		if (userTotalEmissions[1] >= 0) {
			var rev_green_electricity = $('#increaseGreenInput').val();   // get user's input
			//if ((rev_green_electricity == null) || (rev_green_electricity == undefined) || (rev_green_electricity == "")) {

			if ((isNaN(rev_green_electricity)) || (rev_green_electricity == "")) {
				document.getElementById("increaseGreenInput").value = "";
			}
			else if (rev_green_electricity >= 0) {
				homeProgress[9] = 1;
				
				if (rev_green_electricity > 0) {
					var rev_elec = userTotalEmissions[1] * (1 - (rev_green_electricity / 100));          //  = elec * (1 - (green_electricity / 100));
					var co2Saved = userTotalEmissions[1] - rev_elec;
					userRevisedTotalEmissions[9]=[2,co2Saved,0];
				}
			}
		}
		else{
			$("#error-monthly-electrical").removeClass("displayNone").addClass("errorMsg");
			document.getElementById("increaseGreenInput").value = "";
		}
		
		$('.increaseGreenPwr').html(rev_green_electricity);   // output to report
		$('.increaseGreenPwrCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[9][1])));
		
		displayErrorMessages();
		setterRevisedEmissions();
		displayHomeProgressBar();
	}
	function calcColdWater() {
		var userInput = stripCommas($('#loadsPerWeek').val());
		var userSelect = $('#coldWaterSelect').val();
		userRevisedTotalEmissions[4]=[0,0,0];
		homeProgress[10] = 0;
		
		if (userSelect !== ""){
			$('#coldWaterSelect').parent('td').next('.mobile-hook').children('div').css('color','#333').parent().next('.mobile-hook').children('div').css('color','#333');
			
			if (isNaN(userInput)) {
				$('#loadsPerWeek').html('');
			}
			else{
				if (userInput > 0 && userSelect != 'Will Not Do') {
					co2Saved = g_KWH_PER_LOAD_LAUNDRY * g_NUM_WEEKS_PER_YEAR * userInput * g_eFactorValue;
					dollarsSaved = g_KWH_PER_LOAD_LAUNDRY * g_AVG_ELEC_PRICE_PER_KILOWATT * userInput * g_NUM_WEEKS_PER_YEAR;
					userRevisedTotalEmissions[4]=[2,co2Saved,dollarsSaved];                   //  userSelect == 'Will Do'
				
					if (userSelect == 'Already Done') {
						$('#coldWaterSelect').parent().next('.mobile-hook').children('div').css('color','#aaa').parent().next('.mobile-hook').children('div').css('color','#aaa');
						userRevisedTotalEmissions[4][0] = 1;
					}
				}
				homeProgress[10] = 1;
			}
		}
		$('.coldWaterDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[4][2])));
		$('.coldWaterCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[4][1])));
		
		setterRevisedEmissions();
		displayHomeProgressBar();
	}
	function calcDryer() {
		var userSelect = $('#AirDrySelect').val();
		
		if (userSelect !== "") {
			userRevisedTotalEmissions[5]=[0,0,0];
			var percentSelect = $('#percentageAirDrySelect').val();
			homeProgress[11] = 1;
			var co2Saved;
			var dollarsSaved;
			var loadFactor=0;
			
			$('#AirDrySelect').parent().next('.mobile-hook').children('div').css('color','#333').parent().next('.mobile-hook').children('div').css('color','#333');
			
			if (userSelect != 'Will Not Do') {				
				if (percentSelect == 'All my Laundry') {
					loadFactor = 1;
				}
				else if (percentSelect == '50% of my Laundry') {
					loadFactor = 0.50;
				}
				else if (percentSelect == '20% of my Laundry') {
					loadFactor = 0.20;
				}
				else if (percentSelect == '10% of my Laundry') {
					loadFactor = 0.10;
				}
					
				dollarsSaved = g_DRYER_SAVINGS * g_AVG_ELEC_PRICE_PER_KILOWATT * loadFactor;
				co2Saved = g_DRYER_SAVINGS * g_eFactorValue * loadFactor;
				
				userRevisedTotalEmissions[5]=[2,co2Saved,dollarsSaved];
				
				if (userSelect == 'Already Done') {
					$('#AirDrySelect').parent('td').next('.mobile-hook').children('div').css('color','#aaa').parent().next('.mobile-hook').children('div').css('color','#aaa');
					userRevisedTotalEmissions[5][0]=[1];
				}
			}
			var str = (loadFactor * 100).toString() + "%";
				
			$('.airDryDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[5][2])));
			$('.airDryCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[5][1])));
			$('.airDryPercent').html(str);
			
			setterRevisedEmissions();
			displayHomeProgressBar();
		}
	}
	function calcRefrigerator() {
		var userSelect = $('#fridgeSelect').val();
		homeProgress[12] = 1;
		userRevisedTotalEmissions[6]=[0,0,0];
		var co2Saved;
		var dollarsSaved;
		
		$('#fridgeSelect').parent().next('.mobile-hook').children('div').css('color','#333').parent().next('.mobile-hook').children('div').css('color','#333');
		
		if (userSelect != 'Will Not Do') {                //  shows calculations only for Will Do and Already Done
			dollarsSaved = g_FRIDGE_REPLACE_KWH_SAVINGS * g_AVG_ELEC_PRICE_PER_KILOWATT;
			co2Saved = g_FRIDGE_REPLACE_KWH_SAVINGS * g_eFactorValue;

			userRevisedTotalEmissions[6]=[2,co2Saved,dollarsSaved];

			if (userSelect == 'Already Done') {
				$('#fridgeSelect').parent().next('.mobile-hook').children('div').css('color','#aaa').parent().next('.mobile-hook').children('div').css('color','#aaa');
				userRevisedTotalEmissions[6][0]=1;
			}
		}
		$('.fridgeDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[6][2])));
		$('.fridgeCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[6][1])));
		
		setterRevisedEmissions();
		displayHomeProgressBar();
	}
	function calcFurnace(){
		if (getterHeatSource()) {      //  must have a heat source set
			userRevisedTotalEmissions[7]=[0,0,0];
			homeProgress[13] = 1;
			var utility=0;
			
			$("#error-bill-primary-heat").removeClass("errorMsg").addClass("displayNone");
			$('#furnaceSelect').parent().next('.mobile-hook').children('div').css('color','#333').parent().next('.mobile-hook').children('div').css('color','#333');
			
			if (heatSource == "Electricity" || heatSource == "Propane") {
				$('#furnaceSelect').val("");
			}
			else{
				if (heatSource == "Natural Gas") {
					utility = userTotalEmissions[0];
				}
				else if (heatSource == "Fuel Oil") {
					utility = userTotalEmissions[2];
				}
							
				if (utility === 0 || isNaN(utility)){
					$("#error-bill-primary-heat").html("Error: Please enter your an average monthly bill for your Primary Heating Source, "+heatSource+" first.");
					$("#error-bill-primary-heat").removeClass("displayNone").addClass("errorMsg");
					
					$('#furnaceSelect').val("");            // reset the select box
				}
				else{
					var userSelect = $('#furnaceSelect').val();
					var co2Saved=0;
					var dollarsSaved = 0;
			
					if (userSelect != 'Will Not Do') {
						if (heatSource == "Natural Gas") {
							co2Saved = g_BOILER_REPLACE_SAVINGS_NAT_GAS;
							dollarsSaved = g_BOILER_REPLACE_COST_SAVINGS;
						}
						else if (heatSource == "Fuel Oil") {
							co2Saved = g_BOILER_REPLACE_SAVINGS_FUEL_OIL;
							dollarsSaved = g_BOILER_REPLACE_COST_SAVINGS;
						}
					
						userRevisedTotalEmissions[7]=[2,co2Saved,dollarsSaved];
				
						if (userSelect == 'Already Done') {
							$('#furnaceSelect').parent().next('.mobile-hook').children('div').css('color','#aaa').parent().next('.mobile-hook').children('div').css('color','#aaa');
							userRevisedTotalEmissions[7][0]=1;
						}
					}
				}
			}
			
			$('.furnaceDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[7][2])));
			$('.furnaceCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[7][1])));
			
			displayErrorMessages();
			setterRevisedEmissions();
			displayHomeProgressBar();
		}
		else {
			$('#furnaceSelect option').prop('selected', function(){
				return this.defaultSelected;
			});
		}
	}
	function calcWindows(){
		if (getterHeatSource()) {
			userRevisedTotalEmissions[8]=[0,0,0];
			homeProgress[14] = 1;
			var userSelect=$('#windowSelect').val();
			var co2Saved = 0;
			var dollarsSaved = 0;
			homeProgress[14] = 1;

			$('#windowSelect').parent().next('.mobile-hook').children('div').css('color','#333').parent().next('.mobile-hook').children('div').css('color','#333');
			
			if (userSelect != 'Will Not Do') {
				if (heatSource == "Electricity") {
					co2Saved = g_eFactorValue*(g_SWITCH_WINDOWS_SAVINGS / g_BTU_PER_KWH);
				} else if (heatSource == "Natural Gas") {
					co2Saved = g_SWITCH_WINDOWS_SAVINGS / g_BTU_PER_1000CF_NAT_GAS * g_NAT_GAS_CUBIC_FEET_EMISSIONS_FACTOR;
				} else if (heatSource == "Fuel Oil") {
					co2Saved = g_SWITCH_WINDOWS_SAVINGS / g_BTU_PER_GALLON_FUEL_OIL * g_FUEL_OIL_EMISSIONS_FACTOR;
				} else if (heatSource == "Propane") {
					co2Saved = g_SWITCH_WINDOWS_SAVINGS / g_BTU_PER_GALLON_PROPANE * g_PROPANE_EMISSIONS_FACTOR;
				}
				dollarsSaved = g_WINDOW_REPLACE_COST_SAVINGS;
				userRevisedTotalEmissions[8]=[2,co2Saved,dollarsSaved];
				
				if (userSelect == 'Already Done') {
					$('#windowSelect').parent().next('.mobile-hook').children('div').css('color','#aaa').parent().next('.mobile-hook').children('div').css('color','#aaa');
					userRevisedTotalEmissions[8][0]=1;
				}
			}				
			$('.windowDollarsSaved').html(insertCommas(Math.round(dollarsSaved)));
			$('.windowCo2Saved').html(insertCommas(Math.round(co2Saved)));
			
			setterRevisedEmissions();
			displayHomeProgressBar();
		}
	}
	
	function setterVehicleNum(){
		revNumVehicles = $('#numVehiclesInput').val();
		originalVehicleNumber = numVehicles;
		numVehicles = revNumVehicles.valueOf();
		displayUsAvg();
				
		if (originalVehicleNumber > revNumVehicles) {
			for(var x=originalVehicleNumber; x>revNumVehicles;x--){
				$('#vehicle'+x).addClass('displayNone');
				$('#revVehicle'+x).addClass('displayNone');
			
				document.getElementById("vehicle"+x+"Miles").value = "";                                    //  empties the inputs
				document.getElementById("vehicle"+x+"GasMileage").value = "";
				
				$(".vehicle"+x+"Co2").html("0");
				$(".vehicleInfo"+x).html("");
				
				document.getElementById("reduceMilesInput"+x).value = "";
				$(".reduceMilesVehicle"+x+"Dollars").html("0");
				$(".reduceMilesVehicle"+x+"Co2").html("0");
				
				document.getElementById("replaceVehicleInput"+x).value = "";
				$(".replaceVehicle"+x+"Dollars").html("0");
				$(".replaceVehicle"+x+"Co2").html("0");
				
				//calcSavings(x);
				calcMilesSavings(x);
				calcMpgSavings(x);
				calcVehicleEmissions(x);
			}
		}
		else if (originalVehicleNumber < revNumVehicles) {
			for (var y = parseInt(originalVehicleNumber)+1; y <= revNumVehicles; y++){
				$('#vehicle'+y).removeClass('displayNone');
				$('#revVehicle'+y).removeClass('displayNone');
				userRevisedTotalEmissions[ ((y+10) + (y-1)) ] = [0,0,0];
				userRevisedTotalEmissions[ ((y+10) + (y)) ] = [0,0,0];
			}
		}
		setterMaintenance();
		displayVehicleProgressBar();
	}
	function displayVehicleProgressBar(){
		var segment = 100 / (numVehicles * 3 + 1);
		var theTotal = 0;

		if (parseInt(numVehicles) === 0) {
			theTotal=100;
		}
		else {
			//alert("V Prog Bar: "+vehicleData[0][2]+" : "+revisedVehicleData[0][1]+" : "+revisedVehicleData[0][3]+" : "+userRevisedTotalEmissions[10][0]);
			//alert("V Prog Bar: "+revisedVehicleData[idx][1]+" : "+revisedVehicleData[idx][3]+" : "+userRevisedTotalEmissions[10][0]);
			//alert("V Prog Bar: "+vehicleData[idx][2]+" : "+userRevisedTotalEmissions[10][0]);
			
			for (var idx=0; idx<numVehicles; idx++){				
				if (!isNaN(vehicleData[idx][2])) {
					theTotal += segment;
				}
				//alert("segment1: "+theTotal);
				var newMiles = $('#reduceMilesInput' + (idx+1)).val();         //  rev miles output
				
				if (newMiles != "") {     //  rev miles output
					theTotal += segment;
				}
				//alert("segment2: "+theTotal);
				var newMpg = $('#replaceVehicleInput' + (idx+1)).val();
				
				if (newMpg != "") {     //  rev mpg output
					theTotal += segment;
				}
				//alert("segment3: "+theTotal);
			}
			if (!isNaN(userRevisedTotalEmissions[10][0])) {        // Maintenance: any response is accepted
				//alert("this: "+userRevisedTotalEmissions[10][0]);
				theTotal += segment;
			}
			//alert("segment4: "+theTotal);
		}
		
		progressBarTotals[1] = theTotal;
		reportButtonDisplay();
		
		$('#transportationProgressBar').attr('value', theTotal);
	    $("#transportationProgressBar_IE").css("width",theTotal+"%");
	}
    function calcVehicleExhaust(miles,mpg){
		var exhaust=0;
		exhaust = miles / mpg * g_CO2_EMITTED_PER_GALLON_OF_GASOLINE * g_NONCO2_EMITTED_PER_GALLON_OF_GASOLINE;
		
		if (isNaN(exhaust)) {
			exhaust = 0;
		}
		
		return exhaust;
	}
	function calcVehicleEmissions(id){
		$("#error-current-maintenance").removeClass("errorMsg").addClass("displayNone");
		
		var x = parseInt(id);
		var mileChecker = $('#vehicle' + x + 'Miles').val();
		var mpgChecker = $('#vehicle'+x+'GasMileage').val();

		if ((maintCurrentSelect != "") || (mileChecker === "" && mpgChecker === "")) {
			//alert("got in This far: "+mileChecker+" : " + mpgChecker);
			if ((mileChecker != "" && mpgChecker != "")) {
				//alert("got all the way in: "+mileChecker+" : " + mpgChecker);
				var miles = scrubInputText(mileChecker);               //  check for non number related characters
				document.getElementById('vehicle'+x+'Miles').value = miles;           //  if input contained non number related characters show revised number to user
				miles = stripCommas(miles);
				if ($('#vehicle'+x+'Select').val() == "Per Week") {                           // convert miles per week to miles per year first
					miles = calcMilesPerYear(miles);
				}
	
				var mpg = scrubInputText(mpgChecker);
				document.getElementById('vehicle'+x+'GasMileage').value = mpg;
				mpg = stripCommas(mpg);
				
				if (!isNaN(miles) && !isNaN(mpg)) {                     //  if the user enters 0 exhaust is NaN
					var exhaust = calcVehicleExhaust(miles,mpg);
					
					if (maintCurrentSelect == "Do Not Do") {
						exhaust = exhaust * 1.04;
					}
				}
				else{
					exhaust = 0;
				}
				
				vehicleData[x-1][0] = miles;
				vehicleData[x-1][1] = mpg;
				vehicleData[x-1][2] = exhaust;
				
				if (isNaN(miles)) {      //  prevents showing NaN to user in Reduction
					miles=0;
				}
				if (isNaN(mpg)) {      //  prevents showing NaN to user in Reduction
					mpg=0;
				}
				
				$('.vehicleInfo'+x).html(insertCommas(miles) + ' miles/year, avg. ' + mpg + ' MPG');      //  display in Reduction
				$('.vehicle'+x+'Co2').html(insertCommas(Math.round(exhaust)));      //  display computed emission
		
				setterVehicleEmissions();
			}
		}
		else{
			//alert("this message 1");
			$("#error-current-maintenance").removeClass("displayNone").addClass("errorMsg");
			
			document.getElementById("vehicle" + id + "Miles").value = "";
			document.getElementById("vehicle" + id + "GasMileage").value = "";
		}
		displayErrorMessages();
	}
	function setterVehicleEmissions(){
		var total=0;

		for(var x=0;x<numVehicles;x++){
			if (!isNaN(vehicleData[x][2])) {            //  Add up all the exhaust output for all vehicles
				total+= vehicleData[x][2];
			}
		}

		if (revisedVehicleData[x-1] != undefined) {
			if (!isNaN(revisedVehicleData[x-1][0]) || !isNaN(revisedVehicleData[x-1][1]) || !isNaN(revisedVehicleData[x-1][2]) || !isNaN(revisedVehicleData[x-1][3])) {			//  Reset the Reduce section if filled out
				//calcSavings(x);       //  recalculate the emissions
				calcMilesSavings(x);
				calcMpgSavings(x);
			}
		}
		
		calculateMaintenance();
		userTotalEmissions[4] = total;       //  add to overall total for display in aside
		setterTotalEmissions();
		displayVehicleProgressBar();
	}
	
	function calculateMaintenance(){
		var dollarsSaved=0;
		var exhaustSaved=0;
		var showErrorMsg = false;
		
		for (var x=0;x<numVehicles;x++){
			if (!(isNaN(vehicleData[x][0])) && !(isNaN(vehicleData[x][1]))) {      //  miles = vehicleData[x][0], mpg = vehicleData[x][1]
				dollarsSaved += calcVehicleCost(vehicleData[x][0], vehicleData[x][1]) * g_VEHICLE_EFFICIENCY_IMPROVEMENTS;
                exhaustSaved += calcVehicleExhaust(vehicleData[x][0], vehicleData[x][1]) * g_VEHICLE_EFFICIENCY_IMPROVEMENTS;
			}
		}
		
		userRevisedTotalEmissions[10][1] = exhaustSaved;
        userRevisedTotalEmissions[10][2] = dollarsSaved;
		
		if ((userRevisedTotalEmissions[10][0]==1) || (userRevisedTotalEmissions[10][0]==2)) {
			$('.maintenanceDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[10][2])));           // also shows on Report
			$('.maintenanceCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[10][1])));               // also shows on Report
			
			if (userRevisedTotalEmissions[10][0]==1) {
				$('.maintReducDollarsSaved').html(0);
				$('.maintReducCo2Saved').html(0);
			}
			else{
				$('.maintReducDollarsSaved').html(insertCommas(Math.round(userRevisedTotalEmissions[10][2])));
				$('.maintReducCo2Saved').html(insertCommas(Math.round(userRevisedTotalEmissions[10][1])));
			}
		}
		else{
			$('.maintReducDollarsSaved').html(0);
			$('.maintReducCo2Saved').html(0);
		}
		
		setterRevisedEmissions();
	}
	function setterMaintenance(){
		$("#error-maintenance").addClass("displayNone");
		$("#error-redo-maintenance").addClass("displayNone");
		$("#error-current-maintenance").removeClass("errorMsg").addClass("displayNone");

		if (numVehicles == "0") {
            $("#maintCurrent").addClass("displayNone");             //  hide the Maintenance question when there are zero cars.
			$('#maintCurrentSelect').val("");                        //  Return the Select back to to its initial state.
			$("#maintReduce").addClass("displayNone");               //  hide the Maintenance question when there are zero cars.
			$('#maintReduceSelect').val("");                        //  Return the Select back to to its initial state.
            $(".maintenanceDollarsSaved").html("0");
            $(".maintenanceCo2Saved").html("0");
		}
        else if ($("#maintCurrent").hasClass('displayNone')) {
            $("#maintReduce").removeClass("displayNone");                //  if numVehicles WAS 0 but not recalculating emissions
            $("#maintCurrent").removeClass("displayNone");
        }
        else{
            maintCurrentSelect= 'Do Not Do'; // $('#maintCurrentSelect').val();
            var reduceSelect= 'Will Not Do'; // $('#maintReduceSelect').val();
            
            if (maintCurrentSelect != "") {                                                //  Must select Current Maintenance first
                $("#maintReduce").removeClass("displayNone");                              //  Show bottom half
				
                if (maintCurrentSelect == 'Already Done') {
                    $("#maintReduce").addClass("displayNone");                              //  Hide bottom half
                    userRevisedTotalEmissions[10][0] = 1;                                   // 1 = Already Done
                }
				else if (maintCurrentSelect == 'Do Not Do') {
					if (reduceSelect == "Will Do"){
						userRevisedTotalEmissions[10][0] = 2;                                    // 2 = Will Do, 0 = Won't Do
						calculateMaintenance();
					}
					else if (reduceSelect == "Will Not Do"){
						userRevisedTotalEmissions[10][0] = 0;
						$(".maintenanceDollarsSaved").html("0");
						$(".maintenanceCo2Saved").html("0");
					}
					else{
						
						userRevisedTotalEmissions[10][0] = undefined;
						//alert("is undefined now: "+userRevisedTotalEmissions[10][0]);
					}
				}
				
				if (userRevisedTotalEmissions[10][1]>0 || reduceSelect == "") {
					for (var x=1;x<=numVehicles;x++){
						calcVehicleEmissions(x);                               //  Revise the Estimated Emissions for each vehicle
					}
				}
            }
            else if (maintCurrentSelect == "" && reduceSelect != "") {                                                               // if the user trys to select the Reduce Maintenance w/out doing the first section
				//alert("this message 2");
				$("#error-current-maintenance").removeClass("displayNone").addClass("errorMsg");
                document.getElementById("maintReduceSelect").value = "";
            }
        }
		displayErrorMessages();
		displayVehicleProgressBar();
	}
	
	function calcVehicleCost(miles,mpg){
		var cost=0;
		// convert miles per week to miles per year first
		cost = miles / mpg * g_AVG_GAS_PRICE_PER_GALLON;
		return cost;
	}
	
	function calcMilesSavings(id){
		$("#error-vehicle-reduction").removeClass("errorMsg").addClass("displayNone");
    
        var x = parseInt(id);
		var y = parseInt(revNumVehicles); //RAM
        var position1 = (x+10) + (x-1);                                       //  nice bit of simple algebra, huh?   Position is based on the vehicle ID
		var position2 = (x+10) + x;
		
		if ((vehicleData[x-1][2] === undefined) && (userRevisedTotalEmissions[position1][1] == 0) && (userRevisedTotalEmissions[position2][1] == 0) && numVehicles != 0 && y > x) {
            $("#error-vehicle-reduction").removeClass("displayNone").addClass("errorMsg");
            document.getElementById('reduceMilesInput' + x).value = '';
        }
        else{
			revisedVehicleData[x-1][0] = 0;     // dollar savings
			revisedVehicleData[x-1][1] = 0;     // CO2 savings
                
            if (!isNaN(vehicleData[x-1][2])) {
				var theMpg = 0;
				var newMiles = scrubInputText($('#reduceMilesInput' + x).val());         //  check for non number related characters
				document.getElementById('reduceMilesInput' + x).value = newMiles;
				newMiles = stripCommas(newMiles);                                          //  use the revised number of miles
				
				if (isNaN(newMiles)) {
					newMiles = 0;
				}
				if ($('#reduceMilesSelect' + x).val() == "Per Week") {
					newMiles = calcMilesPerYear(newMiles);
				}
				if (newMiles < vehicleData[x-1][0]) {
					//revisedVehicleData[x-1][0] = newMiles * g_AVG_COST_PER_MILE;      //   for revised miles
					var rev$Miles = newMiles * g_AVG_COST_PER_MILE;      //   for revised miles

					
				}
				
				if (isNaN(rev$Miles)) {      //   for revised miles
					rev$Miles=0;
				}
				
				revisedVehicleData[x-1][0] = rev$Miles;
				
				theMpg = revisedVehicleData[x-1][4];        // the revised MPG takes precedence.
				
				if ( theMpg === undefined) {
					theMpg = vehicleData[x-1][1];        // Or use the original MPG
				}
				
				//alert("calc exhaust: "+newMiles+" : "+theMpg);
				revisedVehicleData[x-1][1] = calcVehicleExhaust(newMiles,theMpg);      //   for revised miles
                
                if (isNaN(revisedVehicleData[x-1][1])) {      //   for revised miles
                    revisedVehicleData[x-1][1]=0;
                }
				
			}
			$('.reduceMilesVehicle' + x + 'Dollars').html(insertCommas(Math.round(rev$Miles)));      //   for revised miles
			$('.reduceMilesVehicle' + x + 'Co2').html(insertCommas(Math.round(revisedVehicleData[x-1][1])));      //   for revised miles
			
			userRevisedTotalEmissions[position1]=[2,revisedVehicleData[x-1][1],revisedVehicleData[x-1][0]];      //   for revised miles
			userRevisedTotalEmissions[position2]=[2,revisedVehicleData[x-1][3],revisedVehicleData[x-1][2]];
			
			if (revisedVehicleData[x-1][1]<=0) {      //   for revised miles
				userRevisedTotalEmissions[position1][0]=0;
			}
			if (revisedVehicleData[x-1][3]<=0) {
				userRevisedTotalEmissions[position2][0]=0;
			}
			
			
			setterRevisedEmissions();
			displayVehicleProgressBar();
        }
        displayErrorMessages();
    }

	function calcMpgSavings(id){
		$("#error-vehicle-reduction").removeClass("errorMsg").addClass("displayNone");
    
        var x = parseInt(id);
		var y = parseInt(revNumVehicles); //RAM

        var position1 = (x+10) + (x-1);                                       //  nice bit of simple algebra, huh?   Position is based on the vehicle ID
		var position2 = (x+10) + x;
		
		if ((vehicleData[x-1][2] === undefined) && (userRevisedTotalEmissions[position1][1] == 0) && (userRevisedTotalEmissions[position2][1] == 0) && numVehicles != 0 && y > x) {  //RAM: added && y > x
            $("#error-vehicle-reduction").removeClass("displayNone").addClass("errorMsg");
			document.getElementById('replaceVehicleInput' + x).value = '';
        }
        else{
			revisedVehicleData[x-1][2] = 0;     // dollar savings
			revisedVehicleData[x-1][3] = 0;     // CO2 savings
			revisedVehicleData[x-1][4];         // New car/revised MPG input
                    
            if (!isNaN(vehicleData[x-1][2])) {
				var newMpg = scrubInputText($('#replaceVehicleInput' + x).val());
                document.getElementById('replaceVehicleInput' + x).value = newMpg;
                revisedVehicleData[x-1][4] = stripCommas(newMpg);
                
                if (!(revisedVehicleData[x-1][4] > vehicleData[x-1][1])) {
                    revisedVehicleData[x-1][4] = vehicleData[x-1][1];
                }
				
				//revisedVehicleData[x-1][2] = calcVehicleCost(vehicleData[x-1][0], vehicleData[x-1][1]) - calcVehicleCost(vehicleData[x-1][0],newMpg);
				var rev$MPG = calcVehicleCost(vehicleData[x-1][0], vehicleData[x-1][1]) - calcVehicleCost(vehicleData[x-1][0],revisedVehicleData[x-1][4]);
				
				//revisedVehicleData[x-1][3] = calcVehicleExhaust(vehicleData[x-1][0], vehicleData[x-1][1]) - calcVehicleExhaust(vehicleData[x-1][0],newMpg);
				var revCO2mpg = calcVehicleExhaust(vehicleData[x-1][0], vehicleData[x-1][1]) - calcVehicleExhaust(vehicleData[x-1][0],revisedVehicleData[x-1][4]);
				
				revisedVehicleData[x-1][2] = rev$MPG;
				revisedVehicleData[x-1][3] = revCO2mpg;
				
				if (isNaN(rev$MPG)) {
					rev$MPG=0;
				}
	
				if (isNaN(revCO2mpg)) {
					revCO2mpg=0;
				}
				
				calcMilesSavings(x);
			}
			
			$('.replaceVehicle' + x + 'Dollars').html(insertCommas(Math.round(rev$MPG)));
			$('.replaceVehicle' + x + 'Co2').html(insertCommas(Math.round(revCO2mpg)));
			$('.revMpgVehicle' + x).html(revisedVehicleData[x-1][4]);
			
			setterRevisedEmissions();
			displayVehicleProgressBar();
        }
        displayErrorMessages();
	}
	
	function calcSavings(id){
        $("#error-vehicle-reduction").removeClass("errorMsg").addClass("displayNone");
    
        var x = parseInt(id);
        var position1 = (x+10) + (x-1);                                       //  nice bit of simple algebra, huh?   Position is based on the vehicle ID
		var position2 = (x+10) + x;
        
        
		if ((vehicleData[x-1][2] === undefined) && (userRevisedTotalEmissions[position1][1] == 0) && (userRevisedTotalEmissions[position2][1] == 0) && numVehicles != 0) {
            $("#error-vehicle-reduction").removeClass("displayNone").addClass("errorMsg");
            document.getElementById('reduceMilesInput' + x).value = '';
			document.getElementById('replaceVehicleInput' + x).value = '';
        }
        else{
            revisedVehicleData[x-1] = [0,0,0,0];
                
            if (!isNaN(vehicleData[x-1][2])) {                
                var newMiles = scrubInputText($('#reduceMilesInput' + x).val());         //  check for non number related characters
                document.getElementById('reduceMilesInput' + x).value = newMiles;
                newMiles = stripCommas(newMiles);                                          //  use the revised number of miles
                
                if (isNaN(newMiles)) {
                    newMiles = 0;
                }
                if ($('#reduceMilesSelect' + x).val() == "Per Week") {
                    newMiles = calcMilesPerYear(newMiles);
                }
                if (newMiles < vehicleData[x-1][0]) {
                    revisedVehicleData[x-1][0] = newMiles * g_AVG_COST_PER_MILE;      //   for revised miles
                    
                    if (isNaN(revisedVehicleData[x-1][0])) {      //   for revised miles
                        revisedVehicleData[x-1][0]=0;
                    }
                }
                
                var newMpg = scrubInputText($('#replaceVehicleInput' + x).val());
                document.getElementById('replaceVehicleInput' + x).value = newMpg;
                newMpg = stripCommas(newMpg);
                
                if (!(newMpg > vehicleData[x-1][1])) {
                    newMpg = vehicleData[x-1][1];
                }
                
                revisedVehicleData[x-1][1] = calcVehicleExhaust(newMiles,newMpg);      //   for revised miles
                
                if (isNaN(revisedVehicleData[x-1][1])) {      //   for revised miles
                    revisedVehicleData[x-1][1]=0;
                }
                
                revisedVehicleData[x-1][2] = calcVehicleCost(vehicleData[x-1][0], vehicleData[x-1][1]) - calcVehicleCost(vehicleData[x-1][0],newMpg);
                
                if (isNaN(revisedVehicleData[x-1][2])) {
                    revisedVehicleData[x-1][2]=0;
                }
                
                revisedVehicleData[x-1][3] = calcVehicleExhaust(vehicleData[x-1][0], vehicleData[x-1][1]) - calcVehicleExhaust(vehicleData[x-1][0],newMpg);

                if (isNaN(revisedVehicleData[x-1][3])) {
                    revisedVehicleData[x-1][3]=0;
                }
            }
            
            $('.reduceMilesVehicle' + x + 'Dollars').html(insertCommas(Math.round(revisedVehicleData[x-1][0])));      //   for revised miles
			$('.reduceMilesVehicle' + x + 'Co2').html(insertCommas(Math.round(revisedVehicleData[x-1][1])));      //   for revised miles
			$('.replaceVehicle' + x + 'Dollars').html(insertCommas(Math.round(revisedVehicleData[x-1][2])));
			$('.replaceVehicle' + x + 'Co2').html(insertCommas(Math.round(revisedVehicleData[x-1][3])));
			$('.revMpgVehicle' + x).html(newMpg);
            
            userRevisedTotalEmissions[position1]=[2,revisedVehicleData[x-1][1],revisedVehicleData[x-1][0]];      //   for revised miles
			userRevisedTotalEmissions[position2]=[2,revisedVehicleData[x-1][3],revisedVehicleData[x-1][2]];
			
			if (revisedVehicleData[x-1][1]<=0) {      //   for revised miles
				userRevisedTotalEmissions[position1][0]=0;
			}
			if (revisedVehicleData[x-1][3]<=0) {
				userRevisedTotalEmissions[position2][0]=0;
			}
			
			setterRevisedEmissions();
			displayVehicleProgressBar();
        }
        displayErrorMessages();
    }

    function getterWasteSavings(factor){
		var savings = 0;
		switch (factor) {
			case 0:
				savings = numPeople * g_NEWSPAPER_REDUCTION;
				break;
			case 1:
				savings = numPeople * g_GLASS_REDUCTION;
				break;
			case 2:
				savings = numPeople * g_PLASTIC_REDUCTION;
				break;
			case 3:
				savings = numPeople * g_METAL_REDUCTION;
				break;
			case 4:
				savings = numPeople * g_MAGAZINE_REDUCTION;
				break;
			default:
				break;
		}
		return savings;
    }
    function displayRecyclingTotals(){
		userTotalEmissions[5] = usAvgTotals[2];
		var alreadySaved = 0;
		var willSave = 0;
		var counterAlready = 0;
		var counterWill = 0;
		var strAlready="Recycling: ";
		var strWill="Recycle: ";
		
		userRevisedTotalEmissions[21]=[0,0,0];
		userRevisedTotalEmissions[22]=[0,0,0];
		
		for (var idx=0; idx<userRecycling.length;idx++) {
			if (userRecycling[idx][0] == 1) {                                                    //  1 = Already Done
				strAlready += userRecycling[idx][1]+", ";                                       //     Add the string to the output string
				alreadySaved += Math.abs(getterWasteSavings(idx));                                //     Add the total to the amount Already Saved
				counterAlready++;
			}
			else if (userRecycling[idx][0] == 2) {                                              //  2 = Will do
				willSave += Math.abs(getterWasteSavings(idx));
				strWill += userRecycling[idx][1]+", ";                                          //     Add the string to the output string
				counterWill++;
			}
		}
				
		willSave = Math.abs(Math.round(willSave));
		alreadySaved = Math.round(Math.abs(alreadySaved));
		userTotalEmissions[5] = usAvgTotals[2] - alreadySaved;
		
		$('.wasteAlreadySaved').html(insertCommas( alreadySaved ));                                     //  SubTotal of Already Saved - before subtraction from US Avg
		$('#userWasteCurrent').html(insertCommas(Math.round(userTotalEmissions[5])));		            //  Total after subtraction from US Avg
		$('.wasteWillSave').html(insertCommas( willSave ));                                                //  Total of Will Do

		if (willSave > 0) {
			userRevisedTotalEmissions[21]=[2,willSave,0];       //  by nature of the function this has to be tested for null
		}
		if (alreadySaved > 0) {
			userRevisedTotalEmissions[22]=[1,alreadySaved,0];       //  by nature of the function this has to be tested for null
		}

		var pos = strAlready.lastIndexOf(", ");
		strAlready = strAlready.slice(0,pos);
		$("#already-do .strRecycling").html(strAlready);
		
		var pos2 = strWill.lastIndexOf(", ");
		strWill = strWill.slice(0,pos2);
		$("#will-do .strRecycling").html(strWill);
		
		if (counterAlready == userRecycling.length) {                                   //  display this message if user recycles all items currently
			if ($('#good-job').hasClass("displayNone")) {
				$('#good-job').removeClass("displayNone");
				$('#start-recycling').addClass("displayNone");
				$('.removal-hook').hide();
			}
		}
		else {
			if ($('#start-recycling').hasClass("displayNone")) {
				$('#good-job').addClass("displayNone");
				$('#start-recycling').removeClass("displayNone");
				$('.removal-hook').show();
			}
		}
		
		if (counterAlready == userRecycling.length || counterWill == userRecycling.length) {
			progressBarTotals[2] = 100;
		}
		else{
			if (counterAlready > 0 && counterAlready < userRecycling.length) {
				progressBarTotals[2] = 50;
			}
			if (counterWill > 0 && counterWill < userRecycling.length) {
				progressBarTotals[2] += 50;
			}
		}
		$('#wasteProgressBar').attr('value', progressBarTotals[2]);
	    $("#wasteProgressBar_IE").css("width", progressBarTotals[2] + "%");
		
		reportButtonDisplay();		
		setterTotalEmissions();
	}
    function setterNewspapers(){
		var t = 0;                                                    //  Initially the box is unchecked, meaning the user "Won't Do"
		if ($('#newspaperCheckbox').is(":checked")) {
			document.getElementById("newspaperCheckboxR").checked = false;
			$('#newspaperCheckboxR').parent('.mobile_to-be-block').hide();
			t=1;                                              //  1 = Already Done
		}
		else {
			$('#newspaperCheckboxR').parent('.mobile_to-be-block').show();
		}
		userRecycling[0][0] = t;
		displayRecyclingTotals();
	}
	function setterGlass(){
		var t = 0;
		if ($('#glassCheckbox').is(":checked")) {
			document.getElementById("glassCheckboxR").checked = false;
			$('#glassCheckboxR').parent('.mobile_to-be-block').hide();
			t=1;
		}
		else {
			$('#glassCheckboxR').parent('.mobile_to-be-block').show();
		}
		userRecycling[1][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterPlastic(){
		var t = 0;
		if ($('#plasticCheckbox').is(":checked")) {
			document.getElementById("plasticCheckboxR").checked = false;
			$('#plasticCheckboxR').parent('.mobile_to-be-block').hide();
			t = 1;
		}
		else {
			$('#plasticCheckboxR').parent('.mobile_to-be-block').show();
		}
		userRecycling[2][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterAluminum(){
		var t = 0;
		if ($('#aluminumCheckbox').is(":checked")) {
			document.getElementById("aluminumCheckboxR").checked = false;
			$('#aluminumCheckboxR').parent('.mobile_to-be-block').hide();
			t = 1;
		}
		else {
			$('#aluminumCheckboxR').parent('.mobile_to-be-block').show();
		}
		userRecycling[3][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterMagazines(){
		var t = 0;
		if ($('#magazinesCheckbox').is(":checked")) {
			document.getElementById("magazinesCheckboxR").checked = false;
			$('#magazinesCheckboxR').parent('.mobile_to-be-block').hide();
			t = 1;
		}
		else {
			$('#magazinesCheckboxR').parent('.mobile_to-be-block').show();
		}
		userRecycling[4][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	
	function setterRevNewspapers(){
		var t = 0;
		if ($('#newspaperCheckboxR').is(":checked")) {
			t= 2;
		}
		userRecycling[0][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterRevGlass(){
		var t = 0;
		if ($('#glassCheckboxR').is(":checked")) {
			t = 2;
		}
		userRecycling[1][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterRevPlastic(){
		var t = 0;
		if ($('#plasticCheckboxR').is(":checked")) {
			t = 2;
		}
		userRecycling[2][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterRevAluminum(){
		var t = 0;
		if ($('#aluminumCheckboxR').is(":checked")) {
			t = 2;
		}
		userRecycling[3][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}
	function setterRevMagazines(){
		var t = 0;
		if ($('#magazinesCheckboxR').is(":checked")) {
			t = 2;
		}
		userRecycling[4][0] = t;                         // 1 = Already Done, 2 = Will Do, 0 = Won't Do
		displayRecyclingTotals();
	}  
    
	function setterRevisedEmissions(){
		userRevisedChartNums = [0,0,0,0,0,0];
		totalExhaustAlreadySaved = 0;
		totalDollarsAlreadySaved = 0;
		totalExhaustWillSave = 0;
		totalDollarsWillSave = 0;
		var counterWill = 0;
		var counterAlready = 0;
		totalAlreadyCorrection = 0;
		
		$('#already-do').children().addClass("displayNone");            //  reset on the report page
		$('#will-do').children().addClass("displayNone");
		
		for (var x = 0; x< userRevisedTotalEmissions.length;x++) {
			$('#already-report'+x).css("background-color", "#fff");
			$('#will-report'+x).css("background-color", "#fff");
			
			if (userRevisedTotalEmissions[x] != undefined) {                                    //  weed out undefined
				if (userRevisedTotalEmissions[x][0]==1) {                                       // first position can be (2) Will do, (0) Won't Do or (1) Already Do
					counterAlready++;
					$('#already-report'+x).removeClass('displayNone');
					
					if (!isNaN(userRevisedTotalEmissions[x][1])) {                              // second position is the amount of exhaust/CO2
						totalExhaustAlreadySaved += parseFloat(userRevisedTotalEmissions[x][1]);
					}
					if (!isNaN(userRevisedTotalEmissions[x][2])) {                              // third position is the dollars saved
						totalDollarsAlreadySaved += parseFloat(userRevisedTotalEmissions[x][2]);
					}
					if (counterAlready % 2 == 1) {
						$('#already-report'+x).css("background-color", "#f0f0f0");
					}
					
					if (x==23) {
						totalAlreadyCorrection += parseFloat(userRevisedTotalEmissions[23][1]);    // "Initial Green Power %"
						userRevisedChartNums[0] -= parseFloat(userRevisedTotalEmissions[23][1]);
						userRevisedChartNums[3] -= parseFloat(userRevisedTotalEmissions[23][1]);
					}
				}
				else if (userRevisedTotalEmissions[x][0]==2) {
					counterWill++;
					$("#will-report"+x).removeClass("displayNone");
					
					if (!isNaN(userRevisedTotalEmissions[x][1])) {
						totalExhaustWillSave += parseFloat(userRevisedTotalEmissions[x][1]);
					}
					if (!isNaN(userRevisedTotalEmissions[x][2])) {
						totalDollarsWillSave += parseFloat(userRevisedTotalEmissions[x][2]);
					}
					if (counterWill % 2 == 1) {
						$('#will-report'+x).css("background-color", "#f0f0f0");
					}
				}
				
				if (x==9) {
					userRevisedChartNums[0] = homeEmissionTotal - totalExhaustAlreadySaved;
					userRevisedChartNums[3] = userRevisedChartNums[0] - totalExhaustWillSave;                 //  Totals after planned/Will Do actions
				}
				else if (x>=10 && x<=20) {
					userRevisedChartNums[1] = userTotalEmissions[4] - (totalExhaustAlreadySaved - (homeEmissionTotal - userRevisedChartNums[0]));
					userRevisedChartNums[4] = userRevisedChartNums[1] - (totalExhaustWillSave - (userRevisedChartNums[0] - userRevisedChartNums[3]));
				}
				else if (x==21 && !isNaN(userRevisedTotalEmissions[21][1])) {
					userRevisedChartNums[2] = userTotalEmissions[5];                    //  the revised Waste number goes into [21] only after the user views the Waste page.
				}
				else if (x==22 && !isNaN(userRevisedTotalEmissions[22][1])) {
					userRevisedChartNums[5] = userTotalEmissions[5] - parseFloat(userRevisedTotalEmissions[22][2]);
				}
				
			} 
		}
		emissionsSaved  = totalExhaustWillSave;

		displayEmissions();
	}
	function setterTotalEmissions() {
		//total of emissions before Will do, won't do, or already do
		grandEmissionsTotal = 0;
		homeEmissionTotal = 0;

		for (var x = 0; x < 4;x++) {
			if (!isNaN(userTotalEmissions[x])) {                  //  same as adding a zero
				homeEmissionTotal += userTotalEmissions[x];
			}
		}
		
		if (homeEmissionTotal > 0) {
			$("#energyAC").get(0).disabled = false;
		}else {
			$("#energyAC").get(0).disabled = true;
		}

		grandEmissionsTotal = homeEmissionTotal + userTotalEmissions[4] + userTotalEmissions[5];

		setterRevisedEmissions();      //  the revised number is dependent on the total emissions.
	}
	function displayEmissions(){
		var finiEmission = grandEmissionsTotal - totalAlreadyCorrection;
		var finiNewEmission = finiEmission - totalExhaustWillSave;
		
		$('.totalEmissions').html(insertCommas(finiEmission.toFixed(0)));                                           //  Show in Aside & on Report
		$('.newEmissionTotal').html(insertCommas(finiNewEmission.toFixed(0)));                                    //  Show in Aside & on Report
		
		$("#current-total .homeEnergyCharItem").attr("title",insertCommas(Math.round(userRevisedChartNums[0])) +" lbs.");      //  = homeEmissionTotal - totalExhaustAlreadySaved
		$("#current-total .transportationCharItem").attr("title",insertCommas(Math.round(userRevisedChartNums[1])) +" lbs.");
		$("#current-total .wasteCharItem").attr("title",insertCommas(Math.round(userRevisedChartNums[2])) +" lbs.");
		
		$("#new-total .homeEnergyCharItem").attr("title",insertCommas(Math.round(userRevisedChartNums[3])) +" lbs.");
		$("#new-total .transportationCharItem").attr("title",insertCommas(Math.round(userRevisedChartNums[4])) +" lbs.");
		$("#new-total .wasteCharItem").attr("title",insertCommas(Math.round(userRevisedChartNums[5])) +" lbs.");
		
		$('#already-do-exhaust-total').html(insertCommas(Math.round(totalExhaustAlreadySaved))+" lbs.");  //.prepend(Math.round(totalExhaust));
		$('#already-do-dollar-total').html("$"+insertCommas(Math.round(totalDollarsAlreadySaved)));
		$('#will-do-exhaust-total').html(insertCommas(Math.round(totalExhaustWillSave))+" lbs.");
		$('#will-do-dollar-total').html("$"+insertCommas(Math.round(totalDollarsWillSave)));
	}
    
	function displayChart(){
		var setup = [userRevisedChartNums[0],userRevisedChartNums[1],userRevisedChartNums[2],userRevisedChartNums[3],userRevisedChartNums[4],userRevisedChartNums[5],usAvgTotals[0],usAvgTotals[1],usAvgTotals[2]]; //  for convenience
		var output =[];
		var largest=0;
		
		if (grandEmissionsTotal>grandReductionTotal && grandEmissionsTotal>usAvgTotals[4]) {     // determine largest number
			largest=grandEmissionsTotal;
		}
		else if (grandReductionTotal > usAvgTotals[4]) {
			largest=grandReductionTotal;
		}
		else{
			largest=usAvgTotals[4];
		}
		if (largest<=0 || isNaN(largest)) {
			largest=1;
		}

		for (var idx =0;idx<setup.length;idx++){
			output[idx]=parseInt(setup[idx]);
			output[idx] /= largest;
			output[idx] *= 96;
			if (isNaN(setup[idx])) {
				output[idx]=0;
			}
		}

		$('#current-total .homeEnergyCharItem').css({'width':output[0]+'%'});
		$('#current-total .transportationCharItem').css({'width':output[1]+'%'});
		$('#current-total .wasteCharItem').css({'width':output[2]+'%'});

		$('#new-total .homeEnergyCharItem').css({'width':output[3]+'%'});
		$('#new-total .transportationCharItem').css({'width':output[4]+'%'});
		$('#new-total .wasteCharItem').css({'width':output[5]+'%'});
	
		$('#us-avg .homeEnergyCharItem').css({'width':output[6]+'%'});
		$('#us-avg .transportationCharItem').css({'width':output[7]+'%'});
		$('#us-avg .wasteCharItem').css({'width':output[8]+'%'});

	}
	function displayProgressMsg(){
		var progressCounter=0;
		
		for (var idx=0; idx<progressBarTotals.length;idx++){
			if (progressBarTotals[idx] > 99) {
				++progressCounter;
			}
		}
		
		if (progressCounter == 3) {
			$("#progress-incomplete").addClass("displayNone");
			$("#progress-complete").removeClass("displayNone");
		}
		else {
			$("#progress-incomplete").removeClass("displayNone");
			$("#progress-complete").addClass("displayNone");
		}
	}
    function displayReport(){
		displayProgressMsg();
		
		// "Your Planned Actions"
		var gasSavings = (emissionsSaved / g_CO2_EMITTED_PER_GALLON_OF_GASOLINE);	
		var treesSavings = (emissionsSaved / 86);
		var recyclingSavings = (emissionsSaved / 3.1);	
	
		// "Small Actions Add Up"
		var poundsOfEmission = (emissionsSaved * 500);
		var gallonsOfGasBurned = (emissionsSaved / 19.6) * 500;
	
		displayChart();

		$('.gallonsOfGasSavings').html( insertCommas(parseInt( gasSavings )) );
		$('.treeSavings').html( insertCommas(parseInt( treesSavings )) );
		$('.wasteSavings').html( insertCommas(parseInt( recyclingSavings )) );
		$('.x500emissions').html( insertCommas(parseInt( poundsOfEmission )) );
		$('.gasx500').html( insertCommas(parseInt( gallonsOfGasBurned )) );
	}
    
    $('.hidden-content').slideUp({ duration: 250 });

    $('#accordion header').toggle(function() {
		$(this).next('.hidden-content').slideDown({ duration: 250 }, function () { });
		$(this).children('.open-close-icon').text("[-]");
    },function() {
		$(this).next('.hidden-content').slideUp({ duration: 250 }, function () { });
		$(this).children('.open-close-icon').text("[+]");
    });

	if ($('#home-emissions header .open-close-icon').text() == "[+]") {
		$('#home-emissions header').click();
	}
	if ($('#home-reduction header .open-close-icon').text() == "[+]") {
		$('#home-reduction header').click();
	}
	
	$('#energy, button#back-to-home-energy').click(function () {
		closeDialogs();
		window.scrollTo(0,0);
		
		if (!$(this).hasClass('active')){
			$('#calculator-progress .li .button_nav').removeClass('active');//  remove from the other button that is showing
			$(this).addClass('active');                                                       //  add to this button
			$('.accordion').addClass('displayNone');                                          //  hide all the accordions
			$('#home-emissions,#home-reduction').removeClass('displayNone');                  //  show these accordions
			$('.page-title, .sectionName').html('Home Energy');
			
			if (!$('#report').hasClass('displayNone')) {
				$('#form-and-stuff').removeClass('displayNone');
				$('#report').addClass('displayNone');
			}

			if ($('#home-emissions header .open-close-icon').text() == "[+]") {
				$('#home-emissions header').click();
			}
			if ($('#home-reduction header .open-close-icon').text() == "[+]") {
				$('#home-reduction header').click();
			}
			if ($('#transportation-emissions header .open-close-icon').text() == "[+]"){
				$('#transportation-emissions header').click();
			}
			if ($('#transportation-reduction header .open-close-icon').text() == "[+]") {
				$('#transportation-reduction header').click();
			}
			if ($('#waste-emissions header .open-close-icon').text() == "[+]"){
				$('#waste-emissions header').click();
			}
			if ($('#waste-reduction header .open-close-icon').text() == "[+]"){
				$('#waste-reduction header').click();
			}
		}
	});
	$('#transportation, button#to-transportation, button#back-to-transportation').click(function() {
		closeDialogs();
		window.scrollTo(0,0);
		usAvg[4] = 1;
		
		displayUsAvg();
		setterVehicleNum();
		
		if (!$(this).hasClass('active')){
			$('#calculator-progress .li .button_nav').removeClass('active');//  remove from the other button that is showing
			$('#transportation').addClass('active');      //  add to this button
			$('.accordion').addClass('displayNone');      //  hide all the accordions
			$('#transportation-emissions, #transportation-reduction').removeClass('displayNone');      //  show these accordions
			$('.page-title, .sectionName').html('Transportation');
			if (!$('#report').hasClass('displayNone')) {
				$('#form-and-stuff').removeClass('displayNone');
				$('#report').addClass('displayNone');
			}
			if ($('#home-emissions header').children('.open-close-icon').text() == "[+]"){
				$('#home-emissions header').click();
			}
			if ($('#home-reduction header').children('.open-close-icon').text() == "[+]") {
				$('#home-reduction header').click();
				}
			if ($('#transportation-emissions header').children('.open-close-icon').text() == "[+]") {
				$('#transportation-emissions header').click();
			}
			if ($('#transportation-reduction header').children('.open-close-icon').text() == "[+]"){
				$('#transportation-reduction header').click();
			}
			if ($('#waste-emissions header').children('.open-close-icon').text() == "[+]") {
				$('#waste-emissions header').click();
			}
			if ($('#waste-reduction header').children('.open-close-icon').text() == "[+]") {
				$('#waste-reduction header').click();
			}
		}
	});
	$('#waste, button#to-waste').click(function() {
		closeDialogs();
		window.scrollTo(0,0);
		
		usAvg[5] = 1;                      //  calculation based on number of people
		
		displayUsAvg();
		displayRecyclingTotals();
		
		$('#wasteBeforeInput').html(insertCommas(Math.round(usAvgTotals[2])));                  //  calculation based on number of people

		if (!$(this).hasClass('active')){      //  remove from the other button that is showing
			$('#calculator-progress .li .button_nav').removeClass('active');//  remove from the other button that is showing
			$('#waste').addClass('active');      //  add to this button
			$('.accordion').addClass('displayNone');      //  hide all the accordions
			$('#waste-emissions, #waste-reduction').removeClass('displayNone');      //  show these accordions
			$('.page-title, .sectionName').html('Waste');

			if (!$('#report').hasClass('displayNone')) {
				$('#form-and-stuff').removeClass('displayNone');
				$('#report').addClass('displayNone');
			}

			if ($('#home-emissions header').children('.open-close-icon').text() == "[+]") {
				$('#home-emissions header').click();
			}
			if ($('#home-reduction header').children('.open-close-icon').text() == "[+]") {
				$('#home-reduction header').click();
			}
			if ($('#transportation-emissions header').children('.open-close-icon').text() == "[+]") {
				$('#transportation-emissions header').click();
			}
			if ($('#transportation-reduction header').children('.open-close-icon').text() == "[+]") {
				$('#transportation-reduction header').click();
			}
			if ($('#waste-emissions header').children('.open-close-icon').text() == "[+]") {
				$('#waste-emissions header').click();
			}
			if ($('#waste-reduction header').children('.open-close-icon').text() == "[+]") {
				$('#waste-reduction header').click();
			}
		}
	});
	$('#view-full-report, #to-report').click(function() {
		closeDialogs();
		window.scrollTo(0,0);
		
		$('#calculator-progress .li .button_nav').removeClass('active');//  remove from the other button that is showing
		$('#form-and-stuff').addClass('displayNone');
		$('#report').removeClass('displayNone');
		$('.page-title, .sectionName').html('Your Household Carbon Footprint Report');
	
		displayReport();
		//RAM Event Tracking
		_gaq.push(['_trackEvent', 'Climate Change Pages - Special Events', 'Calculator', "Users That Finish"]);
		if (startTime > 0){
					endTime = new Date().getTime() / 1000;
					timeSpent = endTime - startTime;
					//alert("Time Spent: "+timeSpent);
					if(timeSpent > 5){
						timeSpent = parseInt(Math.round(timeSpent * 100) / 100);
						_gaq.push(['_trackEvent', 'Climate Change Pages - Special Events', 'Calculator', 'Time Spent on Calculator', timeSpent]);
					};
		};
    });
	
	$("#start-over").click(function(){
		location.reload(true);
	});

	function runTheAjax(zip){
		var strippedZip = parseFloat(zip).toString();

		$("#error-zipcode").removeClass("errorMsg").addClass("displayNone");
		
		$.ajax({
			url: "data/egrid.csv",
			type: "get",
			success: function(data) {
				var e = data.split("\r");
				var condition=false;
				var counter=1;
				while(condition === false && counter < e.length){
					var a = e[counter].split(",");
					if (a[0] == strippedZip) {
						g_eFactorValue = a[3] / 1000;
						condition=true;
					}
					++counter;
				}
				if (counter == e.length) {
					$("#invalidZip").removeClass("displayNone");
				}
				entryValidation();
			},
			error: function() {
				$("#invalidZip").removeClass("displayNone");
				entryValidation();
			},
			beforeSend: function(){
				$(".loader").show();
			},
			complete: function(){
				$(".loader").hide();
			}
		});
		displayErrorMessages();
	}
	
	function entryValidation(){
		var showError=false;
		var peopleInput = $("#ppl-in-household-input").val();
		var peopleChecker = stripCommas(peopleInput);
				
		if (peopleChecker != numPeople) {                                                                //  if this is set then onto zip code.
			if (peopleChecker != peopleInput || peopleChecker==="" || peopleChecker<=0) {     // both numbers must be equal and valid
				if (peopleChecker==="" || peopleChecker<=0){
					peopleChecker = "";
				}
				document.getElementById("ppl-in-household-input").value = peopleChecker;           //  if input contained non number related characters show revised number to user
				$("#invalidNum").removeClass("displayNone");                                   //  reveal the correct error msg
				showError = true;                                                               //  will show all the msgs
			}
			else{
				numPeople = peopleChecker;
			}
		}

		var zipInput = $("#zip-code-input").val();
		zipChecker = scrubZipCode(zipInput).toString();

		if (zipChecker != zip_code) {                                                                   // in esscence the zip code is only used in this function to find the g_eFactorValue
			if (zipChecker != zipInput || zipChecker==="" || zipChecker.length != 5) {          // both numbers must be equal and valid
				if (isNaN(zipChecker)) {
					zipChecker="";
				}
				$("#invalidZipNum").removeClass("displayNone");
				showError = true;
			}
		}
		if (!$("#invalidZip").hasClass("displayNone") || !$("#error-zipcode").hasClass("displayNone")) {  //  gets here after a zip not found in ajax search
			showError = true;
		}
		if ($(".default-zip").is(":checked")) {                            //  
			g_eFactorValue = 1;                                                                  // use this default value
			zipChecker = "00000";
		}
		if (g_eFactorValue !== 0) {                            //  ajax was successful
			zip_code = zipChecker;
			$('.number-of-people').html(numPeople);          // populate form
			$('.users-zip').html(zip_code);
			
			$("#main").removeClass("displayNone");
			$("#intro").addClass("displayNone");
		}
		else{
			if (showError === true) {
				$("#failValidation").removeClass("displayNone");
			}
			else if (showError === false){     //  runs only when both error-free
					zip_code = zipChecker;
					runTheAjax(zip_code);
					//RAM Event Tracking
					startTime = new Date().getTime() / 1000;
					_gaq.push(['_trackEvent', 'Climate Change Pages - Special Events', 'Calculator', "Users That Start"]); //RAM Event Tracking
			}
		}
	}
	
	$("#get-started").click(function () {
		$("#failValidation").addClass("displayNone").children().addClass("displayNone");
		entryValidation();
	});

	$("#primaryHeatingSource").change(function() {setterHeatSource();});
	$('#current-emissions-ul').delegate('#naturalGasTextInput','input propertychange', calcNaturalGas);
	$('#naturalGasSelectInput').change(calcNaturalGas);
	$('#current-emissions-ul').delegate('#electricityTextInput','input propertychange',calcElectric);
	$('#electricitySelectInput').change(calcElectric);
	$('#current-emissions-ul').delegate('#electricityGreenTextInput','input propertychange',calcAlreadyGreenElec);
	$('#current-emissions-ul').delegate('#fuelTextInput','input propertychange', calcFuelOil);
	$('#fuelSelectInput').change(calcFuelOil);
	$('#current-emissions-ul').delegate('#propaneTextInput','input propertychange', calcPropane);
	$('#propaneSelectInput').change(calcPropane);
	
	$('#home-reduction table').delegate('#energyAC','input propertychange',calcSummerCooling);
	$('#home-reduction table').delegate('#energyHeat','input propertychange', calcWinterHeating);
	$('#home-reduction table').delegate('#lightsToReplace','input propertychange', calcReplaceBulbs);
	$('#home-reduction table').delegate('#increaseGreenInput','input propertychange', calcGreenPower);
	$('#home-reduction table').delegate('#loadsPerWeek','input propertychange', calcColdWater);
	
	$('#pwrMgmtSelect').change(calcComputerPower);
	$('#coldWaterSelect').change(calcColdWater);
	$('#fridgeSelect').change(calcRefrigerator);
	$('#furnaceSelect').change(calcFurnace);
	$('#windowSelect').change(calcWindows);
	$('#AirDrySelect').change(calcDryer);
	$('#percentageAirDrySelect').change(calcDryer);

	$('#numVehiclesInput').change(setterVehicleNum);
	
	$('#maintCurrentSelect').change(function() {setterMaintenance();});
	
	$('#vehicle1').delegate('#vehicle1Miles','input propertychange', function() {calcVehicleEmissions('1');});
	$('#vehicle1').delegate('#vehicle1GasMileage','input propertychange', function() {calcVehicleEmissions('1');});
	$('#vehicle1Select').change(function() {calcVehicleEmissions('1');});
	
	$('#vehicle2').delegate('#vehicle2Miles','input propertychange', function() {calcVehicleEmissions('2');});
	$('#vehicle2').delegate('#vehicle2GasMileage','input propertychange', function() {calcVehicleEmissions('2');});
	$('#vehicle2Select').change(function() {calcVehicleEmissions('2');});
	
	$('#vehicle3').delegate('#vehicle3Miles','input propertychange', function() {calcVehicleEmissions('3');});
	$('#vehicle3').delegate('#vehicle3GasMileage','input propertychange', function() {calcVehicleEmissions('3');});
	$('#vehicle3Select').change(function() {calcVehicleEmissions('3');});
	
	$('#vehicle4').delegate('#vehicle4Miles','input propertychange', function() {calcVehicleEmissions('4');});
	$('#vehicle4').delegate('#vehicle4GasMileage','input propertychange', function() {calcVehicleEmissions('4');});
	$('#vehicle4Select').change(function() {calcVehicleEmissions('4');});
	
	$('#vehicle5').delegate('#vehicle5Miles','input propertychange', function() {calcVehicleEmissions('5');});
	$('#vehicle5').delegate('#vehicle5GasMileage','input propertychange', function() {calcVehicleEmissions('5');});
	$('#vehicle5Select').change(function() {calcVehicleEmissions('5');});

	$('#maintReduceSelect').change(function() {setterMaintenance();});
	
	$('#revVehicle1').delegate('#reduceMilesInput1','input propertychange', function() {calcMilesSavings('1');});
	$('#revVehicle1').delegate('#replaceVehicleInput1','input propertychange', function() {calcMpgSavings('1');});
	$('#reduceMilesSelect1').change(function() {calcMilesSavings('1');});
	
	$('#revVehicle2').delegate('#reduceMilesInput2','input propertychange', function() {calcMilesSavings('2');});
	$('#revVehicle2').delegate('#replaceVehicleInput2','input propertychange', function() {calcMpgSavings('2');});
	$('#reduceMilesSelect2').change(function() {calcMilesSavings('2');});
	
	$('#revVehicle3').delegate('#reduceMilesInput3','input propertychange', function() {calcMilesSavings('3');});
	$('#revVehicle3').delegate('#replaceVehicleInput3','input propertychange', function() {calcMpgSavings('3');});
	$('#reduceMilesSelect3').change(function() {calcMilesSavings('3');});
	
	$('#revVehicle4').delegate('#reduceMilesInput4','input propertychange', function() {calcMilesSavings('4');});
	$('#revVehicle4').delegate('#replaceVehicleInput4','input propertychange', function() {calcMpgSavings('4');});
	$('#reduceMilesSelect4').change(function() {calcMilesSavings('4');});
	
	$('#revVehicle5').delegate('#reduceMilesInput5','input propertychange', function() {calcMilesSavings('5');});
	$('#revVehicle5').delegate('#replaceVehicleInput5','input propertychange', function() {calcMpgSavings('5');});
	$('#reduceMilesSelect5').change(function() {calcMilesSavings('5');});
	
	$('#newspaperCheckbox').change(setterNewspapers);
	$('#glassCheckbox').change(setterGlass);
	$('#plasticCheckbox').change(setterPlastic);
	$('#aluminumCheckbox').change(setterAluminum);
	$('#magazinesCheckbox').change(setterMagazines);

	$('#newspaperCheckboxR').change(setterRevNewspapers);
	$('#glassCheckboxR').change(setterRevGlass);
	$('#plasticCheckboxR').change(setterRevPlastic);
	$('#aluminumCheckboxR').change(setterRevAluminum);
	$('#magazinesCheckboxR').change(setterRevMagazines);
    
	$('#graphKey').delegate('.key','change', function() {
		if ($('#homeKey').is(":checked")) {
			$('.homeEnergyCharItem').show();
		}
		else {
			$('.homeEnergyCharItem').hide();
		}
		if ($('#transKey').is(":checked")) {
			$('.transportationCharItem').show();
		}
		else {
			$('.transportationCharItem').hide();
		}
		if ($('#wasteKey').is(":checked")) {
			$('.wasteCharItem').show();
		}
		else {
			$('.wasteCharItem').hide();
		}
    });
    
    $('#printicon').click(function () {
		window.print();
    });
    $('#saveicon').click(function () {
		var specialElementHandlers =
			function (element, renderer) {
				return true;
			};
		var doc = new jsPDF();
		doc.fromHTML($('#main').html(), 15, 15, {
			'width': 170,
			'elementHandlers': specialElementHandlers
		});
		doc.output('datauri');
    });

    $('#TWshare').click(function () {
        $('#share-panel').css("display", "none");
        window.open("http://twitter.com/share?text=" + sharepreviewtext + "&url=https://www3.epa.gov/carbon-footprint-calculator", '_blank');
    });

    $('#FBshare').click(function() {
            $('#share-panel').css("display", "none");
            FB.ui({
                    method: 'feed',
                    caption: sharepreviewtext,
                    link: 'https://www3.epa.gov/carbon-footprint-calculator'
         }, function(response){});
    });


    $('#share-close').click(function () {
        $('#share-panel').css("display", "none");
    });

    var sharepreviewtext="";
    $('#share-panel-select-type input[type="radio"]').click(function () {
        updateSharePreview();
    });
    function updateSharePreview() {

        var gasSavings = (emissionsSaved / g_CO2_EMITTED_PER_GALLON_OF_GASOLINE);
        var treesSavings = (emissionsSaved / 86);
        var recyclingSavings = (emissionsSaved / 3.1);


        var val = $('#share-panel-select-type input[type="radio"]:checked').val();

        switch(val) {
            case "1":
                sharepreviewtext = "I'm reducing my carbon footprint! My estimated reductions are equivalent to saving " + insertCommas(parseInt(gasSavings)) + " gallons of gas each year.";
                break;
            case "2":
                sharepreviewtext = "I'm reducing my carbon footprint! My estimated reductions are equivalent to planting " + insertCommas(parseInt(treesSavings)) + " trees each year.";
                break;
            case "3":
                sharepreviewtext = "I'm reducing my carbon footprint! My estimated reductions are equivalent to recycling " + insertCommas(parseInt(recyclingSavings)) + " tons of waste each year.";
                break;
            default:
                sharepreviewtext = "";
				break;
        }
        if (sharepreviewtext === "") $("#share-preview").html(""); else $("#share-preview").html("<b>Preview:</b> "+sharepreviewtext);
    }

    function openDialog_for(id, obj){
        var target = obj;
        $('.dialog').dialog('close');
                
        // if (Modernizr.mq('(max-width: 400px)')) {
        if (!$.browser.hasOwnProperty('msie') && window.matchMedia('(max-width: 400px)').matches) {
            $( id ).dialog("option","modal",true);
            $( id ).dialog("option","position",null);
            $( id ).dialog("option","minWidth",null); 
            $(id).dialog("open");            
        } else {
            $(id).dialog("open"); 
            $( id ).dialog("option","modal",false);
            $( id ).dialog("option","minWidth","400");
            $( id ).dialog( "widget").position({
                   of: target,
                   my: 'left bottom',
                   at: 'right'
           }); 
        }
    }
    
    $("#errorMessageBox").dialog({
        autoOpen: false,
        modal: true,
        dialogClass: "errorMessageBox"
    });
    $('#openSharePanel').click(function () {        
        $('#share-panel').css("display", "block");
        updateSharePreview();
    });

    $("#info-nat-gas").click(function() {
        openDialog_for("#dialog-nat-gas",$(this));                
        return false;
    });
	$('#info-elec').click(function () {
		openDialog_for("#dialog-elec",$(this));
		return false;
	});
	$('#info-elec-green').click(function (){
		openDialog_for("#dialog-elec-green",$(this));
		return false;
	});
    $('#info-oil').click(function () {
		openDialog_for("#dialog-oil",$(this));
		return false;
	});
	$('#info-propane').click(function () {
		openDialog_for("#dialog-propane",$(this));
		return false;
	});
	$('#info-annual-emissions').click(function () {
		openDialog_for("#dialog-annual-emissions",$(this));
		return false;
	});
	$('#info-cooling').click(function () {
		openDialog_for("#dialog-cooling",$(this));
		return false;
	});
	$('#info-heating').click(function () {
		openDialog_for("#dialog-heating",$(this));
		return false;
	});
	$('#info-lighting').click(function () {
		openDialog_for("#dialog-lighting",$(this));
		return false;
	});
	$('#info-green-power').click(function () {
		openDialog_for("#dialog-green-power",$(this));
		return false;
	});
	$('#info-home-green-power').click(function () {
		openDialog_for("#dialog-home-green-power",$(this));
		return false;
	});
	$('.info-miles').click(function () {
		openDialog_for("#dialog-miles",$(this));
		return false;
	});
    $('.info-iselectric').click(function () {
		openDialog_for("#dialog-iselectric",$(this));
		return false;
	});
	$('.info-mileage').click(function () {
		openDialog_for("#dialog-mileage",$(this));
		return false;
	});
	$('#info-car-emissions').click(function () {
		openDialog_for("#dialog-car-emissions",$(this));
		return false;
	});
	$('.info-maintenance').click(function () {
		openDialog_for("#dialog-maintenance",$(this));
		return false;
	});
	$('.info-reduce-miles').click(function () {
		openDialog_for("#dialog-reduce-miles",$(this));
		return false;
	});
	$('.info-increase-mileage').click(function () {
		openDialog_for("#dialog-increase-mileage",$(this));
		return false;
	});
	$('#info-waste-emissions').click(function () {
		openDialog_for("#dialog-waste-emissions",$(this));
		return false;
	});
	$('#info-recycling').click(function () {
		openDialog_for("#dialog-recycling",$(this));
		return false;
	});

	$('#info-make-selection1').click(function () {
		openDialog_for("#dialog-make-selection1",$(this));
		return false;
	});

	$('#info-make-selection2').click(function () {
		openDialog_for("#dialog-make-selection2",$(this));
		return false;
	});

	$('.info-recycling-report-result').click(function () {
            openDialog_for("#dialog-recycling-report-result",$(this));
            return false;
	});

	$('.info-green-power-report-result').click(function () {
            openDialog_for("#dialog-green-power-result-report",$(this));
	    return false;
	});
	$('#info-percentage-green').click(function () {
            openDialog_for("#dialog-percentage-green",$(this));
	    return false;
	});

	$('#dialog-nat-gas').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
   });
	$('#dialog-elec').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
   });
	$('#dialog-elec-green').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-oil').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-propane').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-green-power').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-home-green-power').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-annual-emissions').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-cooling').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-heating').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-lighting').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-miles').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
    $('#dialog-iselectric').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-mileage').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-car-emissions').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-maintenance').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-reduce-miles').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-increase-mileage').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-waste-emissions').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});
	$('#dialog-recycling').dialog({
		autoOpen: false,
		draggable: true,
		title: null,
		modal: false,
		minWidth: 400,
		minHeight: 300
	});

	$('#dialog-make-selection1').dialog({
       autoOpen: false,
       draggable: true,
       title: null,
       modal: false,
       minWidth: 400,
       minHeight: 300
	});
	$('#dialog-make-selection2').dialog({
       autoOpen: false,
       draggable: true,
       title: null,
       modal: false,
       minWidth: 400,
       minHeight: 300
	});
	$('#dialog-recycling-report-result').dialog({
	    autoOpen: false,
	    draggable: true,
	    title: null,
	    modal: false,
	    minWidth: 400,
	    minHeight: 300
	});
	$('#dialog-green-power-result-report').dialog({
	    autoOpen: false,
	    draggable: true,
	    title: null,
	    modal: false,
	    minWidth: 400,
	    minHeight: 300
	});
	$('#dialog-percentage-green').dialog({
	    autoOpen: false,
	    draggable: true,
	    title: null,
	    modal: false,
	    minWidth: 420,
	    minHeight: 300
	});
});