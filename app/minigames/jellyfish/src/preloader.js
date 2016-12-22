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
            
            this.loadSpecificAssets();
            this.loadSharedAssets();
        },

        /**
         * Load game specific assets
         **/
        loadSpecificAssets: function () {

            //Game specific Graphics
            this.game.load.image('background', 'minigames/jellyfish/assets/images/Decors/ABYSSE_background.png');
            this.game.load.atlasJSONHash('jellyfish1', 'minigames/jellyfish/assets/images/MEDUSES_animations/jellyfish1.png', 'minigames/jellyfish/assets/images/MEDUSES_animations/jellyfish1.json');
            this.game.load.atlasJSONHash('jellyfish2', 'minigames/jellyfish/assets/images/MEDUSES_animations/jellyfish2.png', 'minigames/jellyfish/assets/images/MEDUSES_animations/jellyfish2.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', 'minigames/jellyfish/assets/images/ui/ScoreWrong_PecheAuxLettres.png');
            this.load.image('uiScoreRight', 'minigames/jellyfish/assets/images/ui/ScoreSuccess_PecheAuxLettres.png');
            this.load.image('uiScoreEmpty', 'minigames/jellyfish/assets/images/ui/ScoreEmpty_PecheAuxLettres.png');

            //Settings
            // this.game.load.json('standardSettings', 'minigames/jellyfish/assets/data/standard_settings.json');
            // this.game.load.json('gameDesign', 'minigames/jellyfish/assets/data/game_design.json');

            //Game Specific Audio
            this.game.load.audio('background', 'minigames/jellyfish/assets/audio/jellyfish/background.ogg');
            for (var i = 0; i < 5; i++) {
                this.game.load.audio('rdm' + (i + 1), 'minigames/jellyfish/assets/audio/jellyfish/rdm' + (i + 1) + '.ogg');
            }

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro'      , 'minigames/jellyfish/assets/audio/kalulu/kalulu_intro_jellyfish_' + this.game.pedagogicData.discipline + '.ogg');
            this.game.load.audio('kaluluHelp'       , 'minigames/jellyfish/assets/audio/kalulu/kalulu_help_jellyfish_' + 'maths' + '.ogg');
            this.game.load.audio('kaluluGameOverWin', 'minigames/jellyfish/assets/audio/kalulu/kalulu_end_jellyfish_' + 'maths' + '.ogg');
        },

        /**
         * Load all assets in minigames/common/assets/
         **/
        loadSharedAssets: function () {

            //UI 
            this.load.image('pause', 'minigames/common/assets/images/ui/pause.png');
            this.game.load.atlasJSONHash('common/src/ui', 'minigames/common/assets/images/ui/ui.png', 'minigames/common/assets/images/ui/ui.json');

            //FX 
            this.game.load.atlasJSONHash('common/src/fx', 'minigames/common/assets/images/fx/fx.png', 'minigames/common/assets/images/fx/fx.json');
            this.load.image('wrong', 'minigames/common/assets/images/fx/wrong.png');

            //KaluluGraphics
            this.game.load.atlasJSONHash('kaluluIntro', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.png', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.json');
            this.game.load.atlasJSONHash('kaluluOutro', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.png', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.json');
            this.game.load.atlasJSONHash('kaluluIdle1', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.json');
            this.game.load.atlasJSONHash('kaluluIdle2', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.json');
            this.game.load.atlasJSONHash('kaluluSpeaking1', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.json');
            this.game.load.atlasJSONHash('kaluluSpeaking2', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.json');

            //General Audio
            this.game.load.audio('kaluluGameOverLose', 'minigames/common/assets/audio/sfx/KaluluGameOverLose.ogg');

            this.game.load.audio('menuNo'   , 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes'  , 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
            this.game.load.audio('winGame'  , 'minigames/common/assets/audio/sfx/GameOverWin.ogg');
            this.game.load.audio('loseGame' , 'minigames/common/assets/audio/sfx/GameOverLose.ogg');
            this.game.load.audio('kaluluOn' , 'minigames/common/assets/audio/sfx/KaluluOn.ogg');
            this.game.load.audio('kaluluOff', 'minigames/common/assets/audio/sfx/KaluluOff.ogg');
            this.game.load.audio('menu'     , 'minigames/common/assets/audio/sfx/OpenPopin.ogg');
            this.game.load.audio('right'    , 'minigames/common/assets/audio/sfx/ResponseCorrect.ogg');
            this.game.load.audio('wrong'    , 'minigames/common/assets/audio/sfx/ResponseIncorrect.ogg');            
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