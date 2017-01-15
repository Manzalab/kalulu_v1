(function () {
    
    'use strict';

    var EventEmitter = require('eventemitter3');
    var Debugger = require('./debugger');

    var config  = require('./config');
    var states = require('./states');



    function GameLauncher (rafiki) {
        
        this._gameInstance = null;
        this._debugger = null;

        this._createGameInstance({ gameWidth : 1920, gameHeight : 1350, canvasType: Phaser.CANVAS });

        this._initDebug(rafiki, config);
        this._initEvents();

        this._addConfigToGame(rafiki, config);
        this._addGameStates(states);

        this._requireGameState(states.names.BOOT);
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
        this._gameInstance.stateNames = states.names;
        for (var stateName in states.states) {
            this._gameInstance.state.add(stateName, states.states[stateName]);
        }
    };

    GameLauncher.prototype._initEvents = function initEvents () {
        
        this._gameInstance.eventManager = new EventEmitter();
        this._gameInstance.eventManager.on("exitGame", this._quit, this);
    };

    GameLauncher.prototype._quit = function quit () {

        this._gameInstance.eventManager.off("exitGame", this._quit, this);
        this._gameInstance.stateNames = null;
        this._gameInstance.ui = null;

        this._debugger.destroy();
        this._debugger = null;
        
        var rafiki = this._gameInstance.rafiki;
        this._gameInstance.destroy();
        this._gameInstance.rafiki = null;
        this._gameInstance.gameConfig = null;
        this._gameInstance = null;

        console.clear();
        rafiki.close();
    };

    GameLauncher.prototype._requireGameState = function requireGameState (stateName) {
        
        console.info("Look&Learn App Created, Starting " + stateName + "...");
        this._gameInstance.state.start(stateName);
    };


    module.exports = GameLauncher;
})();