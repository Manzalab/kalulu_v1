/**
 * This module is a simple list of the JavaScript native mouse events
**/
define([], function () {

	function MouseEventType () {
		
		this.MOUSE_MOVE 		= "mousemove";
		this.MOUSE_DOWN 		= "mousedown";
		this.MOUSE_OUT 			= "mouseout";
		this.MOUSE_OVER 		= "mouseover";
		this.MOUSE_UP 			= "mouseup";
		this.MOUSE_UP_OUTSIDE 	= "mouseupoutside";
		this.CLICK 				= "click";
		this.RIGHT_DOWN 		= "rightdown";
		this.RIGHT_UP 			= "rightup";
		this.RIGHT_UP_OUTSIDE 	= "rightupoutside";
		this.RIGHT_CLICK 		= "rightclick";
	}

	return new MouseEventType();
});