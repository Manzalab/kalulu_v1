/**
 * This module is the base class for all graphic elements in game.
 * It extends PIXI3.Container
**/
define([
	'../../../libs/pixi',
	"../events/event_type"
], function (
	PIXI3,
	EventType
) {

	function GameObject () {
		PIXI3.Container.call(this);
		
		this.on(EventType.ADDED, this.forceUpdateTransform);
	}

	GameObject.prototype = Object.create(PIXI3.Container.prototype);
	GameObject.prototype.constructor = GameObject;


	GameObject.prototype.forceUpdateTransform = function forceUpdateTransform () {
		if (this.parent !== null) this.updateTransform();
	};

	GameObject.prototype.destroy = function destroy () {
		this.off(EventType.ADDED, this.updateTransform);
		PIXI3.Container.prototype.destroy.call(this);
	};

	return GameObject;
});