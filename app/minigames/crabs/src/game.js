define([
    'eventemitter3',
    'common/src/kalulu',
    'common/src/ui',
    './remediation'
], function (
    EventEmitter,
    Kalulu,
    Ui,
    Remediation
) {

    'use strict';


    var Game = function (game) {
        this.eventManager = null;
        this.background = null;
        this.remediation = null;
        this.ui = null;
        this.kalulu = null;
    };

    Game.prototype = {
        preload : function preloadGame () {
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
                if (this.game.discipline == "maths") this.game.load.atlasJSONHash('maths', Config.gameId + '/assets/images/maths/maths.png', Config.gameId + '/assets/images/maths/maths.json');

            }
        },

        create: function () {

            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.game.eventManager = new EventEmitter();

            this.background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
            this.background.anchor.setTo(0.5, 0.5);
            this.background.width = this.game.width;
            this.background.height = this.game.height;

            this.remediation = new Remediation(this.game);
            this.ui = new Ui(this.game.pedagogicData.rounds.length, this.game);
            this.kalulu = new Kalulu(this.game);
            

            this.game.eventManager.emit('startGame');
            this.game.time.advancedTiming = true; // debug fps
        },

        render: function () {
            this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
        }
    };
    return Game;

});