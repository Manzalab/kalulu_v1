(function () {
    
    'use strict';
    var EventEmitter       = require ('eventemitter3');
    var Events             = require ('application/events');
    var LoadingManager     = require ('application/loading_manager');
    // var LocalStorageModule = require ('application/local_storage_module');
    // var StorageManager     = require ('application/storage_manager');
    var GameManager        = require ('game_logic/game_manager');
    // var InterfaceManager   = require ('interface/interface_manager');
    var Stats              = require ('stats');


    // this line can be changed after having another storage module coded with the same interface.
    // var storage_strategy = new LocalStorageModule(); //@ todo : transfer in config

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    
    /**
     * The Application class is in charge of the lifecycle of the application, and emitting the main loop event.
     * @example <caption>Starting the app</caption>
     * var app = new Application();
     * app.initAndStart();
     * 
     * @class
     * @memberof Application
    **/
    function Application () {
        
        /**
         * The EventSystem Object is in charge of maintaining the listeners registry and emitting events.
         * @type {EventEmitter}
         * @private
        **/
        this._eventSystem = null;
        
        /**
         * The LoadingManager Object is in charge of knowing what to load on specific events.
         * @type {LoadingManager}
         * @private
        **/
        this._loadingManager = null;
        
        /**
         * The StorageManager Object is in charge of storing and retrieving user data.
         * @type {StorageManager}
         * @private
        **/
        this._storageManager = null;

        /**
         * The GameManager Object is in charge of supervising the game logic : states management, events emission...
         * @type {GameManager}
         * @private
        **/
        this._gameManager = null;

        /**
         * The interfaceManager makes the link between the application layer, the game_logic and the interface module (graphics, sounds, inputs, feedbacks...)
         * @type {InterfaceManager}
         * @private
        **/
        this._interfaceManager = null;

        /**
         * The main loop event is fired only when _shouldFireMainLoopEvent is set to true
         * @type {boolean}
         * @private
        **/
        this._shouldFireMainLoopEvent = false;

        /**
         * The current frame number Id
         * @type {number}
         * @private
        **/
        this._frameId = 0;
    }


    // ###############################################################################################################################################
    // ###  PUBLIC PROPERTIES  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(Application.prototype, {
        
        /**
         * The current application frame id
         * @type {number}
         * @memberof Application.Application#
        **/
        frameId : { get: function () { return this._frameId; } }
    });



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################


    /**
     * Initialise the game manager and the interface manager. Starts the application main loop.
    **/
    Application.prototype.initAndStart = function initAndStart () {
        Config.request('/config/config.json', function () {
            this._init();
            this._start();
        }.bind(this));
    };

    /**
     * Allows the "MainLoop" Event to be fired at each new animation frame
    **/
    Application.prototype.enableMainLoop = function enableMainLoop () {
        this._shouldFireMainLoopEvent = true;
    };

    /**
     * Prevents the "MainLoop" Event to be fired at each new animation frame
    **/
    Application.prototype.disableMainLoop = function disableMainLoop () {
        this._shouldFireMainLoopEvent = false;
    };




    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################


    Application.prototype._init = function _init () {
        
        if (Config.enableGlobalVars) {
            window.kalulu = {};
            window.kalulu.application = this;
            console.info("[Kalulu Debug] The global variable kalulu is now available in console.");
        }

        this._eventSystem = new EventEmitter();
        this._eventSystem.name = "Kalulu App Event System";

        this._loadingManager = new LoadingManager(this._eventSystem);

        // this._storageManager = new StorageManager(storage_strategy);

        this._gameManager = new GameManager(this._eventSystem);

        // this._interfaceManager = new InterfaceManager(this._eventSystem);
        
        this._frameId = 0;
        this._mainLoop = this._mainLoop.bind(this);


        if (Config.stats) {
            var stats = this.statsModule = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild( stats.dom );
        }
    };

    Application.prototype._start = function _start () {
        
        this._eventSystem.emit(Events.COMMANDS.BOOT_STATE_REQUEST);
        this.enableMainLoop();
        // this._eventSystem.on(Events.APPLICATION.GET_SAVE, this._onGetSave, this); //@ TODO removeListener
        // this._eventSystem.on(Events.APPLICATION.SET_SAVE, this._onSetSave, this); //@ TODO removeListener
        
        window.requestAnimationFrame(this._mainLoop);
    };

    /**
     * Request a new animation frame and eventually fires the MainLoop Event
     * @private
    **/
    Application.prototype._mainLoop = function _mainLoop () {
        if (Config.stats) this.statsModule.begin();
        if(this._shouldFireMainLoopEvent) {
            this._eventSystem.emit(Events.APPLICATION.MAIN_LOOP, this._frameId);
        }
        this._frameId++;
        if (Config.stats) this.statsModule.end();
        window.requestAnimationFrame(this._mainLoop);
    };

    Application.prototype._onGetSave = function _onGetSave (userId) {
        // this._eventSystem.emit(Events.APPLICATION.SAVED_DATA_SENT, this._storageManager.getUserData(userId));
    };

    Application.prototype._onSetSave = function _onSetSave (userData) {
        // this._eventSystem.emit(Events.APPLICATION.USER_DATA_SAVED, this._storageManager.saveUserData(userData));
    };

    module.exports = Application;
})();