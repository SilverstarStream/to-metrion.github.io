// input field validation
var bounds = {
	"level": [1, 100],
	"autolevel-box": [1, 100],
	"base": [1, 255],
	"evs": [0, 252],
	"ivs": [0, 31],
	"dvs": [0, 15],
	"move-bp": [0, 999],
	"current-happiness": [0, 255]
};
for (var bounded in bounds) {
	if (bounds.hasOwnProperty(bounded)) {
		attachValidation(bounded, bounds[bounded][0], bounds[bounded][1]);
	}
}
function attachValidation(clazz, min, max) {
	$("." + clazz).keyup(function () {
		validate($(this), min, max);
	});
}
function validate(obj, min, max) {
	obj.val(Math.max(min, Math.min(max, ~~obj.val())));
}
function clampIntRange(num, min, max) {
	if (typeof num !== "number") num = 0;
	num = Math.floor(num);
	if (min !== undefined && num < min) num = min;
	if (max !== undefined && num > max) num = max;
	return num;
}

$(".max").bind("keyup change", function () {
	var poke = $(this).closest(".poke-info");
	calcHP(poke);
	calcStats(poke);
});

$(".max-level").bind("keyup change", function () {
	var poke = $(this).closest(".poke-info");
	calcHP(poke);
	calcStats(poke);
});

$("#maxL").change(function () {
	if (this.checked) {
		for (var i = 0; i < 4; i++) {
			$("#maxL" + (i + 1)).prop("checked", true);
		}
	} else {
		for (var i = 0; i < 4; i++) {
			$("#maxL" + (i + 1)).prop("checked", false);
		}
	}
});

$(".tera").bind("keyup change", function () {
	var pokeInfo = $(this).closest(".poke-info");
	if ($(this).prop("checked")) {
		pokeInfo.find(".type1").val(pokeInfo.find(".tera-type").val());
		pokeInfo.find(".type2").val("(none)");
	}
	else {
		var setName = pokeInfo.find("input.set-selector").val();
		var dexEntry = pokedex[setName.substring(0, setName.indexOf(" ("))];
		pokeInfo.find(".type1").val(dexEntry.t1);
		pokeInfo.find(".type2").val(dexEntry.t2);
	}
});

$(".tera-type").bind("keyup change", function () {
	var pokeInfo = $(this).closest(".poke-info");
	if (pokeInfo.find(".tera").prop("checked")) {
		pokeInfo.find(".type1").val($(this).val());
	}
});

$("#autolevel").change(function () {
	// auto-calc stats and current HP on change
	var level = $(gen == 3 || gen == 4 ? "#autolevel-box" : "input:radio[name='autolevel-btn']:checked").val();
	var p1 = $("#p1");
	var p2 = $("#p2");
	if (gen == 4) {
		// for gen 4 only, due to Hall mechanics, changes to the autolevel should not affect the pokemon if it's a custom set
		var p1Name = p1.find("input.set-selector").val(); // speciesName (setName)
		var speciesSets = setdex[p1Name.substring(0, p1Name.indexOf(" ("))];
		if (speciesSets && speciesSets[p1Name.substring(p1Name.indexOf('(') + 1, p1Name.length - 1)]) {
			p1.find(".level").val(level);
		}
		var p2Name = p2.find("input.set-selector").val();
		if (p2Name) {
			speciesSets = setdex[p2Name.substring(0, p2Name.indexOf(" ("))];
			if (speciesSets && speciesSets[p2Name.substring(p2Name.indexOf('(') + 1, p2Name.length - 1)]) {
				p2.find(".level").val(level);
			}
		}
	} else {
		p1.find(".level").val(level);
		p2.find(".level").val(level);
	}
	$(".level").change();
	localStorage.setItem("autolevelGen" + gen, level);
});

$("#format").change(function () {
	localStorage.setItem("selectedFormat", $("input:radio[name='format']:checked").val().toLowerCase());
});

$(".level").bind("keyup change", function () {
	var poke = $(this).closest(".poke-info");
	calcHP(poke);
	calcStats(poke);
});
$(".nature").bind("keyup keydown click change", function () {
	calcStats($(this).closest(".poke-info"));
});
$(".hp .base, .hp .evs, .hp .ivs, .current-happiness").bind("keyup keydown click change", function () {
	calcHP($(this).closest(".poke-info"));
});
$(".at .base, .at .evs, .at .ivs, .current-happiness").bind("keyup keydown click change", function () {
	calcStat($(this).closest(".poke-info"), "at");
});
$(".df .base, .df .evs, .df .ivs, .current-happiness").bind("keyup keydown click change", function () {
	calcStat($(this).closest(".poke-info"), "df");
});
$(".sa .base, .sa .evs, .sa .ivs, .current-happiness").bind("keyup keydown click change", function () {
	calcStat($(this).closest(".poke-info"), "sa");
});
$(".sd .base, .sd .evs, .sd .ivs, .current-happiness").bind("keyup keydown click change", function () {
	calcStat($(this).closest(".poke-info"), "sd");
});
$(".sp .base, .sp .evs, .sp .ivs, .current-happiness").bind("keyup keydown click change", function () {
	calcStat($(this).closest(".poke-info"), "sp");
});
$(".evs").bind("keyup keydown click change", function () {
	calcEvTotal($(this).closest(".poke-info"));
});
$(".sl .base").keyup(function () {
	calcStat($(this).closest(".poke-info"), "sl");
});
$(".at .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, "at");
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".df .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, "df");
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sa .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, "sa");
	poke.find(".sd .dvs").val($(this).val());
	calcStat(poke, "sd");
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sp .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, "sp");
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sl .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, "sl");
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});

function getHPDVs(poke) {
	return ~~poke.find(".at .dvs").val() % 2 * 8 +
            ~~poke.find(".df .dvs").val() % 2 * 4 +
            ~~poke.find(gen === 1 ? ".sl .dvs" : ".sa .dvs").val() % 2 * 2 +
            ~~poke.find(".sp .dvs").val() % 2;
}

function calcStats(poke) {
	for (var i = 0; i < STATS.length; i++) {
		calcStat(poke, STATS[i]);
	}
}

function calcEvTotal(poke) {
	var total = 0;
	poke.find(".evs").each(function (idx, elt) { total += 1 * $(elt).val(); });

	var newClass = total > 510 ? "overLimit" : "underLimit";

	var evTotal = poke.find(".ev-total");
	evTotal.removeClass("underLimit overLimit").text(total).addClass(newClass);
}

function calcCurrentHP(poke, max, percent) {
	var current = Math.ceil(percent * max / 100);
	poke.find(".current-hp").val(current);
}
function calcPercentHP(poke, max, current) {
	var percent = Math.floor(100 * current / max);
	poke.find(".percent-hp").val(percent);
}
$(".current-hp").keyup(function () {
	var max = $(this).parent().children(".max-hp").text();
	validate($(this), 0, max);
	var current = $(this).val();
	calcPercentHP($(this).parent(), max, current);
});
$(".percent-hp").keyup(function () {
	var max = $(this).parent().children(".max-hp").text();
	validate($(this), 0, 100);
	var percent = $(this).val();
	calcCurrentHP($(this).parent(), max, percent);
});

var lastAura = [false, false, false];
$(".ability").bind("keyup change", function () {
	autoSetMultiHits($(this).closest(".poke-info"));
	autoSetAura();
	autoSetTerrain();
});

$("#p1 .ability").bind("keyup change", function () {
	autosetWeather($(this).val(), 0);
	autoSetVicStar(1, "L");
	autoSetSteely(1, "L");
	autoSetRuin(1, "L");
});

