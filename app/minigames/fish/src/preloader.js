define([
], function (
) {
    'use strict';

    /**
	 * Preloader is in charge of loading all the game assets
	 * @class
     * @memberof Jellyfish
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
            this.load.image('BackgroundBottom', Config.gameId + '/assets/images/background/BG_Bilan_partie1.png');
            this.load.image('BackgroundTop', Config.gameId + '/assets/images/background/BG_Bilan_nuages.png');
            this.load.image('sun', Config.gameId + '/assets/images/background/Soleil.png');
            this.game.load.atlasJSONHash('fish', Config.gameId + '/assets/images/Animations_poisson/fish.png', Config.gameId + '/assets/images/Animations_poisson/fish.json');
            
            this.game.load.atlasJSONHash('boat', Config.gameId + '/assets/images/Animation_Bateau/boat.png', Config.gameId + '/assets/images/Animation_Bateau/boat.json');

            //Game specific UI Graphics            



            //Game Specific Audio

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', Config.gameId + '/assets/audio/kalulu/intro.wav');
            this.game.load.audio('kaluluEndWin', Config.gameId + '/assets/audio/kalulu/endWin.wav');
            this.game.load.audio('kaluluEndLoose', Config.gameId + '/assets/audio/kalulu/endLoose.wav');
            this.game.load.audio('kaluluFirstTryIntro', Config.gameId + '/assets/audio/kalulu/firstTryIntro.wav');
            this.game.load.audio('kaluluFirstTryWin', Config.gameId + '/assets/audio/kalulu/firstTryWin.wav');
            this.game.load.audio('kaluluFirstTryLoose', Config.gameId + '/assets/audio/kalulu/firstTryWrong.wav');
            this.game.load.audio('kaluluSecondTryWin', Config.gameId + '/assets/audio/kalulu/secondTryWin.wav');
            this.game.load.audio('kaluluSecondTryLoose', Config.gameId + '/assets/audio/kalulu/secondTryWrong.wav');
        },

        /**
         * Load all assets in sharedAssets
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