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

	function AnimBackground (pAssetName, pIPS) {
		
		this._IPS = pIPS;
		this._assetName = pAssetName;

		StateGraphic.call(this);

		this._assetName = pAssetName;

		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
	}

	AnimBackground.prototype = Object.create(StateGraphic.prototype);
	AnimBackground.prototype.constructor = AnimBackground;
	
	Object.defineProperty(AnimBackground.prototype, "id", { get: function () { return this._id; } });

	AnimBackground.prototype.start = function start(){
		this._setState(this._DEFAULT_STATE, true, true);
		this._anim.animationSpeed = this._IPS / 60;
	}

	return AnimBackground;
});