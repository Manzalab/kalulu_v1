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

    Preloader.prototype = 
	{
        /**
	     * Load all the game assets
	    **/
        preload: function () {
			
			this.loadError = false;
			
            this.preloadBar = this.add.sprite(this.game.world.centerX - 490, this.game.height / 2, 'preloaderBar');
            this.load.setPreloadSprite(this.preloadBar);

            this.loadSpecificAssets();
            this.loadSharedAssets();
        },

        /**
         * Load game specific assets
         **/
        loadSpecificAssets: function () {
            if (!this.game.gameConfig.gameId) {
                console.error("Game Id equals " + this.game.gameConfig.gameId + ". No loading will be possible");
            }
            //Game specific Graphics
            this.load.image('background', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/background.png');

            this.game.load.atlasJSONHash('hole', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/hole/hole.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/hole/hole.json');
            this.game.load.atlasJSONHash('crab', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/crab/crab.png', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/crab/crab.json');

            //Game specific UI Graphics
            console.log('minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/ScoreSuccess_TapeCrabe.png');
            this.load.image('uiScoreWrong', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/ScoreWrong_TapeCrabe.png');
            this.load.image('uiScoreRight', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/ScoreSuccess_TapeCrabe.png');
            this.load.image('uiScoreEmpty', 'minigames/' + this.game.gameConfig.gameId + '/assets/images/ui/ScoreEmpty_TapeCrabe.png');

            //Game Specific Audio
            var temp;
            for (var i = 0; i < 13 ; i++) {
                if ((i + 1) >= 10) temp = i +1;
                else temp = "0" + (i + 1);
                this.game.load.audio('rdm' + temp, 'minigames/' + this.game.gameConfig.gameId + '/assets/audio/sfx/ELAN_GAME_CRAB_Rdm_' + temp + '.ogg');
            }

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

            var animPath = 'minigames/common/assets/images/kalulu_animations/';

            //KaluluGraphics
            this.game.load.atlasJSONHash('kaluluIntro'    , animPath + 'kaluluIntro.png', animPath + 'kaluluIntro.json');
            this.game.load.atlasJSONHash('kaluluOutro'    , animPath + 'kaluluOutro.png', animPath + 'kaluluOutro.json');
            this.game.load.atlasJSONHash('kaluluIdle1'    , animPath + 'kaluluIdle1.png', animPath + 'kaluluIdle1.json');
            this.game.load.atlasJSONHash('kaluluIdle2'    , animPath + 'kaluluIdle2.png', animPath + 'kaluluIdle2.json');
            this.game.load.atlasJSONHash('kaluluSpeaking1', animPath + 'kaluluSpeaking1.png', animPath + 'kaluluSpeaking1.json');
            this.game.load.atlasJSONHash('kaluluSpeaking2', animPath + 'kaluluSpeaking2.png', animPath + 'kaluluSpeaking2.json');

            var sfxPath = 'minigames/common/assets/audio/sfx/';
			
			this.game.load.onFileError.add(this.onFileError);			
			
            //General Audio
            this.game.load.audio('menuNo'            , sfxPath + 'ButtonCancel.ogg');
            this.game.load.audio('menuYes'           , sfxPath + 'ButtonOK.ogg');

            this.game.load.audio('winGame'           , sfxPath + 'GameOverWin.ogg');
            this.game.load.audio('loseGame'          , sfxPath + 'GameOverLose.ogg');

            this.game.load.audio('kaluluOn'          , sfxPath + 'KaluluOn.ogg');
            this.game.load.audio('kaluluOff'         , sfxPath + 'KaluluOff.ogg');

            this.game.load.audio('menu'              , sfxPath + 'OpenPopin.ogg');
            
            this.game.load.audio('right'             , sfxPath + 'ResponseCorrect.ogg');
            this.game.load.audio('wrong'             , sfxPath + 'ResponseIncorrect.ogg');

            this.game.load.audio('kaluluGameOverLose', 'minigames/common/assets/audio/kalulu/kalulu_lose_minigame.ogg');
        },
		
		/**
		 * File loading error handler.
		 *
		 **/
		onFileError: function (fileKey, file) {
			this.loadError = true;
			console.log("onFileError called. Will restart preload");
		},

        /**
         * Starts next state: Preload or Setup whether Preload failed or not.
         * @private
         **/
        create: function () {
			
			this.game.load.onFileError.removeAll();
			
			//call next state, used to load the pedagogic data for a first game.            
			if(this.loadError)
				this.state.start('Preload');
			else
				this.state.start('Setup');
        }
    };

    return Preloader;
});