/**
 * This module provides a Basic implementation of a StateMachine
**/
define([
	'../game/game_object'
], function (
	GameObject
) {

	function StateMachine () {
		
		GameObject.call(this);

		this.doAction = null;

		this.setModeVoid();
	}

	StateMachine.prototype = Object.create(GameObject.prototype);
	StateMachine.prototype.constructor = StateMachine;
	

	// "PUBLIC" METHODS

	StateMachine.prototype.setModeVoid = function setModeVoid () {
		this.doAction = this._doActionVoid;
	};
	
	StateMachine.prototype.start = function start () {
		this._setModeNormal();
	};

	StateMachine.prototype.destroy = function destroy () {
		this.setModeVoid();
		GameObject.prototype.destroy.call(this);
	};


	// "PRIVATE" METHODS

	StateMachine.prototype._doActionVoid = function _doActionVoid () {};


	StateMachine.prototype._setModeNormal = function _setModeNormal () {
		this.doAction = this._doActionNormal;
	};

	StateMachine.prototype._doActionNormal = function _doActionNormal () {
		// to be overriden
	};



	return StateMachine;
});