define([
    'phaser-bundle',
    './config',
    './boot',
    './states/preload',   
    './game',
    // 'params',
    'common/src/minigame_parameters',
    './setup',
    'eventemitter3',
    './states/phase_video',
    './states/phase_image',
    './states/phase_tracing',
    './states/phase_1_maths'
], function (
    Phaser,
    minigameConfig,
    Boot,
    Preloader,   
    Game,
    // params,
    MinigameParameters,
    Setup,
    EventEmitter,
    PhaseVideo,
    PhaseImage,
    PhaseTracing,
    Phase1Maths
) {
    'use strict';

    /**
     * GameLauncher is in charge of instancing the Phaser Game
     * @class
     * @memberof Template
     * @param rafiki {Object} the pedagogic interface
         * It contains :
         * - getSetup() => returns the data instanciated by the remediation engine
         * - saveData(data) => save the remediation data of your minigame
         * - close() => tell kalulu's engine you're done
    **/
    function GameLauncher (rafiki) {

        this.rafiki = rafiki;
        this._config = minigameConfig;
        
        this._config.pedagogicData = rafiki.getPedagogicData();

        if (typeof this._config.requestMinigameConfig === 'function') {
            
            this._config.requestMinigameConfig(this.init.bind(this));
            console.log("[Minigame] Requested this.game.gameConfig");
        }
        else {
            
            console.error('issue with config');
        }

    }   
    

    GameLauncher.prototype.init = function init () {
        
        /**
         * Phaser Game
         * 1920 * 1350 is the targeted resolution of the Pixel C tablet
         * @type {Phaser.Game}
        **/
        this.game = new Phaser.Game(1920, 1350, Phaser.CANVAS); // TODO : make it dynamic for multiscreen handling
        this.game.gameConfig = this._config;
        if (this.game.gameConfig.globalVars) {
            console.info('Debug with global Variables enabled. Everything can be found in global variable "lookandlearn"');
            window.lookandlearn = {};
            window.lookandlearn.game = this.game;
        }


        this.game.rafiki = this.rafiki;
        // debug Panel from Kalulu
        this.game.debugPanel = this.rafiki.debugPanel;

        if (this.game.gameConfig.debugPanel) {
            this.setupDebugPanel();
        }
        
        //  Game States
        this.game.state.add('Boot', Boot);
        this.game.state.add('Preloader', Preloader);
        this.game.state.add('Setup', Setup);
        this.game.state.add('Phase1Video', PhaseVideo);
        this.game.state.add('Phase2Image', PhaseImage);
        this.game.state.add('Phase3Tracing', PhaseTracing);
        this.game.state.add('Phase1Maths', Phase1Maths);
        
        //Starts the 'Boot' State
        console.info("Look&Learn App Created, Starting Boot...");


        if (!this.game.eventManager) {
            this.game.eventManager = new EventEmitter();
        }

        this.game.eventManager.on("exitGame", this.quit, this);
        this.game.state.start('Boot');

    };

    GameLauncher.prototype.quit = function quit () {
        
        this.game.eventManager.off("exitGame", this.quit, this);
        this.clearDebugPanel();
        this.rafiki.close();
        this.destroy();
    };

    GameLauncher.prototype.destroy = function destroy () {
        
        this.game.destroy();
        this.game = null;
    };

    GameLauncher.prototype.setupDebugPanel = function setupDebugPanel() {
        
        console.info("LookAndLearn Setupping debug Panel");
        var debugPanel = null;
        if (this.game.debugPanel) {
            debugPanel = this.game.debugPanel;
            this.game.gameConfig.rafikiDebugPanel = true;
        }
        else {
            debugPanel = this.game.debugPanel = new Dat.GUI();
            this.game.gameConfig.rafikiDebugPanel = false;
        }

        this.game.debugFolderNames = {
            functions: "Debug Functions"
        };

        this._debugFunctions = debugPanel.addFolder(this.game.debugFolderNames.functions);

        this._debugFunctions.add(this, "AutoWin");
        this._debugFunctions.add(this, "skipKalulu");
        this._debugFunctions.open();
    };

    GameLauncher.prototype.clearDebugPanel = function clearDebugPanel() {
        if (this.game.gameConfig.rafikiDebugPanel) {
            console.info("LookAndLearn Cleaning debug Panel");
            this.game.debugPanel.removeFolder(this.game.debugFolderNames.functions);
        }
        else {
            console.info("LookAndLearn Destroying debug Panel");
            this.game.debugPanel.destroy();
        }
    };

    GameLauncher.prototype.AutoWin = function AutoWin() {
        
        this.game.rafiki.save();
        this.game.eventManager.emit("exitGame");
    };

    GameLauncher.prototype.skipKalulu = function skipKalulu() {

        this.game.eventManager.emit("skipKalulu");
    };

    return GameLauncher;
});