var lastTerrain = "noterrain";
var lastManualWeather = "";
var lastAutoWeather = ["", ""];
function autoSetAura() {
	var ability1 = $("#p1 .ability").val();
	var ability2 = $("#p2 .ability").val();
	if (ability1 == "Fairy Aura" || ability2 == "Fairy Aura")
		$("input:checkbox[id='fairy-aura']").prop("checked", true);
	else
		$("input:checkbox[id='fairy-aura']").prop("checked", lastAura[0]);
	if (ability1 == "Dark Aura" || ability2 == "Dark Aura")
		$("input:checkbox[id='dark-aura']").prop("checked", true);
	else
		$("input:checkbox[id='dark-aura']").prop("checked", lastAura[1]);
	if (ability1 == "Aura Break" || ability2 == "Aura Break")
		$("input:checkbox[id='aura-break']").prop("checked", true);
	else
		$("input:checkbox[id='aura-break']").prop("checked", lastAura[2]);
}
function autoSetVicStar(i, side) {
	var ability = $("#p" + i + " .ability").val();
	if (ability === "Victory Star") {
		$("input:checkbox[id='vicStar" + side + "']").prop("checked", true);
	} else {
		$("input:checkbox[id='vicStar" + side + "']").prop("checked", false);
	}
}
function autoSetTerrain() {
	var ability1 = $("#p1 .ability").val();
	var ability2 = $("#p2 .ability").val();
	if (ability1 == "Electric Surge" || ability2 == "Electric Surge" || ability1 == "Hadron Engine" || ability2 == "Hadron Engine") {
		$("input:radio[id='electric']").prop("checked", true);
		lastTerrain = "electric";
	} else if (ability1 == "Grassy Surge" || ability2 == "Grassy Surge") {
		$("input:radio[id='grassy']").prop("checked", true);
		lastTerrain = "grassy";
	} else if (ability1 == "Misty Surge" || ability2 == "Misty Surge") {
		$("input:radio[id='misty']").prop("checked", true);
		lastTerrain = "misty";
	} else if (ability1 == "Psychic Surge" || ability2 == "Psychic Surge") {
		$("input:radio[id='psychic']").prop("checked", true);
		lastTerrain = "psychic";
	} else
		$("input:radio[id='noterrain']").prop("checked", true);
}

function autosetWeather(ability, i) {
	var currentWeather = $("input:radio[name='weather']:checked").val();
	if (!(lastAutoWeather.includes(currentWeather)) || currentWeather === "") {
		lastManualWeather = currentWeather;
		lastAutoWeather[1 - i] = "";
	}

	var primalWeather = ["Harsh Sun", "Heavy Rain"];
	var autoWeatherAbilities = {
		"Drought": "Sun",
		"Drizzle": "Rain",
		"Sand Stream": "Sand",
		"Snow Warning": "Snow",
		"Desolate Land": "Harsh Sun",
		"Primordial Sea": "Heavy Rain",
		"Delta Stream": "Strong Winds",
		"Orichalcum Pulse": "Sun"
	};
	var newWeather;

	if (ability in autoWeatherAbilities) {
		lastAutoWeather[i] = ability === "Snow Warning" && (gen < 9 || gen == 80) ? "Hail" : autoWeatherAbilities[ability];
		if (currentWeather === "Strong Winds") {
			if (!(lastAutoWeather.includes("Strong Winds"))) {
				newWeather = lastAutoWeather[i];
			}
		} else if (primalWeather.includes(currentWeather)) {
			if (lastAutoWeather[i] === "Strong Winds" || primalWeather.includes(lastAutoWeather[i])) {
				newWeather = lastAutoWeather[i];
			} else if (primalWeather.includes(lastAutoWeather[1 - i])) {
				newWeather = lastAutoWeather[1 - i];
			} else {
				newWeather = lastAutoWeather[i];
			}
		} else {
			newWeather = lastAutoWeather[i];
		}
	} else {
		lastAutoWeather[i] = "";
		newWeather = lastAutoWeather[1 - i] !== "" ? lastAutoWeather[1 - i] : lastManualWeather;
	}

	if (newWeather === "Strong Winds" || primalWeather.includes(newWeather)) {
		//$("input:radio[name='weather']").prop("disabled", true);
		//edited out by squirrelboy1225 for doubles!
		$("input:radio[name='weather'][value='" + newWeather + "']").prop("disabled", false);
	} else if (typeof newWeather != "undefined") {
		for (var k = 0; k < $("input:radio[name='weather']").length; k++) {
			var val = $("input:radio[name='weather']")[k].value;
			if (!(primalWeather.includes(val)) && val !== "Strong Winds") {
				$("input:radio[name='weather']")[k].disabled = false;
			} else {
				//$("input:radio[name='weather']")[k].disabled = true;
				//edited out by squirrelboy1225 for doubles!
			}
		}
	}
	$("input:radio[name='weather'][value='" + newWeather + "']").prop("checked", true);
}

$("#p1 .item").bind("keyup change", function () {
	autosetStatus("#p1", $(this).val());
	autoSetMultiHits($(this).closest(".poke-info"));
});

var lastManualStatus = {"#p1": "Healthy", "#p2": "Healthy"};
var lastAutoStatus = {"#p1": "Healthy", "#p2": "Healthy"};
function autosetStatus(p, item) {
	var currentStatus = $(p + " .status").val();
	if (currentStatus !== lastAutoStatus[p]) {
		lastManualStatus[p] = currentStatus;
	}
	if (item === "Flame Orb") {
		lastAutoStatus[p] = "Burned";
		$(p + " .status").val("Burned");
		$(p + " .status").change();
	} else if (item === "Toxic Orb") {
		lastAutoStatus[p] = "Badly Poisoned";
		$(p + " .status").val("Badly Poisoned");
		$(p + " .status").change();
	} else {
		lastAutoStatus[p] = "Healthy";
		if (currentStatus !== lastManualStatus[p]) {
			$(p + " .status").val(lastManualStatus[p]);
			$(p + " .status").change();
		}
	}
}

function autoSetSteely(i, side) {
	var ability = $("#p" + i + " .ability").val();
	if (ability === "Steely Spirit") {
		$("input:checkbox[id='steelySpirit" + side + "']").prop("checked", true);
	} else {
		$("input:checkbox[id='steelySpirit" + side + "']").prop("checked", false);
	}
}

function autoSetRuin(i, side) {
	var ability = $("#p" + i + " .ability").val();
	if (ability === "Tablets of Ruin") {
		$("input:checkbox[id='ruinTablets" + side + "']").prop("checked", true);
	} else {
		$("input:checkbox[id='ruinTablets" + side + "']").prop("checked", false);
	}
	if (ability === "Vessel of Ruin") {
		$("input:checkbox[id='ruinVessel" + side + "']").prop("checked", true);
	} else {
		$("input:checkbox[id='ruinVessel" + side + "']").prop("checked", false);
	}
	if (ability === "Sword of Ruin") {
		$("input:checkbox[id='ruinSword" + side + "']").prop("checked", true);
	} else {
		$("input:checkbox[id='ruinSword" + side + "']").prop("checked", false);
	}
	if (ability === "Beads of Ruin") {
		$("input:checkbox[id='ruinBeads" + side + "']").prop("checked", true);
	} else {
		$("input:checkbox[id='ruinBeads" + side + "']").prop("checked", false);
	}
}

