function CALCULATE_ALL_MOVES_ADV(p1, p2, field) {
	checkAirLock(p1, field);
	checkAirLock(p2, field);
	checkForecast(p1, field.getWeather());
	checkForecast(p2, field.getWeather());
	p1.stats[SP] = getFinalSpeed(p1, field.getWeather(), field.getTerrain());
	p2.stats[SP] = getFinalSpeed(p2, field.getWeather(), field.getTerrain());
	checkIntimidate(p1, p2);
	checkIntimidate(p2, p1);
	var side1 = field.getSide(1);
	var side2 = field.getSide(0);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		results[0][i] = getDamageResultADV(p1, p2, p1.moves[i], side1);
		results[1][i] = getDamageResultADV(p2, p1, p2.moves[i], side2);
	}
	return results;
}

function CALCULATE_MOVES_OF_ATTACKER_ADV(attacker, defender, field) {
	checkAirLock(attacker, field);
	checkAirLock(defender, field);
	checkForecast(attacker, field.getWeather());
	checkForecast(defender, field.getWeather());
	attacker.stats[SP] = getFinalSpeed(attacker, field.getWeather());
	defender.stats[SP] = getFinalSpeed(defender, field.getWeather());
	checkIntimidate(attacker, defender);
	checkIntimidate(defender, attacker);
	var defenderSide = field.getSide(~~(mode === "one-vs-all"));
	var results = [];
	for (var i = 0; i < 4; i++) {
		results[i] = getDamageResultADV(attacker, defender, attacker.moves[i], defenderSide);
	}
	return results;
}

