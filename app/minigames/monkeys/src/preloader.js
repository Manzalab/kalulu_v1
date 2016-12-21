define([
], function (
) {
    'use strict';

    /**
	 * Preloader is in charge of loading all the game assets
	 * @class
     * @memberof Cocolision
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
            this.load.image('sky', Config.gameId + '/assets/images/Decors/CIEL_Background.png');
            this.load.image('ground', Config.gameId + '/assets/images/Decors/Ground.png');
            this.load.image('tree', Config.gameId + '/assets/images/Decors/Palmier2.png');
            this.load.image('treeKing', Config.gameId + '/assets/images/Decors/Palmier.png');
            this.load.image('board', Config.gameId + '/assets/images/Decors/planche_lettres.png');

            this.game.load.atlasJSONHash('coconut', Config.gameId + '/assets/images/coconut/coconut.png', Config.gameId + '/assets/images/coconut/coconut.json');
            this.game.load.atlasJSONHash('stunStars', Config.gameId + '/assets/images/SINGE_animations/stunStars.png', Config.gameId + '/assets/images/SINGE_animations/stunStars.json');
            this.game.load.atlasJSONHash('monkeyNormal', Config.gameId + '/assets/images/SINGE_animations/monkeyNormal.png', Config.gameId + '/assets/images/SINGE_animations/monkeyNormal.json');
            this.game.load.atlasJSONHash('monkeyKing', Config.gameId + '/assets/images/SINGE_animations/monkeyKing.png', Config.gameId + '/assets/images/SINGE_animations/monkeyKing.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', Config.gameId + '/assets/images/ui/singe_perdu.png');
            this.load.image('uiScoreRight', Config.gameId + '/assets/images/ui/singe_gagne.png')
            this.load.image('uiScoreEmpty', Config.gameId + '/assets/images/ui/singe_vide.png')

            //Game Specific Audio
            for (var i = 0; i < 3 ; i++) {
                this.game.load.audio('rdm' + (i + 1), Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_Monkey_Rdm_0' + (i + 1) + '.ogg');
            }
            this.game.load.audio('receiveHeadCoco', Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_ReceiveHeadCoco.ogg');
            this.game.load.audio('send', Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco.ogg');
            this.game.load.audio('sendRight', Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco_Right.ogg');
            this.game.load.audio('sendWrong', Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco_Wrong.ogg');

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', Config.gameId + '/assets/audio/kalulu/intro.ogg');
            this.game.load.audio('kaluluHelp', Config.gameId + '/assets/audio/kalulu/help.ogg');
            this.game.load.audio('kaluluEnd', Config.gameId + '/assets/audio/kalulu/end.ogg');
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