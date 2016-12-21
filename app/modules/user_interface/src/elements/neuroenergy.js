/**
 * This module is in charge of
 * 
**/
define([
	'../utils/game/state_graphic',
	'../utils/game/factories/movie_clip_anim_factory',
	'../utils/game/box_type'
], function (
	StateGraphic,
	MovieClipAnimFactory,
	BoxType
) {
	'use strict';

	function Neuroenergy (description, assetName) {
		
		this._description = description;
		this._assetName = assetName;

		this._DISABLED = "Disabled";

		StateGraphic.call(this);

		this._assetName = assetName;
		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
	}

	Neuroenergy.prototype = Object.create(StateGraphic.prototype);
	Neuroenergy.prototype.constructor = Neuroenergy;
	
	Object.defineProperty(Neuroenergy.prototype, "id", { get: function () { return this._id; } });

	Neuroenergy.prototype.start = function start(){
		this.setModeNormal();
	};

	Neuroenergy.prototype.setModeNormal = function setModeNormal(){
		this._setState(this._DEFAULT_STATE, true, true, 0);
		this._anim.animationSpeed = 0.1;
	};

	Neuroenergy.prototype.setModeDisabled = function setModeDisabled(){
		this._setState(this._DISABLED);
	};

	return Neuroenergy;
});