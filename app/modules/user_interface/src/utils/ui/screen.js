define([
	'./ui_component'
], function (
	UIComponent
) {

	'use strict';
	
	/**
	 * The Screen Class is a UI Component with a _modalImage preset to a black opaque background
	 * 
	 * @class
	 * @extends UIComponent
	 * @memberof Utils.UI
	**/
	function Screen () {
		
		UIComponent.call(this);

		this.modalImage = "black_bg.png";
	}

	Screen.prototype = Object.create(UIComponent.prototype);
	Screen.prototype.constructor = Screen;

	return Screen;
});