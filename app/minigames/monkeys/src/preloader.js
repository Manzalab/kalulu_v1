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
            this.load.image('popup', 'minigames/common/assets/images/ui/popup.png');
            this.load.image('sky', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/decors/CIEL_Background.png');
            this.load.image('ground', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/decors/Ground.png');
            this.load.image('tree', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/decors/Palmier2.png');
            this.load.image('treeKing', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/decors/Palmier.png');
            this.load.image('board', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/decors/planche_lettres.png');

            this.game.load.atlasJSONHash('coconut', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/coconut/coconut.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/coconut/coconut.json');
            this.game.load.atlasJSONHash('stunStars', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/SINGE_animations/stunStars.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/SINGE_animations/stunStars.json');
            this.game.load.atlasJSONHash('monkeyNormal', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/SINGE_animations/monkeyNormal.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/SINGE_animations/monkeyNormal.json');
            this.game.load.atlasJSONHash('monkeyKing', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/SINGE_animations/monkeyKing.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/SINGE_animations/monkeyKing.json');

            //Game specific UI Graphics            
            this.load.image('uiScoreWrong', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/singe_perdu.png');
            this.load.image('uiScoreRight', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/singe_gagne.png')
            this.load.image('uiScoreEmpty', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/singe_vide.png')

            //Game Specific Audio
            for (var i = 0; i < 3 ; i++) {
                this.game.load.audio('rdm' + (i + 1), 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_Monkey_Rdm_0' + (i + 1) + '.ogg');
            }
            this.game.load.audio('receiveHeadCoco', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_ReceiveHeadCoco.ogg');
            this.game.load.audio('send', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco.ogg');
            this.game.load.audio('sendRight', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco_Right.ogg');
            this.game.load.audio('sendWrong', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/monkey/ELAN_GAME_MONKEY_SendCoco_Wrong.ogg');

            //Kalulu Game Specific audio
            this.game.load.audio('kaluluIntro', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_intro_' + this.game.gameConfig.gameId + '_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluHelp', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_help_' + this.game.gameConfig.gameId + '_' + this.game.rafiki.discipline + '.ogg');
            this.game.load.audio('kaluluGameOverWin', 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/kalulu/kalulu_end_' + this.game.gameConfig.gameId + '_' + this.game.rafiki.discipline + '.ogg');
        },

        /**
         * Load all assets in sharedAssets
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

            //General Audio
            this.game.load.audio('kaluluGameOverLose', 'minigames/common/assets/audio/kalulu/kalulu_lose_minigame.ogg');

            this.game.load.audio('menuNo', 'minigames/common/assets/audio/sfx/ButtonCancel.ogg');
            this.game.load.audio('menuYes', 'minigames/common/assets/audio/sfx/ButtonOK.ogg');
            
            this.game.load.audio('winGame', 'minigames/common/assets/audio/sfx/GameOverWin.ogg');
            this.game.load.audio('loseGame', 'minigames/common/assets/audio/sfx/GameOverLose.ogg');
            
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