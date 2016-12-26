/**
 * This module allow to create the ToyChest Screen.
 * This screen is tightly coupled with the Kalulu Project : it is designed to display the 2 courses of Kalulu :
 * Swahili + Maths (or English + Maths for the jury), which are divided in 20 chapters each.
 * The Burrow Screen will display the Chapters, first level of the discipline modules hierarchy we are using.
 * It must be reworked if Discipline Modules are modified.
**/
(function () {

	'use strict';

	var Screen 		= require ('../utils/ui/screen');
    var VideoPlayer = require ('../elements/video_player');
    var Story 		= require ('../elements/story');


	function ToyChestActivityScreen (interfaceManager, activityType) {
		
		Screen.call(this);
		this._activityType = activityType;
		this.name = "mcBurrow"+activityType+"Screen";
		this._interfaceManager = interfaceManager;
		this.build();
		
		// Reference auto-built parts :
		this._background = this.getChildByName("mcBurrowScreenBg");
		this._activitiesButtons = this.getChildByName("mcButtonsContainer");
		this._currActivitiesPage = 0;
		this._nextActivitiesButton = this.getChildByName("mcActivitiesNext");
		this._prevActivitiesButton = this.getChildByName("mcActivitiesPrev");

		this._prevActivitiesButton.onClick = this._onClickOnPrevActivities.bind(this);
		this._nextActivitiesButton.onClick = this._onClickOnNextActivities.bind(this);

		this._hud = {
			topLeft : this.getChildByName("mcBurrowTLHud"),
			top : this.getChildByName("mc"+activityType+"THud")
		};
		this._backButton = this._hud.topLeft.getChildByName("mcBackButton");

		// Buttons Management
		var lLockStart;
		var lActivitiesCount;
		switch	(activityType)
		{
			case "Story":
				lActivitiesCount = 42;
				lLockStart = 5;
			break;

			case "Video":
				lActivitiesCount = 18;
				lLockStart = 4;
			break;

			case "MiniGame":
				lActivitiesCount = 9;
				lLockStart = 1;
			break;
		}
		this._activitiesCount = lActivitiesCount;
		this._lockedActivitiesStart = lLockStart;

		this._prevActivitiesButton.visible = false;
		if (this._activitiesCount<=10) this._nextActivitiesButton.visible = false;
		if (this._activitiesButtons!=null)	this._updateActivitiesButtons(true);


		this._backButton.onClick = this._onClickOnBackButton.bind(this);
	}

	ToyChestActivityScreen.prototype = Object.create(Screen.prototype);
	ToyChestActivityScreen.prototype.constructor = ToyChestActivityScreen;

	/**
	 * Manage the transition after click on a garden button, emits the relevant events.
	**/

	ToyChestActivityScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (pEventData) {
		this._interfaceManager.requestToyChestScreen();
	};
	
	ToyChestActivityScreen.prototype._onClickOnPrevActivities = function _onClickOnPrevActivities (pEventData) {
		this._currActivitiesPage--;
		this._updateActivitiesButtons();
		if (this._currActivitiesPage===0) this._prevActivitiesButton.visible = false;
		if (!this._nextActivitiesButton.visible) this._nextActivitiesButton.visible = true;
	};

	ToyChestActivityScreen.prototype._onClickOnNextActivities = function _onClickOnNextActivities (pEventData) {
		this._currActivitiesPage++;
		this._updateActivitiesButtons();
		if (this._currActivitiesPage==this._activitiesCount.toString().slice(0,-1)) this._nextActivitiesButton.visible = false;
		if (!this._prevActivitiesButton.visible) this._prevActivitiesButton.visible = true;
	};

	ToyChestActivityScreen.prototype._updateActivitiesButtons = function _updateActivitiesButtons (pIsListening) {
		var colorFilter = new PIXI3.filters.ColorMatrixFilter();
		colorFilter.greyscale(0.3);
		for (var k = this._activitiesButtons.children.length-1 ; k >= 0 ; k--)
		{
			var lButton = this._activitiesButtons.children[k];

			if (pIsListening) lButton.onClick = this._onClickOnActivitiesButton.bind(this);
			else lButton.removeChildAt(lButton.children.length-1);
			var lNum = (k+1)+(10*this._currActivitiesPage);
			lButton._txt.text = lNum;
			lButton.name = lNum;
			var lCover = new PIXI3.Sprite(PIXI3.Texture.fromImage(Config.imagesPath + "activity_covers/" + this._activityType.toLowerCase() + "/" + lNum + ".jpg"));
			lCover.anchor.set(0.5);
			lCover.scale.set(0.33);
			lButton.addChild(lCover);
			if (lNum >= this._lockedActivitiesStart)
			{
				lCover.filters = [colorFilter];
				lButton.setModeDisabled();
			}
			else 
			{
				lCover.filters = null;
				lButton.setModeEnabled();
			}
			if (lNum > this._activitiesCount) lButton.visible = false;
			else lButton.visible = true;
		}
	};

	ToyChestActivityScreen.prototype._onClickOnActivitiesButton = function _onClickOnActivitiesButton (pEventData) {
		
		switch (this._activityType)
		{
			case "Video":
				var video = new VideoPlayer(pEventData.target.name, this._interfaceManager);
				this._interfaceManager.openPopin(video);
			break;

			case "MiniGame":
				this._interfaceManager.requestBonusMinigame(this._activityType + pEventData.target.name);
			break;

			case "Story":
				var story = new Story(pEventData.target.name, this._interfaceManager);
				this._interfaceManager.openPopin(story);
			break;

		}
	};

	module.exports = ToyChestActivityScreen;
})();