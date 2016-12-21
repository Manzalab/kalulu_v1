/**
 * This module is in charge of displaying the chapterMap
 * 
**/
define([
	'../utils/ui/button'
], function (
	Button
) {
	'use strict';

	function LessonDot (lesson, clickCallback, assetName) {
		// console.log(lesson);
		if(assetName) this._assetName = assetName;
		else this._assetName 		  = "LessonDot";
		
		this._LOCKED_STATE		= "locked";
		this._OPEN_STATE		= "open";
		this._IN_PROGRESS_STATE	= "inprogress";
		this._COMPLETED_STATE	= "completed";

		this._data = lesson;
		this._cb = clickCallback;

		this._assetNameStandard = this._assetName;
		this._chapterID = lesson.parent.chapterNumber;

		Button.call(this);
		
		this.setText("button");
	}

	LessonDot.prototype = Object.create(Button.prototype);
	LessonDot.prototype.constructor = LessonDot;
	
	Object.defineProperty(LessonDot.prototype, "data", { get: function () { return this._data; } });

	LessonDot.prototype._doNothing = function _doNothing () {
		console.log(this._data);
		console.log("I'm Locked");
	};

	LessonDot.prototype.start = function start () {
		//console.log(this._data);
		if (!this._data.isUnlocked)
			this._setModeLocked();
		else if (this._data.isCompleted)
			this._setModeCompleted();
		else if (this._data.isStarted)
			this._setModeInProgress();
		else
			this._setModeOpen();
	};

	LessonDot.prototype._setModeLocked = function _setModeLocked () {
		this._setState(this._LOCKED_STATE);
		this._anim.gotoAndStop(this._UP);
		this.onClick = this._doNothing;
	};

	LessonDot.prototype._setModeOpen = function _setModeOpen () {
		this._setState(this._OPEN_STATE);
		this._anim.gotoAndStop(this._UP);
		this.onClick = this._cb;
	};

	LessonDot.prototype._setModeInProgress = function _setModeInProgress () {
		this._assetName += this._chapterID;
		this._setState(this._IN_PROGRESS_STATE);
		this._anim.gotoAndStop(this._UP);
		this.onClick = this._cb;
		this._assetName = this._assetNameStandard;
	};

	LessonDot.prototype._setModeCompleted = function _setModeCompleted () {
		this._assetName += this._chapterID;
		this._setState(this._COMPLETED_STATE);
		this._anim.gotoAndStop(this._UP);
		this.onClick = this._cb;
		this._assetName = this._assetNameStandard;
	};

	//
	//
	// FOR DEBUG
	// LessonDot.prototype._mouseOver = function _mouseOver (pEventData) {
	// 	this._setModeInProgress();
	// };
	// LessonDot.prototype._mouseOut = function _mouseOut (pEventData) {
	// 	this._setModeCompleted();
	// };
	//
	//
	//

	return LessonDot;
});