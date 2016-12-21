define([
    'eventemitter3',
    'common/src/ui',
    './remediation',
    'common/src/kalulu'
], function (
    EventEmitter,
    Ui,
    Remediation,
    Kalulu
) {

    'use strict';

    var Game = function (game) {
        /**
         * backgroundTree
         * @private
         * @type {Phaser.Sprite}
        **/
        this.backgroundTree = null;

        /**
         * backgroundSky 
         * @private
         * @type {Phaser.Sprite}
        **/
        this.backgroundSky = null;

        /**
         * In charge of all the game events
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
            this.game.discipline = this.game.pedagogicData.discipline;
            var data = this.game.pedagogicData;
            var roundsCount = data.rounds.length;
            var stimuliCount, stimulus;

            // load audiofiles for the current data
            for (var i = 0; i < roundsCount; i++) {

                stimuliCount = data.rounds[i].stimuli.length;

                for (var j = 0; j < stimuliCount; j++) {

                    stimulus = data.rounds[i].stimuli[j];
                    if (stimulus.value !== "") {
                        //console.log("Loading Phoneme " + stimulus.value.toUpperCase() + " Sound, path : " + stimulus.soundPath);
                        this.game.load.audio(stimulus.value, stimulus.soundPath);
                    }
                }
            }
            if (this.game.discipline == "maths") this.game.load.atlasJSONHash('maths', Config.gameId + '/assets/images/maths/maths.png', Config.gameId + '/assets/images/maths/maths.json');


        },

        create: function () {
            console.info("[Game State] Creating new game");
            if (Config.globalVars) {
                window.memory = {};
                window.memory.game = this.game;
            }


            this.backgroundSky = this.add.sprite(this.world.centerX, this.world.centerY, 'backgroundSky');
            this.backgroundSky.anchor.setTo(0.5, 0.5);
            this.backgroundSky.width = this.game.width;
            this.backgroundSky.height = this.game.height;

            this.backgroundTree = this.add.sprite(this.world.centerX, this.world.centerY, 'backgroundTree');
            this.backgroundTree.anchor.setTo(0.5, 0.5);
            this.backgroundTree.scale.x = 0.5;
            this.backgroundTree.height = this.game.height;
            this.game.eventManager = new EventEmitter();
            this.remediation = new Remediation(this.game);
            this.game.world.bringToTop(this.backgroundTree);
            this.ui = new Ui(this.game.params.getGlobalParams().totalTriesCount, this.game, false, false, false);
            this.kalulu = new Kalulu(this.game);
            this.game.kalulu = this.kalulu;

            this.game.eventManager.once('unPause', function () {
                this.game.eventManager.emit('start');
            }, this);
            this.game.eventManager.emit('startGame');


            this.game.time.advancedTiming = true; //Needed for rendering debug fps

        },

        render: function () {
            this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
        }

    };

    return Game;
});