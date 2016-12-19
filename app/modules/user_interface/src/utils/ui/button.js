/**
 * This modules provides a base class for UI Buttons
 * The method onClick is called on a user click, and can be overriden in daughter classes for an easy setup (no need to redeclare listeners).
 * 
**/
define([
	'../game/state_graphic',
	'../game/factories/movie_clip_anim_factory',
	'../game/box_type',
	'../events/mouse_event_type',
	'../events/touch_event_type'
],
function (
	StateGraphic,
	MovieClipAnimFactory,
	BoxType,
	MouseEventType,
	TouchEventType
) {
	
	'use strict';

	function Button (pAssetName) {
		
		if (typeof pAssetName !== "undefined") {
			this._assetName = pAssetName;
		}

		var assetName = this._assetName;
		
		StateGraphic.call(this);
		
		if (assetName) this._assetName = assetName; // to be explained (cf. StateGraphic Constructor)
		//console.log("Button created with assetName : " + this._assetName);
		this._UP		= 0;
		this._OVER 		= 1;
		this._DOWN 		= 2;
		this._DISABLED 	= 3;
		
		this._txt = null;
		this._upStyle = null;
		this._overStyle = null;
		this._downStyle = null;

		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;
		this.interactive = true;
		this.buttonMode = true;
		
		this.on(MouseEventType.MOUSE_OVER, this._mouseOver);
		this.on(MouseEventType.MOUSE_DOWN, this._mouseDown);
		this.on(MouseEventType.CLICK, this._click);
		this.on(MouseEventType.MOUSE_OUT, this._mouseOut);
		this.on(MouseEventType.MOUSE_UP_OUTSIDE, this._mouseOut);

		this.on(TouchEventType.TOUCH_START, this._mouseDown);
		this.on(TouchEventType.TAP, this._click);
		this.on(TouchEventType.TOUCH_END, this._mouseOut);
		this.on(TouchEventType.TOUCH_END_OUTSIDE, this._mouseOut);

		this._createText();
		this.start();
	}

	Button.prototype = Object.create(StateGraphic.prototype);
	Button.prototype.constructor = Button;
	
	// "PUBLIC" METHODS

	Button.prototype.setText = function setText (pText) {
		this._txt.text = pText;
	};

	Button.prototype.destroy = function destroy () {
		this.off(MouseEventType.MOUSE_OVER, this._mouseOver);
		this.off(MouseEventType.MOUSE_DOWN, this._mouseDown);
		this.off(MouseEventType.CLICK, this._click);
		this.off(MouseEventType.MOUSE_OUT, this._mouseOut);
		this.off(MouseEventType.MOUSE_UP_OUTSIDE, this._mouseOut);

		this.off(TouchEventType.TOUCH_START, this._mouseDown);
		this.off(TouchEventType.TAP, this._click);
		this.off(TouchEventType.TOUCH_END, this._mouseOut);
		this.off(TouchEventType.TOUCH_END_OUTSIDE, this._mouseOut);
		StateGraphic.prototype.destroy.call(this);
	};



	// "PRIVATE" METHODS

	Button.prototype._createText = function _createText () {
		
		this._upStyle		= { font : "40px Arial", fill : "#000000", align : "center" };
		this._overStyle		= { font : "40px Arial", fill : "#AAAAAA", align : "center" };
		this._downStyle 	= { font : "40px Arial", fill : "#00FF00", align : "center" };
		this._disabledStyle = { font : "40px Arial", fill : "#777777", align : "center" };
		
		this._txt = new PIXI3.Text("", this._upStyle);
		this._txt.anchor.set(0.5, 0.5);
	};


	Button.prototype._setModeNormal = function _setModeNormal () {
		this._setState(this._DEFAULT_STATE);
		this._anim.gotoAndStop(this._UP);
		this.addChild(this._txt);
		this._txt.style = this._upStyle;
		StateGraphic.prototype._setModeNormal.call(this);
	};

	Button.prototype.setModeDisabled = function setModeDisabled () {
		this._anim.gotoAndStop(this._DISABLED);
		this._txt.style = this._disabledStyle;
		this.interactive = false;
	};

	Button.prototype.setModeEnabled = function setModeEnabled () {
		this._anim.gotoAndStop(this._UP);
		this._txt.style = this._upStyle;
		this.interactive = true;
	};

	Button.prototype.setModeVoid = function setModeVoid () {
		this.onClick = this._mouseVoid.bind(this);
		this.interactive = false;
	};

	Button.prototype._mouseVoid = function _mouseVoid () {};

	Button.prototype._click = function _click (pEventData) {
		this._anim.gotoAndStop(this._UP);
		this._txt.style = this._upStyle;
		this.onClick(pEventData);
	};
	
	Button.prototype.onClick = function onClick (pEventData) {
		// to be overriden
	};

	Button.prototype._mouseDown = function _mouseDown (pEventData) {
		this._anim.gotoAndStop(this._DOWN);
		this._txt.style = this._downStyle;
	};
	
	Button.prototype._mouseOver = function _mouseOver (pEventData) {
		this._anim.gotoAndStop(this._OVER);
		this._txt.style = this._overStyle;
	};
	
	Button.prototype._mouseOut = function _mouseOut (pEventData) {
		this._anim.gotoAndStop(this._UP);
		this._txt.style = this._upStyle;
	};

	return Button;
});