function autoSetMultiHits(pokeInfo) {
	var ability = pokeInfo.find(".ability").val();
	var item = pokeInfo.find(".item").val();
	for (var i = 1; i <= 4; i++) {
		var moveInfo = pokeInfo.find(".move" + i);
		var moveName = moveInfo.find("select.move-selector").val();
		if(moveName === "Population Bomb") {
			moveInfo.children(".move-hits").val(10);
		} else if (moveName === "Triple Axel") {
			moveInfo.children(".move-hits").val(3);
		} else {
			moveInfo.children(".move-hits").val(ability === "Skill Link" ? 5 : (item === "Loaded Dice" ? 4 : 3));
		}
	}
}

$(".status").bind("keyup change", function () {
	if ($(this).val() === "Badly Poisoned") {
		$(this).parent().children(".toxic-counter").show();
	} else {
		$(this).parent().children(".toxic-counter").hide();
	}
});

$(".move-selector").change(function () {
	var moveName = $(this).val();
	var move = moves[moveName] || moves["(No Move)"];
	var moveGroupObj = $(this).parent();
	moveGroupObj.children(".move-bp").val(move.bp);
	moveGroupObj.children(".move-type").val(move.type);
	moveGroupObj.children(".move-cat").val(move.category);
	moveGroupObj.children(".move-crit").prop("checked", move.alwaysCrit === true);
	var moveHits = moveGroupObj.children(".move-hits");
	moveHits.empty();
	var maxMultiHits = move.maxMultiHits;
	if (maxMultiHits && !move.isMax) {
		for(var i = 2; i <= maxMultiHits; i++) {
			moveHits.append($("<option></option>").attr("value", i).text(i + " hits"));
		}
		moveHits.show();
		moveHits.val($(this).closest(".poke-info").find(".ability").val() === "Skill Link" || moveName === "Population Bomb" ? maxMultiHits : ($(this).closest(".poke-info").find(".item").val() === "Loaded Dice" ? 4 : 3));
	} else {
		moveHits.hide();
	}
	moveGroupObj.children(".move-z").prop("checked", false);
	if (!($(this).closest("poke-info").find(".max").prop("checked"))) {
		moveGroupObj.children(".move-z").prop(".move-max", false);
	}
});

// auto-update set details on select
$(".set-selector").bind("change click keyup keydown", function () {
	var fullSetName = $(this).val();
	var pokemonName, setName;
	pokemonName = fullSetName.substring(0, fullSetName.indexOf(" ("));
	setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));
	var pokemon = pokedex[pokemonName];
	if (!pokemon) {
		console.log("error: `" + pokemonName + "` could not be found in pokedex[]");
		return;
	}
	var pokeObj = $(this).closest(".poke-info");

	// If the sticky move was on this side, reset it
	if (stickyMoves.getSelectedSide() === pokeObj.prop("id")) {
		stickyMoves.clearStickyMove();
	}

	// If the selected move was on this side, reset it
	var selectedMove = $("input:radio[name='resultMove']:checked").prop("id");
	if (selectedMove !== undefined) {
		var selectedSide = selectedMove.charAt(selectedMove.length - 2);
		if (pokeObj.prop("id") === "p1" && selectedSide === "L") {
			$("#resultMoveL1").prop("checked", true);
			$("#resultMoveL1").change();
		}
		else if (pokeObj.prop("id") === "p2" && selectedSide === "R") {
			$("#resultMoveR1").prop("checked", true);
			$("#resultMoveR1").change();
		}
	}

	pokeObj.find(".type1").val(pokemon.t1);
	pokeObj.find(".type2").val(pokemon.t2);
	pokeObj.find(".hp .base").val(pokemon.bs.hp);
	var i;
	for (i = 0; i < STATS.length; i++) {
		pokeObj.find("." + STATS[i] + " .base").val(pokemon.bs[STATS[i]]);
	}
	pokeObj.find(".hp").val("calcHP");
	pokeObj.find(".weight").val(pokemon.w);
	pokeObj.find(".boost").val(0);
	pokeObj.find(".percent-hp").val(100);
	pokeObj.find(".status").val("Healthy");
	$(".status").change();
	pokeObj.find(".max-level").val(10);
	pokeObj.find(".max").prop("checked", false);
	pokeObj.find(".max").change();
	pokeObj.find(".tera-type").val(pokemon.t1);
	pokeObj.find(".tera").prop("checked", false);
	pokeObj.find(".tera").change();
	var moveObj;
	var abilityObj = pokeObj.find(".ability");
	var itemObj = pokeObj.find(".item");
	if (pokemonName in setdexAll && setName in setdexAll[pokemonName]) {
		var set = setdexAll[pokemonName][setName];
		pokeObj.find(".level").val(set.level ? set.level : (localStorage.getItem("autolevelGen" + gen) ? parseInt(localStorage.getItem("autolevelGen" + gen)) : 50));
		pokeObj.find(".hp .evs").val(set.evs && typeof set.evs.hp !== "undefined" ? set.evs.hp : 0);
		pokeObj.find(".hp .ivs").val(set.ivs && typeof set.ivs.hp !== "undefined" ? set.ivs.hp : 31);
		for (i = 0; i < STATS.length; i++) {
			pokeObj.find("." + STATS[i] + " .evs").val(set.evs && typeof set.evs[STATS[i]] !== "undefined" ? set.evs[STATS[i]] : 0);
			pokeObj.find("." + STATS[i] + " .ivs").val(set.ivs && typeof set.ivs[STATS[i]] !== "undefined" ? set.ivs[STATS[i]] : 31);
		}
		setSelectValueIfValid(pokeObj.find(".nature"), set.nature, "Hardy");
		setSelectValueIfValid(abilityObj, set.ability ? set.ability : pokemon.ab, "");
		setSelectValueIfValid(pokeObj.find(".tera-type"), set.teraType, pokemon.t1);
		setSelectValueIfValid(itemObj, set.item, "");
		for (i = 0; i < 4; i++) {
			moveObj = pokeObj.find(".move" + (i + 1) + " select.move-selector");
			setSelectValueIfValid(moveObj, set.moves[i], "(No Move)");
			moveObj.change();
		}
	} else {
		// Blank set
		pokeObj.find(".level").val(localStorage.getItem("autolevelGen" + gen) ? parseInt(localStorage.getItem("autolevelGen" + gen)) : 50);
		pokeObj.find(".hp .evs").val(0);
		pokeObj.find(".hp .ivs").val(31);
		for (i = 0; i < STATS.length; i++) {
			pokeObj.find("." + STATS[i] + " .evs").val(0);
			pokeObj.find("." + STATS[i] + " .ivs").val(31);
		}
		pokeObj.find(".nature").val("Hardy");
		setSelectValueIfValid(abilityObj, pokemon.ab, "");
		pokeObj.find(".tera-type").val(pokemon.t1);
		itemObj.val("");
		for (i = 0; i < 4; i++) {
			moveObj = pokeObj.find(".move" + (i + 1) + " select.move-selector");
			moveObj.val("(No Move)");
			moveObj.change();
		}
	}
	var formeObj = $(this).siblings().find(".forme").parent();
	itemObj.prop("disabled", false);
	if (pokemon.formes) {
		showFormes(formeObj, setName, pokemonName, pokemon);
	} else {
		formeObj.hide();
	}
	calcHP(pokeObj);
	calcStats(pokeObj);
	calcEvTotal(pokeObj);
	abilityObj.change();
	itemObj.change();
});

