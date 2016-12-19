define([], function () {
	
	'use strict';


	// ###############################################################################################################################################
	// ###  CONSTRUCTOR  #############################################################################################################################
	// ###############################################################################################################################################
	

	/**
	 * The DeviceCapabilities class is used to give information about the current device
	 * @class
	 * @memberof Namespace (e.g. Kalulu.Remediation)
	**/
	function DeviceCapabilities () {
		
		/**
	     * the texture ratio to use (multi resolution handling)
	     * @type {number}
	    **/
		this._textureRatio = 1;
	}



	// ###############################################################################################################################################
	// ###  GETTERS & SETTERS  #######################################################################################################################
	// ###############################################################################################################################################


	Object.defineProperties(DeviceCapabilities.prototype, {
	    
	    /**
	     * canvas width
	     * @type {number}
	     * @memberof Namespace.DeviceCapabilities#
	    **/
	    width: { get: function () { return window.innerWidth; } },
	    
	    /**
	     * canvas height
	     * @type {number}
	     * @memberof Namespace.DeviceCapabilities#
	    **/
	    height: { get: function () { return window.innerHeight; } },
	    
	    /**
	     * Is the game encapsulated within CocoonJS ?
	     * @type {boolean}
	     * @memberof Namespace.DeviceCapabilities#
	    **/
	    isCocoonJS: { get: function () { return false; } },

	    /**
	     * the texture ratio to use (multi resolution handling)
	     * @type {number}
	     * @default 1
	     * @memberof Namespace.DeviceCapabilities#
	    **/
	    textureRatio: {
	    	get: function () { return this._textureRatio; },
	    	set: function (value) { this._textureRatio = value ; return this._textureRatio; }
	    }
	});



	// ##############################################################################################################################################
	// ###  METHODS  ################################################################################################################################
	// ##############################################################################################################################################

	/**
	 * @param {PIXI.DisplayObject} the target system
	 * @return {PIXI.Rectangle} a rectangle shaped after the screen size.
	**/
	DeviceCapabilities.prototype.getScreenRect = function getScreenRect(target) {

		var lTopLeft = new PIXI3.Point (0, 0);
		var lBottomRight = new PIXI3.Point (this.width, this.height);
		
		lTopLeft = target.toLocal(lTopLeft);
		lBottomRight = target.toLocal(lBottomRight);
		
		return new PIXI3.Rectangle(lTopLeft.x, lTopLeft.y, lBottomRight.x - lTopLeft.x, lBottomRight.y - lTopLeft.y);
	};

	return new DeviceCapabilities();
});

