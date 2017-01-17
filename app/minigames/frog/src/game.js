define([
    'common/src/ui',
    './remediation',
    'common/src/kalulu',
    'eventemitter3'
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
     * @memberof Frogger    
	 * @param game {Phaser.Game} game instance
	**/
    function Game(game) {
        /**
	     * background 
         * @private
	     * @type {Phaser.Sprite}
	    **/
        this.background = null;

        /**
	     * river 
         * @private
	     * @type {Phaser.Sprite}
	    **/
        this.river = null;
        

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

        preload: function preloadGame() {
            //##console.info("[Game State] Preloading new game");

            // load audiofiles for the current data

            var data = this.game.pedagogicData.data;
            var roundsCount = data.rounds.length;
            var stepsCount, stimuliCount, stimulus;

            for (var i = 0; i < roundsCount; i++) {
                if (this.game.discipline != "maths") this.game.load.audio(data.rounds[i].word.value, data.rounds[i].word.soundPath);
                stepsCount = data.rounds[i].steps.length;
                for (var j = 0; j < stepsCount; j++) {
                    stimuliCount = data.rounds[i].steps[j].stimuli.length;
                    for (var k = 0; k < stimuliCount; k++) {
                        stimulus = data.rounds[i].steps[j].stimuli[k];
                        if (stimulus.value !== "") {
                            this.game.load.audio(stimulus.value, stimulus.soundPath);
                        }
                    }
                }
            }
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

            //##console.info("[Game State] Creating new game");
            if (Config.globalVars) {
                window.frogger = {};
                window.frogger.game = this.game;
            }

            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.game.eventManager = new EventEmitter();

            this.background = this.add.sprite(this.world.centerX, this.world.centerY, 'background', 'Background_frogger');
            this.background.anchor.setTo(0.5, 0.5);
            this.background.width = this.game.width;
            this.background.height = this.game.height;

            this.river = this.add.sprite(this.world.centerX, this.world.centerY, 'background', 'riviere');
            this.river.anchor.setTo(0.5, 0.5);
            this.river.height = this.game.height;

            this.remediation = new Remediation(this.game);
            var centralConch = true;
            var conch = true;
            if (this.game.pedagogicData.discipline == "maths") {
                conch = false;
                centralConch = false;
            }

            this.ui = new Ui(this.game.params.getGlobalParams().totalTriesCount, this.game, centralConch, true, conch);
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
            if (this.game.gameConfig.debugPanel) this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
        }
    };
    
    
    return Game;
});