function showFormes(formeObj, setName, pokemonName, pokemon) {
	var defaultForme = 0;

	if (setName !== "Blank Set") {
		var set = setdexAll[pokemonName][setName];

		if (set.isGmax) defaultForme = 1;

		if (set.item) {
		// Repurpose the previous filtering code to provide the "different default" logic
			if (set.item.includes("ite") && !(set.item.includes("ite Y")) && !(set.item.includes("ite Herb")) ||
				pokemonName === "Groudon" && set.item.includes("Red Orb") ||
				pokemonName === "Kyogre" && set.item.includes("Blue Orb") ||
				pokemonName === "Meloetta" && set.moves.includes("Relic Song") ||
				pokemonName === "Rayquaza" && set.moves.includes("Dragon Ascent") ||
				pokemonName === "Necrozma-Dusk Mane" && set.item.includes("Ultranecrozium Z") ||
				pokemonName === "Necrozma-Dawn Wings" && set.item.includes("Ultranecrozium Z")) {
				defaultForme = 1;
			} else if (set.item.includes("ite Y")) {
				defaultForme = 2;
			}
		}
	}

	var formeOptions = getSelectOptions(pokemon.formes, false, defaultForme);
	formeObj.children("select").find("option").remove().end().append(formeOptions).change();
	formeObj.show();
}

function setSelectValueIfValid(select, value, fallback) {
	select.val(select.children("option[value='" + value + "']").length !== 0 ? value : fallback);
}

$(".forme").change(function () {
	var altForme = pokedex[$(this).val()],
		container = $(this).closest(".info-group").siblings(),
		fullSetName = container.find(".select2-chosen").first().text(),
		pokemonName = fullSetName.substring(0, fullSetName.indexOf(" (")),
		setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));

	$(this).parent().siblings().find(".type1").val(altForme.t1);
	$(this).parent().siblings().find(".type2").val(typeof altForme.t2 != "undefined" ? altForme.t2 : "");
	$(this).parent().siblings().find(".weight").val(altForme.w);

	for (var i = 0; i < STATS.length; i++) {
		var baseStat = container.find("." + STATS[i]).find(".base");
		baseStat.val(altForme.bs[STATS[i]]);
		var altHP = container.find(".hp .base").val(altForme.bs.hp);
		altHP.keyup();
		baseStat.keyup();
	}

	if (abilities.includes(altForme.ab)) {
		container.find(".ability").val(altForme.ab);
	} else if (setName !== "Blank Set" && abilities.includes(setdexAll[pokemonName][setName].ability)) {
		container.find(".ability").val(setdexAll[pokemonName][setName].ability);
	} else {
		container.find(".ability").val("");
	}
	container.find(".ability").keyup();

	if ($(this).val().indexOf("Mega") === 0 && $(this).val() !== "Mega Rayquaza") {
		container.find(".item").val("").keyup();
		//container.find(".item").prop("disabled", true);
		//edited out by squirrelboy1225 for doubles!
	} else {
		container.find(".item").prop("disabled", false);
	}

	if (pokemonName === "Darmanitan") {
		container.find(".percent-hp").val($(this).val() === "Darmanitan-Z" ? "50" : "100").keyup();
	}
	// This is where we would make Zygarde's Forme change @50% HP, need to define var formeName
	// if (pokemonName === "Zygarde" && (formeName === "Zygarde-10%" || formeName === "Zygarde")) {
	//    container.find(".percent-hp").val($(this).val() === "Zygarde-Complete" ? "50" : "100").keyup();
	//}
});

function getTerrainEffects() {
	var className = $(this).prop("className");
	className = className.substring(0, className.indexOf(" "));
	switch (className) {
	case "type1":
	case "type2":
	case "ability":
	case "item":
		var id = $(this).closest(".poke-info").prop("id");
		var terrainValue = $("input:checkbox[name='terrain']:checked").val();
		if (terrainValue === "Electric") {
			$("#" + id).find("[value='Asleep']").prop("disabled", isGroundedTerrain($("#" + id)));
		} else if (terrainValue === "Misty") {
			$("#" + id).find(".status").prop("disabled", isGroundedTerrain($("#" + id)));
		}
		break;
	default:
		$("input:checkbox[name='terrain']").not(this).prop("checked", false);
		if ($(this).prop("checked") && $(this).val() === "Electric") {
			$("#p1").find("[value='Asleep']").prop("disabled", isGroundedTerrain($("#p1")));
			$("#p2").find("[value='Asleep']").prop("disabled", isGroundedTerrain($("#p2")));
		} else if ($(this).prop("checked") && $(this).val() === "Misty") {
			$("#p1").find(".status").prop("disabled", isGroundedTerrain($("#p1")));
			$("#p2").find(".status").prop("disabled", isGroundedTerrain($("#p2")));
		} else {
			$("#p1").find("[value='Asleep']").prop("disabled", false);
			$("#p1").find(".status").prop("disabled", false);
			$("#p2").find("[value='Asleep']").prop("disabled", false);
			$("#p2").find(".status").prop("disabled", false);
		}
		break;
	}
}

function isGroundedTerrain(pokeInfo) {
	return $("#gravity").prop("checked") || pokeInfo.find(".type1").val() !== "Flying" && pokeInfo.find(".type2").val() !== "Flying" &&
            pokeInfo.find(".ability").val() !== "Levitate" && pokeInfo.find(".item").val() !== "Air Balloon";
}

// Need to close over "lastClicked", so we'll do it the old-fashioned way to avoid
// needlessly polluting the global namespace.
var stickyMoves = (function () {
	var lastClicked = "resultMoveL1";
	$(".result-move").click(function () {
		if (this.id === lastClicked) {
			$(this).toggleClass("locked-move");
		} else {
			$(".locked-move").removeClass("locked-move");
		}
		lastClicked = this.id;
	});

	return {
		"clearStickyMove": function () {
			lastClicked = null;
			$(".locked-move").removeClass("locked-move");
		},
		"setSelectedMove": function (slot) {
			lastClicked = slot;
		},
		"getSelectedSide": function () {
			if (lastClicked) {
				if (lastClicked.includes("resultMoveL")) {
					return "p1";
				} else if (lastClicked.includes("resultMoveR")) {
					return "p2";
				}
			}
			return null;
		}
	};
})();

