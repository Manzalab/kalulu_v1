(function () {
    'use strict';

    var Phaser             = require('phaser-bundle');
    var Boot               = require('common/src/boot');
    var Setup              = require('common/src/setup');
    var MinigameParameters = require('common/src/minigame_parameters');
    var Config             = require('common/src/minigame_config');

    var Preloader          = require('./preloader');
    var Game               = require('./game');
    var params             = require('../assets/data/params');
    
    /**
     * GameLauncher is in charge of instanciating the Phaser Game
     * @class
     * @memberof Minigames.Common
     * @param rafiki {Object} the pedagogic interface
         * It contains :
         * - getPedagogicData() => returns the data instanciated by the remediation engine
         * - saveData(data) => save the remediation data of your minigame
         * - close() => tell kalulu's engine you're done
    **/
    function GameLauncher (rafiki) {

        this._rafiki = rafiki;
        this._config = new Config();
        this._config.request('minigames/crabs/assets/data', this.onConfigLoaded.bind(this));
    }   
    
    GameLauncher.prototype.onConfigLoaded = function onConfigLoaded () {
        
        /**
         * Phaser Game
         * 1920 * 1350 is the targeted resolution of the Pixel C tablet
         * @type {Phaser.Game}
        **/
        this.game = new Phaser.Game(1920, 1350, Phaser.CANVAS); // TODO : make it dynamic for multiscreen handling
        
        // Setting Up the Remediation
        this.game.config = this._config;
        this.game.params = new MinigameParameters(params);
        this.game.rafiki = this._rafiki;
        // debug Panel from Kalulu
        this.game.debugPanel = this._rafiki.debugPanel;
        
        //  Game States
        this.game.state.add('Boot', Boot);
        this.game.state.add('Preloader', Preloader);
        this.game.state.add('Setup', Setup);
        this.game.state.add('Game', Game);
        
        //Starts the 'Boot' State
        this.game.state.start('Boot');
    };

    GameLauncher.prototype.destroy = function destroy () {
        
        this.game.destroy();
        this.game = null;
    };

    module.exports = GameLauncher;
})();