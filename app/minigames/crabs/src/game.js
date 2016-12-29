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
    
    /**
     * Game is in charge of linking together the different objects
     * @class
     * @memberof Jellyfish    
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
    }
    
    Game.prototype = {
        preload : function preloadGame () {
            console.info("[Game State] Preloading new game");
            this.game.discipline = this.game.pedagogicData.discipline;
            var data = this.game.pedagogicData.data;
            var roundsCount = data.rounds.length;
            var stimuliCount, stimulus;

            // load audiofiles for the current data
            for (var i = 0; i < roundsCount; i++) {
                var stepsCount = data.rounds[i].steps.length;
                for (var j = 0 ; j < stepsCount; j++) {
                    stimuliCount = data.rounds[i].steps[j].stimuli.length;

                    for (var k = 0; k < stimuliCount; k++) {

                        stimulus = data.rounds[i].steps[j].stimuli[k];
                        if (stimulus.value !== "") {
                            this.game.load.audio(stimulus.value, stimulus.soundPath);
                        }
                    }
                }
            }
            if (this.game.discipline == "maths") this.game.load.atlasJSONHash('maths', 'minigames/common/assets/images/maths/maths.png', 'minigames/common/assets/images/maths/maths.json');
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
            console.info("[Game State] Creating new game");
            if (this.game.gameConfig.globalVars) {
                window.jellyfishes = {};
                window.jellyfishes.game = this.game;
            }

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            
            this.game.eventManager = new EventEmitter();
            
            this.background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
            this.background.anchor.setTo(0.5, 0.5);
            this.background.width = this.game.width;
            this.background.height = this.game.height;
            
            this.remediation = new Remediation(this.game);
            this.ui = new Ui(this.game.params.getGlobalParams().totalTriesCount, this.game);
            this.kalulu = new Kalulu(this.game);
            this.game.kalulu = this.kalulu;
            
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