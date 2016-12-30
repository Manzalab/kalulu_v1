/**
 * This module is in charge of
 * 
**/
define([
	'../elements/animation_plant',
	'../utils/ui/button',
	'../utils/events/mouse_event_type',
	'./kalulu_character'
], function (
	AnimationPlant,
	Button,
	MouseEventType,
	Kalulu
) {
	'use strict';

	var SoundManager            = require ('../utils/sound/sound_manager');

	function Plant (description, assetName) {
		
		this._description = description;

		this._assetName = "Plant_"
		if(parseInt(assetName.split("Chapter")[1], 10) < 10) this._assetName += "0";
		this._assetName += parseInt(assetName.split("Chapter")[1], 10) + "_0" + parseInt(assetName.split("Index")[1], 10);

		this.name = "mcGraphicPlant";

		this._NOT_STARTED = "NotStarted";
        this._SMALL  = "Small";
        this._MEDIUM = "Medium";
        this._LARGE  = "Large";

		this._idChapter = parseInt(this._assetName.split("_")[1], 10);
		this._idPlant = parseInt(this._assetName.split("_")[2], 10);

		this._initHeight = 0;
		this._initPositionY = description.y;

		this._userProfile;
		this._gardenScreen;

		Button.call(this);
		//console.log(this);
	}

	Plant.prototype = Object.create(Button.prototype);
	Plant.prototype.constructor = Plant;
	
	Object.defineProperty(Plant.prototype, "id", { get: function () { return this._id; } });

	Plant.prototype.start = function start(){
		this.setModeNotStarted();

		this._initHeight = this.height;
		this.onClick = this._checkFertilizer.bind(this);
	}

	Plant.prototype.setModeSmall = function setModeSmall () {
		this._setState(this._SMALL);
	};

	Plant.prototype.setModeMedium = function setModeMedium () {
		this._setState(this._MEDIUM);
	};

	Plant.prototype.setModeLarge = function setModeLarge () {
		this._setState(this._LARGE);
		
		this.interactive = false;
		this.buttonMode = false;
	};

	Plant.prototype.setModeNotStarted = function setModeNotStarted () {
		this._setState(this._NOT_STARTED);
	};

	Plant.prototype.setSaveState = function setSaveState (state) {
		switch (state) {
			case this._NOT_STARTED:
				this.setModeNotStarted();
				break;

			case this._SMALL:
				this.setModeSmall();
				break;

			case this._MEDIUM:
				this.setModeMedium();
				break;

			case this._LARGE:
				this.setModeLarge();
				break;

			default:
				this.setModeNotStarted();
		}

		this._setPositionY();
	}

	Plant.prototype.setUserReference = function setUserReference (userProfile) {
		this._userProfile = userProfile;
	}

	Plant.prototype.setGardenScreenReference = function setGardenScreenReference (gardenScreen) {
		this._gardenScreen = gardenScreen;
	}

	Plant.prototype._checkFertilizer = function _checkFertilizer() {
		if (Kalulu.isTalking) return;
		var animation;

		if(this._userProfile) {
			if(this._userProfile.fertilizer > 0) {
				switch(this._state){
					case this._NOT_STARTED:
					this.setModeSmall();
					if (this._userProfile.kaluluTalks.firstPlantEvolve)
					{
						Kalulu.x = Kalulu.width/2;
						Kalulu.y = -Kalulu.height/3-10;
						this._gardenScreen._hud.bottomLeft.addChild(Kalulu);
						Kalulu.startTalk("kalulu_tuto_endstep03_gardenscreen");
						this._userProfile.kaluluTalks.firstPlantEvolve = false;
						this._gardenScreen._interfaceManager._eventSystem.emit(Events.APPLICATION.SET_SAVE, this._userProfile.data);	
					}
					break;

					case this._SMALL:
					this.setModeMedium();
					break;

					case this._MEDIUM:
					this.setModeLarge();
					if (this._userProfile.kaluluTalks.lastPlantEvolve)
					{
						Kalulu.x = Kalulu.width/2;
						Kalulu.y = -Kalulu.height/3-10;
						this._gardenScreen._hud.bottomLeft.addChild(Kalulu);
						Kalulu.startTalk("kalulu_tuto_end_gardenscreen");
						this._userProfile.kaluluTalks.lastPlantEvolve = false;
						this._gardenScreen._interfaceManager._eventSystem.emit(Events.APPLICATION.SET_SAVE, this._userProfile.data);	
					}
					break;
				}
				SoundManager.getSound("fertilizer_0"+Math.floor(Math.random()*6 + 1)).play();
				this._setPositionY();
				
				this._userProfile.fertilizer -= 1;
				this._userProfile.plantsProgression = this;

				this._gardenScreen.fertilizerText = this._userProfile.fertilizer;

				animation = new AnimationPlant();
				this.parent.addChild(animation);

				animation.position.set(this.x, this.y);
			}
			else{
				Kalulu.x = Kalulu.width/2;
				Kalulu.y = -Kalulu.height/3 - 50;
				this._gardenScreen._hud.bottomLeft.addChild(Kalulu);
				Kalulu.startTalk("kalulu_info_nobrainpower");
			} 
		}
	}

	Plant.prototype._setPositionY = function _setPositionY() {
		this.y = this._initPositionY - this.height/2 - this._initHeight/2;
	}

	return Plant;
});