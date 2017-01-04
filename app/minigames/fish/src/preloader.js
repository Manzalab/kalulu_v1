define([
], function (
) {
    'use strict';

    /**
	 * Preloader is in charge of loading all the game assets that will not change on replay. (The assets that can change at replay are preloaded in the game phase)
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
            this.load.image('BackgroundBottom', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/background/BG_Bilan_partie1.png');
            this.load.image('BackgroundTop'   , 'minigames/' + this.game.gameConfig.gameId + '/assets/images/background/BG_Bilan_nuages.png');
            this.load.image('sun'             , 'minigames/' + this.game.gameConfig.gameId + '/assets/images/background/Soleil.png');

            this.game.load.atlasJSONHash('fish', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animations_poisson/fish.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animations_poisson/fish.json');
            this.game.load.atlasJSONHash('boat', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animation_Bateau/boat.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/Animation_Bateau/boat.json');

            //Game specific UI Graphics            



            //Game Specific Audio

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro'         , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_intro_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluEndWin'        , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_end_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluEndLoose'      , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_lose_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluFirstTryIntro' , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_introtry_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluFirstTryWin'   , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_wintry1_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluFirstTryLoose' , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_losetry1_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluSecondTryWin'  , 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_wintry2_fish_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluSecondTryLoose', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_losetry2_fish_' + this.game.rafiki.discipline + '.ogg');
            
        },

        /**
         * Load all assets in sharedAssets
         **/
        loadSharedAssets: function () {

            //UI 
            this.load.image('pause', 'minigames/common/assets/images/ui/pause.png');
            this.game.load.atlasJSONHash('ui', 'minigames/common/assets/images/ui/ui.png', 'minigames/common/assets/images/ui/ui.json');

            //FX 
            this.game.load.atlasJSONHash('fx', 'minigames/common/assets/images/fx/fx.png', 'minigames/common/assets/images/fx/fx.json');
            this.load.image('wrong', 'minigames/common/assets/images/fx/wrong.png');

            //KaluluGraphics
            this.game.load.atlasJSONHash('kaluluIntro'    , 'minigames/common/assets/images/kalulu_animations/kaluluIntro.png', 'minigames/common/assets/images/kalulu_animations/kaluluIntro.json');
            this.game.load.atlasJSONHash('kaluluOutro'    , 'minigames/common/assets/images/kalulu_animations/kaluluOutro.png', 'minigames/common/assets/images/kalulu_animations/kaluluOutro.json');
            this.game.load.atlasJSONHash('kaluluIdle1'    , 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle1.json');
            this.game.load.atlasJSONHash('kaluluIdle2'    , 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.png', 'minigames/common/assets/images/kalulu_animations/kaluluIdle2.json');
            this.game.load.atlasJSONHash('kaluluSpeaking1', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking1.json');
            this.game.load.atlasJSONHash('kaluluSpeaking2', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.png', 'minigames/common/assets/images/kalulu_animations/kaluluSpeaking2.json');

            // Audio
            this.game.load.audio('menuNo'   , 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes'  , 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
            
            this.game.load.audio('menu'     , 'minigames/common/assets/audio/sfx/OpenPopin.ogg');
            
            this.game.load.audio('right'    , 'minigames/common/assets/audio/sfx/ResponseCorrect.ogg');
            this.game.load.audio('wrong'    , 'minigames/common/assets/audio/sfx/ResponseIncorrect.ogg');
            
            this.game.load.audio('kaluluOn' , 'minigames/common/assets/audio/sfx/KaluluOn.ogg');
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