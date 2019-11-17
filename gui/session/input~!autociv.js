// Snaps building placement to cursor and previews it
function autociv_showBuildingPlacementTerrainSnap(mousePosX, mousePosY)
{
	placementSupport.position = Engine.GetTerrainAtScreenPoint(mousePosX, mousePosY);

	if (placementSupport.mode === "wall")
	{
		// Including only the on-screen towers in the next snap candidate list is sufficient here, since the user is
		// still selecting a starting point (which must necessarily be on-screen). (The update of the snap entities
		// itself happens in the call to updateBuildingPlacementPreview below).
		placementSupport.wallSnapEntitiesIncludeOffscreen = false;
	}
	else
	{
		// Cancel if not enough resources
		if (placementSupport.template && Engine.GuiInterfaceCall("GetNeededResources", { "cost": GetTemplateData(placementSupport.template).cost }))
		{
			placementSupport.Reset();
			inputState = INPUT_NORMAL;
			return true;
		}

		let snapData = Engine.GuiInterfaceCall("GetFoundationSnapData", {
			"template": placementSupport.template,
			"x": placementSupport.position.x,
			"z": placementSupport.position.z,
		});
		if (snapData)
		{
			placementSupport.angle = snapData.angle;
			placementSupport.position.x = snapData.x;
			placementSupport.position.z = snapData.z;
		}
	}

	// Includes an update of the snap entity candidates
	updateBuildingPlacementPreview();

	return;
}

/**
 * Select a building from the construction panel given the current unit(s) selected.
 * @param return - true if buildings exist and is selected to place.
 */
function autociv_placeBuildingByGenericName(genericName)
{
	let translatedGenericName = translate(genericName);
	let playerState = GetSimState().players[Engine.GetPlayerID()];
	let selection = g_Selection.toList();

	if (!playerState || !selection.length || Engine.GetGUIObjectByName("unitConstructionPanel").hidden)
		return;

	let index = g_SelectionPanels.Construction.getItems().
		map(item => GetTemplateData(item).name.generic).
		indexOf(translatedGenericName);

	if (index == -1)
		return;

	let unitConstructionButton = Engine.GetGUIObjectByName("unitConstructionButton[" + index + "]");

	if (!unitConstructionButton || unitConstructionButton.hidden || !unitConstructionButton.enabled || !unitConstructionButton.onPress)
		return;

	unitConstructionButton.onPress();
	autociv_showBuildingPlacementTerrainSnap(mouseX, mouseY);

	return true;
}

function autociv_clearSelectedProductionQueues()
{
	let playerState = GetSimState().players[Engine.GetPlayerID()];
	if (!playerState || Engine.GetGUIObjectByName("unitQueuePanel").hidden)
		return;

	g_Selection.toList().map(GetEntityState).filter(v => !!v).forEach(entity =>
	{
		if (!entity.production || !entity.production.queue || entity.id === undefined)
			return;

		for (let queueItem of entity.production.queue)
			if (queueItem.id !== undefined)
				Engine.PostNetworkCommand({
					"type": "stop-production",
					"entity": entity.id,
					"id": queueItem.id
				});
	});
	return true;
}

function autociv_selectEntityWithGenericName(genericName, selectAll, accumulateSelection)
{
	let entities = Engine.GuiInterfaceCall("autociv_FindEntitiesWithGenericName", genericName);
	return autociv_selectFromList(entities, selectAll, accumulateSelection);
}

function autociv_selectEntityWithClassesExpression(classesExpression, selectAll, accumulateSelection)
{
	let p = autociv_selectEntityWithClassesExpression;
	if (Engine.GetMicroseconds() - p.lastCall < p.rateLimit &&
		p.lastParameter === classesExpression)
		return;
	p.lastCall = Engine.GetMicroseconds();
	p.lastParameter = classesExpression;

	let entities = Engine.GuiInterfaceCall("autociv_FindEntitiesWithClassesExpression", classesExpression);
	return autociv_selectFromList(entities, selectAll, accumulateSelection);
}
autociv_selectEntityWithClassesExpression.rateLimit = 1000 * 1000;
autociv_selectEntityWithClassesExpression.lastCall = Engine.GetMicroseconds();
autociv_selectEntityWithClassesExpression.lastParameter = "";

function autociv_selectFromList(entities, selectAll, accumulateSelection)
{
	if (selectAll === undefined)
		selectAll = Engine.HotkeyIsPressed("selection.offscreen");

	if (accumulateSelection === undefined)
		accumulateSelection = Engine.HotkeyIsPressed("selection.add");

	if (entities.length === undefined || !entities.length)
		return;

	// CASE 1: wants to select all entities of the same type.
	if (selectAll)
	{
		// CASE 1 + 3: doesn't want to keep current selection.
		if (!accumulateSelection)
			g_Selection.reset();

		g_Selection.addList(entities);
		return true;
	}

	// CASE 2: cycle between entities of the same type one at a time.
	let entityIsCurrentlySelected = (entity) => g_Selection.selected[entity] !== undefined;

	// Find the index in entities of the first entity inside current selection.
	let entityIndex = 0;
	for (; entityIndex < entities.length; ++entityIndex)
		if (entityIsCurrentlySelected(entities[entityIndex]))
			break;

	// Find the first entity not in the current selection
	for (let index = 0; index < entities.length; ++index)
	{
		let entity = entities[(index + entityIndex) % entities.length];
		if (!entityIsCurrentlySelected(entity))
		{
			// CASE 2 + 3: doesn't want to keep current selection.
			if (!accumulateSelection)
				g_Selection.reset();

			g_Selection.addList([entity]);
			return true;
		}
	}
}

