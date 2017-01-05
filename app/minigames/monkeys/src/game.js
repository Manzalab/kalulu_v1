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
	 * Game is in charge of linking together the different classes
	 * @class
     * @memberof Cocolision
	 * @param game {Phaser.Game} game instance
	**/
    function Game(game) {
        /**
	     * sky 
         * @private
	     * @type {Phaser.Sprite}
	    **/
        this.sky = null;

        /**
	     * ground 
         * @private
	     * @type {Phaser.Sprite}
	    **/
        this.ground = null;

        /**
	     * In charge of all the game events
         * WARNING : NEEDED FOR UI AND KALULU
         * Go to init events in kalulu and ui scripts to see the differents events in place
	     * @type {EventEmitter}
	    **/
        this.eventManager = null;

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
    };

    Game.prototype = {

        preload: function preloadGame() {
            console.info("[Game State] Preloading new game");
            console.log(this.game.pedagogicData);
            // load audiofiles for the current data
            var data = this.game.pedagogicData.data;
            this.game.discipline = this.game.pedagogicData.discipline;
            console.log( data.rounds.length);
            var roundsCount = data.rounds.length;
            var stepsCount, stimuliCount, stimulus;
            console.log(this.game.discipline)
            for (var i = 0; i < roundsCount; i++) {
                if (this.game.discipline != "maths") this.game.load.audio(data.rounds[i].word.value, data.rounds[i].word.soundPath);
                stepsCount = data.rounds[i].steps.length;
                for (var j = 0; j < data.rounds[i].steps.length; j++) {
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

        create: function () {
            console.info("[Game State] Creating new game");
            if (this.game.gameConfig.globalVars) {
                window.cocolision = {};
                window.cocolision.game = this.game;
            }

            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.game.eventManager = new EventEmitter();

            this.sky = this.add.sprite(this.world.centerX, this.world.centerY, 'sky');
            this.sky.anchor.setTo(0.5, 0.5);
            this.sky.width = this.game.width;
            this.sky.height = this.game.height;

            this.ground = this.add.sprite(this.world.centerX, this.game.height, 'ground');
            this.ground.anchor.setTo(0.5, 1);
            this.ground.width = this.game.width;

            this.remediation = new Remediation(this.game);
            console.log(this.game.params.getGlobalParams());

            var centralConch = true;
            var conch = true;
            if (this.game.pedagogicData.discipline === "maths") {
                conch = false;
                centralConch = false;
            }
            this.ui = new Ui(this.game.params.getGlobalParams().totalTriesCount, this.game, centralConch, true, conch);

            this.kalulu = new Kalulu(this.game);

            this.game.eventManager.emit('startGame');

            this.game.time.advancedTiming = true; //Needed for rendering debug fps
        },

        update: function () {

        },

        render: function () {
            /**
            * only for debuging purposes
            * @private
            **/
            this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
        }
    };


    return Game;
});