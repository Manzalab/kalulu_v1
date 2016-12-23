define([
	'../utils/game/state_graphic',
	'../utils/game/factories/movie_clip_anim_factory',
	'../utils/game/box_type'
], function (
	StateGraphic,
	MovieClipAnimFactory,
	BoxType
) {
	
	'use strict';

	// ###############################################################################################################################################
	// ###  CONSTRUCTOR  #############################################################################################################################
	// ###############################################################################################################################################
	
	/**
	 * The Path class is ...
	 * @class
	 * @extends Button
	 * @memberof Namespace (e.g. Kalulu.Remediation)
	 * @param parameter {Object} Description of the parameter
	**/
	function Path (description, assetName) {

		this._description = description;
		this._assetName = assetName;

		this._OFF = 0;
        this._ON  = 1;

		this._id = parseInt(this._assetName.split("_")[1], 10);

		StateGraphic.call(this);
		
		this._assetName = assetName;
		this._factory = new MovieClipAnimFactory();
		this._boxType = BoxType.SELF;

		this.start();
		//console.log(this);
	}

	Path.prototype = Object.create(StateGraphic.prototype);
	Path.prototype.constructor = Path;

	// ###############################################################################################################################################
	// ###  GETTERS & SETTERS  #######################################################################################################################
	// ###############################################################################################################################################

	Object.defineProperties(Path.prototype, {
	    
	    state : {
            get : function () {return this._state}
        }
	});

	// ##############################################################################################################################################
	// ###  METHODS  ################################################################################################################################
	// ##############################################################################################################################################

	Path.prototype.start = function start(){
		this._setState(this._DEFAULT_STATE);
		this.setModeOff();
	}

	Path.prototype.setModeOff = function setModeOff(){
		this._anim.gotoAndStop(this._OFF);
	}

	Path.prototype.setModeOn = function setModeOn(){
		this._anim.gotoAndStop(this._ON);
		console.log(this._state);
	}


	return Path;
});