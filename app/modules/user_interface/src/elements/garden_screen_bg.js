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

	function GardenScreenBg () {
		
		this._assetName = "GardenScreenBg";

		StateGraphic.call(this);

		this._assetName = "GardenScreenBg";

		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
	}

	GardenScreenBg.prototype = Object.create(StateGraphic.prototype);
	GardenScreenBg.prototype.constructor = GardenScreenBg;
	
	Object.defineProperty(GardenScreenBg.prototype, "id", { get: function () { return this._id; } });

	GardenScreenBg.prototype.start = function start(){
		var speedDivisor = 15; 

		this._setState(this._DEFAULT_STATE, true, true);

		this._anim.animationSpeed /= speedDivisor;
	}

	return GardenScreenBg;
});