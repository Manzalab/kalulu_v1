/**
 * This module is a simple list of the gamescope-wide events
**/
define([], function () {

	function EventType () {
		
        this.GAME_LOOP  = "gameLoop";
		this.MAIN_LOOP	= "mainLoop";
		this.RESIZE 	= "resize";
		this.ADDED 		= "added";
		this.REMOVED 	= "removed";
	}

	return new EventType();
});