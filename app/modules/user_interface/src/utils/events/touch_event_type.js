/**
 * This module is a simple list of the JavaScript native touch events
**/
define([], function () {

	function TouchEventType () {
		
		this.TOUCH_START 		= "touchstart";
		this.TOUCH_MOVE 		= "touchmove";
		this.TOUCH_END 			= "touchend";
		this.TOUCH_END_OUTSIDE	= "touchendoutside";
		this.TAP 				= "tap";
	}

	return new TouchEventType();
});