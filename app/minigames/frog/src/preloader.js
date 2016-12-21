define([
], function (
) {
    'use strict';

    /**
         * Preloader is in charge of loading all the game assets
         * @class
         * @memberof Frogger
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
            this.game.load.atlasJSONHash('frog', 'frogger/assets/images/FROGGER_animations/frog.png', 'frogger/assets/images/FROGGER_animations/frog.json');
            this.game.load.atlasJSONHash('background', 'frogger/assets/images/decors/background.png', 'frogger/assets/images/decors/background.json');
            this.game.load.atlasJSONHash('lillypad', 'frogger/assets/images/nenuphar/lillypad.png', 'frogger/assets/images/nenuphar/lillypad.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', 'frogger/assets/images/ui/frogger_perdu.png');
            this.load.image('uiScoreRight', 'frogger/assets/images/ui/frogger_gagne.png')
            this.load.image('uiScoreEmpty', 'frogger/assets/images/ui/frogger_vide.png')

            //Game Specific Audio
            this.game.load.audio('lillypad', 'frogger/assets/audio/lillypad/ELAN_GAME_FROGG_TapLily.wav');
            for (var i = 0; i < 5; i++) {
                this.game.load.audio('idleRdm' + (i + 1), 'frogger/assets/audio/frog/ELAN_GAME_FROGG_Frogg_Rdm_0' + (i + 1) + '.wav');
            }
            for (var i = 0; i < 4; i++) {
                this.game.load.audio('jumpRdm' + (i + 1), 'frogger/assets/audio/frog/ELAN_GAME_FROGG_Jump_Rdm_0' + (i + 1) + '.wav');
            }

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', 'frogger/assets/audio/kalulu/intro.wav');
            this.game.load.audio('kaluluHelp', 'frogger/assets/audio/kalulu/help.wav');
            this.game.load.audio('kaluluEnd', 'frogger/assets/audio/kalulu/end.wav');
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
            this.game.load.atlasJSONHash('kaluluIntro', 'assets_shared/images/Kalulu_animations/kaluluIntro.png', 'assets_shared/images/Kalulu_animations/kaluluIntro.json');
            this.game.load.atlasJSONHash('kaluluOutro', 'assets_shared/images/Kalulu_animations/kaluluOutro.png', 'assets_shared/images/Kalulu_animations/kaluluOutro.json');
            this.game.load.atlasJSONHash('kaluluIdle1', 'assets_shared/images/Kalulu_animations/kaluluIdle1.png', 'assets_shared/images/Kalulu_animations/kaluluIdle1.json');
            this.game.load.atlasJSONHash('kaluluIdle2', 'assets_shared/images/Kalulu_animations/kaluluIdle2.png', 'assets_shared/images/Kalulu_animations/kaluluIdle2.json');
            this.game.load.atlasJSONHash('kaluluSpeaking1', 'assets_shared/images/Kalulu_animations/kaluluSpeaking1.png', 'assets_shared/images/Kalulu_animations/kaluluSpeaking1.json');
            this.game.load.atlasJSONHash('kaluluSpeaking2', 'assets_shared/images/Kalulu_animations/kaluluSpeaking2.png', 'assets_shared/images/Kalulu_animations/kaluluSpeaking2.json');

            // Audio
            this.game.load.audio('menuNo', 'assets_shared/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes', 'assets_shared/audio/sfx/ButtonOK.ogg');
            this.game.load.audio('menu', 'assets_shared/audio/sfx/OpenPopin.ogg');
            this.game.load.audio('right', 'assets_shared/audio/sfx/ResponseCorrect.ogg');
            this.game.load.audio('wrong', 'assets_shared/audio/sfx/ResponseIncorrect.ogg');
            this.game.load.audio('winGame', 'assets_shared/audio/sfx/GameOverWin.ogg');
            this.game.load.audio('loseGame', 'assets_shared/audio/sfx/GameOverLose.ogg');
            this.game.load.audio('kaluluOn', 'assets_shared/audio/sfx/KaluluOn.ogg');
            this.game.load.audio('kaluluOff', 'assets_shared/audio/sfx/KaluluOff.ogg');
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