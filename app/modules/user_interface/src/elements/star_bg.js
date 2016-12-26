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

	function StarBg () {
		
		this._assetName = "StarBg";

		StateGraphic.call(this);

		this._assetName = "StarBg";

		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
	}

	StarBg.prototype = Object.create(StateGraphic.prototype);
	StarBg.prototype.constructor = StarBg;
	
	Object.defineProperty(StarBg.prototype, "id", { get: function () { return this._id; } });

	StarBg.prototype.start = function start(){
		var speedDivisor = 15; 

		this._setState(this._DEFAULT_STATE, true, true);

		this._anim.animationSpeed /= speedDivisor;
	}

	return StarBg;
});