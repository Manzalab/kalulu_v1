define([
	'../utils/ui/button',
	'../utils/events/mouse_event_type',
	'../utils/events/touch_event_type'
], function (
	Button,
	MouseEventType,
	TouchEventType
) {
	
	'use strict';

	// ###############################################################################################################################################
	// ###  CONSTRUCTOR  #############################################################################################################################
	// ###############################################################################################################################################
	
	/**
	 * The SpriteGarden class is ...
	 * @class
	 * @extends Button
	 * @memberof Namespace (e.g. Kalulu.Remediation)
	 * @param parameter {Object} Description of the parameter
	**/
	function SpriteGarden (assetName) {
		
		this._assetName = assetName;
		Button.call(this);

		// console.log(this);
	}

	SpriteGarden.prototype = Object.create(Button.prototype);
	SpriteGarden.prototype.constructor = SpriteGarden;

	// ###############################################################################################################################################
	// ###  GETTERS & SETTERS  #######################################################################################################################
	// ###############################################################################################################################################

	Object.defineProperties(SpriteGarden.prototype, {
	    
	    /**
	     * Description of the accessor
	     * @type {boolean}
	     * @memberof Namespace.SpriteGarden#
	    **/
	    /*privateMemberAccessor: {
	        get: function () {
	            return this._privateMember;
	        },
	        set: function (value) {
	            return null;
	        }
	    }*/
	});

	// ##############################################################################################################################################
	// ###  METHODS  ################################################################################################################################
	// ##############################################################################################################################################

	SpriteGarden.prototype.setInteractive = function setInteractive (interactive) {
		
		this.interactive = interactive;
        this.buttonMode = interactive;
        
        if (interactive) {
            this.on(MouseEventType.CLICK, this._click, this);
            this.setModeEnabled();
        }
        else {
            this.off(MouseEventType.CLICK, this._click, this);
        }
	};

	return SpriteGarden;
});