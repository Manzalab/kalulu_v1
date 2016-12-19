/**
 * This module lists the supported snapping options for the positionnables elements of a UIComponent. (actually not yet implemented in UIComponent)
**/
define([], function () {

	function GameStageAlign () {
		this.TOP 			= 'top';
		this.TOP_LEFT 		= 'topleft';
		this.TOP_RIGHT 		= 'topright';
		this.CENTER 		= 'center';
		this.LEFT 			= 'left';
		this.RIGHT 			= 'right';
		this.BOTTOM 		= 'bottom';
		this.BOTTOM_LEFT 	= 'bottomleft';
		this.BOTTOM_RIGHT 	= 'bottomright';
	}

	return new GameStageAlign();
});