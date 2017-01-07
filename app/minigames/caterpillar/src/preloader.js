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
            this.load.image('leaf', 'minigames/caterpillar/assets/images/Decors/Feuille.png');
            this.load.image('background', 'minigames/caterpillar/assets/images/Decors/Background.png');
            this.load.image('line', 'minigames/caterpillar/assets/images/Decors/Branche_boucle.png');
            this.load.image('lineEnd', 'minigames/caterpillar/assets/images/Decors/Branche_bout.png');

            this.game.load.atlasJSONHash('berry', 'minigames/caterpillar/assets/images/Animation_Baie/berry.png', 'minigames/caterpillar/assets/images/Animation_Baie/berry.json');
            this.game.load.atlasJSONHash('caterpillar', 'minigames/caterpillar/assets/images/caterpillar/caterpillar.png', 'minigames/caterpillar/assets/images/caterpillar/caterpillar.json');
            this.game.load.atlasJSONHash('caterpillarTail', 'minigames/caterpillar/assets/images/caterpillar/tail.png', 'minigames/caterpillar/assets/images/caterpillar/tail.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', 'minigames/caterpillar/assets/images/ui/ScoreWrong_Graphogame.png');
            this.load.image('uiScoreRight', 'minigames/caterpillar/assets/images/ui/ScoreSuccess_Graphogame.png');
            this.load.image('uiScoreEmpty', 'minigames/caterpillar/assets/images/ui/ScoreEmpty_Graphogame.png');

            //Game Specific Audio


            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', 'minigames/caterpillar/assets/audio/kalulu/kalulu_Intro_Caterpillar_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluHelp', 'minigames/caterpillar/assets/audio/kalulu/kalulu_Help_Caterpillar_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluGameOverWin', 'minigames/caterpillar/assets/audio/kalulu/kalulu_End_Caterpillar_' + this.game.rafiki.discipline + '.ogg');
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

            this.game.load.audio('winGame', 'minigames/common/assets/audio/sfx/GameOverWin.ogg');
            this.game.load.audio('loseGame', 'minigames/common/assets/audio/sfx/GameOverLose.ogg');

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