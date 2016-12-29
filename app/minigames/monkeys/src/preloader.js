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
            this.load.image('sky', 'minigames/' + Config.gameId + '/assets/images/Decors/CIEL_Background.png');
            this.load.image('ground', 'minigames/' + Config.gameId + '/assets/images/Decors/Ground.png');
            this.load.image('tree', 'minigames/' + Config.gameId + '/assets/images/Decors/Palmier2.png');
            this.load.image('treeKing', 'minigames/' + Config.gameId + '/assets/images/Decors/Palmier.png');
            this.load.image('board', 'minigames/' + Config.gameId + '/assets/images/Decors/planche_lettres.png');

            this.game.load.atlasJSONHash('coconut', 'minigames/' + Config.gameId + '/assets/images/coconut/coconut.png', 'minigames/' + Config.gameId + '/assets/images/coconut/coconut.json');
            this.game.load.atlasJSONHash('stunStars', 'minigames/' + Config.gameId + '/assets/images/SINGE_animations/stunStars.png', 'minigames/' + Config.gameId + '/assets/images/SINGE_animations/stunStars.json');
            this.game.load.atlasJSONHash('monkeyNormal', 'minigames/' + Config.gameId + '/assets/images/SINGE_animations/monkeyNormal.png', 'minigames/' + Config.gameId + '/assets/images/SINGE_animations/monkeyNormal.json');
            this.game.load.atlasJSONHash('monkeyKing', 'minigames/' + Config.gameId + '/assets/images/SINGE_animations/monkeyKing.png', 'minigames/' + Config.gameId + '/assets/images/SINGE_animations/monkeyKing.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', 'minigames/' + Config.gameId + '/assets/images/ui/singe_perdu.png');
            this.load.image('uiScoreRight', 'minigames/' + Config.gameId + '/assets/images/ui/singe_gagne.png')
            this.load.image('uiScoreEmpty', 'minigames/' + Config.gameId + '/assets/images/ui/singe_vide.png')

            //Game Specific Audio
            for (var i = 0; i < 3 ; i++) {
                this.game.load.audio('rdm' + (i + 1), 'minigames/' + Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_Monkey_Rdm_0' + (i + 1) + '.ogg');
            }
            this.game.load.audio('receiveHeadCoco', 'minigames/' + Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_ReceiveHeadCoco.ogg');
            this.game.load.audio('send', 'minigames/' + Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco.ogg');
            this.game.load.audio('sendRight', 'minigames/' + Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco_Right.ogg');
            this.game.load.audio('sendWrong', 'minigames/' + Config.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco_Wrong.ogg');

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', 'minigames/' + Config.gameId + '/assets/audio/kalulu/kalulu_Intro_' + this.game.gameConfig.gameId.capitalise() + '_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluHelp', 'minigames/' + Config.gameId + '/assets/audio/kalulu/kalulu_Help_' + this.game.gameConfig.gameId.capitalise() + '_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluGameOverWin', 'minigames/' + Config.gameId + '/assets/audio/kalulu/kalulu_End_' + this.game.gameConfig.gameId.capitalise() + '_' + this.game.rafiki.discipline + '.ogg');
        },

        /**
         * Load all assets in sharedAssets
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
            this.game.load.audio('menuNo', 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes', 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
            this.game.load.audio('winGame', 'minigames/common/assets/audio/sfx/GameOverWin.ogg');
            this.game.load.audio('loseGame', 'minigames/common/assets/audio/sfx/GameOverLose.ogg');
            this.game.load.audio('kaluluGameOverLose', 'minigames/common/assets/audio/sfx/kalulu_lose_minigame.ogg');
            this.game.load.audio('kaluluOn', 'minigames/common/assets/audio/sfx/KaluluOn.ogg');
            this.game.load.audio('kaluluOff', 'minigames/common/assets/audio/sfx/KaluluOff.ogg');
            this.game.load.audio('menu', 'minigames/common/assets/audio/sfx/OpenPopin.ogg');
            this.game.load.audio('right', 'minigames/common/assets/audio/sfx/ResponseCorrect.ogg');
            this.game.load.audio('wrong', 'minigames/common/assets/audio/sfx/ResponseIncorrect.ogg');
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