define([
	'../../../libs/pixi',
	'../system/device_capabilities',
	'../events/event_type',
	'../game/game_stage_scale',
	'../game/game_stage_align'
], function (
	PIXI3,
	DeviceCapabilities,
	EventType,
	GameStageScale,
	GameStageAlign
) {
	
	'use strict';

	var SAFE_ZONE_WIDTH = 2048;
	var SAFE_ZONE_HEIGHT = 1366;

	// ###############################################################################################################################################
	// ###  CONSTRUCTOR  #############################################################################################################################
	// ###############################################################################################################################################
	

	/**
	 * The GameStage Object allows to manager the display layers (game, hud, screens, popins)
	 * It offers generic functions of opening/closing screens and popins.
	 * @class
	 * @extends PIXI3.Container
	 * @memberof Namespace (e.g. Kalulu.Remediation)
	**/
	function GameStage () {
		
		PIXI3.Container.call(this);

		this._gameContainer = new PIXI3.Container();
		this._hudContainer = new PIXI3.Container();
		this._popinsContainer = new PIXI3.Container();
		this._screensContainer = new PIXI3.Container();
		this._screensTransitionsContainer = new PIXI3.Container();

		this._alignMode = GameStageAlign.CENTER;	
		this._scaleMode = GameStageScale.SHOW_ALL;
		this._safeZone = null;
		this._renderFunction = null;

		this.addChild(this._gameContainer);
		this.addChild(this._hudContainer);
		this.addChild(this._screensContainer);
		this.addChild(this._popinsContainer);
		this.addChild(this._screensTransitionsContainer);

		if (Config.enableKaluluGlobalDebug) window.GameStage = this;
	}

	GameStage.prototype = Object.create(PIXI3.Container.prototype);
	GameStage.prototype.constructor = GameStage;


	// ###############################################################################################################################################
	// ###  GETTERS & SETTERS  #######################################################################################################################
	// ###############################################################################################################################################


	Object.defineProperties(GameStage.prototype, {
	    
	    /**
	     * name of the object
	     * @type {string}
	     * @memberof Namespace.GameStage#
	    **/
	    name: { get: function () { return "Game Stage"; } },

	    /**
	     * A rectangle giving the position and size of the safezone
	     * @type {PIXI.Rectangle}
	     * @memberof Namespace.GameStage#
	    **/
	    safeZone : { get : function () { return this._safeZone; } },
	});



	// ##############################################################################################################################################
	// ###  METHODS  ################################################################################################################################
	// ##############################################################################################################################################


	/**
	 * Returns something
	 * @param paramName {Type} description of the parameter
	 * @return {Type} description of the returned object
	**/
	GameStage.prototype.init = function init (pRenderFunction, pSafeZoneWidth, pSafeZoneHeight, pCenterPopinsContainer, pCenterScreensContainer, pCenterHudContainer, pCenterGameContainer, pCenterScreensTransitionsContainer) {
		
		if (typeof pSafeZoneWidth === "undefined") pSafeZoneWidth = SAFE_ZONE_WIDTH;
		if (typeof pSafeZoneHeight === "undefined") pSafeZoneHeight = SAFE_ZONE_HEIGHT;
		if (typeof pCenterGameContainer === "undefined") pCenterGameContainer = true;
		if (typeof pCenterHudContainer === "undefined") pCenterHudContainer = true;
		if (typeof pCenterScreensContainer === "undefined") pCenterScreensContainer = true;
		if (typeof pCenterPopinsContainer === "undefined") pCenterPopinsContainer = true;
		if (typeof pCenterScreensTransitionsContainer === "undefined") pCenterScreensTransitionsContainer = true;
		
		this._safeZone = new PIXI3.Rectangle(0, 0, pSafeZoneWidth, pSafeZoneHeight);
		
		if (pCenterGameContainer) {
			this._gameContainer.x = this._safeZone.width / 2;
			this._gameContainer.y = this._safeZone.height / 2;
		}
		
		if (pCenterScreensContainer) {
			this._screensContainer.x = this._safeZone.width / 2;
			this._screensContainer.y = this._safeZone.height / 2;
		}
		
		if (pCenterPopinsContainer) {
			this._popinsContainer.x = this._safeZone.width / 2;
			this._popinsContainer.y = this._safeZone.height / 2;
		}
		
		if (pCenterHudContainer) {
			this._popinsContainer.x = this._safeZone.width / 2;
			this._popinsContainer.y = this._safeZone.height / 2;
		}

		if (pCenterScreensTransitionsContainer) {
			this._screensTransitionsContainer.x = this._safeZone.width / 2;
			this._screensTransitionsContainer.y = this._safeZone.height / 2;
		}


		this._renderFunction = pRenderFunction;
	};

	GameStage.prototype.resize = function resize () {
			
		var lWidth = DeviceCapabilities.width;
		var lHeight = DeviceCapabilities.height;
				
		var lRatio = Math.round(10000 * Math.min(lWidth / this._safeZone.width, lHeight / this._safeZone.height)) / 10000;
		
		if (this._scaleMode == GameStageScale.SHOW_ALL) this.scale.set(lRatio, lRatio);
		else this.scale.set (DeviceCapabilities.textureRatio, DeviceCapabilities.textureRatio);
		
		if (this._alignMode == GameStageAlign.LEFT || this._alignMode == GameStageAlign.TOP_LEFT || this._alignMode == GameStageAlign.BOTTOM_LEFT) this.x = 0;
		else if (this._alignMode == GameStageAlign.RIGHT || this._alignMode == GameStageAlign.TOP_RIGHT || this._alignMode == GameStageAlign.BOTTOM_RIGHT) this.x = lWidth - this._safeZone.width * this.scale.x;
		else this.x = (lWidth - this._safeZone.width * this.scale.x) / 2;
		
		if (this._alignMode == GameStageAlign.TOP || this._alignMode == GameStageAlign.TOP_LEFT || this._alignMode == GameStageAlign.TOP_RIGHT) this.y = 0;
		else if (this._alignMode == GameStageAlign.BOTTOM || this._alignMode == GameStageAlign.BOTTOM_LEFT || this._alignMode == GameStageAlign.BOTTOM_RIGHT) this.y = lHeight - this._safeZone.height * this.scale.y;
		else this.y = (lHeight - this._safeZone.height * this.scale.y) / 2;
		
		
		this._renderFunction();
		
		this.emit(EventType.RESIZE, { "width":lWidth, "height":lHeight });
	};


	GameStage.prototype.getScreensContainer = function getScreensContainer () {
		return this._screensContainer;
	};

	GameStage.prototype.getPopinsContainer = function getPopinsContainer () {
		return this._popinsContainer;
	};

	GameStage.prototype.getGameContainer = function getGameContainer () {
		return this._gameContainer;
	};
	GameStage.prototype.getHudContainer = function getHudContainer () {
		return this._hudContainer;
	};
	GameStage.prototype.getScreensTransitionsContainer = function getScreensTransitionsContainer () {
		return this._screensTransitionsContainer;
	};
	return new GameStage();
});