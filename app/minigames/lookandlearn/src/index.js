(function () {
    
    'use strict';
    
    var EventEmitter       = require('eventemitter3');

    var minigameConfig     = require('./config');
    var Debugger           = require('./debugger');
    var stateNames = {
        BOOT               : "Boot",
        PRELOAD            : "Preload",
        BOARD_GAME_PHASE   : "BoardGamePhase",
        VIDEO_PHASE        : "VideoPhase",
        ILLUSTRATION_PHASE : "IllustrationPhase",
        TRACING_PHASE      : "TracingPhase"
    };

    var states = {
        stateNames.BOOT               : require('./states/boot'),
        stateNames.PRELOAD            : require('./states/preload'),
        stateNames.BOARD_GAME_PHASE   : require('./states/phase_board_game'),
        stateNames.VIDEO_PHASE        : require('./states/phase_video'),
        stateNames.ILLUSTRATION_PHASE : require('./states/phase_illustration'),
        stateNames.TRACING_PHASE      : require('./states/phase_tracing')
    };

    /**
     * GameLauncher is in charge of instancing the Phaser Game with required states, config options and debug.
     * @class
     * @param rafiki {Object} the pedagogic interface
    **/
    function GameLauncher (rafiki) {

        this._rafiki = rafiki;
        this._config = minigameConfig;

        this._config.requestMinigameConfig(this._launch.bind(this));
    }   
    

    GameLauncher.prototype._launch = function launch () {
        
        this._createGameInstance({ gameWidth : 1920, gameHeight : 1350, canvasType: Phaser.CANVAS });
        
        this._addConfigToGame(this._rafiki, this._config);
        this._initDebug(this._rafiki, this._config);

        this._addGameStates(states);
        this._initEvents();

        this._requireGameState('Boot');
    };

    GameLauncher.prototype._createGameInstance = function createGameInstance (options) {
        
        this._gameInstance = new Phaser.Game(options.gameWidth, options.gameHeight, options.canvasType); // TODO : make it dynamic for multiscreen handling
    };

    GameLauncher.prototype._addConfigToGame = function addConfigToGame (rafiki, config) {
        
        this._gameInstance.rafiki = rafiki;
        this._gameInstance.gameConfig = config;
    };

    GameLauncher.prototype._initDebug = function initDebug (rafiki, config) {
        
        this._debugger = new Debugger(this._gameInstance, rafiki, config);
    };

    GameLauncher.prototype._addGameStates = function addGameStates (states) {
        this._gameInstance.stateNames = stateNames;
        for (var stateName in states) {
            this._gameInstance.state.add(stateName, states[stateName]);
        }
    };

    GameLauncher.prototype._initEvents = function initEvents () {
        
        this._gameInstance.eventManager = new EventEmitter();
        this._gameInstance.eventManager.on("exitGame", this._quit, this);
    };

    GameLauncher.prototype._quit = function quit () {
        this._gameInstance.eventManager.off("exitGame", this._quit, this);
        this.clearDebugPanel();
        this._gameInstance.rafiki.close();
        this._gameInstance._destroy();
    };

    GameLauncher.prototype._destroy = function destroy () {
        
        this._gameInstance.destroy();
        this._gameInstance = null;
        this._rafiki = null;
        this._config = null;
    };

    GameLauncher.prototype._requireGameState = function requireGameState (stateName) {
        
        console.info("Look&Learn App Created, Starting " + stateName + "...");
        this._gameInstance.state.start(stateName);
    };


    module.exports = GameLauncher;
})();