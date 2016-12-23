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

	function AnimationPlant () {
		
		this._assetName = "AnimationPlant";

		StateGraphic.call(this);

		this._assetName = "AnimationPlant";

		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
	}

	AnimationPlant.prototype = Object.create(StateGraphic.prototype);
	AnimationPlant.prototype.constructor = AnimationPlant;
	
	Object.defineProperty(AnimationPlant.prototype, "id", { get: function () { return this._id; } });

	AnimationPlant.prototype.start = function start(){
		var speedDivisor = 6; 

		this._setState(this._DEFAULT_STATE, true, true);

		this._anim.animationSpeed /= speedDivisor;

		createjs.Tween.get(this).wait(60/speedDivisor * this._anim.totalFrames * 10).to({alpha: 0}, 60/speedDivisor * this._anim.totalFrames * 10, createjs.Ease.linear).call(function () {
			this.parent.removeChild(this);
            this.destroy();
        }.bind(this));
	}

	return AnimationPlant;
});