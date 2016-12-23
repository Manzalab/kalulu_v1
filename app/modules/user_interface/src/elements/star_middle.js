/**
 * This module is in charge of
 * 
**/
define([
	'../utils/game/state_graphic',
	'../utils/game/factories/movie_clip_anim_factory',
	'../utils/events/mouse_event_type',
	'../utils/game/box_type'
], function (
	StateGraphic,
	MovieClipAnimFactory,
	MouseEventType,
	BoxType
) {
	'use strict';

	function StarMiddle (assetName) {
		
		this._assetName = "StarMiddle_" + assetName.split("StarMiddle")[1];

		StateGraphic.call(this);

		this._assetName = "StarMiddle_" + assetName.split("StarMiddle")[1];

		this._SMALL  = 2;
        this._MEDIUM = 1;
        this._LARGE  = 0;

		// FOR DEBUG
		// this.interactive = true;
		// this.buttonMode = true;
		// this.on(MouseEventType.MOUSE_OVER, this._mouseOver);
		// this.on(MouseEventType.MOUSE_OUT, this._mouseOut);
		//

		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
	}

	StarMiddle.prototype = Object.create(StateGraphic.prototype);
	StarMiddle.prototype.constructor = StarMiddle;
	
	Object.defineProperty(StarMiddle.prototype, "id", { get: function () { return this._id; } });

	StarMiddle.prototype.start = function start(){
		this._setState(this._DEFAULT_STATE);
		this.setModeSmall();
	}

	StarMiddle.prototype.setModeSmall = function setModeSmall () {
		this._anim.gotoAndStop(this._SMALL);
	};

	StarMiddle.prototype.setModeMedium = function setModeMedium () {
		this._anim.gotoAndStop(this._MEDIUM);
	};

	StarMiddle.prototype.setModeLarge = function setModeLarge () {
		this._anim.gotoAndStop(this._LARGE);
	};

	// FOR DEBUG
	// StarMiddle.prototype._mouseOver = function _mouseOver (pEventData) {
	// 	this.setModeMedium();
	// };
	// StarMiddle.prototype._mouseOut = function _mouseOut (pEventData) {
	// 	this.setModeLarge();
	// };
	// StarMiddle.prototype.destroy = function destroy () {
	// 	this.off(MouseEventType.MOUSE_OVER, this._mouseOver);
	// 	this.off(MouseEventType.MOUSE_UP_OUTSIDE, this._mouseOut);
	// 	StateGraphic.prototype.destroy.call(this);
	// };
	//

	return StarMiddle;
});