function autociv_setFormation(formation = "null")
{
	let that = autociv_setFormation;
	if (that.validFormations.indexOf(formation) == -1)
		return;

	let formationTemplate = `special/formations/${formation}`;
	if (!canMoveSelectionIntoFormation(formationTemplate))
		return;

	Engine.PostNetworkCommand({
		"type": "formation",
		"entities": g_Selection.toList(),
		"name": formationTemplate
	});

	return true;
}

Object.defineProperty(autociv_setFormation, "validFormations", {
	get()
	{
		return "_validFormations" in this ? this._validFormations :
			this._validFormations = autociv_getValidFormations();
	}
})

function autociv_SetCorpsesMax(value)
{
	Engine.GuiInterfaceCall("autociv_SetCorpsesMax", value);
}

function autociv_SetAutotrain(active, entities = g_Selection.toList())
{
	Engine.GuiInterfaceCall("autociv_SetAutotrain", {
		"active": active,
		"entities": entities
	});
}

var g_autociv_hotkeys = {
	"autociv.session.building.autotrain.enable": function (ev)
	{
		autociv_SetAutotrain(true);
		return true;
	},
	"autociv.session.building.autotrain.disable": function (ev)
	{
		autociv_SetAutotrain(false);
		return true;
	},
	"autociv.open.autociv_settings": function (ev)
	{
		autocivCL.Engine.PushGuiPage("page_autociv_settings.xml");
		return true;
	},
	"autociv.session.production.queue.clear": function (ev)
	{
		autociv_clearSelectedProductionQueues();
		return true;
	}
}

var g_autociv_hotkeysPrefixes = {
	// Hotkeys for building placement
	"autociv.session.building.place.": function (ev, hotkeyPrefix)
	{
		let buildingGenericName = ev.hotkey.split(hotkeyPrefix)[1].replace(/_/g, " ");
		autociv_placeBuildingByGenericName(buildingGenericName);
		return true;
	},
	// Hotkeys for unit or buildings selection by generic name
	"autociv.session.entity.select.": function (ev, hotkeyPrefix)
	{
		let entityGenericName = ev.hotkey.split(hotkeyPrefix)[1].replace(/_/g, " ");
		autociv_selectEntityWithGenericName(entityGenericName);
		return true;
	},
	// Hotkeys for unit or buildings selection by classes
	"autociv.session.entity.by.class.select.": function (ev, hotkeyPrefix)
	{
		let enitytClassesExpression = ev.hotkey.split(hotkeyPrefix)[1];
		autociv_selectEntityWithClassesExpression(enitytClassesExpression, true);
		return true;
	},
	// Hotkeys for formations
	"autociv.session.formation.set.": function (ev, hotkeyPrefix)
	{
		let formation = ev.hotkey.split(hotkeyPrefix)[1];
		autociv_setFormation(formation);
		return true;
	}
};

autociv_patchApplyN("handleInputBeforeGui", function (target, that, args)
{
	let [ev] = args;
	autociv_APM.add(ev);
	return target.apply(that, args);
})

autociv_patchApplyN("handleInputAfterGui", function (target, that, args)
{
	let [ev] = args;
	if ("hotkey" in ev && ev.type == "hotkeydown")
	{
		// Special case hotkeys
		for (let prefix in g_autociv_hotkeysPrefixes)
			if (ev.hotkey.startsWith(prefix))
				return !!g_autociv_hotkeysPrefixes[prefix](ev, prefix);

		// Hotkey with normal behaviour
		if (ev.hotkey in g_autociv_hotkeys)
			return !!g_autociv_hotkeys[ev.hotkey](ev);
	}
	return target.apply(that, args);
})


unitFilters.autociv_isNotWounded = entity =>
{
	let entState = GetEntityState(entity);
	return entState &&
		hasClass(entState, "Unit") &&
		entState.maxHitpoints &&
		100 * entState.hitpoints > entState.maxHitpoints * Engine.ConfigDB_GetValue("user", "gui.session.woundedunithotkeythreshold");
};

autociv_patchApplyN("getPreferredEntities", function (target, that, args)
{
	let [ents] = args;
	if (Engine.HotkeyIsPressed("autociv.selection.nowoundedonly"))
		return ents.filter(unitFilters.autociv_isNotWounded);

	return target.apply(that, args);
})
