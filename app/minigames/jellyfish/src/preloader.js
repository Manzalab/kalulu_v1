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
            this.game.load.image('background', Config.gameId + '/assets/images/Decors/ABYSSE_background.png');
            this.game.load.atlasJSONHash('jellyfish1', Config.gameId + '/assets/images/MEDUSES_animations/jellyfish1.png', Config.gameId + '/assets/images/MEDUSES_animations/jellyfish1.json');
            this.game.load.atlasJSONHash('jellyfish2', Config.gameId + '/assets/images/MEDUSES_animations/jellyfish2.png', Config.gameId + '/assets/images/MEDUSES_animations/jellyfish2.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', Config.gameId + '/assets/images/ui/ScoreWrong_PecheAuxLettres.png');
            this.load.image('uiScoreRight', Config.gameId + '/assets/images/ui/ScoreSuccess_PecheAuxLettres.png');
            this.load.image('uiScoreEmpty', Config.gameId + '/assets/images/ui/ScoreEmpty_PecheAuxLettres.png');

            //Settings
            // this.game.load.json('standardSettings', Config.gameId + '/assets/data/standard_settings.json');
            // this.game.load.json('gameDesign', Config.gameId + '/assets/data/game_design.json');

            //Game Specific Audio
            this.game.load.audio('background', Config.gameId + '/assets/audio/jellyfish/background.ogg');
            for (var i = 0; i < 5; i++) {
                this.game.load.audio('rdm' + (i + 1), Config.gameId + '/assets/audio/jellyfish/rdm' + (i + 1) + '.ogg');
            }

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', Config.gameId + '/assets/audio/kalulu/intro.ogg');
            this.game.load.audio('kaluluHelp', Config.gameId + '/assets/audio/kalulu/help.ogg');
            this.game.load.audio('kaluluGameOverWin', Config.gameId + '/assets/audio/kalulu/end.ogg');
        },

        /**
         * Load all assets in assets_shared
         **/
        loadSharedAssets: function () {

            //UI 
            this.load.image('pause', 'assets_shared/images/ui/pause.png');
            this.game.load.atlasJSONHash('common/src/ui', 'assets_shared/images/ui/ui.png', 'assets_shared/images/ui/ui.json');

            //FX 
            this.game.load.atlasJSONHash('common/src/fx', 'assets_shared/images/fx/fx.png', 'assets_shared/images/fx/fx.json');
            this.load.image('wrong', 'assets_shared/images/fx/wrong.png');

            //KaluluGraphics
            this.game.load.atlasJSONHash('kaluluIntro', 'assets_shared/images/kalulu_animations/kaluluIntro.png', 'assets_shared/images/kalulu_animations/kaluluIntro.json');
            this.game.load.atlasJSONHash('kaluluOutro', 'assets_shared/images/kalulu_animations/kaluluOutro.png', 'assets_shared/images/kalulu_animations/kaluluOutro.json');
            this.game.load.atlasJSONHash('kaluluIdle1', 'assets_shared/images/kalulu_animations/kaluluIdle1.png', 'assets_shared/images/kalulu_animations/kaluluIdle1.json');
            this.game.load.atlasJSONHash('kaluluIdle2', 'assets_shared/images/kalulu_animations/kaluluIdle2.png', 'assets_shared/images/kalulu_animations/kaluluIdle2.json');
            this.game.load.atlasJSONHash('kaluluSpeaking1', 'assets_shared/images/kalulu_animations/kaluluSpeaking1.png', 'assets_shared/images/kalulu_animations/kaluluSpeaking1.json');
            this.game.load.atlasJSONHash('kaluluSpeaking2', 'assets_shared/images/kalulu_animations/kaluluSpeaking2.png', 'assets_shared/images/kalulu_animations/kaluluSpeaking2.json');

            //General Audio
            this.game.load.audio('menuNo', 'assets_shared/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes', 'assets_shared/audio/sfx/ButtonOK.ogg');
            this.game.load.audio('winGame', 'assets_shared/audio/sfx/GameOverWin.ogg');
            this.game.load.audio('loseGame', 'assets_shared/audio/sfx/GameOverLose.ogg');
            this.game.load.audio('kaluluGameOverLose', 'assets_shared/audio/sfx/KaluluGameOverLose.ogg');
            this.game.load.audio('kaluluOn', 'assets_shared/audio/sfx/KaluluOn.ogg');
            this.game.load.audio('kaluluOff', 'assets_shared/audio/sfx/KaluluOff.ogg');
            this.game.load.audio('menu', 'assets_shared/audio/sfx/OpenPopin.ogg');
            this.game.load.audio('right', 'assets_shared/audio/sfx/ResponseCorrect.ogg');
            this.game.load.audio('wrong', 'assets_shared/audio/sfx/ResponseIncorrect.ogg');            
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