/**
 * This module is a simple list of the loading events 
**/
define([], function () {

	function LoadEventType () {
		
		this.COMPLETE 	= "complete";
		this.LOADED 	= "load";
		this.PROGRESS 	= "progress";
		this.ERROR		= "error";
	}

	return new LoadEventType();
});