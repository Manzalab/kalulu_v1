define([
    'common/src/ui',
    './remediation',
    './kalulu',
    'eventemitter3',
], function (
    Ui,
    Remediation,
    Kalulu,
    EventEmitter
) {

    'use strict';

    /**
     * Game is in charge of linking together the different objects
	 * @class
     * @memberof Template    
	 * @param game {Phaser.Game} game instance
	**/
    function Game(game) {

        /**
         * User interface 
	     * @type {Ui}
	    **/
        this.ui = null;

        /**
	     * In charge of the kalulu animations and audio
	     * @type {Kalulu}
	    **/
        this.kalulu = null;

        /**
	     * In charge of all the local Remediation and game loop
	     * @type {Remediation}
	    **/
        this.remediation = null;
    }

    Game.prototype = {
        preload: function(){
            this.game.load.atlasJSONHash('buoyRed', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animation_Bateau/buoyred_' + this.game.rafiki.discipline + '.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animation_Bateau/buoyred_' + this.game.rafiki.discipline + '.json');
            this.game.load.atlasJSONHash('buoyGreen', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animation_Bateau/buoygreen_' + this.game.rafiki.discipline + '.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animation_Bateau/buoygreen_' + this.game.rafiki.discipline + '.json');
        },

        /**
         * Fires 'startGame' event when done
         * Instanciates : 
         * - eventManager
         * - kalulu
         * - ui
         * - remediation
         **/
        create: function () {
            this.game.discipline = this.game.pedagogicData.discipline;

            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.game.eventManager = new EventEmitter();

            this.remediation = new Remediation(this.game);
            this.ui = new Ui(0, this.game, false, false, false, false);
            this.kalulu = new Kalulu(this.game);

            this.game.eventManager.emit('startGame');

            this.game.time.advancedTiming = true; //Needed for rendering debug fps
        },

        /** 
         * Show FPS in top left corner
         * Used for debugging purposes only
         * @private
         **/
        render: function () {
            this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
        }
    };


    return Game;
});