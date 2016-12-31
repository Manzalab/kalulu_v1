/**
 * This module allow to create the Burrow Screen.
 * This screen is tightly coupled with the Kalulu Project : it is designed to display the 2 courses of Kalulu :
 * Swahili + Maths (or English + Maths for the jury), which are divided in 20 chapters each.
 * The Burrow Screen will display the Chapters, first level of the discipline modules hierarchy we are using.
 * It must be reworked if Discipline Modules are modified.
**/
(function () {
	'use strict';

	var Screen 			= require ('../utils/ui/screen');

	function ToyChestScreen (interfaceManager) {
		
		Screen.call(this);
		
		this.name = "mcBurrowScreen";
		this._interfaceManager = interfaceManager;
		this.build();
		// Reference auto-built parts :
		this._background = this.getChildByName("mcBurrowScreenBg");
		this._toyChestButtons = this.getChildByName("mcButtonsContainer");
		this._videoButton = this._toyChestButtons.getChildByName("mcVideoButton");
		this._miniGameButton = this._toyChestButtons.getChildByName("mcMiniGameButton");
		this._storyButton = this._toyChestButtons.getChildByName("mcStoryButton");
		this._hud = {
			topLeft : this.getChildByName("mcBurrowTLHud")
		};
		this._backButton = this._hud.topLeft.getChildByName("mcBackButton");
		this._buttonsContainerOffset = this._toyChestButtons.position.clone();

		// Buttons Management :
		if (Config.enableGlobalVars) window.kalulu._toyChestButtons = this._toyChestButtons;
		

		for (var k = this._toyChestButtons.children.length-1 ; k >= 0 ; k--) 
			this._toyChestButtons.children[k].onClick = this._onClickOnActivityButton.bind(this);

		this._backButton.onClick = this._onClickOnBackButton.bind(this);


		// Transition FX :
		// this._blurFilter = new PIXI3.filters.BlurFilter();
		// this._blurFilter.blur = 0;
		// this._background.filters = [this._blurFilter];

		// Debug
		if (Config.enableGlobalVars) window.kalulu.toyChestScreen = this;
	}

	ToyChestScreen.prototype = Object.create(Screen.prototype);
	ToyChestScreen.prototype.constructor = ToyChestScreen;

	/**
	 * Manage the transition after click on a garden button, emits the relevant events.
	**/
	ToyChestScreen.prototype._onClickOnActivityButton = function _onClickOnActivityButton (pEventData) {
		if (this._interfaceManager.kaluluCharacter.isTalking) return;
		this._interfaceManager.requestToyChestActivityScreen(pEventData.target._assetName.replace("Button",""));
		
	};

	ToyChestScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (pEventData) {
		if (this._interfaceManager.kaluluCharacter.isTalking) return;
		this._interfaceManager.requestBrainScreen();
	};

	module.exports = ToyChestScreen;

})();