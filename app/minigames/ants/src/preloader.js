define([
], function (
) {
    'use strict';

    /**
	 * Preloader is in charge of loading all the game assets
	 * @class
     * @memberof jellyfishes
	 * @param game {Phaser.Game} game instance
	**/
    function Preloader(game) {
        this.preloadBar = null;
    }

    Preloader.prototype = {
        /**
	     * Load all the game assets
	    **/
        preload: function () {
            this.preloadBar = this.add.sprite(this.game.world.centerX - 490, this.game.height / 2, 'preloaderBar');
            this.load.setPreloadSprite(this.preloadBar);
            //##console.log(this.game);
            //this.loadDatasetAudio();
            this.loadSpecificAssets();
            this.loadSharedAssets();
        },

        /**
         * Load game specific assets
         **/
        loadSpecificAssets: function () {

            //Game specific Graphics
            this.game.load.image('background', 'minigames/ants/assets/images/Decors/texte_a_trou_background.png');
            this.game.load.atlasJSONHash('ant', 'minigames/ants/assets/images/Fourmi_animations/ant.png', 'minigames/ants/assets/images/Fourmi_animations/ant.json');
            this.game.load.image('leef', 'minigames/ants/assets/images/leef/Feuille.png');
            for (var i = 0; i < 4 ; i++) {
                this.game.load.image('hole' + (i + 1), 'minigames/ants/assets/images/leef/Trou0' + (i + 1) + '.png');
            }

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', 'minigames/ants/assets/images/ui/ScoreWrong.png');
            this.load.image('uiScoreRight', 'minigames/ants/assets/images/ui/ScoreSuccess.png');
            this.load.image('uiScoreEmpty', 'minigames/ants/assets/images/ui/ScoreEmpty.png');

            //Game Specific Audio
            //this.game.load.audio('background', 'minigames/ants/assets/audio/jellyfish/background.ogg');
            //for (var i = 0; i < 5; i++) {
            //    this.game.load.audio('rdm' + (i + 1), 'minigames/ants/assets/audio/jellyfish/rdm' + (i + 1) + '.ogg');
            //}

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', 'minigames/ants/assets/audio/kalulu/kalulu_intro_ants_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluHelp', 'minigames/ants/assets/audio/kalulu/kalulu_help_ants_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluGameOverWin', 'minigames/ants/assets/audio/kalulu/kalulu_end_ants_' + this.game.rafiki.discipline + '.ogg');
        },

        /**
         * Load all assets in minigames/common/assets
         **/
        loadSharedAssets: function () {

            //UI
            this.game.load.atlasJSONHash('ui', 'minigames/common/assets/images/ui/ui.png', 'minigames/common/assets/images/ui/ui.json');

            //FX 
            this.game.load.atlasJSONHash('fx', 'minigames/common/assets/images/fx/fx.png', 'minigames/common/assets/images/fx/fx.json');
            this.load.image('wrong', 'minigames/common/assets/images/fx/wrong.png');

            //KaluluGraphics
            this.game.load.atlasJSONHash('kaluluIntro', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.png', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.json');
            this.game.load.atlasJSONHash('kaluluOutro', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.png', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.json');
            this.game.load.atlasJSONHash('kaluluIdle1', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.json');
            this.game.load.atlasJSONHash('kaluluIdle2', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.json');
            this.game.load.atlasJSONHash('kaluluSpeaking1', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.json');
            this.game.load.atlasJSONHash('kaluluSpeaking2', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.json');

            // Audio
            this.game.load.audio('kaluluGameOverLose', 'minigames/common/assets/audio/kalulu/kalulu_lose_minigame.ogg');

            this.game.load.audio('menuNo', 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes', 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
            this.game.load.audio('menu', 'minigames/common/assets/audio/sfx/OpenPopin.ogg');
            this.game.load.audio('right', 'minigames/common/assets/audio/sfx/ResponseCorrect.ogg');
            this.game.load.audio('wrong', 'minigames/common/assets/audio/sfx/ResponseIncorrect.ogg');
            this.game.load.audio('loseGame', 'minigames/common/assets/audio/sfx/GameOverLose.ogg');  
            this.game.load.audio('winGame', 'minigames/common/assets/audio/sfx/GameOverWin.ogg');  
            this.game.load.audio('kaluluOn', 'minigames/common/assets/audio/sfx/KaluluOn.ogg');
            this.game.load.audio('kaluluOff', 'minigames/common/assets/audio/sfx/KaluluOff.ogg');
        },

        /**
         * Starts next state
         * @private
         **/
        create: function () {
            //call next state
            this.state.start('Setup');
        }
    };

    return Preloader;
});