function Pokemon(pokeInfo, setName) { // if passing a jquery object, just call this with 1 argument
	if (typeof pokeInfo === "string") {
		// this branch is used for the mass calc; pokeInfo is species name
		this.name = pokeInfo;
		var pokemon = pokedex[pokeInfo];
		this.type1 = pokemon.t1;
		this.type2 = pokemon.t2 && typeof pokemon.t2 !== "undefined" ? pokemon.t2 : "";
		this.rawStats = [];
		this.boosts = [];
		this.stats = [];
		this.evs = [];

		var set = setdex[this.name][setName];
		//this.isGmax = setName.includes("-Gmax") || pokemon.isGmax || set.isGmax;
		this.level = set.level ? set.level : (localStorage.getItem("autolevelGen" + gen) ? parseInt(localStorage.getItem("autolevelGen" + gen)) : 50);

		this.HPEVs = set.evs && typeof set.evs.hp !== "undefined" ? set.evs.hp : 0;
		if (gen < 3) {
			var HPDVs = 15;
			// ~~ is used as a faster Math.floor() for positive numbers and fails on negative ones
			this.maxHP = ~~(((pokemon.bs.hp + HPDVs) * 2 + 63) * this.level / 100) + this.level + 10;
		} else if (pokemon.bs.hp === 1) {
			this.maxHP = 1;
		} else {
			var HPIVs = set.ivs && typeof set.ivs.hp !== "undefined" ? set.ivs.hp : 31;
			this.maxHP = ~~((pokemon.bs.hp * 2 + HPIVs + ~~(this.HPEVs / 4)) * this.level / 100) + this.level + 10;
		}
		this.curHP = this.maxHP;
		this.nature = set.nature;
		for (var i = 0; i < STATS.length; i++) {
			var stat = STATS[i];
			this.boosts[stat] = 0;
			this.evs[stat] = set.evs && typeof set.evs[stat] !== "undefined" ? set.evs[stat] : 0;
			if (gen < 3) {
				var dvs = 15;
				this.rawStats[stat] = ~~(((pokemon.bs[stat] + dvs) * 2 + 63) * this.level / 100) + 5;
			} else {
				var ivs = set.ivs && typeof set.ivs[stat] !== "undefined" ? set.ivs[stat] : 31;
				var natureMods = NATURES[this.nature];
				var nature = natureMods[0] === stat ? 1.1 : natureMods[1] === stat ? 0.9 : 1;
				this.rawStats[stat] = ~~((~~((pokemon.bs[stat] * 2 + ivs + ~~(this.evs[stat] / 4)) * this.level / 100) + 5) * nature);
			}
		}

		this.ability = set.ability && typeof set.ability !== "undefined" ? set.ability :
			pokemon.ab && typeof pokemon.ab !== "undefined" ? pokemon.ab : "";
		this.item = set.item && typeof set.item !== "undefined" && (set.item === "Eviolite" || !(set.item.includes("ite"))) ? set.item : "";
		this.status = "Healthy";
		this.toxicCounter = 0;
		this.moves = [];
		for (var i = 0; i < 4; i++) {
			var moveName = set.moves[i];
			var defaultDetails = moves[moveName] || moves["(No Move)"];
			this.moves.push($.extend({}, defaultDetails, {
				"name": defaultDetails.bp === 0 ? "(No Move)" : moveName,
				"bp": defaultDetails.bp,
				"type": defaultDetails.type,
				"category": defaultDetails.category,
				"isCrit": !!defaultDetails.alwaysCrit,
				"acc": defaultDetails.acc,
				"hits": defaultDetails.maxMultiHits ? (this.ability === "Skill Link" || moveName === "Population Bomb" || moveName === "Triple Axel" ? defaultDetails.maxMultiHits : (this.item === "Loaded Dice" ? 4 : 3)) : defaultDetails.isThreeHit ? 3 : defaultDetails.isTwoHit ? 2 : 1,
				"usedTimes": 1
			}));
		}
		this.baseMoveNames = [this.moves[0].name, this.moves[1].name, this.moves[2].name, this.moves[3].name];
		this.weight = pokemon.w;
		this.tier = set.tier;
	} else {
		// pokeInfo is a jquery object
		var setName = pokeInfo.find("input.set-selector").val();
		if (setName.indexOf("(") === -1) {
			this.name = setName;
		} else {
			var pokemonName = setName.substring(0, setName.indexOf(" ("));
			this.name = pokedex[pokemonName].formes ? pokeInfo.find(".forme").val() : pokemonName;
		}
		this.type1 = pokeInfo.find(".type1").val();
		this.type2 = pokeInfo.find(".type2").val();
		// ~~ is used as a faster Math.floor() for positive numbers and fails on negative ones
		this.level = ~~pokeInfo.find(".level").val();
		this.maxHP = ~~pokeInfo.find(".hp .total").text();
		this.curHP = ~~pokeInfo.find(".current-hp").val();
		this.HPEVs = ~~pokeInfo.find(".hp .evs").val();
		this.HPIVs = ~~pokeInfo.find(".hp .ivs").val();
		this.isDynamax = pokeInfo.find(".max").prop("checked");
		this.isTerastal = pokeInfo.find(".tera").prop("checked");
		if (gen === 9) {
			this.teraType = pokeInfo.find(".tera-type").val();
		}
		var dexEntry = pokedex[setName.substring(0, setName.indexOf(" ("))];
		this.dexType1 = dexEntry.t1;
		this.dexType2 = dexEntry.t2;
		this.rawStats = [];
		this.boosts = [];
		this.stats = [];
		this.evs = [];
		this.ivs = [];
		for (var i = 0; i < STATS.length; i++) {
			this.rawStats[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .total").text();
			this.boosts[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .boost").val();
			this.evs[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .evs").val();
			this.ivs[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .ivs").val();
		}
		this.nature = pokeInfo.find(".nature").val();
		this.ability = pokeInfo.find(".ability").val();
		this.item = pokeInfo.find(".item").val();
		this.status = pokeInfo.find(".status").val();
		this.toxicCounter = this.status === "Badly Poisoned" ? ~~pokeInfo.find(".toxic-counter").val() : 0;
		var move1 = pokeInfo.find(".move1");
		var move2 = pokeInfo.find(".move2");
		var move3 = pokeInfo.find(".move3");
		var move4 = pokeInfo.find(".move4");
		this.baseMoveNames = [move1.find("select.move-selector").val(), move2.find("select.move-selector").val(), move3.find("select.move-selector").val(), move4.find("select.move-selector").val()];
		this.moves = [
			getMoveDetails(move1, this.item, this.name),
			getMoveDetails(move2, this.item, this.name),
			getMoveDetails(move3, this.item, this.name),
			getMoveDetails(move4, this.item, this.name)
		];
		this.weight = +pokeInfo.find(".weight").val();
	}
	this.hasType = function (type) {
		return this.type1 === type || this.type2 === type;
	};
}

function getMoveDetails(moveInfo, item, species) {
	var moveName = moveInfo.find("select.move-selector").val();
	var defaultDetails = moves[moveName];
	var isZMove = gen == 7 && moveInfo.find("input.move-z").prop("checked");
	var isMax = gen == 8 && moveInfo.find("input.move-max").prop("checked");

	if (isMax) {
		var exceptions_100_fight = ["Low Kick", "Reversal", "Final Gambit"];
		var exceptions_80_fight = ["Double Kick", "Triple Kick"];
		var exceptions_75_fight = ["Counter", "Seismic Toss"];
		var exceptions_140 = ["Triple Axel", "Crush Grip", "Wring Out", "Magnitude", "Double Iron Bash", "Rising Voltage"];
		var exceptions_130 = ["Scale Shot", "Dual Wingbeat", "Terrain Pulse", "Bolt Beak (Doubled)", "Fishious Rend (Doubled)", "Pin Missile", "Power Trip", "Punishment", "Dragon Darts", "Dual Chop", "Electro Ball", "Heat Crash",
			"Bullet Seed", "Grass Knot", "Bonemerang", "Bone Rush", "Fissure", "Icicle Spear", "Sheer Cold", "Weather Ball", "Tail Slap", "Guillotine", "Horn Drill",
			"Flail", "Return", "Frustration", "Endeavor", "Natural Gift", "Trump Card", "Stored Power", "Rock Blast", "Gear Grind", "Gyro Ball", "Heavy Slam"];
		var exceptions_120 = ["Double Hit", "Spike Cannon"];
		var exceptions_100 = ["Twineedle", "Beat Up", "Fling", "Dragon Rage", "Nature\'s Madness", "Night Shade", "Comet Punch", "Fury Swipes", "Sonic Boom", "Bide",
			"Super Fang", "Present", "Spit Up", "Psywave", "Mirror Coat", "Metal Burst"];

		var tempBP = 0;

		var maxMoveName = MAXMOVES_LOOKUP[defaultDetails.type];

		if (moves[maxMoveName].type == "Fighting" || moves[maxMoveName].type == "Poison") {
			if (exceptions_100_fight.includes(moveName)) tempBP = 100;
			else if (exceptions_80_fight.includes(moveName)) tempBP = 80;
			else if (exceptions_75_fight.includes(moveName)) tempBP = 75;
			else if (defaultDetails.bp >= 150) tempBP = 100;
			else if (defaultDetails.bp >= 110) tempBP = 95;
			else if (defaultDetails.bp >= 75) tempBP = 90;
			else if (defaultDetails.bp >= 65) tempBP = 85;
			else if (defaultDetails.bp >= 55) tempBP = 80;
			else if (defaultDetails.bp >= 45) tempBP = 75;
			else if (defaultDetails.bp >= 1) tempBP = 70;
		} else {
			if (exceptions_140.includes(moveName)) tempBP = 140;
			else if (exceptions_130.includes(moveName)) tempBP = 130;
			else if (exceptions_120.includes(moveName)) tempBP = 120;
			else if (exceptions_100.includes(moveName)) tempBP = 100;
			else if (defaultDetails.bp >= 150) tempBP = 150;
			else if (defaultDetails.bp >= 110) tempBP = 140;
			else if (defaultDetails.bp >= 75) tempBP = 130;
			else if (defaultDetails.bp >= 65) tempBP = 120;
			else if (defaultDetails.bp >= 55) tempBP = 110;
			else if (defaultDetails.bp >= 45) tempBP = 100;
			else if (defaultDetails.bp >= 1) tempBP = 90;
		}

		var tempType = defaultDetails.type;
		var ability = moveInfo.closest(".poke-info").find(".ability").val();
		// changing the type like this prevents getDamageResult() from applying the -ate boost, which is accurate to the game
		if (ability === "Pixilate" && tempType === "Normal") {
			maxMoveName = "Max Starfall";
			tempType = "Fairy";
		} else if (ability === "Refrigerate" && tempType === "Normal") {
			maxMoveName = "Max Hailstorm";
			tempType = "Ice";
		}

		if (tempBP == 0) {
			maxMoveName = "Max Guard";
			tempType = "Normal";
		} else if (species === "Cinderace-Gmax" && tempType === "Fire") {
			tempBP = 160;
			maxMoveName = "G-Max Fireball";
		} else if (species === "Inteleon-Gmax" && tempType === "Water") {
			tempBP = 160;
			maxMoveName = "G-Max Hydrosnipe";
		} else if (species === "Rillaboom-Gmax" && tempType === "Grass") {
			tempBP = 160;
			maxMoveName = "G-Max Drum Solo";
		}

		return $.extend({}, moves[maxMoveName], {
			"name": maxMoveName,
			"moveDescName": maxMoveName + " (" + tempBP + "BP)",
			"bp": tempBP,
			"type": tempType,
			"category": defaultDetails.category,
			"isCrit": moveInfo.find(".move-crit").prop("checked"),
			"hits": 1,
			"isMax": true
		});
	}

	// If z-move is checked but there isn't a corresponding z-move, use the original move
	if (isZMove && "zp" in defaultDetails) {
		var zMoveName = getZMoveName(moveName, defaultDetails.type, item);
		return $.extend({}, moves[zMoveName], {
			"name": zMoveName,
			"bp": moves[zMoveName].bp === 1 ? defaultDetails.zp : moves[zMoveName].bp,
			"category": defaultDetails.category,
			"isCrit": moveInfo.find(".move-crit").prop("checked"),
			"hits": 1
		});
	} else {
		return $.extend({}, defaultDetails, {
			"name": moveName,
			"bp": ~~moveInfo.find(".move-bp").val(),
			"type": moveInfo.find(".move-type").val(),
			"category": moveInfo.find(".move-cat").val(),
			"isCrit": moveInfo.find(".move-crit").prop("checked"),
			"isMax": isMax,
			"hits": defaultDetails.maxMultiHits ? ~~moveInfo.find(".move-hits").val() : defaultDetails.isThreeHit ? 3 : defaultDetails.isTwoHit ? 2 : 1,
			"usedTimes": defaultDetails.dropsStats ? ~~moveInfo.find(".stat-drops").val() : 1
		});
	}
}

function getZMoveName(moveName, moveType, item) {
	return moveName.includes("Hidden Power") ? "Breakneck Blitz" : // Hidden Power will become Breakneck Blitz
		moveName === "Clanging Scales" && item === "Kommonium Z" ? "Clangorous Soulblaze" :
			moveName === "Darkest Lariat" && item === "Incinium Z" ? "Malicious Moonsault" :
				moveName === "Giga Impact" && item === "Snorlium Z" ? "Pulverizing Pancake" :
					moveName === "Moongeist Beam" && item === "Lunalium Z" ? "Menacing Moonraze Maelstrom" :
						moveName === "Photon Geyser" && item === "Ultranecrozium Z" ? "Light That Burns the Sky" :
							moveName === "Play Rough" && item === "Mimikium Z" ? "Let\'s Snuggle Forever" :
								moveName === "Psychic" && item === "Mewnium Z" ? "Genesis Supernova" :
									moveName === "Sparkling Aria" && item === "Primarium Z" ? "Oceanic Operetta" :
										moveName === "Spectral Thief" && item === "Marshadium Z" ? "Soul-Stealing 7-Star Strike" :
											moveName === "Spirit Shackle" && item === "Decidium Z" ? "Sinister Arrow Raid" :
												moveName === "Stone Edge" && item === "Lycanium Z" ? "Splintered Stormshards" :
													moveName === "Sunsteel Strike" && item === "Solganium Z" ? "Searing Sunraze Smash" :
														moveName === "Thunderbolt" && item === "Aloraichium Z" ? "Stoked Sparksurfer" :
															moveName === "Thunderbolt" && item === "Pikashunium Z" ? "10,000,000 Volt Thunderbolt" :
																moveName === "Volt Tackle" && item === "Pikanium Z" ? "Catastropika" :
																	moveName === "Nature\'s Madness" && item === "Tapunium Z" ? "Guardian of Alola" :
																		moveName === "Spectral Thief" && item === "Marshadium Z" ? "Soul-Stealing 7-Star Strike" :
																			ZMOVES_TYPING[moveType];
}

function Field() {
	var format = $("input:radio[name='format']:checked").val().toLowerCase()
	var isGravity = $("#gravity").prop("checked");
	var isSR = [$("#srL").prop("checked"), $("#srR").prop("checked")];
	var isProtect = [$("#protectL").prop("checked"), $("#protectR").prop("checked")];
	var weather = $("input:radio[name='weather']:checked").val();
	var spikes = [~~$("input:radio[name='spikesL']:checked").val(), ~~$("input:radio[name='spikesR']:checked").val()];
	var terrain = $("input:radio[name='terrain']:checked").val() ? $("input:radio[name='terrain']:checked").val() : "";
	var isReflect = [$("#reflectL").prop("checked"), $("#reflectR").prop("checked")];
	var isLightScreen = [$("#lightScreenL").prop("checked"), $("#lightScreenR").prop("checked")];
	var isSeeded = [$("#leechSeedL").prop("checked"), $("#leechSeedR").prop("checked")];
	var isForesight = [$("#foresightL").prop("checked"), $("#foresightR").prop("checked")];
	var isHelpingHand = [$("#helpingHandR").prop("checked"), $("#helpingHandL").prop("checked")]; // affects attacks against opposite side
	var isPowerSpot = [$("#powerSpotR").prop("checked"), $("#powerSpotL").prop("checked")]; // affects attacks against opposite side
	var isFriendGuard = [$("#friendGuardL").prop("checked"), $("#friendGuardR").prop("checked")];
	var isBattery = [$("#batteryR").prop("checked"), $("#batteryL").prop("checked")];
	var isMinimized = [$("#minimL").prop("checked"), $("#minimR").prop("checked")];
	var isVictoryStar = [$("#vicStarL").prop("checked"), $("#vicStarR").prop("checked")];
	var isBusted8 = [$("#busted8L").prop("checked"), $("#busted8R").prop("checked")];
	var isBusted16 = [$("#busted16L").prop("checked"), $("#busted16R").prop("checked")];
	var isSteelySpirit = [$("#steelySpiritR").prop("checked"), $("#steelySpiritL").prop("checked")]; // affects attacks against opposite side
	var fainted = [$("#faintedR").val(), $("#faintedL").val()]; // affects attacks against opposite side
	var isRuinTablets = [$("#ruinTabletsL").prop("checked"), $("#ruinTabletsR").prop("checked")];
	var isRuinVessel = [$("#ruinVesselL").prop("checked"), $("#ruinVesselR").prop("checked")];
	var isRuinSword = [$("#ruinSwordR").prop("checked"), $("#ruinSwordL").prop("checked")]; // affects attacks against opposite side
	var isRuinBeads = [$("#ruinBeadsR").prop("checked"), $("#ruinBeadsL").prop("checked")]; // affects attacks against opposite side

	this.getWeather = function () {
		return weather;
	};
	this.setWeather = function (newWeather) {
		weather = newWeather;
	};
	this.clearWeather = function () {
		weather = "";
	};
	this.getTerrain = function () {
		return terrain;
	};
	this.getSide = function (i) {
		return new Side(format, terrain, weather, isGravity, isSR[i], spikes[i], isReflect[i], isLightScreen[i], isSeeded[i],
			isForesight[i], isHelpingHand[i], isMinimized[i], isVictoryStar[i], isFriendGuard[i], isBattery[i],
			isProtect[i], isPowerSpot[i], isBusted8[i], isBusted16[i], isSteelySpirit[i],
			fainted[i], isRuinTablets[i], isRuinVessel[i], isRuinSword[i], isRuinBeads[i]);
	};
}

function Side(format, terrain, weather, isGravity, isSR, spikes, isReflect, isLightScreen, isSeeded, isForesight, isHelpingHand,
	isMinimized, isVictoryStar, isFriendGuard, isBattery, isProtect,
	isPowerSpot, isBusted8, isBusted16, isSteelySpirit,
	faintedCount, isRuinTablets, isRuinVessel, isRuinSword, isRuinBeads) {
	this.format = format;
	this.terrain = terrain;
	this.weather = weather;
	this.isGravity = isGravity;
	this.isSR = isSR;
	this.spikes = spikes;
	this.isReflect = isReflect;
	this.isLightScreen = isLightScreen;
	this.isSeeded = isSeeded;
	this.isForesight = isForesight;
	this.isHelpingHand = isHelpingHand;
	this.isMinimized = isMinimized;
	this.isVictoryStar = isVictoryStar;
	this.isFriendGuard = isFriendGuard;
	this.isBattery = isBattery;
	this.isProtect = isProtect;
	this.isPowerSpot = isPowerSpot;
	this.isBusted8 = isBusted8;
	this.isBusted16 = isBusted16;
	this.isSteelySpirit = isSteelySpirit;
	this.faintedCount = faintedCount;
	this.isRuinTablets = isRuinTablets;
	this.isRuinVessel = isRuinVessel;
	this.isRuinSword = isRuinSword;
	this.isRuinBeads = isRuinBeads;
}

var gen, pokedex, setdex, setdexAll, typeChart, moves, abilities, items, calculateAllMoves;
var STATS = STATS_GSC;
var calcHP = CALC_HP_ADV;
var calcStat = CALC_STAT_ADV;
$(".gen").change(function () {
	gen = ~~$(this).val();
	switch (gen) {
	case 3:
		pokedex = POKEDEX_ADV;
		setdex = SETDEX_EM;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_ADV;
		items = ITEMS_ADV;
		abilities = ABILITIES_ADV;
		calculateAllMoves = CALCULATE_ALL_MOVES_ADV;
		localStorage.setItem("selectedGen", 3);
		break;
	case 4:
		pokedex = POKEDEX_DPP;
		setdex = SETDEX_PHGSS;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_DPP;
		items = ITEMS_DPP;
		abilities = ABILITIES_DPP;
		calculateAllMoves = CALCULATE_ALL_MOVES_PTHGSS;
		localStorage.setItem("selectedGen", 4);
		break;
	case 5:
		pokedex = POKEDEX_BW;
		setdex = SETDEX_GEN5;
		typeChart = TYPE_CHART_GSC;
		moves = MOVES_BW;
		items = ITEMS_BW;
		abilities = ABILITIES_BW;
		calculateAllMoves = CALCULATE_ALL_MOVES_MODERN;
		localStorage.setItem("selectedGen", 5);
		break;
	case 6:
		pokedex = POKEDEX_XY;
		setdex = SETDEX_GEN6;
		typeChart = TYPE_CHART_XY;
		moves = MOVES_XY;
		items = ITEMS_XY;
		abilities = ABILITIES_XY;
		calculateAllMoves = CALCULATE_ALL_MOVES_MODERN;
		localStorage.setItem("selectedGen", 6);
		break;
	case 7:
		pokedex = POKEDEX_SM;
		setdex = SETDEX_GEN7;
		typeChart = TYPE_CHART_XY;
		moves = MOVES_SM;
		items = ITEMS_SM;
		abilities = ABILITIES_SM;
		calculateAllMoves = CALCULATE_ALL_MOVES_MODERN;
		localStorage.setItem("selectedGen", 7);
		break;
	case 8:
		pokedex = POKEDEX_SS;
		setdex = SETDEX_GEN8;
		typeChart = TYPE_CHART_XY;
		moves = MOVES_SS;
		items = ITEMS_SS;
		abilities = ABILITIES_SS;
		calculateAllMoves = CALCULATE_ALL_MOVES_MODERN;
		localStorage.setItem("selectedGen", 8);
		break;
	case 80:
		pokedex = POKEDEX_BDSP;
		setdex = SETDEX_GEN80;
		typeChart = TYPE_CHART_XY;
		moves = MOVES_SS;
		items = ITEMS_SS;
		abilities = ABILITIES_SS;
		calculateAllMoves = CALCULATE_ALL_MOVES_MODERN;
		localStorage.setItem("selectedGen", 80);
		break;
	case 9:
		pokedex = POKEDEX_SV;
		setdex = SETDEX_CUSTOM;//SV
		typeChart = TYPE_CHART_XY;
		moves = MOVES_SV;
		items = ITEMS_SV;
		abilities = ABILITIES_SV;
		calculateAllMoves = CALCULATE_ALL_MOVES_MODERN;
		localStorage.setItem("selectedGen", 9);
	}
	setdexAll = joinDexes([setdex, SETDEX_CUSTOM]);
	clearField();
	$(".gen-specific.g" + gen).show();
	$(".gen-specific").not(".g" + gen).hide();
	var typeOptions = getSelectOptions(Object.keys(typeChart));
	$("select.type1, select.move-type").find("option").remove().end().append(typeOptions);
	$("select.type2").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
	var moveOptions = getSelectOptions(Object.keys(moves), true);
	$("select.move-selector").find("option").remove().end().append(moveOptions);
	var abilityOptions = getSelectOptions(abilities, true);
	$("select.ability").find("option").remove().end().append("<option value=\"\">(other)</option>" + abilityOptions);
	var itemOptions = getSelectOptions(items, true);
	$("select.item").find("option").remove().end().append("<option value=\"\">(none)</option>" + itemOptions);

	$(".set-selector").val(getSetOptions()[1].id); // load the first set after the unselectable species name
	$(".set-selector").change();
});

function joinDexes(components) {
	var joinedDex = {};
	for (var i = 0; i < components.length; i++) {
		var sourceDex = components[i];
		if (sourceDex) {
			for (var p in sourceDex) {
				if (sourceDex.hasOwnProperty(p)) {
					joinedDex[p] = $.extend(joinedDex[p], sourceDex[p]);
				}
			}
		}
	}
	return joinedDex;
}

function clearField() {
	var storedLevel = localStorage.getItem("autolevelGen" + gen) ? localStorage.getItem("autolevelGen" + gen) : 50;
	if (gen == 3 || gen == 4) {
		$("#autolevel-box").val(storedLevel);
	} else {
		$("input:radio[id='autolevel" + storedLevel + "']").prop("checked", true);
	}
	if (localStorage.getItem("selectedFormat") != null) {
		switch (localStorage.getItem("selectedFormat") + "") {

		case "singles":
			$("#singles").prop("checked", true);
			break;

		case "doubles":
			$("#doubles").prop("checked", true);
			break;

		default:
			$("#doubles").prop("checked", true);
		}
	} else if (gen == 3 || gen == 4) {
		$("#singles").prop("checked", true);
	} else {
		$("#doubles").prop("checked", true);
	}
	$("#clear").prop("checked", true);
	$("#gscClear").prop("checked", true);
	$("#gravity").prop("checked", false);
	$("#srL").prop("checked", false);
	$("#srR").prop("checked", false);
	$("#spikesL0").prop("checked", true);
	$("#spikesR0").prop("checked", true);
	$("#gscSpikesL").prop("checked", false);
	$("#gscSpikesR").prop("checked", false);
	$("#reflectL").prop("checked", false);
	$("#reflectR").prop("checked", false);
	$("#lightScreenL").prop("checked", false);
	$("#lightScreenR").prop("checked", false);
	$("#leechSeedL").prop("checked", false);
	$("#leechSeedR").prop("checked", false);
	$("#foresightL").prop("checked", false);
	$("#foresightR").prop("checked", false);
	$("#helpingHandL").prop("checked", false);
	$("#helpingHandR").prop("checked", false);
	$("#powerSpotL").prop("checked", false);
	$("#powerSpotR").prop("checked", false);
	$("#friendGuardL").prop("checked", false);
	$("#friendGuardR").prop("checked", false);
	$("#clangL").prop("checked", false);
	$("#clangR").prop("checked", false);
	$("#wpL").prop("checked", false);
	$("#wpR").prop("checked", false);
	$("#evoL").prop("checked", false);
	$("#evoR").prop("checked", false);
	$("#steelySpiritL").prop("checked", false);
	$("#steelySpiritR").prop("checked", false);
	$("#faintedL").val(0);
	$("#faintedR").val(0);
	$("#ruinTabletsL").prop("checked", false);
	$("#ruinTabletsR").prop("checked", false);
	$("#ruinVesselL").prop("checked", false);
	$("#ruinVesselR").prop("checked", false);
	$("#ruinSwordL").prop("checked", false);
	$("#ruinSwordR").prop("checked", false);
	$("#ruinBeadsL").prop("checked", false);
	$("#ruinBeadsR").prop("checked", false);
}

function getSetOptions() {
	var pokeNames, index;
	pokeNames = Object.keys(pokedex);
	index = pokeNames.length;
	while (index--) {
		if (pokedex[pokeNames[index]].isAlternateForme) {
			pokeNames.splice(index, 1);
		}
	}
	pokeNames.sort();
	index = pokeNames.length;
	while (index--) { //forcing alolan forms to show first
		if (pokeNames[index].includes("-Alola")) {
			var temp = pokeNames[index];
			pokeNames.splice(index, 1); //deleting alolan entry
			var regularForm = temp.substring(0, temp.indexOf("-Alola"));
			var regularIndex = pokeNames.indexOf(regularForm);
			pokeNames.splice(regularIndex, 0, temp); //re-inserting it right before non-alolan entry
		}
	}
	var setOptions = [];
	for (var i = 0; i < pokeNames.length; i++) {
		var pokeName = pokeNames[i];
		setOptions.push({
			"pokemon": pokeName,
			"text": pokeName
		});
		if (pokeName in setdexAll) {
			var setNames = Object.keys(setdexAll[pokeName]);
			for (var j = 0; j < setNames.length; j++) {
				var setName = setNames[j];
				setOptions.push({
					"pokemon": pokeName,
					"set": setName,
					"text": pokeName + " (" + setName + ")",
					"id": pokeName + " (" + setName + ")"
				});
			}
		}
		setOptions.push({
			"pokemon": pokeName,
			"set": "Blank Set",
			"text": pokeName + " (Blank Set)",
			"id": pokeName + " (Blank Set)"
		});
	}
	return setOptions;
}

function getSelectOptions(arr, sort, defaultIdx) {
	if (sort) {
		arr.sort();
	}
	var r = "";
	// Zero is of course falsy too, but this is mostly to coerce undefined.
	if (!defaultIdx) {
		defaultIdx = 0;
	}
	for (var i = 0; i < arr.length; i++) {
		if (i === defaultIdx) {
			r += '<option value="' + arr[i] + '" selected="selected">' + arr[i] + "</option>";
		} else {
			r += '<option value="' + arr[i] + '">' + arr[i] + "</option>";
		}
	}
	return r;
}

$(document).ready(function () {
	if (localStorage.getItem("selectedGen") != null) {
		switch (localStorage.getItem("selectedGen") + "") {

		case "3":
			$("#gen3").prop("checked", true);
			$("#gen3").change();
			break;

		case "4":
			$("#gen4").prop("checked", true);
			$("#gen4").change();
			break;

		case "5":
			$("#gen5").prop("checked", true);
			$("#gen5").change();
			break;

		case "6":
			$("#gen6").prop("checked", true);
			$("#gen6").change();
			break;

		case "7":
			$("#gen7").prop("checked", true);
			$("#gen7").change();
			break;

		case "8":
			$("#gen8").prop("checked", true);
			$("#gen8").change();
			break;
				
		case "80": // BDSP
			$("#gen80").prop("checked", true);
			$("#gen80").change();
			break;
				
		case "9":
			$("#gen9").prop("checked", true);
			$("#gen9").change();
			break;

		default:
			$("#gen9").prop("checked", true);
			$("#gen9").change();
		}
	} else {
		$("#gen9").prop("checked", true);
		$("#gen9").change();
	}
	$(".terrain-trigger").bind("change keyup", getTerrainEffects);
	//$(".calc-trigger").bind("change keyup", calculate);
	$(".set-selector").select2({
		"formatResult": function (object) {
			return object.set ? "&nbsp;&nbsp;&nbsp;" + object.set : "<b>" + object.text + "</b>";
		},
		"query": function (query) {
			var setOptions = getSetOptions();
			var pageSize = 30;
			var results = [];
			for (var i = 0; i < setOptions.length; i++) {
				var pokeName = setOptions[i].pokemon.toUpperCase();
				if (!query.term || pokeName.indexOf(query.term.toUpperCase()) === 0 || pokeName.includes("" + query.term.toUpperCase())) {
					results.push(setOptions[i]);
				}
			}
			query.callback({
				"results": results.slice((query.page - 1) * pageSize, query.page * pageSize),
				"more": results.length >= query.page * pageSize
			});
		},
		"initSelection": function (element, callback) {
			var data = getSetOptions()[1]; // skip over the unselectable first species name and display the name of the first set in the selector
			callback(data);
		}
	});
	$(".move-selector").select2({
		"dropdownAutoWidth": true,
		"matcher": function (term, text) {
			// 2nd condition is for Hidden Power
			return text.toUpperCase().indexOf(term.toUpperCase()) === 0 || text.toUpperCase().includes(" " + term.toUpperCase());
		}
	});
	$(".set-selector").val(getSetOptions()[1].id); // load the first set after the unselectable species name
	$(".set-selector").change();
});

var linkExtension = '.html';