function getDamageResultADV(attacker, defender, move, field) {
	var description = {
		"attackerName": attacker.name,
		"moveName": move.name,
		"defenderName": defender.name
	};

	if (killsShedinja(attacker, defender, move)) {
		return {"damage": [1], "description": buildDescription(description)};
	}
	if (move.bp === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	let moveType = move.type;

	var isCritical = move.isCrit && ["Battle Armor", "Shell Armor"].indexOf(defender.ability) === -1;

	if (move.name === "Weather Ball") {
		moveType = getWeatherBall(field.weather, attacker.item);
		if (moveType !== "Normal") {
			description.weather = field.weather;
		}
		description.moveBP = move.bp;
	}

	// If a move's type is different from its default type, print it.
	if (move.name in moves) {
		let moveDefaultDetails = moves[move.name];
		if (moveDefaultDetails.hasOwnProperty("type") && moveType !== moveDefaultDetails.type) {
			description.moveType = moveType;
		}
	}

	var typeEffect1 = getMoveEffectiveness(move, moveType, defender.type1);
	var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, moveType, defender.type2) : 1;
	var typeEffectiveness = typeEffect1 * typeEffect2;

	if (typeEffectiveness === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	if ((defender.ability.indexOf("Flash Fire") !== -1 && moveType === "Fire") ||
            (defender.ability === "Levitate" && moveType === "Ground") ||
            (defender.ability === "Volt Absorb" && moveType === "Electric") ||
            (defender.ability === "Water Absorb" && moveType === "Water") ||
            (defender.ability === "Wonder Guard" && typeEffectiveness <= 1 && !["Struggle", "Beat Up", "Future Sight", "Doom Desire"].includes(move.name)) ||
            (defender.ability === "Soundproof" && move.isSound)) {
		description.defenderAbility = defender.ability;
		return {"damage": [0], "description": buildDescription(description)};
	}

	description.HPEVs = defender.HPEVs + " HP";
	let attackerLevel = attacker.level;
	if (attackerLevel != defender.level || (attackerLevel != 50 && attackerLevel != 100)) {
		description.attackerLevel = attackerLevel;
		description.defenderLevel = defender.level;
	}

	if (move.name === "Seismic Toss" || move.name === "Night Shade") {
		return {"damage": [attackerLevel], "description": buildDescription(description)};
	}

	if (move.hits > 1) {
		description.hits = move.hits;
	}

	var basePower;
	switch (move.name) {
	case "Flail":
	case "Reversal":
		var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
		basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Eruption":
	case "Water Spout":
		basePower = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
		description.moveBP = basePower;
		break;
	case "Low Kick":
		var w = defender.weight;
		basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
		description.moveBP = basePower;
		break;
	default:
		basePower = move.bp;
	}

	var isPhysical = moveType === "None" || typeChart[moveType].category === "Physical";
	var attackStat = isPhysical ? AT : SA;
	description.attackEVs = attacker.evs[attackStat] +
            (NATURES[attacker.nature][0] === attackStat ? "+" : NATURES[attacker.nature][1] === attackStat ? "-" : "") + " " +
            toSmogonStat(attackStat);
	var defenseStat = isPhysical ? DF : SD;
	description.defenseEVs = defender.evs[defenseStat] +
            (NATURES[defender.nature][0] === defenseStat ? "+" : NATURES[defender.nature][1] === defenseStat ? "-" : "") + " " +
            toSmogonStat(defenseStat);
	var at = attacker.rawStats[attackStat];
	var df = defender.rawStats[defenseStat];

	if (isPhysical && (attacker.ability === "Huge Power" || attacker.ability === "Pure Power")) {
		at *= 2;
		description.attackerAbility = attacker.ability;
	}

	if (attacker.item !== "Sea Incense" && getItemBoostType(attacker.item) === moveType) {
		at = Math.floor(at * 1.1);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Sea Incense" && moveType === "Water") {
		at = Math.floor(at * 1.05);
		description.attackerItem = attacker.item;
	} else if ((isPhysical && attacker.item === "Choice Band") ||
            (!isPhysical && attacker.item === "Soul Dew" && (attacker.name === "Latios" || attacker.name === "Latias"))) {
		at = Math.floor(at * 1.5);
		description.attackerItem = attacker.item;
	} else if ((!isPhysical && attacker.item.replaceAll(" ", "") === "DeepSeaTooth" && attacker.name === "Clamperl") ||
            (!isPhysical && attacker.item === "Light Ball" && attacker.name === "Pikachu") ||
            (isPhysical && attacker.item === "Thick Club" && (attacker.name === "Cubone" || attacker.name === "Marowak"))) {
		at *= 2;
		description.attackerItem = attacker.item;
	}

	if (!isPhysical && defender.item === "Soul Dew" && (defender.name === "Latios" || defender.name === "Latias")) {
		df = Math.floor(df * 1.5);
		description.defenderItem = defender.item;
	} else if ((!isPhysical && defender.item.replaceAll(" ", "") === "DeepSeaScale" && defender.name === "Clamperl") ||
            (isPhysical && defender.item === "Metal Powder" && defender.name === "Ditto")) {
		df *= 2;
		description.defenderItem = defender.item;
	}

	if (defender.ability === "Thick Fat" && (moveType === "Fire" || moveType === "Ice")) {
		at = Math.floor(at / 2);
		description.defenderAbility = defender.ability;
	} else if (isPhysical && defender.ability === "Marvel Scale" && defender.status !== "Healthy") {
		df = Math.floor(df * 1.5);
		description.defenderAbility = defender.ability;
	}

	if (isPhysical && (attacker.ability === "Hustle" || (attacker.ability === "Guts" && attacker.status !== "Healthy"))) {
		at = Math.floor(at * 1.5);
		description.attackerAbility = attacker.ability;
	} else if (!isPhysical && (attacker.ability === "Plus (active)" || attacker.ability === "Minus (active)")) {
		at = Math.floor(at * 1.5);
		description.attackerAbility = attacker.ability.substring(0, attacker.ability.indexOf(" ("));
	} else if (attacker.curHP <= attacker.maxHP / 3 &&
            ((attacker.ability === "Overgrow" && moveType === "Grass") ||
            (attacker.ability === "Blaze" && moveType === "Fire") ||
            (attacker.ability === "Torrent" && moveType === "Water") ||
            (attacker.ability === "Swarm" && moveType === "Bug"))) {
		basePower = Math.floor(basePower * 1.5);
		description.attackerAbility = attacker.ability;
	}

	if (move.name === "Explosion" || move.name === "Self-Destruct") {
		df = Math.floor(df / 2);
	}

	var attackBoost = attacker.boosts[attackStat];
	var defenseBoost = defender.boosts[defenseStat];
	if (attackBoost > 0 || (!isCritical && attackBoost < 0)) {
		at = getModifiedStat(at, attackBoost);
		description.attackBoost = attackBoost;
	}
	if (defenseBoost < 0 || (!isCritical && defenseBoost > 0)) {
		df = getModifiedStat(df, defenseBoost);
		description.defenseBoost = defenseBoost;
	}

	var baseDamage = Math.floor(Math.floor(Math.floor(2 * attackerLevel / 5 + 2) * at * basePower / df) / 50);

	if (attacker.status === "Burned" && isPhysical && attacker.ability !== "Guts") {
		baseDamage = Math.floor(baseDamage / 2);
		description.isBurned = true;
	}

	let ignoresScreens = isCritical || move.name == "Brick Break";
	if (isPhysical && field.isReflect && !ignoresScreens) {
		if (field.format === "singles") {
			baseDamage = Math.floor(baseDamage / 2);
		} else {
			baseDamage = Math.floor(baseDamage * 2 / 3);
			description.isDoublesScreen = true;
		}
		description.isReflect = true;
	} else if (!isPhysical && field.isLightScreen && !ignoresScreens) {
		if (field.format === "singles") {
			baseDamage = Math.floor(baseDamage / 2);
		} else {
			baseDamage = Math.floor(baseDamage * 2 / 3);
			description.isDoublesScreen = true;
		}
		description.isLightScreen = true;
	}

	if (field.format === "doubles" && move.isSpread && (move.name !== "Explosion" && move.name !== "Self-Destruct" && move.name !== "Earthquake" && move.name !== "Magnitude")) {
		// weird gen 3 spread damage mechanics
		baseDamage = Math.floor(baseDamage / 2);
		description.isSpread = true;
	}

	if ((field.weather === "Sun" && moveType === "Fire") || (field.weather === "Rain" && moveType === "Water")) {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.weather = field.weather;
	} else if ((field.weather === "Sun" && moveType === "Water") || (field.weather === "Rain" && moveType === "Fire") ||
            (move.name === "Solar Beam" && ["Rain", "Sand", "Hail"].indexOf(field.weather) !== -1)) {
		baseDamage = Math.floor(baseDamage / 2);
		description.weather = field.weather;
	}

	if (attacker.ability === "Flash Fire (activated)" && moveType === "Fire") {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.attackerAbility = "Flash Fire";
	}

	baseDamage = Math.max(1, baseDamage) + 2;

	if (isCritical) {
		baseDamage *= 2;
		description.isCritical = true;
	}

	if (move.name === "Weather Ball" && field.weather !== "") {
		baseDamage *= 2;
		description.moveBP = baseDamage;
	}

	if (field.isCharge && moveType === "Electric") {
		baseDamage *= 2;
		description.isCharge = true;
	}

	if (field.isHelpingHand) {
		baseDamage = Math.floor(baseDamage * 1.5);
		description.isHelpingHand = true;
	}

	if (attacker.hasType(moveType)) {
		baseDamage = Math.floor(baseDamage * 1.5);
	}

	baseDamage = Math.floor(baseDamage * typeEffectiveness);

	var damage = [];
	for (var i = 85; i <= 100; i++) {
		damage[i - 85] = Math.max(1, Math.floor(baseDamage * i / 100));
	}
	return {"damage": damage, "description": buildDescription(description)};
}
