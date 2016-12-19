define([
    '../libs/pixi',
    './utils/game/game_stage',
    './utils/system/device_capabilities',
    './utils/events/event_type'
], function (
    PIXI3,
    GameStage,
    DeviceCapabilities,
    EventType
) {

    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################


    /**
     * The RenderingManager class is in charge of the rendering of Kalulu (mainly Kalulu UI, and eventually mini-games using PIXI3)
     * and the management between the various renderers used by the minigames.
     *
     * @class
     * @memberof Kalulu.Interface
    **/
    function RenderingManager () {

        /**
         * The main container where all displayObjects will be added
         * @type {PIXI.Container}
         * @private
        **/
        this._stage = new PIXI3.Container();
        
        /**
         * The PIXI renderer (PIXI.WebGLRenderer || PIXI.CanvasRenderer)
         * @type {PIXI.SystemRenderer}
         * @private
        **/
        this._renderer = this._getInitialisedRenderer();
        
        /**
         * Is the renderer on ?
         * @type {boolean}
         * @private
        **/
        this._rendererOn = true;
        
        /**
         * The main canvas name/id if needed in dom.
         * @type {string}
         * @private
        **/
        this._mainCanvasName = "Kalulu User Interface";
        
        /**
         * The width of the Graphic Zone
         *
         * @type {number}
         * @private
        **/
        this._GRAPHIC_ZONE_WIDTH = 2430;

        /**
         * The height of the Graphic Zone
         *
         * @type {number}
         * @private
        **/
        this._GRAPHIC_ZONE_HEIGHT = 1536;
        
        /**
         * The width of the Safe Zone
         *
         * @type {number}
         * @private
        **/
        this._SAFE_ZONE_WIDTH = 2048;

        /**
         * The height of the Safe Zone
         *
         * @type {number}
         * @private
        **/
        this._SAFE_ZONE_HEIGHT = 1366;


        this._minigamesCanvas = null;
        this._minigamesDiv = null;

        this._init();
    }



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(RenderingManager.prototype, {
        
        /**
         * The width of the Graphic Zone
         * The GraphicZone may be displayed or not, depending on the proportions of the target screen.
         * (A wide screen (16:9) will show the GraphicZone on the left and right, when a tall screen (4:3) will show the GraphicZone on the top and bottom)
         * @readonly
         * @type {number}
         * @memberof Kalulu.Interface.RenderingManager#
        **/
        GRAPHIC_ZONE_WIDTH: {
            get: function () {
                return this._GRAPHIC_ZONE_WIDTH;
            }
        },

        /**
         * The height of the Graphic Zone
         * The GraphicZone may be displayed or not, depending on the proportions of the target screen.
         * (A wide screen (16:9) will show the GraphicZone on the left and right, when a tall screen (4:3) will show the GraphicZone on the top and bottom)
         * @readonly
         * @type {number}
         * @memberof Kalulu.Interface.RenderingManager#
        **/
        GRAPHIC_ZONE_HEIGHT: {
            get: function () {
                return this._GRAPHIC_ZONE_HEIGHT;
            }
        },

        /**
         * The width of the Safe Zone
         * The SafeZone is always fully displayed for any screen size.
         * @readonly
         * @type {number}
         * @memberof Kalulu.Interface.RenderingManager#
        **/
        SAFE_ZONE_WIDTH: {
            get: function () {
                return this._SAFE_ZONE_WIDTH;
            }
        },

        /**
         * The height of the Safe Zone
         * The SafeZone is always fully displayed for any screen size.
         * @readonly
         * @type {number}
         * @memberof Kalulu.Interface.RenderingManager#
        **/
        SAFE_ZONE_HEIGHT: {
            get: function () {
                return this._SAFE_ZONE_HEIGHT;
            }
        },
        
        /**
         * Is teh renderer displayed ?
         * @readonly
         * @type {boolean}
         * @memberof Kalulu.Interface.RenderingManager#
        **/
        rendererIsDisplayed : { get : function () { return this._rendererOn; }}
    });



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################


    /**
     * Returns something
     *
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    RenderingManager.prototype.render = function render () {
        this._renderer.render(this._stage);
    };


    /**
     * Removes the renderer from the document body
     * 
     * @param renderer {PIXI.SystemRenderer} the renderer you want to remove from the document. if null, will remove main renderer
    **/
    RenderingManager.prototype.removeRenderer = function removeRenderer (renderer) {
        if (!this._rendererOn) {
            console.warn("[RenderingManager] Why do you ask to remove the renderer again ? It is already removed. Please check your double call.");
            return;
        }
        renderer = renderer || this._renderer;
        document.body.removeChild(renderer.view);
        this._rendererOn = false;
        console.log("[RenderingManager] Renderer removed from document body");
    };


    /**
     * Adds the renderer to the document body
     *
     * @param renderer {PIXI.SystemRenderer} the renderer you want to add to the document. if null, will add main renderer
    **/
    RenderingManager.prototype.addRenderer = function addRenderer (renderer) {
        renderer = renderer || this._renderer;
        document.body.appendChild(renderer.view);
        this._rendererOn = true;
        console.info("[RenderingManager] Renderer added to document body");
    };

    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################


    RenderingManager.prototype._init = function _init() {

        // Canvas Id
        this._renderer.view.id = this._mainCanvasName;

        // GameStage
        GameStage.init(this.render.bind(this), this.SAFE_ZONE_WIDTH, this.SAFE_ZONE_HEIGHT, true, true);
        this._stage.addChild(GameStage);

        // resize event
        this._unboundResize = this._resize;
        this._resize = this._unboundResize.bind(this);

        window.addEventListener(EventType.RESIZE, this._resize);
        this._resize();
    };

    /**
     * Resizes the renderer and the gamestage with the new height and with returned by DeviceCapabilities.
     * 
     * @private
    **/
    RenderingManager.prototype._resize = function _resize() {
        
        this._renderer.resize(DeviceCapabilities.width, DeviceCapabilities.height);
        GameStage.resize();
    };


    /**
     * Returns an autodetected renderer (WebGL or Canvas) initialised and added to document body.
     * 
     * @private
     * @return {Pixi.SystemRenderer} le renderer newly created and setup
    **/
    RenderingManager.prototype._getInitialisedRenderer = function _getInitialisedRenderer () {
        
        var rendererOptions = {antialias : true};
        var renderer = PIXI3.autoDetectRenderer(DeviceCapabilities.width, DeviceCapabilities.height, rendererOptions); // autodetect will use WebGL if possible, canvas else.
        // var renderer = PIXI3.WebGLRenderer(DeviceCapabilities.width, DeviceCapabilities.height); // cette ligne force un renderer WebGL

        this.addRenderer(renderer);

        return renderer;
    };


    return RenderingManager;
});